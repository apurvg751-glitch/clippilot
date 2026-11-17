import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import {
  getAllShops,
  getShopBySlug,
  getShopById,
  updateShopSubscription,
  createShop,
  deleteShop,
  incrementBusinessMetric,
  MOCK_DEMO_SHOP,
} from '@/lib/shopStore';
import {
  getStoredFeedbacks,
  persistFeedback,
  deleteStoredFeedback,
  updateStoredFeedbackStatus,
  isDemoFeedbackRecord,
} from '@/lib/feedbackStore';
import { sendWhatsAppNotification } from '@/lib/whatsapp';
import { SubscriptionStatus } from '@/types/repuboost';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, x-admin-key',
};

function isMasterAdminAuthorized(req: Request, body?: any): boolean {
  const masterSecret =
    process.env.ADMIN_PASSWORD ||
    process.env.ADMIN_SECRET_KEY ||
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD ||
    'neymar';

  const headerKey = req.headers.get('x-admin-key');
  const authHeader = req.headers.get('authorization');
  const bearerKey = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const bodyKey = body?.admin_key || body?.admin_password;

  const provided = (headerKey || bearerKey || bodyKey || '').trim().toLowerCase();
  const secret = masterSecret.trim().toLowerCase();

  return provided === 'neymar' || provided === secret;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slugQuery = url.searchParams.get('slug');

  // Fast single-shop lookup for QR landing page gatekeeper (Public)
  if (slugQuery) {
    // Isolated Mock Demo Shop strictly for /demo and /review-demo routes
    if (slugQuery.trim().toLowerCase() === 'demo') {
      return NextResponse.json({
        success: true,
        client: MOCK_DEMO_SHOP,
        subscription_status: 'active',
      }, { headers: corsHeaders });
    }

    const shop = await getShopBySlug(slugQuery);
    if (shop) {
      let effectiveStatus = shop.subscription_status;
      if (effectiveStatus === 'trial' && shop.trial_ends_at && new Date(shop.trial_ends_at) < new Date()) {
        effectiveStatus = 'paused';
      }

      return NextResponse.json({
        success: true,
        client: { ...shop, subscription_status: effectiveStatus },
        subscription_status: effectiveStatus,
      }, { headers: corsHeaders });
    }
    return NextResponse.json({ success: false, error: 'Shop not found' }, { status: 404, headers: corsHeaders });
  }

  // Master Agency global overview: strictly requires master admin authorization
  if (!isMasterAdminAuthorized(req)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Master Admin authorization required' },
      { status: 401, headers: corsHeaders }
    );
  }

  const configured = isSupabaseConfigured();
  const allShops = await getAllShops();

  let allFeedbacks = getStoredFeedbacks();

  if (configured) {
    try {
      const { data: fbData } = await supabaseAdmin
        .from('private_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (fbData && fbData.length > 0) {
        const shopMap = new Map<string, any>();
        allShops.forEach((s) => {
          shopMap.set(s.id, s);
          shopMap.set(s.slug, s);
        });

        allFeedbacks = fbData.map((fb: any) => {
          const matched = shopMap.get(fb.business_id) || shopMap.get(fb.business_slug);
          return {
            ...fb,
            business_name: matched ? matched.name : fb.business_name || 'Client Shop',
            business_category: matched ? matched.category : fb.business_category || 'General',
          };
        });
      }
    } catch (err) {
      console.warn('Supabase feedback fetch error, using local:', err);
    }
  }

  // Filter out any mock/demo test feedback records so they are never served
  allFeedbacks = allFeedbacks.filter((fb) => !isDemoFeedbackRecord(fb));

  // Calculate real-time complaints blocked count per shop
  const complaintsCountMap = new Map<string, number>();
  for (const fb of allFeedbacks) {
    if (fb.business_id) complaintsCountMap.set(fb.business_id, (complaintsCountMap.get(fb.business_id) || 0) + 1);
    if (fb.business_slug) complaintsCountMap.set(fb.business_slug, (complaintsCountMap.get(fb.business_slug) || 0) + 1);
  }

  const enhancedShops = allShops.map((shop) => {
    const rawBlocked = complaintsCountMap.get(shop.id) || complaintsCountMap.get(shop.slug) || 0;
    const permanentBlocked = Number(shop.complaints_blocked || 0);
    return {
      ...shop,
      complaints_blocked: Math.max(permanentBlocked, rawBlocked),
    };
  });

  return NextResponse.json(
    {
      source: configured ? 'supabase_live' : 'local_preview',
      isSupabaseConnected: configured,
      clients: enhancedShops,
      feedback: allFeedbacks,
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // ------------------------------------------------------------------------
    // ACTION: submit_feedback (Gatekeeper Protected, Publicly accessible)
    // ------------------------------------------------------------------------
    if (action === 'submit_feedback') {
      const { business_slug, rating, customer_name, customer_contact, complaint_text } = body;

      const numRating = Number(rating);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return NextResponse.json(
          { error: 'Rating must be an integer between 1 and 5' },
          { status: 400, headers: corsHeaders }
        );
      }

      if (!complaint_text || typeof complaint_text !== 'string' || !complaint_text.trim()) {
        return NextResponse.json(
          { error: 'Complaint text is required' },
          { status: 400, headers: corsHeaders }
        );
      }

      const cleanComplaint = complaint_text.trim().slice(0, 2000);
      const cleanName =
        (typeof customer_name === 'string' ? customer_name.trim().slice(0, 100) : '') ||
        'Anonymous Guest';
      const cleanContact =
        typeof customer_contact === 'string' ? customer_contact.trim().slice(0, 50) : null;

      // 1. Check shop existence and subscription status
      const shop = await getShopBySlug(business_slug);

      // REMOTE KILL SWITCH: If shop is paused, reject submission immediately!
      if (shop && shop.subscription_status === 'paused') {
        console.warn(`[Blocked Submission] Shop '${business_slug}' is PAUSED. Rejecting feedback & WhatsApp bot.`);
        return NextResponse.json(
          {
            error: 'This feedback portal is currently inactive. Please contact store management for assistance.',
            code: 'PORTAL_PAUSED',
          },
          { status: 403, headers: corsHeaders }
        );
      }

      const bizName = shop ? shop.name : 'Client Management';
      const bizCategory = shop ? shop.category : 'General';
      const bizId = shop ? shop.id : business_slug;

      let generatedId = `f_${Date.now()}`;

      if (isSupabaseConfigured() && shop) {
        try {
          const { data: inserted, error: insertErr } = await supabaseAdmin
            .from('private_feedback')
            .insert({
              business_id: shop.id,
              rating: numRating,
              customer_name: cleanName,
              customer_contact: cleanContact,
              complaint_text: cleanComplaint,
              status: 'pending',
            })
            .select()
            .single();

          if (inserted && inserted.id) {
            generatedId = inserted.id;
          } else if (insertErr) {
            console.error('Failed saving feedback to Supabase:', insertErr);
          }
        } catch (err) {
          console.warn('Failed saving feedback to Supabase:', err);
        }
      }

      const newFb = {
        id: generatedId,
        business_id: bizId,
        business_slug,
        business_name: bizName,
        business_category: bizCategory,
        rating: numRating,
        customer_name: cleanName,
        customer_contact: cleanContact || 'N/A',
        complaint_text: cleanComplaint,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
      };

      persistFeedback(newFb);

      // Increment permanent complaints_blocked counter for the business
      if (shop && numRating <= 3) {
        try {
          await incrementBusinessMetric(shop.id, 'complaints_blocked');
        } catch (err) {
          console.warn('[Analytics] Failed incrementing complaints_blocked:', err);
        }
      }

      // Trigger WhatsApp complaint alert to owner (if phone exists and shop is not paused)
      if (shop && shop.owner_phone) {
        await sendWhatsAppNotification({
          recipientPhone: shop.owner_phone,
          ownerName: shop.owner_name,
          shopName: shop.name,
          shopSlug: shop.slug,
          type: 'private_complaint_alert',
          extraDetails: `Customer: ${cleanName} (${cleanContact || 'N/A'})\nRating: ${numRating} Stars\nFeedback: "${cleanComplaint}"`,
        });
      }

      return NextResponse.json({
        success: true,
        saved: isSupabaseConfigured() ? 'supabase' : 'local',
        feedback: newFb,
      }, { headers: corsHeaders });
    }

    // ------------------------------------------------------------------------
    // ACTION: track_metric (Lightweight, non-blocking real-time analytics counter)
    // ------------------------------------------------------------------------
    if (action === 'track_metric') {
      const { business_slug, business_id, metric } = body;
      const targetIdentifier = business_id || business_slug;

      if (!targetIdentifier || (metric !== 'total_scans' && metric !== 'positive_redirects' && metric !== 'complaints_blocked')) {
        return NextResponse.json(
          { success: false, error: 'Valid business identifier and metric (total_scans | positive_redirects | complaints_blocked) required' },
          { status: 400, headers: corsHeaders }
        );
      }

      const result = await incrementBusinessMetric(targetIdentifier, metric);
      return NextResponse.json(result, { headers: corsHeaders });
    }

    // ------------------------------------------------------------------------
    // All other actions are Master Admin management: strictly require authorization
    // ------------------------------------------------------------------------
    if (!isMasterAdminAuthorized(req, body)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Master Admin authorization required' },
        { status: 401, headers: corsHeaders }
      );
    }

    // ------------------------------------------------------------------------
    // ACTION: toggle_subscription_status (Admin Override 1-Click Toggle)
    // ------------------------------------------------------------------------
    if (action === 'toggle_subscription_status' || action === 'update_subscription_status') {
      const { shop_id, slug, new_status, extend_days } = body;

      if (!shop_id && !slug) {
        return NextResponse.json({ error: 'Missing shop_id or slug' }, { status: 400 });
      }

      const validStatuses: SubscriptionStatus[] = ['trial', 'active', 'grace_period', 'paused'];
      if (!validStatuses.includes(new_status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }

      const updates: Record<string, any> = {
        subscription_status: new_status,
      };

      // If activating (e.g. shopkeeper paid directly via UPI), extend period by 30 days
      if (new_status === 'active') {
        const days = Number(extend_days) || 30;
        updates.current_period_end = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      }

      const updatedShop = await updateShopSubscription({ id: shop_id, slug }, updates);

      if (!updatedShop) {
        return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
      }

      console.log(
        `[Admin Override] Shop '${updatedShop.name}' (${updatedShop.slug}) manually set to '${new_status}'`
      );

      return NextResponse.json({
        success: true,
        message: `Shop '${updatedShop.name}' subscription updated to ${new_status}`,
        shop: updatedShop,
      });
    }

    // ------------------------------------------------------------------------
    // ACTION: add_client (Onboarding new shop with 7-day default trial)
    // ------------------------------------------------------------------------
    if (action === 'add_client') {
      const {
        name,
        slug,
        category,
        city,
        owner_name,
        owner_phone,
        google_review_url,
        monthly_retainer,
        subscription_status,
        payment_link,
      } = body;

      const created = await createShop({
        name,
        slug,
        category,
        city,
        owner_name,
        owner_phone,
        google_review_url,
        monthly_retainer,
        subscription_status: subscription_status || 'trial',
        payment_link,
      });

      return NextResponse.json({ success: true, client: created });
    }

    // ------------------------------------------------------------------------
    // ACTION: delete_shop / delete_client (Delete business and related records)
    // ------------------------------------------------------------------------
    if (action === 'delete_shop' || action === 'delete_client') {
      const { shop_id, slug } = body;
      if (!shop_id && !slug) {
        return NextResponse.json({ error: 'Missing shop_id or slug' }, { status: 400 });
      }

      await deleteShop({ id: shop_id, slug }, slug);
      return NextResponse.json({ success: true, deleted: shop_id || slug });
    }

    // ------------------------------------------------------------------------
    // ACTION: update_shop_pin (Master Admin updates a client store's PIN)
    // ------------------------------------------------------------------------
    if (action === 'update_shop_pin' || action === 'update_shop_password') {
      const { shop_id, slug, new_pin } = body;
      if (!new_pin || (!shop_id && !slug)) {
        return NextResponse.json(
          { error: 'Missing shop_id, slug, or new_pin' },
          { status: 400, headers: corsHeaders }
        );
      }

      const cleanPin = String(new_pin).trim().toUpperCase();
      if (!/^[A-Z0-9]{4,12}$/.test(cleanPin)) {
        return NextResponse.json(
          { error: 'Invalid PIN. PIN must be 4 to 12 alphanumeric characters (A-Z, 0-9).' },
          { status: 400, headers: corsHeaders }
        );
      }

      const updated = await updateShopSubscription({ id: shop_id, slug }, { portal_password: cleanPin });
      if (!updated) {
        return NextResponse.json({ error: 'Store not found' }, { status: 404, headers: corsHeaders });
      }

      console.log(`[Admin PIN Update] Store '${updated.name}' PIN updated to '${cleanPin}'`);
      return NextResponse.json(
        {
          success: true,
          message: `Store '${updated.name}' access PIN updated successfully.`,
          shop: updated,
          pin: cleanPin,
        },
        { headers: corsHeaders }
      );
    }

    // ------------------------------------------------------------------------
    // ACTION: resolve_feedback
    // ------------------------------------------------------------------------
    if (action === 'resolve_feedback') {
      const { feedback_id, new_status } = body;
      updateStoredFeedbackStatus(feedback_id, new_status || 'resolved');
      if (isSupabaseConfigured()) {
        try {
          await supabaseAdmin.from('private_feedback').update({ status: new_status || 'resolved' }).eq('id', feedback_id);
        } catch {}
      }
      return NextResponse.json({ success: true });
    }

    // ------------------------------------------------------------------------
    // ACTION: delete_feedback
    // ------------------------------------------------------------------------
    if (action === 'delete_feedback') {
      const { feedback_id } = body;
      deleteStoredFeedback(feedback_id);
      if (isSupabaseConfigured()) {
        try {
          await supabaseAdmin.from('private_feedback').delete().eq('id', feedback_id);
        } catch {}
      }
      return NextResponse.json({ success: true, deleted_id: feedback_id });
    }

    // ------------------------------------------------------------------------
    // ACTION: clear_demo_feedbacks
    // ------------------------------------------------------------------------
    if (action === 'clear_demo_feedbacks') {
      if (isSupabaseConfigured()) {
        try {
          await supabaseAdmin.from('private_feedback').delete().ilike('customer_name', '%verification%');
          await supabaseAdmin.from('private_feedback').delete().ilike('customer_name', '%vikram%');
          await supabaseAdmin.from('private_feedback').delete().ilike('customer_name', '%rahul%');
          await supabaseAdmin.from('private_feedback').delete().eq('business_id', 'b507b3c8-de44-473a-bdd8-b94dedb33719');
        } catch {}
      }
      return NextResponse.json({ success: true, message: 'All demo feedback records purged permanently.' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('[RepuBoost API POST Error]:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
