import { supabase, isSupabaseConfigured } from "./supabase";
import { BookingFormSchema, type BookingFormData } from "./validation";
import { WHATSAPP, PACKAGES } from "../data";

export type BookingResult = {
  success: boolean;
  bookingId?: string;
  whatsappUrl: string;
  message: string;
};

export async function submitBooking(rawInput: unknown): Promise<BookingResult> {
  // 1. Client-Side Schema Validation
  const parsed = BookingFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Please check your booking details.";
    throw new Error(errorMsg);
  }

  const data: BookingFormData = parsed.data;

  // 2. Format WhatsApp URL (Preserving existing WhatsApp workflow)
  const pkgName = PACKAGES.find((p) => p.id === data.pkg)?.name ?? data.pkg ?? "Décor & Celebration";
  const whatsappLines = [
    "Hi Hidden Café! I'd like to book a party 🎈",
    `• Name: ${data.name}`,
    `• Phone: ${data.phone}`,
    `• Date: ${data.date}`,
    `• Time slot: ${data.slot}`,
    `• Guests: ${data.guests}`,
    `• Package: ${pkgName}`,
    data.notes ? `• Notes: ${data.notes}` : "",
  ].filter(Boolean);

  const whatsappUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(whatsappLines.join("\n"))}`;

  // 3. If Supabase is configured, submit to database via secure RPC
  let bookingId: string | undefined;

  if (isSupabaseConfigured) {
    try {
      const { data: rpcRes, error: rpcErr } = await supabase.rpc("submit_party_booking", {
        p_customer_name: data.name,
        p_phone: data.phone,
        p_booking_date: data.date,
        p_booking_time: data.slot,
        p_guest_count: data.guests,
        p_event_type: pkgName,
        p_package_id: data.pkg,
        p_message: data.notes || null,
        p_ip_hash: null,
      });

      if (rpcErr) {
        console.warn("[BookingService] Supabase RPC error:", rpcErr.message);
        // Do not block customer from reaching WhatsApp if DB fails
      } else if (rpcRes && typeof rpcRes === "object") {
        const res = rpcRes as { success?: boolean; error?: string; booking_id?: string; message?: string };
        if (res.success === false && res.error) {
          throw new Error(res.error);
        }
        bookingId = res.booking_id;
      }
    } catch (err) {
      if (err instanceof Error && !err.message.includes("network")) {
        throw err;
      }
      console.warn("[BookingService] Fallback to direct WhatsApp booking:", err);
    }
  }

  return {
    success: true,
    bookingId,
    whatsappUrl,
    message: bookingId
      ? "Booking saved to our database! Opening WhatsApp to instantly confirm with café staff."
      : "Opening WhatsApp with your booking details. We will confirm your slot shortly!",
  };
}
