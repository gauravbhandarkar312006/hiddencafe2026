// Supabase Edge Function: create-booking
// Server-Side Validation, Rate Limiting & Bot Mitigation for Party Bookings
// Follows Zero-Trust Architecture: Privileged service role key remains exclusively on the server.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { z } from "https://esm.sh/zod@3.22.4";

// Allowed origins for CORS protection
const ALLOWED_ORIGIN = Deno.env.get("CORS_ALLOWED_ORIGIN") || "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "X-Content-Type-Options": "nosniff",
};

// Strict Zod schema matching database constraints
const BookingRequestSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),
  phone: z
    .string({ required_error: "Phone is required" })
    .trim()
    .regex(/^\+?[0-9\s\-]{10,20}$/, "Invalid phone format (10-15 digits required)"),
  date: z
    .string({ required_error: "Booking date is required" })
    .refine((val) => {
      const d = new Date(val);
      if (isNaN(d.getTime())) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return d >= today;
    }, "Booking date cannot be in the past"),
  slot: z
    .string({ required_error: "Time slot is required" })
    .trim()
    .min(2, "Slot name is too short")
    .max(60, "Slot name too long"),
  guests: z
    .coerce
    .number({ required_error: "Guest count is required" })
    .int("Guest count must be an integer")
    .min(1, "Guest count must be at least 1")
    .max(200, "Guest count cannot exceed 200"),
  pkg: z
    .string()
    .trim()
    .max(80, "Package ID is too long")
    .optional()
    .default("Custom Celebration"),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes cannot exceed 1000 characters")
    .optional()
    .default(""),
  // Honeypot field for bot trapping: If filled, request is rejected
  hp: z
    .string()
    .optional()
    .refine((v) => !v || v.trim().length === 0, "Bot detected"),
});

// Helper to hash IP addresses for privacy-compliant rate limiting
async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`salt_cafe_${ip}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

serve(async (req: Request) => {
  // Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Enforce HTTP Method
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed. Use POST." }),
      { status: 405, headers: corsHeaders }
    );
  }

  // Enforce Content-Type
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return new Response(
      JSON.stringify({ success: false, error: "Content-Type must be application/json" }),
      { status: 415, headers: corsHeaders }
    );
  }

  // Extract client IP (Prefer Cloudflare CF-Connecting-IP, then X-Real-IP)
  const clientIp =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    "direct-client";
  const ipHash = await hashIp(clientIp);

  try {
    // Check Payload Size limit (Max 32 KB)
    const rawBody = await req.text();
    if (rawBody.length > 32 * 1024) {
      return new Response(
        JSON.stringify({ success: false, error: "Payload too large. Maximum size is 32KB." }),
        { status: 413, headers: corsHeaders }
      );
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawBody);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Malformed JSON payload." }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Strict schema validation
    const validationResult = BookingRequestSchema.safeParse(parsedJson);
    if (!validationResult.success) {
      const issue = validationResult.error.issues[0];
      return new Response(
        JSON.stringify({
          success: false,
          error: issue ? `${issue.path.join(".")}: ${issue.message}` : "Validation failed.",
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const data = validationResult.data;

    // Honeypot bot protection trigger
    if (data.hp && data.hp.trim().length > 0) {
      console.warn(`[SECURITY] Bot submission trapped from IP hash: ${ipHash}`);
      // Return synthetic success so bots don't adapt
      return new Response(
        JSON.stringify({ success: true, message: "Request received" }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Initialize trusted Supabase client using server-side secrets
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[CRITICAL] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Edge Function environment.");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Server configuration error. Please contact the café directly via WhatsApp.",
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call database RPC for atomic validation, rate limiting & insert
    const { data: rpcResponse, error: rpcError } = await supabase.rpc(
      "submit_party_booking",
      {
        p_customer_name: data.name,
        p_phone: data.phone,
        p_booking_date: data.date,
        p_booking_time: data.slot,
        p_guest_count: data.guests,
        p_event_type: data.pkg,
        p_package_id: data.pkg,
        p_message: data.notes,
        p_ip_hash: ipHash,
      }
    );

    if (rpcError) {
      console.error("[DB ERROR] submit_party_booking failed:", rpcError.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to process booking. Please verify details or reach out on WhatsApp.",
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    if (!rpcResponse.success) {
      return new Response(JSON.stringify(rpcResponse), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Success response
    console.info(`[BOOKING] Successfully received booking ${rpcResponse.booking_id} for ${data.date}`);
    return new Response(JSON.stringify(rpcResponse), {
      status: 201,
      headers: corsHeaders,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("[UNHANDLED EXCEPTION]", errorMsg);
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred. Please try again or WhatsApp us directly.",
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
