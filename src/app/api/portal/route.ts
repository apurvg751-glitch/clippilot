import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { verifyShopPortalAuth } from '@/lib/shopStore';
import {
  getStoredFeedbacks,
  deleteStoredFeedback,
  updateStoredFeedbackStatus,
} from '@/lib/feedbackStore';
import { parseJsonBody, safeInternalError, safeString } from '@/lib/apiSecurity';

/**
 * RepuBoost Multi-Tenant Shopkeeper Portal API
 * Strict tenant data isolation: Shopkeepers ONLY receive and modify their own feedback.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const shopQuery = url.searchParams.get('shop');
  const pinQuery = url.searchParams.get('pin');

  if (!shopQuery || !pinQuery) {
    return NextResponse.json(
      { success: false, error: 'Shop identifier and PIN are required' },
      { status: 400, headers: corsHeaders }
    );
  }

  // 1. Authenticate Shopkeeper Tenant
  const shop = await verifyShopPortalAuth(shopQuery, pinQuery);
  if (!shop) {
    return NextResponse.json(
      { success: false, error: 'Invalid Shop ID or Access PIN' },
      { status: 401, headers: corsHeaders }
    );
  }

  // 2. Fetch Strictly Isolated Feedback for this Tenant ONLY
  let tenantFeedback: any[] = [];
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabaseAdmin
        .from('private_feedback')
        .select('*')
        .eq('business_id', shop.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        tenantFeedback = data.map((fb: any) => ({
          ...fb,
          business_name: shop.name,
          business_slug: shop.slug,
        }));
      } else if (error) {
        console.warn('[Tenant Portal] Supabase fetch error:', error);
      }
    } catch (err) {
      console.warn('[Tenant Portal] Supabase fetch error:', err);
    }
  }

  // 3. Fallback / merge with local store strictly for this shop
  const localList = getStoredFeedbacks().filter(
    (fb) => fb.business_id === shop.id || fb.business_slug === shop.slug
  );

  const seenIds = new Set(tenantFeedback.map((f) => f.id));
  for (const lfb of localList) {
    if (!seenIds.has(lfb.id)) {
      tenantFeedback.push({
        ...lfb,
        business_name: shop.name,
        business_slug: shop.slug,
      });
    }
  }

  return NextResponse.json(
    {
      success: true,
      shop: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        category: shop.category,
        city: shop.city,
        owner_name: shop.owner_name,
        owner_phone: shop.owner_phone,
        google_review_url: shop.google_review_url,
        subscription_status: shop.subscription_status,
        total_scans: shop.total_scans ?? shop.scans_count ?? 0,
        positive_redirects: shop.positive_redirects ?? shop.reviews_gained ?? 0,
        scans_count: shop.total_scans ?? shop.scans_count ?? 0,
        rating_avg: shop.rating_avg ?? 5.0,
        reviews_gained: shop.positive_redirects ?? shop.reviews_gained ?? 0,
        complaints_blocked: Math.max(Number(shop.complaints_blocked || 0), tenantFeedback.length),
      },
      feedback: tenantFeedback,
    },
    { headers: corsHeaders }
  );
}

export async function POST(req: Request) {
  try {
    const { data: body, error: parseErr } = await parseJsonBody(req);
    if (parseErr || !body) {
      return NextResponse.json(
        { success: false, error: parseErr || 'Request body cannot be empty' },
        { status: 400, headers: corsHeaders }
      );
    }
    const { action } = body;

    // ACTION: login
    if (action === 'login') {
      const identifier = safeString(body.identifier, 100);
      const pin = safeString(body.pin, 20);
      if (!identifier || !pin) {
        return NextResponse.json(
          { success: false, error: 'Please enter both Business ID and Access PIN' },
          { status: 400, headers: corsHeaders }
        );
      }

      const shop = await verifyShopPortalAuth(identifier, pin);
      if (!shop) {
        return NextResponse.json(
          { success: false, error: 'Incorrect Business ID or PIN. Please check your credentials.' },
          { status: 401, headers: corsHeaders }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: `Welcome back, ${shop.name}!`,
          shop: {
            id: shop.id,
            name: shop.name,
            slug: shop.slug,
            category: shop.category,
            city: shop.city,
            owner_name: shop.owner_name,
            owner_phone: shop.owner_phone,
            google_review_url: shop.google_review_url,
            subscription_status: shop.subscription_status,
            total_scans: shop.total_scans ?? shop.scans_count ?? 0,
            positive_redirects: shop.positive_redirects ?? shop.reviews_gained ?? 0,
            scans_count: shop.total_scans ?? shop.scans_count ?? 0,
            reviews_gained: shop.positive_redirects ?? shop.reviews_gained ?? 0,
            complaints_blocked: shop.complaints_blocked ?? 0,
          },
        },
        { headers: corsHeaders }
      );
    }

    // ACTION: resolve_complaint (Tenant authenticated)
    if (action === 'resolve_complaint') {
      const { shop_slug, pin, feedback_id, new_status } = body;
      const shop = await verifyShopPortalAuth(shop_slug, pin);
      if (!shop) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }

      updateStoredFeedbackStatus(feedback_id, new_status || 'resolved', shop.id);

      if (isSupabaseConfigured()) {
        try {
          await supabaseAdmin
            .from('private_feedback')
            .update({ status: new_status || 'resolved' })
            .eq('id', feedback_id)
            .eq('business_id', shop.id);
        } catch (err) {
          console.warn('[Tenant Portal] Resolve complaint error:', err);
        }
      }

      return NextResponse.json({ success: true, message: 'Complaint status updated' }, { headers: corsHeaders });
    }

    // ACTION: delete_complaint (Tenant authenticated delete)
    if (action === 'delete_complaint') {
      const { shop_slug, pin, feedback_id } = body;
      const shop = await verifyShopPortalAuth(shop_slug, pin);
      if (!shop) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }

      deleteStoredFeedback(feedback_id, shop.id);

      if (isSupabaseConfigured()) {
        try {
          await supabaseAdmin
            .from('private_feedback')
            .delete()
            .eq('id', feedback_id)
            .eq('business_id', shop.id);
        } catch (err) {
          console.warn('[Tenant Portal] Delete complaint error:', err);
        }
      }

      return NextResponse.json({ success: true, message: 'Complaint deleted permanently' }, { headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400, headers: corsHeaders });
  } catch (err: unknown) {
    return safeInternalError(err, 'Portal API POST', corsHeaders);
  }
}
