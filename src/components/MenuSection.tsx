import { useState, useMemo } from "react";
import { MENU, type MenuItem, WHATSAPP } from "../data";
import { Reveal, SectionHeading, VegMark, StarIcon, FlameIcon, WhatsAppIcon } from "./ui";
import { useToast } from "./Toast";
import { cn } from "../utils/cn";

function ItemRow({ item, index }: { item: MenuItem; index: number }) {
  const { toast } = useToast();

  const handleOrder = () => {
    const text = `Hi Hidden Café! I would like to order: ${item.name} (₹${item.price})`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    toast({
      title: `Added to order: ${item.name}`,
      description: `₹${item.price} • Connecting to WhatsApp for direct order delivery & takeaway!`,
      type: "coffee",
    });
  };

  return (
    <li
      onClick={handleOrder}
      className="rise-in group flex cursor-pointer items-baseline rounded-xl px-3.5 py-3 transition-all duration-300 hover:bg-latte/[0.06] hover:pl-4.5"
      style={{ animationDelay: `${index * 35}ms` }}
      title="Click to order on WhatsApp"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <VegMark />
          <span className="text-[15px] font-bold tracking-wide text-latte transition-colors group-hover:text-foam sm:text-base">
            {item.name}
          </span>
          {item.famous && (
            <span className="rounded-full bg-caramel/15 border border-caramel/30 px-2 py-0.5 text-[10px] font-bold tracking-wider text-caramel uppercase">
              popular
            </span>
          )}
          {item.pick && <StarIcon className="h-3.5 w-3.5 text-caramel" filled />}
          {item.spicy && <FlameIcon className="h-3.5 w-3.5 text-chili" />}
        </div>
        {item.note && <p className="mt-0.5 pl-[22px] text-xs text-dune italic">{item.note}</p>}
        {item.sizePrice && (
          <p className="mt-1 pl-[22px] text-[11px] font-semibold text-caramel/90">
            {item.sizePrice}
          </p>
        )}
      </div>
      <span className="dot-leader hidden sm:block" aria-hidden />
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-display text-base font-bold whitespace-nowrap text-caramel transition-colors group-hover:text-foam sm:text-lg">
          ₹{item.price}
        </span>
        <span className="text-xs text-caramel/60 opacity-0 transition-opacity group-hover:opacity-100">
          Order ↗
        </span>
      </div>
    </li>
  );
}

