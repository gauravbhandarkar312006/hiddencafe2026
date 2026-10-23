-- ====================================================================
-- Migration: 20261023000003_create_staff_and_rls.sql
-- Description: Staff authorization table, hardened security helper functions,
--              recursion-free staff_roles policies, and strict default-deny RLS
-- Reversible: DROP TABLE IF EXISTS public.staff_roles CASCADE;
-- ====================================================================

-- 1. Staff Roles Table linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.staff_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.staff_roles IS 'Verified staff role mappings for administrative operations';

-- 2. Security Definer Helper Functions
-- Fixed safe search_path = public, pg_temp to prevent search path hijacking.
-- Anti-probing guards prevent checking arbitrary user IDs.

-- Helper: Check if caller is an Owner (used by policies to manage roles without recursion)
CREATE OR REPLACE FUNCTION public.is_owner(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
DECLARE
    target_id UUID := COALESCE(check_user_id, auth.uid());
BEGIN
    -- Deny if unauthenticated or target is null
    IF target_id IS NULL OR auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Anti-probing guard: Users can only check their own ownership status
    IF target_id <> auth.uid() THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.staff_roles
        WHERE user_id = target_id
          AND role = 'owner'
    );
END;
$$;

-- Helper: Check if caller is a Staff member (owner, manager, or staff)
CREATE OR REPLACE FUNCTION public.is_staff(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
DECLARE
    target_id UUID := COALESCE(check_user_id, auth.uid());
BEGIN
    IF target_id IS NULL OR auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Anti-probing guard: Only verified owners can query other user IDs
    IF target_id <> auth.uid() AND NOT public.is_owner(auth.uid()) THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.staff_roles
        WHERE user_id = target_id
    );
END;
$$;

-- Helper: Check if caller is a Manager or Owner
CREATE OR REPLACE FUNCTION public.is_manager_or_owner(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
DECLARE
    target_id UUID := COALESCE(check_user_id, auth.uid());
BEGIN
    IF target_id IS NULL OR auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Anti-probing guard: Only verified owners can query other user IDs
    IF target_id <> auth.uid() AND NOT public.is_owner(auth.uid()) THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.staff_roles
        WHERE user_id = target_id
          AND role IN ('owner', 'manager')
    );
END;
$$;

