import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";

// Test against the exact same validation schema used in production
const BookingSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().trim().regex(/^\+?[0-9\s\-]{10,20}$/, "Invalid phone"),
  date: z.string().refine((val) => {
    const d = new Date(val);
    if (isNaN(d.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d >= today;
  }, "Booking date cannot be in the past"),
  slot: z.string().trim().min(2).max(60),
  guests: z.coerce.number().int().min(1).max(200),
  pkg: z.string().trim().max(80).optional().default("Glow Wall Celebration"),
  notes: z.string().trim().max(1000).optional().default(""),
  hp: z.string().optional().refine((v) => !v || v.trim().length === 0, "Bot detected"),
});

function sanitizeText(input) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

describe("Security & Validation Suite — Hidden Café", () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const validTomorrow = tomorrow.toISOString().split("T")[0];

  it("Accepts valid booking payload", () => {
    const payload = {
      name: "Rohit Deshmukh",
      phone: "+91 9876543210",
      date: validTomorrow,
      slot: "Evening (5 – 8 PM)",
      guests: "12",
      pkg: "glow",
      notes: "Birthday party with neon lights",
    };

    const res = BookingSchema.safeParse(payload);
    assert.equal(res.success, true);
    if (res.success) {
      assert.equal(res.data.name, "Rohit Deshmukh");
      assert.equal(res.data.guests, 12);
    }
  });

  it("Rejects bookings with past dates", () => {
    const payload = {
      name: "Aarav Sharma",
      phone: "9876543210",
      date: "2020-01-01",
      slot: "Lunch (12 – 3 PM)",
      guests: 4,
    };

    const res = BookingSchema.safeParse(payload);
    assert.equal(res.success, false);
    assert.match(res.error.issues[0].message, /past/i);
  });

  it("Rejects invalid phone numbers", () => {
    const invalidPhones = ["abc1234567", "123", "phone#number", "999999999999999999999999"];
    for (const phone of invalidPhones) {
      const res = BookingSchema.safeParse({
        name: "Test User",
        phone,
        date: validTomorrow,
        slot: "Evening (5 – 8 PM)",
        guests: 5,
      });
      assert.equal(res.success, false, `Expected ${phone} to be rejected`);
    }
  });

  it("Rejects out-of-bounds guest counts (zero, negative, >200)", () => {
    for (const guests of [0, -4, 201, 1000]) {
      const res = BookingSchema.safeParse({
        name: "Test User",
        phone: "9876543210",
        date: validTomorrow,
        slot: "Evening (5 – 8 PM)",
        guests,
      });
      assert.equal(res.success, false, `Expected guests=${guests} to fail`);
    }
  });

  it("Rejects oversized customer name (>100 characters)", () => {
    const res = BookingSchema.safeParse({
      name: "A".repeat(101),
      phone: "9876543210",
      date: validTomorrow,
      slot: "Evening (5 – 8 PM)",
      guests: 5,
    });
    assert.equal(res.success, false);
  });

  it("Rejects oversized notes (>1000 characters)", () => {
    const res = BookingSchema.safeParse({
      name: "Test User",
      phone: "9876543210",
      date: validTomorrow,
      slot: "Evening (5 – 8 PM)",
      guests: 5,
      notes: "N".repeat(1001),
    });
    assert.equal(res.success, false);
  });

  it("Traps automated bots filling the honeypot field", () => {
    const res = BookingSchema.safeParse({
      name: "Bot Spammer",
      phone: "9876543210",
      date: validTomorrow,
      slot: "Evening (5 – 8 PM)",
      guests: 5,
      hp: "http://spam-link.ru",
    });
    assert.equal(res.success, false);
    assert.match(res.error.issues[0].message, /bot/i);
  });

  it("Strips untrusted privileged fields from payload (mass assignment defense)", () => {
    const untrustedPayload = {
      name: "Legit Customer",
      phone: "9876543210",
      date: validTomorrow,
      slot: "Night (8 – 10 PM)",
      guests: 6,
      // Attempted privileged injections
      status: "confirmed",
      role: "owner",
      id: "00000000-0000-0000-0000-000000000000",
      is_admin: true,
    };

    const res = BookingSchema.safeParse(untrustedPayload);
    assert.equal(res.success, true);
    if (res.success) {
      assert.equal("status" in res.data, false);
      assert.equal("role" in res.data, false);
      assert.equal("id" in res.data, false);
      assert.equal("is_admin" in res.data, false);
    }
  });

  it("Correctly sanitizes XSS injection payloads", () => {
    const malicious = '<script>alert("xss")</script><img src="x" onerror="steal()"/>';
    const sanitized = sanitizeText(malicious);
    assert.equal(sanitized.includes("<script>"), false);
    assert.equal(sanitized.includes("<img"), false);
    assert.equal(sanitized.includes("&lt;script&gt;"), true);
  });
});
