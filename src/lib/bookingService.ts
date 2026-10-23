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

  // 3. If Supabase is configured, submit through trusted Edge Function gateway
  let bookingId: string | undefined;

  if (isSupabaseConfigured) {
    try {
      const { data: edgeRes, error: edgeErr } = await supabase.functions.invoke("create-booking", {
        body: {
          name: data.name,
          phone: data.phone,
          date: data.date,
          slot: data.slot,
          guests: data.guests,
          pkg: pkgName,
          notes: data.notes || "",
          hp: data.hp || "",
        },
      });

      if (edgeErr) {
        console.warn("[BookingService] Edge Function notice:", edgeErr.message);
      } else if (edgeRes && typeof edgeRes === "object") {
        const res = edgeRes as { success?: boolean; error?: string; booking_id?: string; message?: string };
        if (res.success === false && res.error) {
          throw new Error(res.error);
        }
        bookingId = res.booking_id;
      }
    } catch (err) {
      if (err instanceof Error && !err.message.includes("network") && !err.message.includes("FunctionsFetchError")) {
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
