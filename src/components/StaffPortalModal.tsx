import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useToast } from "./Toast";
import { cn } from "../utils/cn";
import { WhatsAppIcon } from "./ui";

type Booking = {
  id: string;
  customer_name: string;
  phone: string;
  booking_date: string;
  booking_time: string;
  guest_count: number;
  event_type: string;
  message?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: string;
};

type MenuItemState = {
  id: string;
  name: string;
  category: string;
  price: number;
  is_available: boolean;
};

export default function StaffPortalModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionUser, setSessionUser] = useState<string | null>(null);
  const [staffRole, setStaffRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"bookings" | "menu">("bookings");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemState[]>([]);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const { toast } = useToast();

  // Listen to auth changes
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSessionUser(session.user.email || "Staff Member");
        checkRole(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSessionUser(session.user.email || "Staff Member");
        checkRole(session.user.id);
      } else {
        setSessionUser(null);
        setStaffRole(null);
        setBookings([]);
        setMenuItems([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("staff_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (!error && data) {
        setStaffRole(data.role);
        loadData();
      } else {
        setStaffRole("staff");
        loadData();
      }
    } catch {
      setStaffRole("staff");
      loadData();
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch bookings
      const { data: bookingData, error: bErr } = await supabase
        .from("party_bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (!bErr && bookingData) {
        setBookings(bookingData as Booking[]);
      }

      // 2. Fetch all menu items
      const { data: menuData, error: mErr } = await supabase
        .from("menu_items")
        .select("id, name, category, price, is_available")
        .order("category");

      if (!mErr && menuData) {
        setMenuItems(menuData as MenuItemState[]);
      }
    } catch (err) {
      console.warn("Failed to load staff data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    if (!isSupabaseConfigured) {
      setLoginError("Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setLoginError("Invalid credentials. Please verify your staff email and password.");
      } else {
        toast({
          title: "Staff Login Successful",
          description: "Welcome to Hidden Café Management.",
          type: "info",
        });
      }
    } catch {
      setLoginError("Sign-in failed. Please check network connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSessionUser(null);
    setStaffRole(null);
    toast({
      title: "Signed Out",
      description: "You have securely signed out of the staff portal.",
      type: "info",
    });
  };

  const updateBookingStatus = async (bookingId: string, newStatus: Booking["status"]) => {
    try {
      const { error } = await supabase
        .from("party_bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);

      if (error) {
        toast({
          title: "Update Failed",
          description: error.message,
          type: "info",
        });
      } else {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );
        toast({
          title: "Status Updated",
          description: `Booking status changed to ${newStatus}.`,
          type: "party",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMenuAvailability = async (itemId: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from("menu_items")
        .update({ is_available: !current })
        .eq("id", itemId);

      if (error) {
        toast({
          title: "Update Failed",
          description: error.message,
          type: "info",
        });
      } else {
        setMenuItems((prev) =>
          prev.map((m) => (m.id === itemId ? { ...m, is_available: !current } : m))
        );
        toast({
          title: "Menu Item Updated",
          description: `Item marked as ${!current ? "Available" : "Out of Stock"}.`,
          type: "coffee",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const filteredBookings =
    statusFilter === "all"
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bean-950/85 backdrop-blur-md"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-latte/15 bg-bean-900 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-latte/10 bg-bean-950/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-caramel/40 bg-caramel/10 text-caramel text-sm font-bold">
              🔒
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-foam">
                Hidden Café Staff Portal
              </h3>
              <p className="text-xs text-dune">
                {sessionUser ? `Logged in as: ${sessionUser} (${staffRole || "Staff"})` : "Authorized Personnel Only"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {sessionUser && (
              <button
                onClick={handleLogout}
                className="rounded-lg border border-latte/20 px-3 py-1.5 text-xs font-semibold text-latte/80 hover:bg-latte/10 hover:text-foam transition"
              >
                Sign Out
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-latte/15 text-latte hover:text-foam hover:border-caramel/40 transition"
              aria-label="Close Staff Portal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {!sessionUser ? (
            /* Login Form */
            <div className="mx-auto max-w-md py-8">
              <div className="text-center mb-6">
                <h4 className="font-display text-2xl font-bold text-latte">
                  Staff Authentication
                </h4>
                <p className="mt-1 text-xs text-dune">
                  Protected by Supabase Auth and Row Level Security.
                </p>
              </div>

              {!isSupabaseConfigured && (
                <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
                  <p className="font-bold">⚠️ Supabase Environment Required</p>
                  <p className="mt-1 leading-relaxed">
                    Please provide your <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code> to connect the real database.
                  </p>
                </div>
              )}

              {loginError && (
                <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-dune mb-1">
                    Staff Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manager@hiddencafe.in"
                    className="w-full rounded-lg border border-latte/15 bg-bean-950/70 px-4 py-2.5 text-sm text-foam placeholder:text-dune/50 outline-none focus:border-caramel"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-dune mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-lg border border-latte/15 bg-bean-950/70 px-4 py-2.5 text-sm text-foam placeholder:text-dune/50 outline-none focus:border-caramel"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-caramel py-3 text-xs font-bold uppercase tracking-wider text-bean-950 hover:bg-foam transition-all shadow-lg disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Sign In to Dashboard"}
                </button>
              </form>
            </div>
          ) : (
            /* Staff Dashboard */
            <div>
              {/* Navigation Tabs */}
              <div className="flex items-center gap-3 border-b border-latte/10 pb-4 mb-6">
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={cn(
                    "rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition",
                    activeTab === "bookings"
                      ? "bg-caramel text-bean-950"
                      : "text-latte/70 hover:bg-bean-950 hover:text-foam"
                  )}
                >
                  Party Bookings ({bookings.length})
                </button>
                <button
                  onClick={() => setActiveTab("menu")}
                  className={cn(
                    "rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition",
                    activeTab === "menu"
                      ? "bg-caramel text-bean-950"
                      : "text-latte/70 hover:bg-bean-950 hover:text-foam"
                  )}
                >
                  Menu Availability ({menuItems.length})
                </button>
                <button
                  onClick={loadData}
                  className="ml-auto text-xs text-caramel hover:underline"
                >
                  ↻ Refresh Data
                </button>
              </div>

              {activeTab === "bookings" ? (
                <div>
                  {/* Status Filters */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-dune">Filter:</span>
                    {["all", "pending", "confirmed", "completed", "cancelled"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={cn(
                          "rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase transition",
                          statusFilter === st
                            ? "bg-latte/20 text-foam"
                            : "text-dune hover:text-latte"
                        )}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {filteredBookings.length === 0 ? (
                    <div className="py-12 text-center text-dune">
                      <p className="text-base">No bookings found under this filter.</p>
                      <p className="text-xs mt-1">Bookings submitted from the website will appear here in real time.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredBookings.map((b) => (
                        <div
                          key={b.id}
                          className="rounded-xl border border-latte/10 bg-bean-950/60 p-4 transition hover:border-caramel/30"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foam text-base">
                                  {b.customer_name}
                                </span>
                                <span
                                  className={cn(
                                    "rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase",
                                    b.status === "confirmed" && "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
                                    b.status === "pending" && "bg-amber-500/20 text-amber-300 border border-amber-500/30",
                                    b.status === "completed" && "bg-blue-500/20 text-blue-300 border border-blue-500/30",
                                    b.status === "cancelled" && "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  )}
                                >
                                  {b.status}
                                </span>
                              </div>
                              <p className="text-xs text-caramel mt-1 font-semibold">
                                {b.booking_date} • {b.booking_time} • {b.guest_count} Guests • {b.event_type}
                              </p>
                              {b.message && (
                                <p className="text-xs text-dune mt-1 italic">
                                  Notes: "{b.message}"
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={`https://wa.me/${b.phone.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-pista/40 bg-pista/10 px-3 py-1.5 text-xs font-bold text-pista hover:bg-pista/20 transition"
                              >
                                <WhatsAppIcon className="h-3.5 w-3.5" />
                                Chat ({b.phone})
                              </a>

                              <select
                                value={b.status}
                                onChange={(e) =>
                                  updateBookingStatus(b.id, e.target.value as Booking["status"])
                                }
                                className="rounded-lg border border-latte/20 bg-bean-900 px-2.5 py-1.5 text-xs text-latte outline-none focus:border-caramel"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Menu Availability Management */
                <div>
                  <p className="text-xs text-dune mb-4">
                    Toggle items to update live menu availability on the public website.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {menuItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-latte/10 bg-bean-950/60 px-4 py-2.5"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foam">{item.name}</p>
                          <p className="text-[11px] text-dune">₹{item.price} • {item.category}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleMenuAvailability(item.id, item.is_available)}
                          className={cn(
                            "rounded-md px-2.5 py-1 text-xs font-bold uppercase transition",
                            item.is_available
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          )}
                        >
                          {item.is_available ? "In Stock" : "Out of Stock"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