export default function MenuSection() {
  const [activeId, setActiveId] = useState(MENU[0].id);
  const [menuView, setMenuView] = useState<"interactive" | "brochure">("interactive");
  const [activePdfPage, setActivePdfPage] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const active = MENU.find((c) => c.id === activeId) ?? MENU[0];

  const filteredItems = useMemo(() => {
    if (!search.trim()) return active.items;
    const q = search.toLowerCase();
    return active.items.filter(
      (item) => item.name.toLowerCase().includes(q) || item.note?.toLowerCase().includes(q)
    );
  }, [active, search]);

  const menuPdfPages = [
    { page: 1, title: "Page 1: Mocktails, Fries & Nuggets, Garlic Bread" },
    { page: 2, title: "Page 2: Soup, Twisty Potato, Maggie, Momos, Wraps & Tacos" },
    { page: 3, title: "Page 3: Nachos, Sandwiches, Burgers, Pizzas & Pastas" },
    { page: 4, title: "Page 4: Rice, Noodles & Chinese Appetizers & Platters" },
    { page: 5, title: "Page 5: Chocolate Sandwiches, Brownies, Hot Drinks, Cold Coffee & Shakes" },
    { page: 6, title: "Page 6: Ferraro Shakes, Ice Creams, Soft Drinks & Dips" },
  ];

  return (
    <section id="menu" className="relative scroll-mt-24 border-y border-latte/8 bg-bean-900/50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            kicker="02 · The Real Menu"
            title={
              <>
                Where Flavour <br />
                <em className="text-caramel">Meets Comfort.</em>
              </>
            }
            hand="100% pure veg café & restro • freshly prepared"
          />

          <Reveal delay={150}>
            <div className="flex flex-wrap items-center gap-3">
              {/* View Toggle */}
              <div className="inline-flex rounded-full border border-caramel/30 bg-bean-900/90 p-1 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setMenuView("interactive")}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-bold tracking-wide transition-all duration-300",
                    menuView === "interactive"
                      ? "bg-caramel text-bean-950 shadow-[0_2px_12px_rgba(194,160,90,0.4)]"
                      : "text-dune hover:text-latte"
                  )}
                >
                  🍽️ Interactive Menu
                </button>
                <button
                  type="button"
                  onClick={() => setMenuView("brochure")}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-bold tracking-wide transition-all duration-300",
                    menuView === "brochure"
                      ? "bg-caramel text-bean-950 shadow-[0_2px_12px_rgba(194,160,90,0.4)]"
                      : "text-dune hover:text-latte"
                  )}
                >
                  📄 Original Menu Cards (6)
                </button>
              </div>

              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi Hidden Café! I would like to order food.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-latte/15 bg-bean-850 px-4 py-2 text-xs font-bold text-latte transition-all hover:border-caramel hover:text-caramel"
              >
                <WhatsAppIcon className="h-3.5 w-3.5 text-caramel" />
                WhatsApp Order
              </a>
            </div>
          </Reveal>
        </div>

        {menuView === "interactive" ? (
          <div className="mt-12 grid gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:gap-14">
            {/* Sticky Feature Card */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal variant="left">
                <div className="group relative overflow-hidden rounded-2xl border border-latte/12 shadow-xl">
                  <img
                    key={active.id}
                    src={active.image}
                    alt={active.imageLabel}
                    className="rise-in aspect-[5/4] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] lg:aspect-[4/4.3]"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bean-950/95 via-bean-950/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 w-full p-6">
                    <p className="font-hand text-xl text-foam italic drop-shadow">{active.imageLabel}</p>
                    <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-latte/80">{active.blurb}</p>
                  </div>
                  <span className="font-display absolute top-4 right-4 rounded-full bg-bean-950/80 px-3.5 py-1.5 text-xs font-bold tracking-[0.16em] text-caramel uppercase backdrop-blur-md border border-caramel/30">
                    {active.hindi}
                  </span>
                </div>
              </Reveal>

              <Reveal delay={150}>
                <div className="neon-frame-amber mt-5 flex items-center justify-between gap-4 rounded-xl bg-bean-900/90 p-4">
                  <div>
                    <p className="text-xs font-bold tracking-wide text-latte">
                      Special Recommendation:
                    </p>
                    <p className="text-xs text-dune mt-0.5">
                      <span className="text-caramel font-semibold">Peri Peri Twisty</span> +{" "}
                      <span className="text-caramel font-semibold">Classic Cold Coffee</span>
                    </p>
                  </div>
                  <span className="font-display shrink-0 text-xl font-bold text-caramel italic">₹297</span>
                </div>
              </Reveal>
            </div>

            {/* Categories & Items List */}
            <div>
              {/* Category tabs */}
              <Reveal delay={100}>
                <div className="flex flex-wrap gap-2">
                  {MENU.map((cat) => {
                    const isActive = cat.id === activeId;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setActiveId(cat.id);
                          setSearch("");
                        }}
                        className={cn(
                          "rounded-xl border px-4 py-2 text-xs font-bold tracking-wide uppercase transition-all duration-300",
                          isActive
                            ? "border-caramel bg-caramel text-bean-950 shadow-[0_4px_18px_rgba(194,160,90,0.35)] scale-[1.02]"
                            : "border-latte/12 bg-bean-850/60 text-latte/75 hover:border-caramel/40 hover:text-latte"
                        )}
                      >
                        {cat.label}
                        <span className={cn("ml-2 text-[10px]", isActive ? "text-bean-900" : "text-dune")}>
                          {cat.items.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Reveal>

              {/* Quick filter input */}
              <div className="mt-5">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search in ${active.label}... (e.g. peri peri, cheese, pasta)`}
                  className="w-full rounded-xl border border-latte/14 bg-bean-950/70 px-4 py-2.5 text-xs text-foam placeholder:text-dune/60 outline-none transition-all focus:border-caramel/70"
                />
              </div>

              {/* Items List */}
              <ul key={active.id} className="mt-4 divide-y divide-latte/7">
                {filteredItems.map((item, i) => (
                  <ItemRow key={item.name} item={item} index={i} />
                ))}
              </ul>

              {filteredItems.length === 0 && (
                <div className="py-8 text-center text-xs text-dune">
                  No items match "{search}". Try searching for another dish.
                </div>
              )}

              {/* Legend without Jain */}
              <Reveal delay={200}>
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-latte/10 pt-4 text-[12px] font-semibold text-dune">
                  <span className="flex items-center gap-1.5">
                    <VegMark /> 100% Pure Veg
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FlameIcon className="h-3.5 w-3.5 text-chili" /> Spicy Delights
                  </span>
                  <span className="flex items-center gap-1.5">
                    <StarIcon className="h-3.5 w-3.5 text-caramel" filled /> Chef's Signature
                  </span>
                  <span className="text-[11px] text-dune/70 ml-auto">
                    Click any item to order on WhatsApp
                  </span>
                </div>
              </Reveal>
            </div>
          </div>
        ) : (
          /* View Mode: Original 6 Menu Cards from PDF */
          <div className="mt-12">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {menuPdfPages.map((p) => (
                <div
                  key={p.page}
                  onClick={() => setActivePdfPage(p.page)}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-latte/12 bg-bean-900 shadow-xl transition-all duration-300 hover:border-caramel/70 hover:-translate-y-1"
                >
                  <div className="aspect-[3/4.6] w-full overflow-hidden bg-bean-950">
                    <img
                      src={`/images/menu/menu-page-${p.page}.jpg`}
                      alt={p.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-center justify-between bg-bean-850 p-4">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-caramel uppercase">
                        Menu Page {p.page}
                      </span>
                      <p className="mt-0.5 text-xs font-bold text-foam line-clamp-1">{p.title}</p>
                    </div>
                    <span className="text-xs font-bold text-caramel opacity-0 transition-opacity group-hover:opacity-100">
                      Zoom ↗
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Menu Card Zoom Modal */}
      {activePdfPage !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[120] flex items-center justify-center bg-bean-950/85 p-4 backdrop-blur-md animate-in fade-in"
          onClick={() => setActivePdfPage(null)}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-caramel/40 bg-bean-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-latte/10 bg-bean-950/90 px-5 py-3">
              <span className="text-xs font-bold text-caramel uppercase">
                Official Menu Card · Page {activePdfPage}
              </span>
              <button
                type="button"
                onClick={() => setActivePdfPage(null)}
                className="rounded-lg p-1 text-dune hover:text-foam"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[78vh] overflow-auto bg-black/40 p-2 flex items-center justify-center">
              <img
                src={`/images/menu/menu-page-${activePdfPage}.jpg`}
                alt={`Menu Page ${activePdfPage}`}
                className="max-h-[74vh] w-auto max-w-full rounded-md object-contain"
              />
            </div>
            <div className="flex items-center justify-between border-t border-latte/10 bg-bean-950/90 p-4">
              <span className="text-xs text-dune">Plot no-9, Adarsh Nagar RTO Road, Jalgaon</span>
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hi Hidden Café! I want to order from Menu Page ${activePdfPage}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-caramel px-4 py-2 text-xs font-bold text-bean-950 uppercase"
                >
                  Order via WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => setActivePdfPage(null)}
                  className="rounded-xl border border-latte/15 px-3 py-2 text-xs font-bold text-latte"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
