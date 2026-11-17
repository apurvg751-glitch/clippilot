import { NextResponse } from 'next/server';
import { getAllShops, updateShopSubscription } from '@/lib/shopStore';
import { sendWhatsAppNotification } from '@/lib/whatsapp';

/**
 * Daily Cron Job: Trial Expiry & Grace Period Verification
 * Path: GET /api/cron/subscription-check or POST /api/cron/subscription-check
 *
 * Runs once daily at midnight (00:00 UTC) via Vercel Cron or external scheduler.
 * 1. Checks for shops with expired 7-day trials -> updates to 'paused' and sends WhatsApp payment link.
 * 2. Checks for shops in 'grace_period' more than 3 days overdue -> updates to 'paused' and notifies owner.
 */
async function runSubscriptionAudit(req: Request) {
  try {
    // 1. Verify Vercel Cron Secret (Fail-closed)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized: CRON_SECRET required' }, { status: 401 });
    }

    const now = new Date();
    const allShops = await getAllShops();

    const trialsExpired: Array<{ slug: string; name: string; ownerPhone: string }> = [];
    const graceEnded: Array<{ slug: string; name: string; ownerPhone: string; overdueDays: number }> = [];

    console.log(`[Subscription Cron Started] Checking ${allShops.length} shops at ${now.toISOString()}`);

    for (const shop of allShops) {
      const payLink =
        shop.payment_link || `https://clippilot-rust.vercel.app/r/${shop.slug}?pay=1`;

      // ------------------------------------------------------------------------
      // CHECK 1: Free Trial Expiry Check (trial_ends_at < NOW())
      // ------------------------------------------------------------------------
      if (shop.subscription_status === 'trial') {
        const trialEndDate = new Date(shop.trial_ends_at);

        if (trialEndDate < now) {
          console.log(`[Trial Expired] Pausing shop: ${shop.name} (${shop.slug}). Ended: ${trialEndDate.toISOString()}`);

          // Remote kill switch: Update to paused
          await updateShopSubscription(shop.id, {
            subscription_status: 'paused',
          });

          // Dispatch trial ended WhatsApp notification with payment link & aggregated 7-day review stats
          await sendWhatsAppNotification({
            recipientPhone: shop.owner_phone,
            ownerName: shop.owner_name,
            shopName: shop.name,
            shopSlug: shop.slug,
            type: 'trial_ended',
            paymentLink: payLink,
            reviewsGained: shop.reviews_gained ?? 0,
            complaintsBlocked: shop.complaints_blocked ?? 0,
            scansCount: shop.scans_count ?? 0,
            ratingAvg: shop.rating_avg ?? 5.0,
          });

          trialsExpired.push({
            slug: shop.slug,
            name: shop.name,
            ownerPhone: shop.owner_phone,
          });
        }
      }

      // ------------------------------------------------------------------------
      // CHECK 2: Grace Period Overdue Check (> 3 days overdue)
      // ------------------------------------------------------------------------
      if (shop.subscription_status === 'grace_period') {
        // Benchmark against current_period_end, or fallback to shop.updated_at
        const baselineTime = shop.current_period_end
          ? new Date(shop.current_period_end).getTime()
          : shop.updated_at
          ? new Date(shop.updated_at).getTime()
          : now.getTime() - 4 * 24 * 60 * 60 * 1000;

        const overdueMs = now.getTime() - baselineTime;
        const overdueDays = overdueMs / (1000 * 60 * 60 * 24);

        if (overdueDays > 3) {
          console.log(
            `[Grace Period Concluded] Pausing shop: ${shop.name} (${shop.slug}). Overdue by ${overdueDays.toFixed(1)} days.`
          );

          // Remote kill switch: Update to paused
          await updateShopSubscription(shop.id, {
            subscription_status: 'paused',
          });

          // Dispatch grace period expired WhatsApp notification
          await sendWhatsAppNotification({
            recipientPhone: shop.owner_phone,
            ownerName: shop.owner_name,
            shopName: shop.name,
            shopSlug: shop.slug,
            type: 'grace_period_expired',
            paymentLink: payLink,
          });

          graceEnded.push({
            slug: shop.slug,
            name: shop.name,
            ownerPhone: shop.owner_phone,
            overdueDays: Math.round(overdueDays * 10) / 10,
          });
        }
      }
    }

    const summary = {
      success: true,
      timestamp: now.toISOString(),
      total_shops_checked: allShops.length,
      trials_expired_count: trialsExpired.length,
      grace_ended_count: graceEnded.length,
      trials_expired: trialsExpired,
      grace_ended: graceEnded,
    };

    console.log('[Subscription Cron Complete]', summary);
    return NextResponse.json(summary);
  } catch (err: any) {
    console.error('[Subscription Cron Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return runSubscriptionAudit(req);
}

export async function POST(req: Request) {
  return runSubscriptionAudit(req);
}
