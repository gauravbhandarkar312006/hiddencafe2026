import { useState, type FormEvent } from "react";
import { PACKAGES, ADDONS, PHONE_TEL, PHONE_DISPLAY } from "../data";
import { Reveal, Img, SectionHeading, SparkIcon, PhoneIcon, WhatsAppIcon, BalloonIcon, CakeIcon } from "./ui";
import { useToast } from "./Toast";
import { cn } from "../utils/cn";
import { submitBooking } from "../lib/bookingService";

const PARTY_SOURCES = ["/images/birthday-setup.jpg", "/images/birthday-setup.png"];

type FormState = {
  name: string;
  phone: string;
  date: string;
  slot: string;
  guests: string;
  pkg: string;
  notes: string;
  hp: string;
};

const EMPTY: FormState = {
  name: "",
  phone: "",
  date: "",
  slot: "Evening (5 – 8 PM)",
  guests: "",
  pkg: "glow",
  notes: "",
  hp: "",
};

function ScatterPolaroid({
  sources,
  alt,
  caption,
  className,
  rotate,
  delay,
}: {
  sources: string[];
  alt: string;
  caption: string;
  className: string;
  rotate: string;
  delay: number;
}) {
  return (
    <Reveal variant="left" delay={delay} className={cn("absolute", className)}>
      <figure
        className={cn(
          "tape rounded-sm bg-foam p-2.5 pb-3 shadow-[0_26px_60px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:z-30 hover:rotate-0 hover:scale-[1.05]",
          rotate
        )}
      >
        <Img
          sources={sources}
          alt={alt}
          className="block aspect-[4/3.4] w-full rounded-[2px] bg-bean-800/60 object-cover"
          loading="lazy"
        />
        <figcaption className="font-hand mt-2 text-center text-base leading-none text-bean-800 italic">{caption}</figcaption>
      </figure>
    </Reveal>
  );
}

