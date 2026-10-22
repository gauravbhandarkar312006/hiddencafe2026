import { HOURS, ADDRESS, PHONE_DISPLAY, PHONE_TEL, WHATSAPP, MAPS_QUERY, MAP_EMBED } from "../data";
import { Reveal, SectionHeading, PinIcon, PhoneIcon, ClockIcon, WhatsAppIcon, ArrowIcon, BeanIcon, StarIcon } from "./ui";
import { cn } from "../utils/cn";

const NAV_LINKS = [
  { href: "#menu", label: "Menu" },
  { href: "#parties", label: "Parties & Décor" },
  { href: "#celebrations", label: "Celebrations & Events" },
  { href: "#reviews", label: "Reviews" },
];

export default function Visit() {
  const today = (new Date().getDay() + 6) % 7; // Monday = 0

  return (
    <>
      <section id="visit" className="relative scroll-mt-24 overflow-hidden py-24 sm:py-32">
        <div
          className="pointer-events-none absolute -top-24 right-0 h-[28rem] w-[28rem] rounded-full opacity-50"
          style={{ background: "radial-gradient(circle, rgba(227,154,69,0.1), transparent 62%)" }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <SectionHeading
              kicker="06 · Find the Hideout"
              title={
                <>
                  Come get <em className="text-roseneon">lost</em> with us.
                </>
              }
              hand="4-min walk from Shirsoli station"
            />

            <Reveal delay={140}>
              <address className="mt-8 space-y-5 not-italic">
                <p className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-caramel/40 text-caramel">
                    <PinIcon className="h-4.5 w-4.5" />
                  </span>
                  <span>
                    <span className="block text-[11px] font-extrabold tracking-[0.2em] text-dune uppercase">Address</span>
                    <span className="mt-1 block text-[15.5px] leading-relaxed font-bold text-latte">{ADDRESS}</span>
                  </span>
                </p>
                <p className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-caramel/40 text-caramel">
                    <PhoneIcon className="h-4.5 w-4.5" />
                  </span>
                  <span>
                    <span className="block text-[11px] font-extrabold tracking-[0.2em] text-dune uppercase">Call or WhatsApp</span>
                    <a href={`tel:${PHONE_TEL}`} className="mt-1 block text-[15.5px] font-bold text-latte transition-colors hover:text-caramel">
                      {PHONE_DISPLAY}
                    </a>
                  </span>
                </p>
                <p className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-caramel/40 text-caramel">
                    <ClockIcon className="h-4.5 w-4.5" />
                  </span>
                  <span>
                    <span className="block text-[11px] font-extrabold tracking-[0.2em] text-dune uppercase">Hours</span>
                    <span className="mt-1 block text-[15.5px] font-bold text-latte">Every day · 10:00 AM – 10:00 PM</span>
                    <span className="mt-0.5 block text-[13px] text-dune">Last orders at 9:40 PM · décor setups after close</span>
                  </span>
                </p>
              </address>
            </Reveal>

            <Reveal delay={220}>
              <div className="mt-8 flex flex-wrap gap-3.5">
                <a
                  href={MAPS_QUERY}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 rounded-full bg-caramel px-6 py-3.5 text-[13px] font-extrabold tracking-[0.08em] text-bean-950 uppercase shadow-[0_10px_30px_rgba(227,154,69,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-foam"
                >
                  Get directions
                  <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </a>
                <a
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi Hidden Café! I'd like to reserve a table.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full border border-pista/50 px-6 py-3.5 text-[13px] font-extrabold tracking-[0.08em] text-pista uppercase transition-all duration-300 hover:-translate-y-0.5 hover:bg-pista/10"
                >
                  <WhatsAppIcon className="h-4.5 w-4.5" /> Reserve a table
                </a>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-10 overflow-hidden rounded-md border border-latte/12">
                <div className="flex items-center justify-between border-b border-latte/10 bg-bean-900/70 px-5 py-3">
                  <p className="text-[11px] font-extrabold tracking-[0.24em] text-dune uppercase">This week</p>
                  <span className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.14em] text-pista uppercase">
                    <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-pista" /> open now
                  </span>
                </div>
                <ul>
                  {HOURS.map((h, i) => (
                    <li
                      key={h.day}
                      className={cn(
                        "flex items-center justify-between px-5 py-2.5 text-[13.5px] transition-colors",
                        i === today ? "bg-caramel/10 font-extrabold text-caramel" : "text-latte/75 odd:bg-latte/[0.02]"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {i === today && <BeanIcon className="h-3.5 w-3.5" />}
                        {h.day}
                        {i === today && <span className="font-hand text-sm italic normal-case">← today</span>}
                      </span>
                      <span className="tabular-nums">{h.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          {/* map */}
          <Reveal variant="right" delay={150} className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative overflow-hidden rounded-md border border-latte/15 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
              <iframe
                title="Hidden Café & Restro on Google Maps"
                src={MAP_EMBED}
                className="map-dark h-[30rem] w-full sm:h-[36rem]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-latte/10 ring-inset" />
              <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-md border border-latte/15 bg-bean-950/90 px-4 py-3 backdrop-blur-sm">
                <span className="neon-rose font-display text-2xl font-bold italic">H</span>
                <div>
                  <p className="text-[13px] font-extrabold text-foam">Hidden Café & Restro</p>
                  <p className="flex items-center gap-1 text-[12px] text-dune">
                    <StarIcon className="h-3 w-3 text-caramel" filled /> 4.4 · Adarsh Nagar Rd · till 10 PM
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* footer */}
      <footer className="relative border-t border-latte/10 bg-bean-950">
        <div className="mx-auto max-w-7xl px-5 pt-16 pb-8 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <Reveal>
              <p className="font-display text-[clamp(3rem,8vw,6rem)] leading-[0.85] font-bold tracking-tight">
                <span className="text-foam italic">Hidden</span>
                <span className="neon-rose">·</span>
              </p>
            </Reveal>
            <Reveal delay={120}>
              <p className="font-hand max-w-xs text-right text-lg leading-snug text-dune italic">
                not lost —<br />
                just <span className="text-roseneon">hidden</span>. see you at ten?
              </p>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-10 border-t border-latte/8 pt-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[11px] font-extrabold tracking-[0.24em] text-caramel uppercase">Explore</p>
              <ul className="mt-4 space-y-2.5">
                {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="text-[14px] font-bold text-latte/75 transition-colors hover:text-caramel">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-extrabold tracking-[0.24em] text-caramel uppercase">Reach us</p>
              <ul className="mt-4 space-y-2.5 text-[14px] font-bold text-latte/75">
                <li>
                  <a href={`tel:${PHONE_TEL}`} className="transition-colors hover:text-caramel">
                    {PHONE_DISPLAY}
                  </a>
                </li>
                <li>
                  <a
                    href={`https://wa.me/${WHATSAPP}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-pista"
                  >
                    WhatsApp us
                  </a>
                </li>
                <li>
                  <a href={MAPS_QUERY} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-caramel">
                    Google Maps
                  </a>
                </li>
                <li className="pt-1 text-[13px] leading-relaxed font-normal text-dune">{ADDRESS}</li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-extrabold tracking-[0.24em] text-caramel uppercase">Hours</p>
              <ul className="mt-4 space-y-2.5 text-[14px] text-latte/75">
                <li className="font-bold">Mon – Sun</li>
                <li>10:00 AM – 10:00 PM</li>
                <li className="pt-1 text-[13px] text-dune">Party décor setups available after close.</li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-extrabold tracking-[0.24em] text-caramel uppercase">House rules</p>
              <ul className="font-hand mt-4 space-y-1.5 text-base text-latte/75 italic">
                <li>· outside cake welcome</li>
                <li>· photos encouraged</li>
                <li>{"· conversations > Wi-Fi"}</li>
                <li>· the twisters are for sharing (maybe)</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-latte/8 pt-6 text-[12.5px] text-dune">
            <p>© 2026 Hidden Café & Restro · Adarsh Nagar, Jalgaon. All cravings reserved.</p>
            <div className="flex items-center gap-5">
              <p className="flex items-center gap-1.5">
                Brewed with <BeanIcon className="h-3.5 w-3.5 text-caramel" /> in Jalgaon
              </p>
              <a
                href="#top"
                className="group flex h-10 w-10 items-center justify-center rounded-full border border-latte/15 text-latte transition-all duration-300 hover:border-caramel/60 hover:text-caramel"
                aria-label="Back to top"
              >
                <ArrowIcon className="h-4 w-4 -rotate-45 transition-transform duration-300 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
