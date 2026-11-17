-- ==============================================================================
-- RepuBoost: Automated Subscription & Remote Kill Switch Schema Update
-- Migration: 20261115_subscription_remote_kill_switch.sql
-- ==============================================================================

-- 1. Create Subscription Status Enum
DO $$ BEGIN
    CREATE TYPE subscription_status_enum AS ENUM ('trial', 'active', 'grace_period', 'paused');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Ensure UUID extension is active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Create or Update `shops` Table
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'Retail & General',
    city TEXT DEFAULT 'Delhi',
    owner_name TEXT NOT NULL,
    owner_phone TEXT NOT NULL,
    google_review_url TEXT NOT NULL,
    monthly_retainer NUMERIC(10, 2) DEFAULT 2999.00,
    
    -- Subscription & Remote Kill Switch Fields
    subscription_status subscription_status_enum NOT NULL DEFAULT 'trial',
    trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    current_period_end TIMESTAMPTZ,
    razorpay_subscription_id TEXT,
    razorpay_customer_id TEXT,
    payment_link TEXT,
    
    -- Engagement & Reputation Metrics
    scans_count INTEGER DEFAULT 0,
    rating_avg NUMERIC(3, 2) DEFAULT 5.0,
    reviews_gained INTEGER DEFAULT 0,
    complaints_blocked INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments on Columns for Clarity
COMMENT ON COLUMN public.shops.subscription_status IS 'Lifecycle state: trial (7 days free), active (paid), grace_period (failed billing, 3 days to resolve), paused (remote kill switch engaged)';
COMMENT ON COLUMN public.shops.trial_ends_at IS 'Timestamp when 7-day free trial concludes (defaults to NOW() + 7 days)';
COMMENT ON COLUMN public.shops.current_period_end IS 'Timestamp when active billing cycle ends';
COMMENT ON COLUMN public.shops.razorpay_subscription_id IS 'Associated Razorpay recurring subscription ID (e.g., sub_xxxxxxxxxxxxxx)';

-- 4. Backward Compatibility with existing `businesses` table (if present)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'businesses') THEN
        -- Add columns if not already present
        ALTER TABLE public.businesses 
            ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial',
            ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
            ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
            ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT,
            ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT,
            ADD COLUMN IF NOT EXISTS payment_link TEXT;
            
        -- Sync existing records to shops table
        INSERT INTO public.shops (id, name, slug, category, city, owner_name, owner_phone, google_review_url, monthly_retainer, subscription_status, created_at)
        SELECT 
            id, name, slug, category, city, owner_name, owner_phone, google_review_url, monthly_retainer, 
            CASE 
                WHEN payment_status = 'active' THEN 'active'::subscription_status_enum
                WHEN payment_status = 'paused' THEN 'paused'::subscription_status_enum
                ELSE 'trial'::subscription_status_enum
            END,
            created_at
        FROM public.businesses
        ON CONFLICT (slug) DO UPDATE 
        SET subscription_status = EXCLUDED.subscription_status;
    END IF;
END $$;

-- 5. Indexes for High-Performance Gatekeeping & Midnight Cron
CREATE INDEX IF NOT EXISTS idx_shops_slug ON public.shops(slug);
CREATE INDEX IF NOT EXISTS idx_shops_subscription_status ON public.shops(subscription_status);
CREATE INDEX IF NOT EXISTS idx_shops_trial_ends_at ON public.shops(trial_ends_at) WHERE subscription_status = 'trial';
CREATE INDEX IF NOT EXISTS idx_shops_current_period_end ON public.shops(current_period_end) WHERE subscription_status = 'grace_period';
CREATE INDEX IF NOT EXISTS idx_shops_razorpay_sub_id ON public.shops(razorpay_subscription_id);

-- 6. Row-Level Security (RLS) Policies
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- Public read policy (allows customer landing page gatekeeper to check status by slug)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access to shops') THEN
        CREATE POLICY "Allow public read access to shops" ON public.shops FOR SELECT USING (true);
    END IF;

    -- Service role / Admin policy for mutations
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service role full access to shops') THEN
        CREATE POLICY "Allow service role full access to shops" ON public.shops FOR ALL USING (true);
    END IF;
END $$;

-- 7. Automated Updated At Trigger
CREATE OR REPLACE FUNCTION update_shops_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_shops_updated_at ON public.shops;
CREATE TRIGGER update_shops_updated_at
    BEFORE UPDATE ON public.shops
    FOR EACH ROW
    EXECUTE FUNCTION update_shops_updated_at_column();
