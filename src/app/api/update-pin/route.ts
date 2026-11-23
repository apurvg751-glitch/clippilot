import { NextResponse } from 'next/server';
import { verifyShopPortalAuth, updateShopSubscription, getShopBySlug, getShopById } from '@/lib/shopStore';
import { parseJsonBody, safeInternalError, isMasterAdminAuthorized, safeString } from '@/lib/apiSecurity';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, x-admin-key',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed. Use POST to update PIN.' },
    { status: 405, headers: corsHeaders }
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

    const { shop_id, slug, shop_slug, current_pin, new_pin } = body;
    const targetSlug = safeString(slug || shop_slug, 80);

    // 1. PIN Format & Strength Validation (4 to 12 alphanumeric characters)
    if (!new_pin || (typeof new_pin !== 'string' && typeof new_pin !== 'number')) {
      return NextResponse.json(
        { success: false, error: 'Missing new_pin parameter' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanNewPin = String(new_pin).trim().toUpperCase();
    if (!/^[A-Z0-9]{4,12}$/.test(cleanNewPin)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid PIN. Must be 4 to 12 alphanumeric characters (A-Z, 0-9) with no spaces or symbols.',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // 2. Authorization Check: Either Master Admin or Authenticated Shop Tenant
    const isAdminAuthorized = isMasterAdminAuthorized(req, body);

    let targetShop = null;

    if (isAdminAuthorized) {
      // Master Admin path
      if (!shop_id && !targetSlug) {
        return NextResponse.json(
          { success: false, error: 'Missing target shop_id or slug' },
          { status: 400, headers: corsHeaders }
        );
      }
      targetShop = shop_id
        ? await getShopById(shop_id)
        : await getShopBySlug(targetSlug);
    } else {
      // Shopkeeper Self-Service path: strictly requires target slug + verified current PIN
      if (!targetSlug || !current_pin) {
        return NextResponse.json(
          {
            success: false,
            error: 'Unauthorized: Provide valid current_pin with shop_slug, or Master Admin authorization.',
          },
          { status: 401, headers: corsHeaders }
        );
      }

      const verified = await verifyShopPortalAuth(targetSlug, String(current_pin));
      if (!verified) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Invalid current PIN or shop identifier' },
          { status: 401, headers: corsHeaders }
        );
      }
      targetShop = verified;
    }

    if (!targetShop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // 3. Persist Updated PIN
    const updated = await updateShopSubscription(
      { id: targetShop.id, slug: targetShop.slug },
      { portal_password: cleanNewPin }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Failed updating shop PIN' },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log(`[PIN Update] Successfully updated PIN for '${updated.name}' (${updated.slug}) to '${cleanNewPin}'`);

    return NextResponse.json(
      {
        success: true,
        message: `Access PIN for '${updated.name}' updated successfully.`,
        shop: {
          id: updated.id,
          name: updated.name,
          slug: updated.slug,
        },
        pin: cleanNewPin,
      },
      { headers: corsHeaders }
    );
  } catch (err: unknown) {
    return safeInternalError(err, 'Update PIN POST', corsHeaders);
  }
}
