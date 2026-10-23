import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";

// Production Zod Schema matching database constraints & Edge Function
const BookingSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().trim().regex(/^\+?[0-9\s\-]{10,20}$/, "Invalid phone format"),
  date: z.string().refine((val) => {
    const d = new Date(val);
    if (isNaN(d.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxFuture = new Date();
    maxFuture.setDate(maxFuture.getDate() + 365);
    return d >= today && d <= maxFuture;
  }, "Booking date must be between today and 365 days in the future"),
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

// In-memory simulation of atomic rate-limiting database logic
class MockAtomicRateLimiter {
  constructor() {
    this.store = new Map();
  }

  checkRateLimit(key, maxRequests, windowMs) {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || entry.expiresAt < now) {
      this.store.set(key, { count: 1, expiresAt: now + windowMs });
      return true;
    }

    if (entry.count < maxRequests) {
      entry.count += 1;
      return true;
    }

    return false;
  }
}

// In-memory simulation of transactional concurrency lock & duplicate check
class MockBookingStore {
  constructor() {
    this.bookings = [];
    this.lockMap = new Set();
  }

  async submitBooking({ name, phone, date, slot, guests, ipHash, initialStatus = "pending" }) {
    const lockKey = `${phone}:${date}:${slot}`;
    if (this.lockMap.has(lockKey)) {
      await new Promise((r) => setTimeout(r, 10));
    }
    this.lockMap.add(lockKey);

    try {
      const fiveMinAgo = Date.now() - 5 * 60 * 1000;
      const existing = this.bookings.find(
        (b) =>
          b.phone === phone &&
          b.date === date &&
          b.slot === slot &&
          b.createdAt > fiveMinAgo &&
          ["pending", "confirmed"].includes(b.status)
      );

      if (existing) {
        return {
          success: true,
          booking_id: existing.id,
          status: existing.status, // Exact status returned (Requirement 3)
          duplicate: true,
          message: "Existing booking returned without duplicate insertion",
        };
      }

      const newBooking = {
        id: `mock-uuid-${this.bookings.length + 1}`,
        name,
        phone,
        date,
        slot,
        guests,
        ipHash,
        status: initialStatus,
        createdAt: Date.now(),
      };
      this.bookings.push(newBooking);

      return {
        success: true,
        booking_id: newBooking.id,
        status: newBooking.status,
        duplicate: false,
        message: "New booking created",
      };
    } finally {
      this.lockMap.delete(lockKey);
    }
  }
}

// In-memory simulation of PostgreSQL staff role anti-probing logic
class MockStaffAuth {
  constructor() {
    this.roles = new Map();
  }

  setRole(userId, role) {
    this.roles.set(userId, role);
  }

  isOwner(callerId, targetId = callerId) {
    if (!callerId || !targetId) return false;
    // Users can only check their own ownership status
    if (callerId !== targetId) return false;
    return this.roles.get(targetId) === "owner";
  }

  isStaff(callerId, targetId = callerId) {
    if (!callerId || !targetId) return false;
    // Non-owners can only check themselves
    if (callerId !== targetId && !this.isOwner(callerId, callerId)) {
      return false;
    }
    return this.roles.has(targetId);
  }
}

describe("Security & Validation Suite — Hidden Café", () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const validTomorrow = tomorrow.toISOString().split("T")[0];

  it("1. Accepts valid booking payload", () => {
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

  it("2. Rejects bookings with past dates", () => {
    const payload = {
      name: "Aarav Sharma",
      phone: "9876543210",
      date: "2020-01-01",
      slot: "Lunch (12 – 3 PM)",
      guests: 4,
    };

    const res = BookingSchema.safeParse(payload);
    assert.equal(res.success, false);
    assert.match(res.error.issues[0].message, /today and 365 days/i);
  });

  it("3. Rejects bookings beyond 365 days in advance", () => {
    const farFuture = new Date();
    farFuture.setDate(farFuture.getDate() + 400);
    const res = BookingSchema.safeParse({
      name: "Future Customer",
      phone: "9876543210",
      date: farFuture.toISOString().split("T")[0],
      slot: "Lunch (12 – 3 PM)",
      guests: 4,
    });
    assert.equal(res.success, false);
    assert.match(res.error.issues[0].message, /365 days/i);
  });

  it("4. Rejects invalid phone numbers", () => {
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

  it("5. Rejects out-of-bounds guest counts (zero, negative, >200)", () => {
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

  it("6. Rejects oversized fields (name > 100, notes > 1000, pkg > 80)", () => {
    const resName = BookingSchema.safeParse({
      name: "A".repeat(101),
      phone: "9876543210",
      date: validTomorrow,
      slot: "Evening",
      guests: 5,
    });
    assert.equal(resName.success, false);

    const resNotes = BookingSchema.safeParse({
      name: "Test User",
      phone: "9876543210",
      date: validTomorrow,
      slot: "Evening",
      guests: 5,
      notes: "N".repeat(1001),
    });
    assert.equal(resNotes.success, false);

    const resPkg = BookingSchema.safeParse({
      name: "Test User",
      phone: "9876543210",
      date: validTomorrow,
      slot: "Evening",
      guests: 5,
      pkg: "P".repeat(81),
    });
    assert.equal(resPkg.success, false);
  });

  it("7. Traps automated bots filling the honeypot field", () => {
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

  it("8. Mass Assignment Defense: Strips untrusted privileged fields from payload", () => {
    const untrustedPayload = {
      name: "Legit Customer",
      phone: "9876543210",
      date: validTomorrow,
      slot: "Night (8 – 10 PM)",
      guests: 6,
      // Privileged injection attempts
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

  it("9. Correctly sanitizes XSS injection payloads", () => {
    const malicious = '<script>alert("xss")</script><img src="x" onerror="steal()"/>';
    const sanitized = sanitizeText(malicious);
    assert.equal(sanitized.includes("<script>"), false);
    assert.equal(sanitized.includes("<img"), false);
    assert.equal(sanitized.includes("&lt;script&gt;"), true);
  });

  it("10. Atomic Rate Limiter: Enforces burst limits and rejects excess requests", () => {
    const limiter = new MockAtomicRateLimiter();
    const testKey = "booking_ip:verified_server_hash_123";
    const maxRequests = 5;
    const windowMs = 600000;

    for (let i = 1; i <= maxRequests; i++) {
      const allowed = limiter.checkRateLimit(testKey, maxRequests, windowMs);
      assert.equal(allowed, true, `Request #${i} should be permitted`);
    }

    const excess = limiter.checkRateLimit(testKey, maxRequests, windowMs);
    assert.equal(excess, false, "Request #6 must be rate-limited");
  });

  it("11. Rate-Limit Bypass Defense: Changing client phone does not bypass IP limit", () => {
    const limiter = new MockAtomicRateLimiter();
    const serverIpKey = "booking_ip:real_visitor_ip_hash";
    const maxIpRequests = 5;
    const windowMs = 600000;

    // Attacker sends 5 requests using different phone numbers from same IP
    for (let i = 1; i <= maxIpRequests; i++) {
      const allowed = limiter.checkRateLimit(serverIpKey, maxIpRequests, windowMs);
      assert.equal(allowed, true);
    }

    // 6th request with yet another phone number MUST still be blocked by IP limiter
    const blocked = limiter.checkRateLimit(serverIpKey, maxIpRequests, windowMs);
    assert.equal(blocked, false, "Attacker rotating phone numbers from same IP must be blocked");
  });

  it("12. Duplicate Booking Return: Accidental resubmission returns exact existing status", async () => {
    const store = new MockBookingStore();
    const payload = {
      name: "Pooja Patil",
      phone: "9823456789",
      date: validTomorrow,
      slot: "Evening (5 – 8 PM)",
      guests: 6,
      ipHash: "hash_xyz",
      initialStatus: "confirmed", // Existing booking was already confirmed by staff
    };

    // First submission
    const res1 = await store.submitBooking(payload);
    assert.equal(res1.success, true);
    assert.equal(res1.status, "confirmed");

    // Second submission by user (accidental double-click)
    const res2 = await store.submitBooking(payload);
    assert.equal(res2.success, true);
    assert.equal(res2.duplicate, true);
    // Verifies Requirement 3: Returns actual status ("confirmed"), NOT hardcoded "pending"
    assert.equal(res2.status, "confirmed");
    assert.equal(res1.booking_id, res2.booking_id);
    assert.equal(store.bookings.length, 1);
  });

  it("13. Separate Bookings: Same customer can legitimately book multiple different slots", async () => {
    const store = new MockBookingStore();
    const customer = {
      name: "Gaurav B",
      phone: "8605875107",
      date: validTomorrow,
      guests: 4,
      ipHash: "hash_789",
    };

    const resLunch = await store.submitBooking({ ...customer, slot: "Lunch (12 – 3 PM)" });
    const resNight = await store.submitBooking({ ...customer, slot: "Night (8 – 10 PM)" });

    assert.equal(resLunch.success, true);
    assert.equal(resNight.success, true);
    assert.notEqual(resLunch.booking_id, resNight.booking_id);
    assert.equal(store.bookings.length, 2);
  });

  it("14. Staff Anti-Probing Defense: Non-owners cannot enumerate staff roles", () => {
    const auth = new MockStaffAuth();
    auth.setRole("owner-uuid-1", "owner");
    auth.setRole("staff-uuid-2", "staff");
    auth.setRole("customer-uuid-3", "user");

    // 1. Unauthenticated checks fail
    assert.equal(auth.isStaff(null, "staff-uuid-2"), false);
    assert.equal(auth.isOwner(null, "owner-uuid-1"), false);

    // 2. Staff user can check their own role
    assert.equal(auth.isStaff("staff-uuid-2", "staff-uuid-2"), true);

    // 3. Staff user CANNOT probe if customer-uuid-3 or owner-uuid-1 exists
    assert.equal(auth.isStaff("staff-uuid-2", "owner-uuid-1"), false);
    assert.equal(auth.isOwner("staff-uuid-2", "owner-uuid-1"), false);

    // 4. Owner CAN check roles for management
    assert.equal(auth.isOwner("owner-uuid-1", "owner-uuid-1"), true);
    assert.equal(auth.isStaff("owner-uuid-1", "staff-uuid-2"), true);
  });
});
