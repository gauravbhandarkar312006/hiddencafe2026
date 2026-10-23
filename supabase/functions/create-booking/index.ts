// Supabase Edge Function: create-booking
// Server-Side Validation, IP Derivation, Honeypot & Rate Limiting for Party Bookings
// Runs in trusted Deno runtime with service_role privileges. Never expose service_role to browser.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { z } from "https://esm.sh/zod@3.22.4";

const ALLOWED_ORIGIN = Deno.env.get("CORS_ALLOWED_ORIGIN") || "*";
const IP_HASH_SALT = Deno.env.get("IP_HASH_SALT") || "hc_pepper_2026_salt";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "X-Content-Type-Options": "nosniff",
};

// Strict Zod schema matching database constraints exactly
const BookingRequestSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
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
      const maxFuture = new Date();
      maxFuture.setDate(maxFuture.getDate() + 365);
      return d >= today && d <= maxFuture;
    }, "Booking date must be between today and 365 days in the future"),
  slot: z
    .string({ required_error: "Time slot is required" })
    .trim()
    .min(2, "Slot name is too short")
    .max(60, "Slot name cannot exceed 60 characters"),
  guests: z
    .coerce
    .number({ required_error: "Guest count is required" })
    .int("Guest count must be an integer")
    .min(1, "Guest count must be at least 1")
    .max(200, "Guest count cannot exceed 200"),
  pkg: z
    .string()
    .trim()
    .max(80, "Package identifier cannot exceed 80 characters")
    .optional()
    .default("Custom Celebration"),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes cannot exceed 1000 characters")
    .optional()
    .default(""),
  // Honeypot field for bot trapping: must be completely empty
  hp: z
    .string()
    .optional()
    .refine((v) => !v || v.trim().length === 0, "Bot detected"),
});

// Cryptographic hash of client IP using server-side salt (raw IP is never stored)
async function hashClientIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${IP_HASH_SALT}::${ip.trim()}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 64);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed. Use POST." }),
      { status: 405, headers: corsHeaders }
    );
  }

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return new Response(
      JSON.stringify({ success: false, error: "Content-Type must be application/json" }),
      { status: 415, headers: corsHeaders }
    );
  }

  // Trusted IP Extraction:
  // When proxied through Cloudflare, CF-Connecting-IP cannot be spoofed by the client.
  // If not proxied (e.g. local dev / direct curl), we note the limitation and pass null.
  const rawCfIp = req.headers.get("cf-connecting-ip");
  let ipHash: string | null = null;

  if (rawCfIp && rawCfIp.trim().length > 0) {
    ipHash = await hashClientIp(rawCfIp.trim());
  } else {
    console.warn("[RATE_LIMIT_NOTICE] CF-Connecting-IP not present. Request is either unproxied or running in local development. Enforcing phone-based rate limiting.");
  }

  try {
    // Enforce 32KB body limit
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

    // Strict validation
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

    // Honeypot bot trigger
    if (data.hp && data.hp.trim().length > 0) {
      console.warn(`[SECURITY] Bot submission trapped. IP hash: ${ipHash || "unknown"}`);
      return new Response(
        JSON.stringify({ success: true, message: "Request received" }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Supabase service client initialization
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[CRITICAL] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Edge Function.");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Server configuration error. Please WhatsApp us directly.",
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call privileged database function using service_role
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
        p_message: data.notes || null,
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
        error: "An unexpected error occurred. Please contact us via WhatsApp.",
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
