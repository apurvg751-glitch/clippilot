import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://epveejqecdmrxwbkbkwe.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_0Ub_zULW00DBro_xQd_f6A_4MAQpcc7';
// Server-only key: strictly read from environment, never hardcode fallback secret literals in client-bundled files
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    !supabaseUrl.includes('placeholder') &&
    supabaseAnonKey !== 'placeholder-anon-key' &&
    supabaseAnonKey.length > 20
  );
};

// Public client for browser / anon reads
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Administrative client for server-side routes to bypass RLS and guarantee persistent writes/updates
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
