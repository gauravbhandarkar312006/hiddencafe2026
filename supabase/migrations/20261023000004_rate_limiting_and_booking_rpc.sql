-- ====================================================================
-- Migration: 20261023000004_rate_limiting_and_booking_rpc.sql
-- Description: Atomic rate limiting, concurrency-safe duplicate protection,
--              exact existing status return, least-privilege service_role RPC,
--              and verified SECURITY DEFINER execution restrictions.
-- Reversible: DROP TABLE IF EXISTS public.rate_limits CASCADE; DROP FUNCTION IF EXISTS public.submit_party_booking CASCADE;
-- ====================================================================

-- 1. Persistent Rate Limit Tracking for serverless environments
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 1,
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON public.rate_limits (expires_at);

-- Enable RLS and lock down direct table access from public / anon clients
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.rate_limits TO service_role;

-- Periodic cleanup of expired rate limit keys (service_role only)
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    DELETE FROM public.rate_limits WHERE expires_at < now();
$$;

REVOKE ALL ON FUNCTION public.cleanup_expired_rate_limits() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_rate_limits() TO service_role;

-- Atomic Rate Limit verification function (single-statement upsert returning count)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_key TEXT,
    p_max_requests INTEGER,
    p_window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_current_count INTEGER;
    v_expires TIMESTAMPTZ := now() + (p_window_seconds || ' seconds')::INTERVAL;
BEGIN
    INSERT INTO public.rate_limits (key, count, expires_at)
    VALUES (p_key, 1, v_expires)
    ON CONFLICT (key) DO UPDATE
    SET count = CASE
            WHEN public.rate_limits.expires_at < now() THEN 1
            ELSE public.rate_limits.count + 1
        END,
        expires_at = CASE
            WHEN public.rate_limits.expires_at < now() THEN v_expires
            ELSE public.rate_limits.expires_at
        END
    RETURNING count INTO v_current_count;

    RETURN v_current_count <= p_max_requests;
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;

