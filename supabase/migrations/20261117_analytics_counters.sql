-- ==============================================================================
-- RepuBoost: Analytics Counters & Atomic Increment RPC Function
-- Migration: 20261117_analytics_counters.sql
-- Enables real-time, non-blocking scan, positive review, and blocked complaints tracking.
-- ==============================================================================

-- 1. Safely add total_scans, positive_redirects, complaints_blocked columns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'businesses') THEN
        ALTER TABLE public.businesses 
        ADD COLUMN IF NOT EXISTS total_scans INTEGER DEFAULT 0 NOT NULL,
        ADD COLUMN IF NOT EXISTS positive_redirects INTEGER DEFAULT 0 NOT NULL,
        ADD COLUMN IF NOT EXISTS complaints_blocked INTEGER DEFAULT 0 NOT NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shops') THEN
        ALTER TABLE public.shops 
        ADD COLUMN IF NOT EXISTS total_scans INTEGER DEFAULT 0 NOT NULL,
        ADD COLUMN IF NOT EXISTS positive_redirects INTEGER DEFAULT 0 NOT NULL,
        ADD COLUMN IF NOT EXISTS complaints_blocked INTEGER DEFAULT 0 NOT NULL;
    END IF;
END $$;

-- 2. Create atomic increment RPC function with strict parameter validation
CREATE OR REPLACE FUNCTION public.increment_business_metric(
    p_business_id UUID,
    p_metric TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_updated RECORD;
BEGIN
    -- Strict validation of metric name
    IF p_metric NOT IN ('total_scans', 'positive_redirects', 'complaints_blocked') THEN
        RAISE EXCEPTION 'Invalid metric name: %. Allowed metrics are total_scans, positive_redirects, complaints_blocked', p_metric;
    END IF;

    -- Atomic increment on businesses table
    IF p_metric = 'total_scans' THEN
        UPDATE public.businesses
        SET total_scans = COALESCE(total_scans, 0) + 1
        WHERE id = p_business_id
        RETURNING id, name, slug, total_scans, positive_redirects, complaints_blocked INTO v_updated;
    ELSIF p_metric = 'positive_redirects' THEN
        UPDATE public.businesses
        SET positive_redirects = COALESCE(positive_redirects, 0) + 1
        WHERE id = p_business_id
        RETURNING id, name, slug, total_scans, positive_redirects, complaints_blocked INTO v_updated;
    ELSIF p_metric = 'complaints_blocked' THEN
        UPDATE public.businesses
        SET complaints_blocked = COALESCE(complaints_blocked, 0) + 1
        WHERE id = p_business_id
        RETURNING id, name, slug, total_scans, positive_redirects, complaints_blocked INTO v_updated;
    END IF;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true, 
            'metric', p_metric, 
            'total_scans', v_updated.total_scans, 
            'positive_redirects', v_updated.positive_redirects,
            'complaints_blocked', v_updated.complaints_blocked
        );
    END IF;

    -- Fallback: Check if record exists in shops table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shops') THEN
        IF p_metric = 'total_scans' THEN
            UPDATE public.shops
            SET total_scans = COALESCE(total_scans, 0) + 1
            WHERE id = p_business_id
            RETURNING id, name, slug, total_scans, positive_redirects, complaints_blocked INTO v_updated;
        ELSIF p_metric = 'positive_redirects' THEN
            UPDATE public.shops
            SET positive_redirects = COALESCE(positive_redirects, 0) + 1
            WHERE id = p_business_id
            RETURNING id, name, slug, total_scans, positive_redirects, complaints_blocked INTO v_updated;
        ELSIF p_metric = 'complaints_blocked' THEN
            UPDATE public.shops
            SET complaints_blocked = COALESCE(complaints_blocked, 0) + 1
            WHERE id = p_business_id
            RETURNING id, name, slug, total_scans, positive_redirects, complaints_blocked INTO v_updated;
        END IF;

        IF FOUND THEN
            RETURN jsonb_build_object(
                'success', true, 
                'metric', p_metric, 
                'total_scans', v_updated.total_scans, 
                'positive_redirects', v_updated.positive_redirects,
                'complaints_blocked', v_updated.complaints_blocked
            );
        END IF;
    END IF;

    RETURN jsonb_build_object('success', false, 'error', 'Business record not found');
END;
$$;

-- 3. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.increment_business_metric(UUID, TEXT) TO anon, authenticated, service_role;
