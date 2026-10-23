-- ====================================================================
-- Migration: 20261023000003_create_staff_and_rls.sql
-- Description: Staff authorization table, security helper functions and strict RLS policies
-- Reversible: DROP TABLE IF EXISTS public.staff_roles CASCADE;
-- ====================================================================

-- 1. Staff Roles Table linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.staff_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.staff_roles IS 'Verified staff role mappings for administrative operations';

-- 2. Security Definer Helper Functions (run with elevated rights to check role without exposing table)
CREATE OR REPLACE FUNCTION public.is_staff(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.staff_roles
        WHERE user_id = check_user_id
    );
$$;

CREATE OR REPLACE FUNCTION public.is_manager_or_owner(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.staff_roles
        WHERE user_id = check_user_id
          AND role IN ('owner', 'manager')
    );
$$;

-- 3. Enable Row Level Security (RLS) on all tables (DEFAULT-DENY)
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_bookings ENABLE ROW LEVEL SECURITY;

-- 4. Policies for staff_roles
-- Users can only check their own role
DROP POLICY IF EXISTS "Staff can read their own role" ON public.staff_roles;
CREATE POLICY "Staff can read their own role"
    ON public.staff_roles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Only owners can manage roles
DROP POLICY IF EXISTS "Owner can manage staff roles" ON public.staff_roles;
CREATE POLICY "Owner can manage staff roles"
    ON public.staff_roles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.staff_roles
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.staff_roles
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- 5. Policies for menu_items
-- Public visitors can read available menu items
DROP POLICY IF EXISTS "Public can view available menu items" ON public.menu_items;
CREATE POLICY "Public can view available menu items"
    ON public.menu_items
    FOR SELECT
    TO anon, authenticated
    USING (is_available = true);

-- Staff can view all menu items (including disabled/out-of-stock items)
DROP POLICY IF EXISTS "Staff can view all menu items" ON public.menu_items;
CREATE POLICY "Staff can view all menu items"
    ON public.menu_items
    FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

-- Managers/Owners can insert, update or delete menu items
DROP POLICY IF EXISTS "Staff managers can modify menu items" ON public.menu_items;
CREATE POLICY "Staff managers can modify menu items"
    ON public.menu_items
    FOR ALL
    TO authenticated
    USING (public.is_manager_or_owner(auth.uid()))
    WITH CHECK (public.is_manager_or_owner(auth.uid()));

-- 6. Policies for party_bookings
-- CRITICAL SECURITY: Public anonymous visitors CANNOT SELECT, UPDATE, or DELETE party bookings.
-- Only authenticated staff can view customer bookings
DROP POLICY IF EXISTS "Staff can view party bookings" ON public.party_bookings;
CREATE POLICY "Staff can view party bookings"
    ON public.party_bookings
    FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

-- Only authenticated staff can update booking status or details
DROP POLICY IF EXISTS "Staff can update party bookings" ON public.party_bookings;
CREATE POLICY "Staff can update party bookings"
    ON public.party_bookings
    FOR UPDATE
    TO authenticated
    USING (public.is_staff(auth.uid()))
    WITH CHECK (public.is_staff(auth.uid()));

-- Only owner/manager can delete booking records
DROP POLICY IF EXISTS "Staff can delete party bookings" ON public.party_bookings;
CREATE POLICY "Staff can delete party bookings"
    ON public.party_bookings
    FOR DELETE
    TO authenticated
    USING (public.is_manager_or_owner(auth.uid()));
