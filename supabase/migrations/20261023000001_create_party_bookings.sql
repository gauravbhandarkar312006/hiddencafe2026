-- ====================================================================
-- Migration: 20261023000001_create_party_bookings.sql
-- Description: Create party_bookings table with strict constraints & audit columns
-- Reversible: DROP TABLE IF EXISTS public.party_bookings CASCADE;
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function for automatic updated_at timestamp updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.party_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TEXT NOT NULL,
    guest_count INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    package_id TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    ip_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT chk_customer_name_len CHECK (char_length(trim(customer_name)) >= 2 AND char_length(customer_name) <= 100),
    CONSTRAINT chk_phone_format CHECK (phone ~ '^\+?[0-9\s\-]{10,20}$'),
    CONSTRAINT chk_booking_date_future CHECK (booking_date >= CURRENT_DATE),
    CONSTRAINT chk_booking_time_len CHECK (char_length(trim(booking_time)) >= 2 AND char_length(booking_time) <= 60),
    CONSTRAINT chk_guest_count CHECK (guest_count >= 1 AND guest_count <= 200),
    CONSTRAINT chk_event_type_len CHECK (char_length(trim(event_type)) >= 2 AND char_length(event_type) <= 100),
    CONSTRAINT chk_message_len CHECK (message IS NULL OR char_length(message) <= 1000),
    CONSTRAINT chk_status_enum CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'))
);

-- Performance and query indexes
CREATE INDEX IF NOT EXISTS idx_party_bookings_date ON public.party_bookings (booking_date);
CREATE INDEX IF NOT EXISTS idx_party_bookings_status ON public.party_bookings (status);
CREATE INDEX IF NOT EXISTS idx_party_bookings_created_at ON public.party_bookings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_party_bookings_phone ON public.party_bookings (phone);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_party_bookings_updated_at ON public.party_bookings;
CREATE TRIGGER trg_party_bookings_updated_at
    BEFORE UPDATE ON public.party_bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.party_bookings IS 'Secure celebration and party booking records for Hidden Café';