export default function Parties() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const choosePackage = (id: string) => {
    set("pkg")(id);
    const chosen = PACKAGES.find((p) => p.id === id);
    toast({
      title: `Selected: ${chosen?.name || "Party Package"}`,
      description: `₹${chosen?.price?.toLocaleString() || "1,499"} • Scroll down to book your preferred date & time!`,
      type: "party",
    });
    document.getElementById("book-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.phone.trim() || !form.date || !form.guests) {
      const msg = "Please enter your name, contact phone, booking date and guest count.";
      setError(msg);
      toast({
        title: "Missing Details",
        description: msg,
        type: "info",
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitBooking(form);
      setSent(true);
      window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
      toast({
        title: result.bookingId ? "Booking Saved & Forwarded! 🎈" : "Opening WhatsApp 🎈",
        description: result.message,
        type: "party",
      });
      window.setTimeout(() => setSent(false), 5000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to submit booking.";
      setError(errorMsg);
      toast({
        title: "Booking Error",
        description: errorMsg,
        type: "info",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-md border border-latte/14 bg-bean-950/70 px-4 py-3 text-[15px] text-foam placeholder:text-dune/60 outline-none transition-all duration-300 focus:border-caramel/70 focus:shadow-[0_0_0_3px_rgba(194,160,90,0.18)]";

  return (
    <section id="parties" className="relative scroll-mt-24 overflow-hidden py-24 sm:py-32">
      {/* rose glow backdrop */}
      <div
        className="pointer-events-none absolute top-10 -left-40 h-[36rem] w-[36rem] rounded-full opacity-60"
        style={{ background: "radial-gradient(circle, rgba(255,110,139,0.13), transparent 62%)" }}
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-0 h-[30rem] w-[30rem] rounded-full opacity-50"
        style={{ background: "radial-gradient(circle, rgba(227,154,69,0.1), transparent 60%)" }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-start gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          {/* scattered evidence */}
          <div className="relative order-2 h-[56rem] lg:order-1 lg:h-[64rem]">
            <ScatterPolaroid
              sources={PARTY_SOURCES}
              alt="Birthday decoration at Hidden Café — balloon arch, butterflies and neon Happy Birthday sign"
              caption="the glow wall, mid-setup"
              className="top-0 left-2 w-64 sm:w-80 lg:w-[22rem]"
              rotate="-rotate-3"
              delay={0}
            />
            <ScatterPolaroid
              sources={["/images/baby-shower.jpg"]}
              alt="Baby shower decoration at Hidden Café — pink balloons, butterflies and neon sign"
              caption="baby shower magic"
              className="top-[28%] right-0 w-56 sm:w-72 lg:w-80"
              rotate="rotate-4"
              delay={160}
            />
            <ScatterPolaroid
              sources={["/images/together-forever.jpg"]}
              alt="Together Forever anniversary setup with floral arch, neon sign and marquee 25 at Hidden Café"
              caption="Together Forever"
              className="top-[54%] left-4 w-52 sm:w-64 lg:w-72"
              rotate="-rotate-2"
              delay={240}
            />
            <ScatterPolaroid
              sources={["/images/couple-party-special.jpg"]}
              alt="Couple Party romantic candlelight setup with fairy lights, red curtains and balloons"
              caption="Couple Party"
              className="bottom-0 right-6 w-48 sm:w-60 lg:w-68"
              rotate="rotate-5"
              delay={320}
            />
            <p className="font-hand absolute top-[22%] left-[52%] hidden text-lg text-roseneon italic sm:block">
              real tables, real celebrations ↓
            </p>
          </div>

          {/* pitch + packages */}
          <div className="order-1 lg:order-2">
            <SectionHeading
              kicker="03 · Parties & Décor"
              title={
                <>
                  Birthdays, but
                  <br />
                  <em className="text-roseneon">make it neon.</em>
                </>
              }
              hand="yes, we decorate. yes, it glows."
            />
            <Reveal delay={140}>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-dune">
                It started with one balloon bunch and a borrowed sign — now the owner plans décor for birthdays,
                baby showers, couple celebrations and surprise proposals almost every week. Pick a package, tell us the colours, and walk
                in to a table that's already <span className="text-roseneon">glowing</span>.
              </p>
            </Reveal>

            <div className="mt-10 space-y-5">
              {PACKAGES.map((pkg, i) => {
                const featured = pkg.id === "glow";
                return (
                  <Reveal key={pkg.id} delay={i * 120}>
                    <article
                      className={cn(
                        "group relative rounded-md border p-6 transition-all duration-500 sm:p-7",
                        featured
                          ? "neon-frame bg-bean-900/90"
                          : "border-latte/12 bg-bean-900/60 hover:-translate-y-1 hover:border-caramel/40"
                      )}
                    >
                      {pkg.tag && (
                        <span className="font-body absolute -top-3.5 right-6 rounded-full bg-rosedeep px-3.5 py-1 text-[11px] font-bold tracking-[0.16em] text-foam uppercase">
                          {pkg.tag}
                        </span>
                      )}
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <h3 className="font-display text-2xl font-semibold text-foam italic sm:text-[1.7rem]">
                          {pkg.name}
                        </h3>
                        <p className="font-display text-2xl font-bold text-caramel">
                          ₹{pkg.price.toLocaleString("en-IN")}
                          <span className="ml-1 text-xs font-bold text-dune">onwards</span>
                        </p>
                      </div>
                      <p className="mt-2 text-[14px] text-dune">{pkg.desc}</p>
                      <ul className="mt-4 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                        {pkg.includes.map((inc) => (
                          <li key={inc} className="flex items-start gap-2 text-[13.5px] text-latte/80">
                            <SparkIcon className={cn("mt-1 h-2.5 w-2.5 shrink-0", featured ? "text-roseneon" : "text-caramel")} />
                            {inc}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => choosePackage(pkg.id)}
                        className={cn(
                          "mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-extrabold tracking-[0.12em] uppercase transition-all duration-300",
                          featured
                            ? "bg-rosedeep text-foam hover:bg-[#8a3a45]"
                            : "border border-caramel/50 text-caramel hover:bg-caramel hover:text-bean-950"
                        )}
                      >
                        Book this <BalloonIcon className="h-4 w-4" />
                      </button>
                    </article>
                  </Reveal>
                );
              })}
            </div>

            <Reveal delay={200}>
              <div className="mt-8">
                <p className="text-[11px] font-bold tracking-[0.24em] text-dune uppercase">Add-ons we're good at</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {ADDONS.map((a) => (
                    <li
                      key={a}
                      className="rounded-full border border-latte/14 px-3.5 py-1.5 text-[12.5px] font-bold text-latte/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-roseneon/50 hover:text-roseneon"
                    >
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>

        {/* booking form */}
        <Reveal delay={100}>
          <div id="book-form" className="mt-20 scroll-mt-32 rounded-md border border-latte/12 bg-bean-900/80 p-6 sm:p-10">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <h3 className="font-display text-3xl font-semibold text-foam sm:text-4xl">
                  Plan the <em className="text-caramel">surprise</em>
                </h3>
                <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-dune">
                  Tell us the date and the vibe — we'll reply on WhatsApp within the hour with setup photos and a
                  final quote. No advance needed to hold a table.
                </p>
                <div className="mt-7 space-y-3">
                  <a
                    href={`tel:${PHONE_TEL}`}
                    className="flex items-center gap-3 text-[15px] font-bold text-latte transition-colors hover:text-caramel"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-caramel/40 text-caramel">
                      <PhoneIcon className="h-4.5 w-4.5" />
                    </span>
                    Prefer to talk? {PHONE_DISPLAY}
                  </a>
                  <p className="flex items-center gap-3 text-[14px] text-dune">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-latte/15 text-latte/70">
                      <CakeIcon className="h-4.5 w-4.5" />
                    </span>
                    Outside cake welcome — we'll bring the candles.
                  </p>
                </div>
              </div>

              <form id="book-form" onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
                {/* Honeypot field for bot trapping (invisible to normal users) */}
                <input
                  type="text"
                  name="hp"
                  value={form.hp}
                  onChange={(e) => set("hp")(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                <div>
                  <label htmlFor="bk-name" className="mb-1.5 block text-[11px] font-extrabold tracking-[0.18em] text-dune uppercase">
                    Your name *
                  </label>
                  <input id="bk-name" className={inputCls} placeholder="Aarav Sharma" value={form.name} onChange={(e) => set("name")(e.target.value)} required maxLength={100} />
                </div>
                <div>
                  <label htmlFor="bk-phone" className="mb-1.5 block text-[11px] font-extrabold tracking-[0.18em] text-dune uppercase">
                    Phone / WhatsApp *
                  </label>
                  <input id="bk-phone" className={inputCls} placeholder="98XXXXXXXX" inputMode="tel" value={form.phone} onChange={(e) => set("phone")(e.target.value)} required maxLength={20} />
                </div>
                <div>
                  <label htmlFor="bk-date" className="mb-1.5 block text-[11px] font-extrabold tracking-[0.18em] text-dune uppercase">
                    Date *
                  </label>
                  <input
                    id="bk-date"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    className={inputCls}
                    value={form.date}
                    onChange={(e) => set("date")(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="bk-slot" className="mb-1.5 block text-[11px] font-extrabold tracking-[0.18em] text-dune uppercase">
                    Time slot *
                  </label>
                  <select id="bk-slot" className={inputCls} value={form.slot} onChange={(e) => set("slot")(e.target.value)}>
                    <option>Lunch (12 – 3 PM)</option>
                    <option>Evening (5 – 8 PM)</option>
                    <option>Night (8 – 10 PM)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="bk-guests" className="mb-1.5 block text-[11px] font-extrabold tracking-[0.18em] text-dune uppercase">
                    Guests *
                  </label>
                  <input id="bk-guests" className={inputCls} placeholder="e.g. 8" inputMode="numeric" value={form.guests} onChange={(e) => set("guests")(e.target.value)} required min={1} max={200} />
                </div>
                <div>
                  <label htmlFor="bk-pkg" className="mb-1.5 block text-[11px] font-extrabold tracking-[0.18em] text-dune uppercase">
                    Package
                  </label>
                  <select id="bk-pkg" className={inputCls} value={form.pkg} onChange={(e) => set("pkg")(e.target.value)}>
                    {PACKAGES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₹{p.price.toLocaleString("en-IN")}
                      </option>
                    ))}
                    <option value="decor">Just the décor</option>
                    <option value="tbd">Still deciding</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="bk-notes" className="mb-1.5 block text-[11px] font-extrabold tracking-[0.18em] text-dune uppercase">
                    Theme, colours, surprises…
                  </label>
                  <textarea id="bk-notes" rows={3} maxLength={1000} className={cn(inputCls, "resize-none")} placeholder="Rose-gold balloons, her favourite playlist, cake at 8 sharp…" value={form.notes} onChange={(e) => set("notes")(e.target.value)} />
                </div>
                {error && <p className="text-[13px] font-bold text-roseneon sm:col-span-2">{error}</p>}
                <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group inline-flex items-center gap-3 rounded-full bg-rosedeep px-7 py-4 text-sm font-bold tracking-[0.08em] text-foam uppercase transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#8a3a45] disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    <WhatsAppIcon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                    {submitting ? "Securing Booking..." : "Send on WhatsApp"}
                  </button>
                  <p className="text-[13px] text-dune" role="status">
                    {sent ? "Booking processed & opening WhatsApp — see you there ✳" : "Replies usually within the hour, 10 AM – 10 PM."}
                  </p>
                </div>
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
