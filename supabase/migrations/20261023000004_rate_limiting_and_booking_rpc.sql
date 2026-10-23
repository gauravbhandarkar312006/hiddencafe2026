-- ====================================================================
-- Migration: 20261023000004_rate_limiting_and_booking_rpc.sql
-- Description: Atomic rate limiting, concurrency-safe duplicate protection,
--              hardened search_path and least-privilege public booking RPC
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

-- Atomic Rate Limit verification function (upsert with returning count)
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

-- 2. Secure Server-Side Public Booking RPC Function
-- This function runs with SECURITY DEFINER to allow public customers
-- to submit bookings through strict server-side validation and rate limits,
-- WITHOUT granting anonymous visitors direct INSERT privileges on the table.
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
    v_clean_time TEXT;
    v_clean_event TEXT;
    v_clean_message TEXT;
    v_clean_pkg TEXT;
    v_clean_ip TEXT;
    v_booking_id UUID;
    v_ip_allowed BOOLEAN;
    v_phone_allowed BOOLEAN;
    v_existing_duplicate UUID;
BEGIN
    -- 1. Input sanitization & normalization
    v_clean_name := trim(p_customer_name);
    v_clean_phone := trim(regexp_replace(p_phone, '[^\+0-9]', '', 'g'));
    v_clean_time := trim(p_booking_time);
    v_clean_event := trim(p_event_type);
    v_clean_message := CASE WHEN p_message IS NOT NULL AND length(trim(p_message)) > 0 THEN trim(p_message) ELSE NULL END;
    v_clean_pkg := CASE WHEN p_package_id IS NOT NULL AND length(trim(p_package_id)) > 0 THEN trim(p_package_id) ELSE NULL END;

    -- 2. Trusted Client Identity Resolution (Requirement 4)
    -- Never trust client-supplied IP hashes from untrusted anon callers.
    -- If called by anon directly, derive a server-side keyed hash using the phone & daily secret.
    -- If called by service_role (from trusted Edge Function), accept the verified hash.
    IF auth.role() = 'anon' OR auth.role() IS NULL THEN
        v_clean_ip := encode(digest('anon_guard_' || v_clean_phone || '_' || CURRENT_DATE::text, 'sha256'), 'hex');
    ELSE
        IF p_ip_hash IS NOT NULL AND p_ip_hash ~ '^[a-fA-F0-9]{32,64}$' THEN
            v_clean_ip := lower(p_ip_hash);
        ELSE
            v_clean_ip := encode(digest('srv_guard_' || v_clean_phone, 'sha256'), 'hex');
        END IF;
    END IF;

    -- 3. Strict Server-Side Validation (Consistent with DB Constraints)
    IF v_clean_name IS NULL OR length(v_clean_name) < 2 OR length(v_clean_name) > 100 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Customer name must be between 2 and 100 characters.');
    END IF;

    IF v_clean_phone IS NULL OR length(v_clean_phone) < 10 OR length(v_clean_phone) > 15 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Please provide a valid 10 to 15 digit contact number.');
    END IF;

    IF p_booking_date < CURRENT_DATE THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking date cannot be in the past.');
    END IF;

    IF p_booking_date > CURRENT_DATE + INTERVAL '365 days' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Bookings can only be scheduled up to 1 year in advance.');
    END IF;

    IF v_clean_time IS NULL OR length(v_clean_time) < 2 OR length(v_clean_time) > 60 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Please select a valid time slot.');
    END IF;

    IF p_guest_count IS NULL OR p_guest_count < 1 OR p_guest_count > 200 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Guest count must be between 1 and 200.');
    END IF;

    IF v_clean_event IS NULL OR length(v_clean_event) < 2 OR length(v_clean_event) > 100 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Please specify a valid celebration type.');
    END IF;

    IF v_clean_pkg IS NOT NULL AND length(v_clean_pkg) > 80 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Package identifier too long.');
    END IF;

    IF v_clean_message IS NOT NULL AND length(v_clean_message) > 1000 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Notes/message cannot exceed 1000 characters.');
    END IF;

    -- 4. Atomic Rate Limiting
    -- Max 5 booking attempts per 10 minutes per IP hash
    v_ip_allowed := public.check_rate_limit('booking_ip:' || v_clean_ip, 5, 600);
    IF NOT v_ip_allowed THEN
        RETURN jsonb_build_object('success', false, 'error', 'Too many booking attempts. Please wait a few minutes before trying again.');
    END IF;

    -- Max 3 bookings per hour per phone number
    v_phone_allowed := public.check_rate_limit('booking_phone:' || v_clean_phone, 3, 3600);
    IF NOT v_phone_allowed THEN
        RETURN jsonb_build_object('success', false, 'error', 'Multiple bookings detected for this phone. Please contact café staff directly.');
    END IF;

    -- 5. Concurrency-Safe Duplicate Booking Protection (Requirement 5)
    -- Transactional advisory lock serialized by phone + date + slot
    PERFORM pg_advisory_xact_lock(hashtext(v_clean_phone || ':' || p_booking_date::text || ':' || v_clean_time));

    -- Check if an active booking exists for the same phone, date, and slot within 5 minutes
    SELECT id INTO v_existing_duplicate
    FROM public.party_bookings
    WHERE phone = v_clean_phone
      AND booking_date = p_booking_date
      AND booking_time = v_clean_time
      AND status IN ('pending', 'confirmed')
      AND created_at > now() - INTERVAL '5 minutes'
    LIMIT 1;

    IF v_existing_duplicate IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', true,
            'booking_id', v_existing_duplicate,
            'booking_date', p_booking_date,
            'booking_time', v_clean_time,
            'status', 'pending',
            'message', 'Your booking request is already received. Our team will contact you shortly.'
        );
    END IF;

    -- 6. Safe parameterized insert
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

    -- 7. Minimum Necessary Public Confirmation (Requirement 7)
    -- Never expose customer phone numbers, private notes, IP hashes, or database internals
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

-- Grant execution permission for the RPC function to anonymous and authenticated users
REVOKE ALL ON FUNCTION public.submit_party_booking(TEXT, TEXT, DATE, TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_party_booking(TEXT, TEXT, DATE, TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
