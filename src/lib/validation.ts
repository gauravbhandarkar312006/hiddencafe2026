import { z } from "zod";

// Shared validation schema for party bookings
export const BookingFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s\-]{10,20}$/, "Please enter a valid 10-digit mobile number"),
  date: z
    .string()
    .refine((val) => {
      const d = new Date(val);
      if (isNaN(d.getTime())) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxFuture = new Date();
      maxFuture.setDate(maxFuture.getDate() + 365);
      return d >= today && d <= maxFuture;
    }, "Booking date must be between today and 365 days in advance"),
  slot: z
    .string()
    .trim()
    .min(2, "Please choose a time slot")
    .max(60, "Invalid slot name"),
  guests: z
    .coerce
    .number()
    .int("Guest count must be a whole number")
    .min(1, "At least 1 guest required")
    .max(200, "Maximum 200 guests accommodated"),
  pkg: z
    .string()
    .trim()
    .max(80, "Invalid package name")
    .optional()
    .default("Glow Wall Celebration"),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes cannot exceed 1000 characters")
    .optional()
    .default(""),
  hp: z
    .string()
    .optional()
    .refine((v) => !v || v.trim().length === 0, "Spam detected"),
});

export type BookingFormData = z.infer<typeof BookingFormSchema>;

// Quick HTML sanitization helper for client display
export function sanitizeText(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