-- 2. Privileged Server-Side Booking RPC Function
-- Accessible strictly via service_role from the trusted Supabase Edge Function.
-- Direct execution is revoked from PUBLIC, anon, and authenticated clients to prevent
-- untrusted callers from forging client IP identities or bypassing server validation.
CREATE OR REPLACE FUNCTION public.submit_party_booking(
    p_customer_name TEXT,
    p_phone TEXT,
    p_booking_date DATE,
    p_booking_time TEXT,
    p_guest_count INTEGER,
    p_event_type TEXT,
    p_package_id TEXT DEFAULT NULL,
    p_message TEXT DEFAULT NULL,
    p_ip_hash TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_clean_name TEXT;
    v_clean_phone TEXT;
    v_phone_digits TEXT;
    v_clean_time TEXT;
    v_clean_event TEXT;
    v_clean_message TEXT;
    v_clean_pkg TEXT;
    v_clean_ip TEXT;
    v_booking_id UUID;
    v_existing_duplicate UUID;
    v_existing_status TEXT;
    v_ip_allowed BOOLEAN;
    v_phone_allowed BOOLEAN;
BEGIN
    -- 1. Strict Null and Type Validations
    IF p_customer_name IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Customer name is required.');
    END IF;
    v_clean_name := trim(p_customer_name);
    IF length(v_clean_name) < 2 OR length(v_clean_name) > 100 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Customer name must be between 2 and 100 characters.');
    END IF;

    IF p_phone IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Contact phone number is required.');
    END IF;
    -- Raw format constraint check: ^\+?[0-9\s\-]{10,20}$
    IF NOT (trim(p_phone) ~ '^\+?[0-9\s\-]{10,20}$') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid contact number format.');
    END IF;
    -- Extract digits-only to validate 10-15 digits regardless of punctuation
    v_phone_digits := regexp_replace(trim(p_phone), '[^0-9]', '', 'g');
    IF length(v_phone_digits) < 10 OR length(v_phone_digits) > 15 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Phone number must contain between 10 and 15 digits.');
    END IF;
    -- Standardize stored phone: E.164 if '+' was provided, else digits
    IF trim(p_phone) LIKE '+%' THEN
        v_clean_phone := '+' || v_phone_digits;
    ELSE
        v_clean_phone := v_phone_digits;
    END IF;

    IF p_booking_date IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking date is required.');
    END IF;
    IF p_booking_date < CURRENT_DATE THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking date cannot be in the past.');
    END IF;
    IF p_booking_date > (CURRENT_DATE + INTERVAL '365 days')::DATE THEN
        RETURN jsonb_build_object('success', false, 'error', 'Bookings can only be scheduled up to 1 year in advance.');
    END IF;

    IF p_booking_time IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Time slot is required.');
    END IF;
    v_clean_time := trim(p_booking_time);
    IF length(v_clean_time) < 2 OR length(v_clean_time) > 60 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Time slot must be between 2 and 60 characters.');
    END IF;

    IF p_guest_count IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Guest count is required.');
    END IF;
    IF p_guest_count < 1 OR p_guest_count > 200 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Guest count must be between 1 and 200.');
    END IF;

    IF p_event_type IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Celebration/event type is required.');
    END IF;
    v_clean_event := trim(p_event_type);
    IF length(v_clean_event) < 2 OR length(v_clean_event) > 100 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Celebration type must be between 2 and 100 characters.');
    END IF;

    IF p_package_id IS NOT NULL AND length(trim(p_package_id)) > 0 THEN
        v_clean_pkg := trim(p_package_id);
        IF length(v_clean_pkg) > 80 THEN
            RETURN jsonb_build_object('success', false, 'error', 'Package identifier cannot exceed 80 characters.');
        END IF;
    ELSE
        v_clean_pkg := NULL;
    END IF;

    IF p_message IS NOT NULL AND length(trim(p_message)) > 0 THEN
        v_clean_message := trim(p_message);
        IF length(v_clean_message) > 1000 THEN
            RETURN jsonb_build_object('success', false, 'error', 'Notes/message cannot exceed 1000 characters.');
        END IF;
    ELSE
        v_clean_message := NULL;
    END IF;

    -- 2. IP Hash Validation & Rate Limiting (Requirement 1 & 4)
    -- When called via Edge Function, p_ip_hash is a server-derived salted hex hash.
    -- If p_ip_hash is missing (e.g. unproxied local dev), IP rate limit is skipped and logged;
    -- phone-based rate limiting is ALWAYS strictly enforced.
    IF p_ip_hash IS NOT NULL AND length(trim(p_ip_hash)) > 0 THEN
        IF NOT (trim(p_ip_hash) ~ '^[a-fA-F0-9]{32,64}$') THEN
            RETURN jsonb_build_object('success', false, 'error', 'Invalid IP hash format.');
        END IF;
        v_clean_ip := lower(trim(p_ip_hash));
        -- Enforce IP-based rate limit: max 5 bookings per 10 minutes per IP hash
        v_ip_allowed := public.check_rate_limit('booking_ip:' || v_clean_ip, 5, 600);
        IF NOT v_ip_allowed THEN
            RETURN jsonb_build_object('success', false, 'error', 'Too many booking requests from this network. Please wait a few minutes.');
        END IF;
    ELSE
        v_clean_ip := NULL;
    END IF;

    -- Phone-based rate limiting: max 3 booking attempts per hour per normalized phone digits
    v_phone_allowed := public.check_rate_limit('booking_phone:' || v_phone_digits, 3, 3600);
    IF NOT v_phone_allowed THEN
        RETURN jsonb_build_object('success', false, 'error', 'Multiple bookings detected for this phone. Please contact café staff directly.');
    END IF;

    -- 3. Concurrency-Safe Duplicate Booking Protection (Requirement 3 & 5)
    -- Transactional advisory lock serialized by phone digits + date + slot
    PERFORM pg_advisory_xact_lock(hashtext(v_phone_digits || ':' || p_booking_date::text || ':' || v_clean_time));

    -- Check if an active booking exists for the same phone, date, and slot within 5 minutes
    SELECT id, status INTO v_existing_duplicate, v_existing_status
    FROM public.party_bookings
    WHERE (phone = v_clean_phone OR phone = v_phone_digits OR phone = '+' || v_phone_digits)
      AND booking_date = p_booking_date
      AND booking_time = v_clean_time
      AND status IN ('pending', 'confirmed')
      AND created_at > now() - INTERVAL '5 minutes'
    ORDER BY created_at DESC
    LIMIT 1;

    -- Return actual existing booking status (Requirement 3)
    IF v_existing_duplicate IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', true,
            'booking_id', v_existing_duplicate,
            'booking_date', p_booking_date,
            'booking_time', v_clean_time,
            'status', v_existing_status,
            'message', 'Your booking request is already received. Our team will contact you shortly.'
        );
    END IF;

    -- 4. Parameterized Insert with Generated Privileged Fields
    INSERT INTO public.party_bookings (
        customer_name,
        phone,
        booking_date,
        booking_time,
        guest_count,
        event_type,
        package_id,
        message,
        status,
        ip_hash
    ) VALUES (
        v_clean_name,
        v_clean_phone,
        p_booking_date,
        v_clean_time,
        p_guest_count,
        v_clean_event,
        v_clean_pkg,
        v_clean_message,
        'pending',
        v_clean_ip
    )
    RETURNING id INTO v_booking_id;

    -- 5. Return Minimum Necessary Public Confirmation (Requirement 7)
    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_booking_id,
        'booking_date', p_booking_date,
        'booking_time', v_clean_time,
        'status', 'pending',
        'message', 'Booking request received successfully! We look forward to hosting your celebration.'
    );
END;
$$;

-- Least Privilege Access:
-- Revoke execution from PUBLIC, anon, and authenticated clients.
-- Only the trusted server-side Edge Function (service_role) can execute this function.
REVOKE ALL ON FUNCTION public.submit_party_booking(TEXT, TEXT, DATE, TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_party_booking(TEXT, TEXT, DATE, TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT) TO service_role;
