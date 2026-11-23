import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { Shop, SubscriptionStatus } from '@/types/repuboost';

const CLIENTS_STORE_PATH = path.join(process.env.TEMP || '/tmp', 'repuboost_clients_store.json');
const METRICS_STORE_PATH = path.join(process.env.TEMP || '/tmp', 'repuboost_metrics_store.json');

export interface StoredMetrics {
  total_scans: number;
  positive_redirects: number;
  complaints_blocked?: number;
}

export function getStoredMetrics(): Record<string, StoredMetrics> {
  try {
    if (fs.existsSync(METRICS_STORE_PATH)) {
      const data = fs.readFileSync(METRICS_STORE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {}
  return {};
}

export function saveStoredMetrics(metrics: Record<string, StoredMetrics>): void {
  try {
    fs.writeFileSync(METRICS_STORE_PATH, JSON.stringify(metrics, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed saving metrics store:', err);
  }
}

// Default initial shop data (Empty by default - never resurrect deleted shops)
export const DEFAULT_SHOPS: Shop[] = [];

/**
 * Mock Demo Shop: Strictly isolated for /demo and /review-demo routes only.
 * Never returned by getAllShops(), getShopBySlug(), or verifyShopPortalAuth().
 */
export const MOCK_DEMO_SHOP: Shop = {
  id: 'demo-royal-spice',
  name: 'The Royal Spice Restaurant',
  slug: 'demo',
  category: 'Fine Dining & Hospitality',
  city: 'Jaipur, Rajasthan',
  owner_name: 'Royal Spice Management',
  owner_phone: '+91 98765 43210',
  google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
  monthly_retainer: 899,
  subscription_status: 'active',
  portal_password: 'DEMO88',
  trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  razorpay_subscription_id: 'sub_demo_001',
  payment_link: null,
  total_scans: 142,
  positive_redirects: 28,
  scans_count: 142,
  rating_avg: 4.8,
  reviews_gained: 28,
  complaints_blocked: 4,
  created_at: new Date('2026-11-01T00:00:00.000Z').toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Generates a cryptographically secure 6-digit random access PIN
 */
export function generateSecurePin(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// Backward-compatible alias
export const generateDefaultPin = generateSecurePin;

/**
 * Extracts persistent PIN from DB record or embedded URL fragment
 */
export function extractStoredPin(raw: any): string {
  if (raw.portal_password) return String(raw.portal_password).trim().toUpperCase();
  if (raw.google_review_url && typeof raw.google_review_url === 'string' && raw.google_review_url.includes('#repuboost_pin=')) {
    const match = raw.google_review_url.match(/#repuboost_pin=([A-Z0-9_-]+)/i);
    if (match && match[1]) {
      return match[1].trim().toUpperCase();
    }
  }
  return generateSecurePin();
}

/**
 * Cleans review URL so users/guests are redirected to official Google Maps without internal metadata tags
 */
export function cleanGoogleReviewUrl(url?: string): string {
  if (!url) return '';
  return url.replace(/#repuboost_pin=[^&]*/g, '');
}

/**
 * Normalizes a raw shop/business record from DB or file to typed Shop
 * Accurately supports all 4 lifecycle states: 'trial' | 'active' | 'grace_period' | 'paused'
 */
function normalizeShop(raw: any): Shop {
  const candidateStatus = raw.subscription_status || raw.payment_status;
  const validStatuses: SubscriptionStatus[] = ['trial', 'active', 'grace_period', 'paused'];

  const rawStatus: SubscriptionStatus = validStatuses.includes(candidateStatus)
    ? candidateStatus
    : candidateStatus === 'due'
    ? 'grace_period'
    : 'trial';

  // Real-time trial expiration enforcement: If 7-day trial has elapsed, immediately pause
  const trialEnds = raw.trial_ends_at
    ? new Date(raw.trial_ends_at).getTime()
    : (raw.created_at ? new Date(raw.created_at).getTime() : Date.now()) + 7 * 24 * 60 * 60 * 1000;

  const status: SubscriptionStatus =
    rawStatus === 'trial' && trialEnds < Date.now() ? 'paused' : rawStatus;

  return {
    id: raw.id || `shop_${Date.now()}`,
    name: raw.name || 'Unnamed Shop',
    slug: raw.slug || 'shop',
    category: raw.category || 'Retail & General',
    city: raw.city || 'Delhi',
    owner_name: raw.owner_name || 'Management',
    owner_phone: raw.owner_phone || '',
    google_review_url: cleanGoogleReviewUrl(raw.google_review_url),
    monthly_retainer: Number(raw.monthly_retainer) || 899,
    subscription_status: status,
    payment_status: status,
    portal_password: extractStoredPin(raw),
    trial_ends_at:
      raw.trial_ends_at ||
      new Date((raw.created_at ? new Date(raw.created_at).getTime() : Date.now()) + 7 * 24 * 60 * 60 * 1000).toISOString(),
    current_period_end: raw.current_period_end || null,
    razorpay_subscription_id: raw.razorpay_subscription_id || null,
    razorpay_customer_id: raw.razorpay_customer_id || null,
    payment_link: raw.payment_link || null,
    total_scans: Number(
      raw.total_scans ??
      getStoredMetrics()[raw.id]?.total_scans ??
      getStoredMetrics()[raw.slug]?.total_scans ??
      raw.scans_count ??
      0
    ),
    positive_redirects: Number(
      raw.positive_redirects ??
      getStoredMetrics()[raw.id]?.positive_redirects ??
      getStoredMetrics()[raw.slug]?.positive_redirects ??
      raw.reviews_gained ??
      0
    ),
    scans_count: Number(
      raw.total_scans ??
      getStoredMetrics()[raw.id]?.total_scans ??
      getStoredMetrics()[raw.slug]?.total_scans ??
      raw.scans_count ??
      0
    ),
    rating_avg: raw.rating_avg ?? 5.0,
    reviews_gained: Number(
      raw.positive_redirects ??
      getStoredMetrics()[raw.id]?.positive_redirects ??
      getStoredMetrics()[raw.slug]?.positive_redirects ??
      raw.reviews_gained ??
      0
    ),
    complaints_blocked: Number(
      raw.complaints_blocked ??
      getStoredMetrics()[raw.id]?.complaints_blocked ??
      getStoredMetrics()[raw.slug]?.complaints_blocked ??
      0
    ),
    created_at: raw.created_at || new Date().toISOString(),
    updated_at: raw.updated_at || new Date().toISOString(),
  };
}

/**
 * Reads local cached shops
 */
export function getLocalShops(): Shop[] {
  try {
    if (fs.existsSync(CLIENTS_STORE_PATH)) {
      const raw = fs.readFileSync(CLIENTS_STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeShop);
      }
    }
  } catch (err) {
    console.error('Failed reading local shop file:', err);
  }
  return [];
}

/**
 * Saves shops locally
 */
export function saveLocalShops(shops: Shop[]): void {
  try {
    fs.writeFileSync(CLIENTS_STORE_PATH, JSON.stringify(shops, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing local shop file:', err);
  }
}

// In-Memory Micro-Cache for zero-latency repetitive scans (45s TTL)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const shopCacheBySlug = new Map<string, CacheEntry<Shop | null>>();
const CACHE_TTL_MS = 45 * 1000;

export function invalidateShopCache(slug?: string) {
  if (slug) {
    shopCacheBySlug.delete(slug.toLowerCase().trim());
  } else {
    shopCacheBySlug.clear();
  }
}

/**
 * Fetch all shops from Supabase or local store using supabaseAdmin.
 * Strictly uses Supabase when configured with ZERO fallback to local storage.
 */
export async function getAllShops(): Promise<Shop[]> {
  if (isSupabaseConfigured()) {
    try {
      // Direct query to businesses table (the active live table in Supabase)
      const { data: bizData, error: bizErr } = await supabaseAdmin
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (!bizErr && Array.isArray(bizData)) {
        return bizData.map(normalizeShop);
      }
    } catch (err) {
      console.warn('Supabase query error:', err);
    }
    // Strict isolation: When Supabase is configured, NEVER fall back to local storage!
    return [];
  }

  return getLocalShops();
}

/**
 * Retrieve a shop by slug.
 * Strictly checks Supabase when configured with ZERO fallback to local storage.
 */
export async function getShopBySlug(slug: string): Promise<Shop | null> {
  const cleanSlug = slug.trim().toLowerCase();

  // 1. Fast in-memory cache check (<1ms)
  const cached = shopCacheBySlug.get(cleanSlug);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  if (isSupabaseConfigured()) {
    try {
      // 2. Direct query to businesses table (zero missing-table penalty)
      const { data: biz, error: bizErr } = await supabaseAdmin
        .from('businesses')
        .select('*')
        .eq('slug', cleanSlug)
        .maybeSingle();

      if (!bizErr) {
        const result = biz ? normalizeShop(biz) : null;
        shopCacheBySlug.set(cleanSlug, { data: result, timestamp: Date.now() });
        return result;
      }
    } catch (err) {
      console.warn(`Supabase getShopBySlug(${cleanSlug}) failed:`, err);
    }
    // Strict isolation: When Supabase is configured, NEVER fall back to local storage!
    return null;
  }

  const locals = getLocalShops();
  const matched = locals.find((s) => s.slug.toLowerCase() === cleanSlug);
  return matched || null;
}

/**
 * Verifies credentials for a shopkeeper tenant login.
 * Uses strict exact matching (===) ONLY - no loose .includes() checks.
 */
export async function verifyShopPortalAuth(identifier: string, pin: string): Promise<Shop | null> {
  const cleanId = typeof identifier === 'string' ? identifier.trim().toLowerCase() : '';
  const normalizedId = cleanId.replace(/[^a-z0-9]/g, '');
  const cleanPin = typeof pin === 'string' ? pin.trim().toUpperCase() : typeof pin === 'number' ? String(pin).trim().toUpperCase() : '';

  if (!cleanId || !cleanPin) return null;

  const all = await getAllShops();
  const matched = all.find((s) => {
    const sSlug = s.slug.toLowerCase();
    const sId = s.id.toLowerCase();
    const sName = s.name.toLowerCase();
    const sSlugNorm = sSlug.replace(/[^a-z0-9]/g, '');
    const sNameNorm = sName.replace(/[^a-z0-9]/g, '');
    const sPhoneNorm = s.owner_phone.replace(/[^0-9]/g, '');
    const idPhoneNorm = cleanId.replace(/[^0-9]/g, '');

    // Strict exact matching (===) ONLY - loose .includes() checks removed for security
    return (
      sSlug === cleanId ||
      sId === cleanId ||
      sName === cleanId ||
      (normalizedId.length >= 3 && (sSlugNorm === normalizedId || sNameNorm === normalizedId)) ||
      (idPhoneNorm.length >= 10 && sPhoneNorm === idPhoneNorm)
    );
  });

  if (!matched) return null;

  const validPin = (matched.portal_password || generateSecurePin()).toUpperCase();
  if (validPin === cleanPin) {
    return matched;
  }
  return null;
}

/**
 * Retrieve a shop by ID.
 * Strictly checks Supabase when configured with ZERO fallback to local storage.
 */
export async function getShopById(id: string): Promise<Shop | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data: biz, error: bizErr } = await supabaseAdmin.from('businesses').select('*').eq('id', id).maybeSingle();
      if (!bizErr && biz) return normalizeShop(biz);
    } catch (err) {
      console.warn(`Supabase getShopById(${id}) failed:`, err);
    }
    // Strict isolation: When Supabase is configured, NEVER fall back to local storage!
    return null;
  }

  const locals = getLocalShops();
  return locals.find((s) => s.id === id) || null;
}

/**
 * Retrieve a shop by Razorpay subscription ID.
 * Strictly checks Supabase when configured with ZERO fallback to local storage.
 */
export async function getShopByRazorpaySubscriptionId(subId: string): Promise<Shop | null> {
  if (!subId) return null;

  if (isSupabaseConfigured()) {
    try {
      const { data: biz } = await supabaseAdmin
        .from('businesses')
        .select('*')
        .eq('razorpay_subscription_id', subId)
        .maybeSingle();
      if (biz) return normalizeShop(biz);
    } catch (err) {
      console.warn(`Supabase lookup for subId ${subId} failed:`, err);
    }
    // Strict isolation: When Supabase is configured, NEVER fall back to local storage!
    return null;
  }

  const locals = getLocalShops();
  return locals.find((s) => s.razorpay_subscription_id === subId) || null;
}

/**
 * Updates a shop's subscription status or metadata across DB and local store
 * Guarantees persistent writes into Supabase by using supabaseAdmin and handling schema variations
 */
export async function updateShopSubscription(
  identifier: string | { id?: string; slug?: string },
  updates: Partial<Shop>
): Promise<Shop | null> {
  let targetId: string | undefined;
  let targetSlug: string | undefined;

  if (typeof identifier === 'string') {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)) {
      targetId = identifier;
    } else {
      targetSlug = identifier;
    }
  } else if (identifier) {
    if (identifier.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier.id)) {
      targetId = identifier.id;
    }
    targetSlug = identifier.slug || (!targetId ? identifier.id : undefined);
  }

  const newStatus = updates.subscription_status || updates.payment_status;
  const updatedData: Record<string, any> = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (newStatus) {
    updatedData.subscription_status = newStatus;
    updatedData.payment_status = newStatus;
  }

  let updatedShop: Shop | null = null;

  if (isSupabaseConfigured()) {
    // 1. Direct update to businesses table (the active live table in Supabase)
    try {
      const bizPayload: Record<string, any> = {};
      if (newStatus) {
        bizPayload.payment_status = newStatus;
      }
      if (updates.name) bizPayload.name = updates.name;
      if (updates.category) bizPayload.category = updates.category;
      if (updates.city) bizPayload.city = updates.city;
      if (updates.owner_name) bizPayload.owner_name = updates.owner_name;
      if (updates.owner_phone) bizPayload.owner_phone = updates.owner_phone;
      if (updates.monthly_retainer) bizPayload.monthly_retainer = updates.monthly_retainer;

      // Handle PIN persistence in Supabase:
      // Since businesses table schema doesn't have a portal_password column,
      // embed the PIN as a persistent #repuboost_pin=... fragment into google_review_url.
      if (updates.portal_password) {
        const cleanPin = updates.portal_password.trim().toUpperCase();
        let targetGoogleUrl = updates.google_review_url;
        if (!targetGoogleUrl) {
          const currentShop = targetId ? await getShopById(targetId) : targetSlug ? await getShopBySlug(targetSlug) : null;
          targetGoogleUrl = currentShop?.google_review_url || '';
        }
        const cleaned = (targetGoogleUrl || '').replace(/#repuboost_pin=[^&]*/g, '');
        bizPayload.google_review_url = `${cleaned}#repuboost_pin=${cleanPin}`;
      } else if (updates.google_review_url) {
        bizPayload.google_review_url = updates.google_review_url;
      }

      let bizRes = null;
      if (targetId) {
        const { data } = await supabaseAdmin
          .from('businesses')
          .update(bizPayload)
          .eq('id', targetId)
          .select()
          .maybeSingle();
        bizRes = data;
      }
      if (!bizRes && targetSlug) {
        const { data } = await supabaseAdmin
          .from('businesses')
          .update(bizPayload)
          .eq('slug', targetSlug)
          .select()
          .maybeSingle();
        bizRes = data;
      }

      if (bizRes) {
        updatedShop = normalizeShop({
          ...bizRes,
          subscription_status: newStatus || bizRes.payment_status,
          payment_status: newStatus || bizRes.payment_status,
        });
      }
    } catch (err) {
      console.warn('Supabase businesses update error:', err);
    }

    invalidateShopCache(targetSlug);
  }

  // 3. Update local file store
  const locals = getLocalShops();
  const idx = locals.findIndex(
    (s) =>
      (targetId && s.id === targetId) ||
      (targetSlug && (s.slug === targetSlug || s.id === targetSlug))
  );
  if (idx >= 0) {
    const merged = normalizeShop({
      ...locals[idx],
      ...updatedData,
      subscription_status: newStatus || locals[idx].subscription_status,
      payment_status: newStatus || locals[idx].subscription_status,
    });
    locals[idx] = merged;
    saveLocalShops(locals);
    if (!updatedShop) {
      updatedShop = merged;
    }
  }

  return updatedShop;
}

/**
 * Permanently deletes a shop and its associated feedback records
 */
export async function deleteShop(
  identifier: string | { id?: string; slug?: string },
  explicitSlug?: string
): Promise<boolean> {
  let targetId: string | undefined;
  let targetSlug: string | undefined;

  if (typeof identifier === 'string') {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)) {
      targetId = identifier;
    } else {
      targetSlug = identifier;
    }
  } else if (identifier) {
    if (identifier.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier.id)) {
      targetId = identifier.id;
    }
    targetSlug = identifier.slug || (!targetId ? identifier.id : undefined);
  }

  if (explicitSlug && !targetSlug) {
    targetSlug = explicitSlug;
  }

  if (isSupabaseConfigured()) {
    try {
      if (targetId) {
        await supabaseAdmin.from('private_feedback').delete().eq('business_id', targetId);
        await supabaseAdmin.from('businesses').delete().eq('id', targetId);
      }
      if (targetSlug) {
        await supabaseAdmin.from('businesses').delete().eq('slug', targetSlug);
      }
      invalidateShopCache(targetSlug);
    } catch (err) {
      console.warn('Failed deleting shop from Supabase:', err);
    }
  }

  const locals = getLocalShops();
  const filtered = locals.filter((s) => {
    if (targetId && s.id === targetId) return false;
    if (targetSlug && (s.slug === targetSlug || s.id === targetSlug)) return false;
    return true;
  });
  saveLocalShops(filtered);
  return true;
}

/**
 * Creates a new shop with default 7-day trial and remote kill-switch ready status
 */
export async function createShop(data: {
  name: string;
  slug: string;
  category: string;
  city?: string;
  owner_name: string;
  owner_phone: string;
  google_review_url: string;
  monthly_retainer?: number;
  subscription_status?: SubscriptionStatus;
  payment_link?: string;
}): Promise<Shop> {
  const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const status: SubscriptionStatus = data.subscription_status || 'trial';

  const rawSlug = typeof data.slug === 'string' && data.slug.trim() ? data.slug : (data.name || 'shop');
  const cleanSlug = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

  const newShopData = {
    name: data.name || 'Untitled Shop',
    slug: cleanSlug,
    category: data.category || 'Retail & General',
    city: data.city || 'Delhi',
    owner_name: data.owner_name,
    owner_phone: data.owner_phone,
    google_review_url: data.google_review_url,
    monthly_retainer: Number(data.monthly_retainer) || 899,
    subscription_status: status,
    payment_status: status,
    trial_ends_at: trialEndsAt,
    current_period_end: null,
    razorpay_subscription_id: null,
    payment_link: data.payment_link || `https://rzp.io/l/repuboost-${data.slug}`,
    scans_count: 0,
    rating_avg: 5.0,
    reviews_gained: 0,
    complaints_blocked: 0,
  };

  let created: Shop | null = null;

  if (isSupabaseConfigured()) {
    try {
      const { data: dbData, error } = await supabaseAdmin
        .from('businesses')
        .insert({
          name: newShopData.name,
          slug: newShopData.slug,
          category: newShopData.category,
          city: newShopData.city,
          owner_name: newShopData.owner_name,
          owner_phone: newShopData.owner_phone,
          google_review_url: newShopData.google_review_url,
          monthly_retainer: newShopData.monthly_retainer,
          payment_status: newShopData.payment_status,
        })
        .select()
        .single();

      if (!error && dbData) {
        created = normalizeShop(dbData);
      }
      invalidateShopCache(newShopData.slug);
    } catch (err) {
      console.warn('Supabase createShop failed, storing locally:', err);
    }
  }

  if (!created) {
    created = normalizeShop({
      id: `shop_${Date.now()}`,
      ...newShopData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  const locals = getLocalShops();
  const filtered = locals.filter((s) => s.slug !== created!.slug);
  filtered.unshift(created);
  saveLocalShops(filtered);

  return created;
}

/**
 * Atomically increments a business metric ('total_scans' or 'positive_redirects')
 * 1. Checks if shop exists and is NOT paused (never track when paused)
 * 2. Attempts atomic Supabase RPC: increment_business_metric(p_business_id, p_metric)
 * 3. Falls back safely to direct update / local cache increment
 */
export async function incrementBusinessMetric(
  slugOrId: string,
  metric: 'total_scans' | 'positive_redirects' | 'complaints_blocked'
): Promise<{ success: boolean; total_scans?: number; positive_redirects?: number; complaints_blocked?: number; error?: string }> {
  if (!slugOrId || (metric !== 'total_scans' && metric !== 'positive_redirects' && metric !== 'complaints_blocked')) {
    return { success: false, error: 'Invalid parameters' };
  }

  // 1. Lookup shop
  let shop: Shop | null = null;
  if (slugOrId.includes('-') && slugOrId.length > 20) {
    // Possible UUID
    shop = await getShopById(slugOrId);
  }
  if (!shop) {
    shop = await getShopBySlug(slugOrId);
  }
  if (!shop) {
    // Check mock demo shop
    if (slugOrId.trim().toLowerCase() === 'demo') {
      MOCK_DEMO_SHOP[metric] = (MOCK_DEMO_SHOP[metric] || 0) + 1;
      if (metric === 'total_scans') MOCK_DEMO_SHOP.scans_count = MOCK_DEMO_SHOP.total_scans;
      if (metric === 'positive_redirects') MOCK_DEMO_SHOP.reviews_gained = MOCK_DEMO_SHOP.positive_redirects;
      return {
        success: true,
        total_scans: MOCK_DEMO_SHOP.total_scans,
        positive_redirects: MOCK_DEMO_SHOP.positive_redirects,
        complaints_blocked: MOCK_DEMO_SHOP.complaints_blocked,
      };
    }
    return { success: false, error: 'Shop not found' };
  }

  // 2. Do NOT track anything if shop is paused
  if (shop.subscription_status === 'paused') {
    return { success: false, error: 'Shop is paused' };
  }

  let updatedTotalScans = (shop.total_scans ?? shop.scans_count ?? 0) + (metric === 'total_scans' ? 1 : 0);
  let updatedPositiveRedirects = (shop.positive_redirects ?? shop.reviews_gained ?? 0) + (metric === 'positive_redirects' ? 1 : 0);
  let updatedComplaintsBlocked = (shop.complaints_blocked ?? 0) + (metric === 'complaints_blocked' ? 1 : 0);

  // 3. Update persistent metrics cache
  const metricsCache = getStoredMetrics();
  const shopKey = shop.id || shop.slug;
  if (!metricsCache[shopKey]) {
    metricsCache[shopKey] = {
      total_scans: Number(shop.total_scans ?? shop.scans_count ?? 0),
      positive_redirects: Number(shop.positive_redirects ?? shop.reviews_gained ?? 0),
      complaints_blocked: Number(shop.complaints_blocked ?? 0),
    };
  }
  if (metric === 'total_scans') {
    metricsCache[shopKey].total_scans = (metricsCache[shopKey].total_scans || 0) + 1;
    updatedTotalScans = metricsCache[shopKey].total_scans;
  } else if (metric === 'positive_redirects') {
    metricsCache[shopKey].positive_redirects = (metricsCache[shopKey].positive_redirects || 0) + 1;
    updatedPositiveRedirects = metricsCache[shopKey].positive_redirects;
  } else if (metric === 'complaints_blocked') {
    metricsCache[shopKey].complaints_blocked = (metricsCache[shopKey].complaints_blocked || 0) + 1;
    updatedComplaintsBlocked = metricsCache[shopKey].complaints_blocked;
  }
  if (shop.slug && shop.slug !== shopKey) {
    metricsCache[shop.slug] = { ...metricsCache[shopKey] };
  }
  saveStoredMetrics(metricsCache);

  // 4. Supabase RPC / Direct Update
  if (isSupabaseConfigured()) {
    try {
      // Try atomic RPC function first
      const { data: rpcData, error: rpcErr } = await supabaseAdmin.rpc('increment_business_metric', {
        p_business_id: shop.id,
        p_metric: metric,
      });

      if (!rpcErr && rpcData && rpcData.success) {
        if (rpcData.total_scans !== undefined) metricsCache[shopKey].total_scans = rpcData.total_scans;
        if (rpcData.positive_redirects !== undefined) metricsCache[shopKey].positive_redirects = rpcData.positive_redirects;
        if (rpcData.complaints_blocked !== undefined) metricsCache[shopKey].complaints_blocked = rpcData.complaints_blocked;
        if (shop.slug) metricsCache[shop.slug] = { ...metricsCache[shopKey] };
        saveStoredMetrics(metricsCache);
        return {
          success: true,
          total_scans: rpcData.total_scans,
          positive_redirects: rpcData.positive_redirects,
          complaints_blocked: rpcData.complaints_blocked,
        };
      }

      // Fallback: direct update if RPC is pending in SQL editor
      const updatePayload: Record<string, any> = {
        [metric]: metric === 'total_scans' ? updatedTotalScans : metric === 'positive_redirects' ? updatedPositiveRedirects : updatedComplaintsBlocked,
      };
      if (metric === 'total_scans') updatePayload.scans_count = updatedTotalScans;
      if (metric === 'positive_redirects') updatePayload.reviews_gained = updatedPositiveRedirects;

      await supabaseAdmin.from('businesses').update(updatePayload).eq('id', shop.id);
    } catch (err) {
      console.warn(`Supabase increment failed for ${slugOrId}:`, err);
    }
  }

  // 5. Update local file store if present
  try {
    const locals = getLocalShops();
    const target = locals.find((s) => s.slug === shop!.slug || s.id === shop!.id);
    if (target) {
      if (metric === 'total_scans') {
        target.total_scans = updatedTotalScans;
        target.scans_count = updatedTotalScans;
      } else if (metric === 'positive_redirects') {
        target.positive_redirects = updatedPositiveRedirects;
        target.reviews_gained = updatedPositiveRedirects;
      } else if (metric === 'complaints_blocked') {
        target.complaints_blocked = updatedComplaintsBlocked;
      }
      saveLocalShops(locals);
    }
  } catch (err) {
    console.warn('Local store update error:', err);
  }

  return {
    success: true,
    total_scans: updatedTotalScans,
    positive_redirects: updatedPositiveRedirects,
    complaints_blocked: updatedComplaintsBlocked,
  };
}
