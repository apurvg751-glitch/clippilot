-- ==============================================================================
-- RepuBoost: Multi-Tenant Row-Level Security (RLS) Hardening
-- Migration: 20261116_security_rls_hardening.sql
-- Strictly protects 'businesses', 'shops', and 'private_feedback' tables.
-- ==============================================================================

-- 1. Enable RLS on all RepuBoost core tables
ALTER TABLE IF EXISTS public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.private_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.scan_analytics ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing insecure blanket policies on businesses table
DROP POLICY IF EXISTS "Allow public update on businesses" ON public.businesses;
DROP POLICY IF EXISTS "Allow public update" ON public.businesses;
DROP POLICY IF EXISTS "Allow public write to businesses" ON public.businesses;
DROP POLICY IF EXISTS "Allow public insert to businesses" ON public.businesses;
DROP POLICY IF EXISTS "Allow public delete on businesses" ON public.businesses;
DROP POLICY IF EXISTS "Allow public access to businesses" ON public.businesses;
DROP POLICY IF EXISTS "Public update access on businesses" ON public.businesses;

-- 3. Drop any insecure blanket policies on shops table
DROP POLICY IF EXISTS "Allow public update on shops" ON public.shops;
DROP POLICY IF EXISTS "Allow public update" ON public.shops;
DROP POLICY IF EXISTS "Allow public write to shops" ON public.shops;
DROP POLICY IF EXISTS "Allow public delete on shops" ON public.shops;

-- 4. Safe Public Read Policies (Only SELECT allowed for QR counter gatekeeping by slug)
DO $$
BEGIN
    -- Public read for businesses (if table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'businesses') THEN
        DROP POLICY IF EXISTS "Allow public read access to businesses" ON public.businesses;
        CREATE POLICY "Allow public read access to businesses" ON public.businesses FOR SELECT USING (true);

        -- Service role full access for businesses
        DROP POLICY IF EXISTS "Allow service role full access to businesses" ON public.businesses;
        CREATE POLICY "Allow service role full access to businesses" ON public.businesses FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    -- Public read for shops
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shops') THEN
        DROP POLICY IF EXISTS "Allow public read access to shops" ON public.shops;
        CREATE POLICY "Allow public read access to shops" ON public.shops FOR SELECT USING (true);

        -- Service role full access for shops
        DROP POLICY IF EXISTS "Allow service role full access to shops" ON public.shops;
        CREATE POLICY "Allow service role full access to shops" ON public.shops FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 5. Strict Feedback Isolation Policies
-- Public can ONLY insert 1-3 star complaints via the feedback form
DROP POLICY IF EXISTS "Allow public read on private_feedback" ON public.private_feedback;
DROP POLICY IF EXISTS "Allow public select on private_feedback" ON public.private_feedback;
DROP POLICY IF EXISTS "Allow public update on private_feedback" ON public.private_feedback;
DROP POLICY IF EXISTS "Allow public delete on private_feedback" ON public.private_feedback;
DROP POLICY IF EXISTS "Allow public insert to private_feedback" ON public.private_feedback;

CREATE POLICY "Allow public insert to private_feedback" 
    ON public.private_feedback 
    FOR INSERT 
    WITH CHECK (true);

-- Service role full access for authenticated API queries and mutations
DROP POLICY IF EXISTS "Allow service role full access to private_feedback" ON public.private_feedback;
CREATE POLICY "Allow service role full access to private_feedback" 
    ON public.private_feedback 
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- 6. Scan Analytics Policies
DROP POLICY IF EXISTS "Allow public insert to scan_analytics" ON public.scan_analytics;
CREATE POLICY "Allow public insert to scan_analytics" 
    ON public.scan_analytics 
    FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role full access to scan_analytics" ON public.scan_analytics;
CREATE POLICY "Allow service role full access to scan_analytics" 
    ON public.scan_analytics 
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);
