import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { PHONE_DISPLAY, PHONE_TEL } from "../data";
import { PhoneIcon, BalloonIcon } from "./ui";
import Logo from "./Logo";

const LINKS = [
  { href: "#menu", label: "Menu" },
  { href: "#celebrations", label: "Celebrations" },
  { href: "#reviews", label: "Reviews" },
  { href: "#visit", label: "Visit" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "border-b border-latte/10 bg-bean-950/85 backdrop-blur-md" : "border-b border-transparent"
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between px-5 transition-all duration-500 sm:px-8",
          scrolled ? "py-3" : "py-5"
        )}
      >
        <a href="#top" className="flex items-center" aria-label="Hidden Café & Restro — home">
          <Logo size="nav" />
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group relative text-[13px] font-bold tracking-[0.14em] text-latte/75 uppercase transition-colors hover:text-caramel"
            >
              {l.label}
              <span className="absolute -bottom-1.5 left-0 h-[2px] w-full origin-left scale-x-0 bg-caramel transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${PHONE_TEL}`}
            className="hidden items-center gap-2 text-sm font-bold text-latte/85 transition-colors hover:text-caramel xl:flex"
          >
            <PhoneIcon className="h-4 w-4 text-caramel" />
            {PHONE_DISPLAY}
          </a>
          <a
            href="#celebrations"
            className="neon-frame hidden items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold tracking-wide text-roseneon transition-all duration-300 hover:bg-roseneon/10 sm:flex"
          >
            <BalloonIcon className="h-4 w-4" />
            Book a party
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-latte/15 text-latte transition hover:border-caramel/50 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <span
              className={cn(
                "absolute h-[2px] w-4 bg-current transition-all duration-300",
                open ? "rotate-45" : "-translate-y-[5px]"
              )}
            />
            <span
              className={cn(
                "absolute h-[2px] w-4 bg-current transition-all duration-300",
                open ? "-rotate-45" : "translate-y-[5px]"
              )}
            />
          </button>
        </div>
      </div>

      {/* mobile panel */}
      <div
        className={cn(
          "grid overflow-hidden border-b border-latte/10 bg-bean-950/97 backdrop-blur-lg transition-all duration-500 lg:hidden",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] border-transparent opacity-0"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <nav className="flex flex-col gap-1 px-6 py-6" aria-label="Mobile">
            {LINKS.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-display border-b border-latte/8 py-3 text-2xl font-medium text-latte italic transition-colors hover:text-caramel"
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                {l.label}
              </a>
            ))}
            <div className="mt-5 flex items-center gap-3">
              <a
                href={`tel:${PHONE_TEL}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-caramel px-4 py-3 text-sm font-bold text-bean-950"
              >
                <PhoneIcon className="h-4 w-4" /> Call us
              </a>
              <a
                href="#celebrations"
                onClick={() => setOpen(false)}
                className="neon-frame flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold text-roseneon"
              >
                <BalloonIcon className="h-4 w-4" /> Book a party
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