-- Least-Privilege Function Permissions:
-- Revoke all execution rights from PUBLIC and anon; grant only to authenticated and service_role.
REVOKE ALL ON FUNCTION public.is_owner(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_staff(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_manager_or_owner(UUID) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.is_owner(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_manager_or_owner(UUID) TO authenticated, service_role;

-- 3. Enable Row Level Security (RLS) on all tables (DEFAULT-DENY)
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_bookings ENABLE ROW LEVEL SECURITY;

-- Explicit Table Grants (Defense-in-depth):
-- Public and anon have zero privileges on staff_roles and party_bookings.
REVOKE ALL ON TABLE public.staff_roles FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.staff_roles TO authenticated;
GRANT ALL ON TABLE public.staff_roles TO service_role;

REVOKE ALL ON TABLE public.party_bookings FROM PUBLIC, anon;
GRANT SELECT, DELETE ON TABLE public.party_bookings TO authenticated;
-- Column-level privilege: Staff can ONLY update the 'status' column
GRANT UPDATE (status) ON TABLE public.party_bookings TO authenticated;
GRANT ALL ON TABLE public.party_bookings TO service_role;

-- Trigger Function: Strictly prevent staff from modifying customer identity, phone, dates, or audit timestamps
CREATE OR REPLACE FUNCTION public.enforce_booking_update_restrictions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Verify that immutable fields were NOT altered during status updates
    IF (NEW.id IS DISTINCT FROM OLD.id OR
        NEW.customer_name IS DISTINCT FROM OLD.customer_name OR
        NEW.phone IS DISTINCT FROM OLD.phone OR
        NEW.booking_date IS DISTINCT FROM OLD.booking_date OR
        NEW.booking_time IS DISTINCT FROM OLD.booking_time OR
        NEW.guest_count IS DISTINCT FROM OLD.guest_count OR
        NEW.event_type IS DISTINCT FROM OLD.event_type OR
        NEW.package_id IS DISTINCT FROM OLD.package_id OR
        NEW.message IS DISTINCT FROM OLD.message OR
        NEW.ip_hash IS DISTINCT FROM OLD.ip_hash OR
        NEW.created_at IS DISTINCT FROM OLD.created_at) THEN
        RAISE EXCEPTION 'Unauthorized: Staff are only permitted to update booking status. Customer details and audit timestamps cannot be modified.';
    END IF;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_booking_update_restrictions() FROM PUBLIC, anon;

DROP TRIGGER IF EXISTS trg_enforce_booking_update_restrictions ON public.party_bookings;
CREATE TRIGGER trg_enforce_booking_update_restrictions
    BEFORE UPDATE ON public.party_bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_booking_update_restrictions();

-- 4. Policies for staff_roles
-- Staff members can only view their own assigned role
DROP POLICY IF EXISTS "Staff can read their own role" ON public.staff_roles;
CREATE POLICY "Staff can read their own role"
    ON public.staff_roles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Owners alone can view, assign, update, and remove staff roles.
-- Uses is_owner(auth.uid()) to avoid infinite RLS recursion on staff_roles.
DROP POLICY IF EXISTS "Owner can manage staff roles" ON public.staff_roles;
CREATE POLICY "Owner can manage staff roles"
    ON public.staff_roles
    FOR ALL
    TO authenticated
    USING (public.is_owner(auth.uid()))
    WITH CHECK (public.is_owner(auth.uid()));

-- 5. Policies for menu_items
-- Public visitors can read only active, available menu items
DROP POLICY IF EXISTS "Public can view available menu items" ON public.menu_items;
CREATE POLICY "Public can view available menu items"
    ON public.menu_items
    FOR SELECT
    TO anon, authenticated
    USING (is_available = true);

-- Authenticated staff can view all menu items (including out-of-stock items)
DROP POLICY IF EXISTS "Staff can view all menu items" ON public.menu_items;
CREATE POLICY "Staff can view all menu items"
    ON public.menu_items
    FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

-- Only Managers and Owners can create, update, or delete menu items / prices
DROP POLICY IF EXISTS "Staff managers can modify menu items" ON public.menu_items;
CREATE POLICY "Staff managers can modify menu items"
    ON public.menu_items
    FOR ALL
    TO authenticated
    USING (public.is_manager_or_owner(auth.uid()))
    WITH CHECK (public.is_manager_or_owner(auth.uid()));

-- 6. Policies for party_bookings
-- Public visitors have ZERO read/select, update, or delete access to booking records.
-- Public bookings are exclusively created via the validated, rate-limited RPC endpoint.

-- Authenticated staff can view customer booking records
DROP POLICY IF EXISTS "Staff can view party bookings" ON public.party_bookings;
CREATE POLICY "Staff can view party bookings"
    ON public.party_bookings
    FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

-- Authenticated staff can update booking status (pending -> confirmed -> completed/cancelled)
DROP POLICY IF EXISTS "Staff can update party bookings" ON public.party_bookings;
CREATE POLICY "Staff can update party bookings"
    ON public.party_bookings
    FOR UPDATE
    TO authenticated
    USING (public.is_staff(auth.uid()))
    WITH CHECK (public.is_staff(auth.uid()));

-- Only Managers and Owners can delete customer booking records
DROP POLICY IF EXISTS "Staff can delete party bookings" ON public.party_bookings;
CREATE POLICY "Staff can delete party bookings"
    ON public.party_bookings
    FOR DELETE
    TO authenticated
    USING (public.is_manager_or_owner(auth.uid()));
