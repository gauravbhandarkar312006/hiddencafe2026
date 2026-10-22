import { useState, useMemo } from "react";
import { Reveal, SectionHeading, WhatsAppIcon, PhoneIcon } from "./ui";
import { WHATSAPP, PHONE_DISPLAY, PHONE_TEL } from "../data";
import { useToast } from "./Toast";
import { cn } from "../utils/cn";

export type EventCategory =
  | "all"
  | "couple"
  | "birthday"
  | "baby-shower"
  | "kitty-party"
  | "kids-party"
  | "get-together";

interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  categoryLabel: string;
  image: string;
  fallback?: string;
  description: string;
  badge?: string;
  span?: string;
}

const EVENT_ITEMS: EventItem[] = [
  // Couple Party items (prominently featuring the user's uploaded couple party image)
  {
    id: "couple-special",
    title: "Couple Party • Romantic Candlelight Dinner",
    category: "couple",
    categoryLabel: "Couple Party",
    image: "/images/couple-party-special.jpg",
    description:
      "Intimate romantic setup with cascading fairy lights, deep red velvet drapes, fresh rose petals on the table, and balloon pillars.",
    badge: "Most Romantic",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    id: "couple-anniversary-heart",
    title: "Together Forever • Anniversary Ring",
    category: "couple",
    categoryLabel: "Couple Party",
    image: "/images/together-forever.jpg",
    fallback: "/images/events/photos/photo_p16_1.jpeg",
    description: "Floral canopy arch with illuminated 'Together Forever' neon sign and marquee numbers.",
    badge: "Anniversary Special",
  },
  {
    id: "couple-cozy-table",
    title: "Candlelight Date Corner",
    category: "couple",
    categoryLabel: "Couple Party",
    image: "/images/events/photos/photo_p16_4.jpeg",
    description: "Private booth arrangement with warm ambient lighting, perfect for surprise proposals & dates.",
  },
  {
    id: "couple-anniversary-geometric",
    title: "Happy Anniversary Grand Geometric Arch",
    category: "couple",
    categoryLabel: "Couple Party",
    image: "/images/events/anniversary-gold-geometric.jpg",
    fallback: "/images/together-forever.jpg",
    description: "Illuminated 'Happy Anniversary' neon centerpiece with geometric gold arch, cascading ceiling wisteria, and celebratory flower bouquets.",
    badge: "Anniversary Special",
  },

  // Birthday Party setups
  {
    id: "bday-red-black-ring",
    title: "Red & Black Celebration Ring & Rose Heart Table",
    category: "birthday",
    categoryLabel: "Party Birthday",
    image: "/images/events/bday-red-black-ring.jpg",
    fallback: "/images/birthday-setup.jpg",
    description:
      "Striking black and red balloon circular arch with glowing 'Happy Birthday' neon sign, hanging wisteria blossoms, and fresh rose petal heart centerpiece on the table.",
    badge: "Bestseller Setup",
    span: "md:col-span-2",
  },
  {
    id: "bday-white-gold-ring",
    title: "Metallic Gold & White Luxury Birthday Ring",
    category: "birthday",
    categoryLabel: "Party Birthday",
    image: "/images/events/bday-white-gold-ring.jpg",
    fallback: "/images/events/photos/photo_p3_4.jpeg",
    description:
      "Elegant royal setup with metallic gold and white balloons, illuminated fairy light curtain, and radiant 'Happy Birthday' neon sign.",
    badge: "Royal Setup",
    span: "md:col-span-1",
  },
  {
    id: "bday-princess-theme",
    title: "Disney Princess Theme Birthday Fantasy",
    category: "birthday",
    categoryLabel: "Party Birthday",
    image: "/images/events/bday-princess-theme.jpg",
    fallback: "/images/events/photos/photo_p5_1.jpeg",
    description:
      "Magical fairy-tale princess party backdrop with pastel balloon clusters, illuminated marquee lights, character standees, and custom neon name sign.",
    badge: "Kids Princess Special",
    span: "md:col-span-1",
  },
  {
    id: "bday-candlelit-table",
    title: "Candlelit Rose Petal Birthday Banquet",
    category: "birthday",
    categoryLabel: "Party Birthday",
    image: "/images/events/bday-candlelit-table.jpg",
    fallback: "/images/events/photos/photo_p4_1.jpeg",
    description:
      "Signature long celebration table draped in crimson rose petals, ambient candle lanterns, fairy lights, and balloon arch backdrop.",
    badge: "Table Decor Special",
    span: "md:col-span-2",
  },
  {
    id: "bday-anniversary-geometric",
    title: "Anniversary & Milestone Geometric Arch Setup",
    category: "birthday",
    categoryLabel: "Party Birthday",
    image: "/images/events/anniversary-gold-geometric.jpg",
    fallback: "/images/events/photos/photo_p3_6.jpeg",
    description:
      "Geometric golden backdrop with black & metallic gold balloon clusters, floral canopy, cake pedestal, and fresh flower bouquets.",
    badge: "Anniversary & Milestone",
    span: "md:col-span-1",
  },

  // Baby Shower
  {
    id: "baby-shower-ring",
    title: "Dreamy Baby Shower Dual Ring",
    category: "baby-shower",
    categoryLabel: "Baby Shower",
    image: "/images/events/photos/photo_p11_1.jpeg",
    fallback: "/images/baby-shower.jpg",
    description:
      "Sky blue and pastel pink balloon circle with cute baby carriages, bottles, teddy bears and celebratory cutouts.",
    badge: "Mom-to-be Special",
    span: "md:col-span-2",
  },
  {
    id: "baby-shower-fairytale",
    title: "Princess Fairy Arch Decor",
    category: "baby-shower",
    categoryLabel: "Baby Shower",
    image: "/images/events/photos/photo_p11_2.jpeg",
    description: "Fairytale balloon column with butterflies, fairy lights and pink floral clouds.",
  },

  // Kitty Party
  {
    id: "kitty-party-feast",
    title: "Grand Kitty Party Long Table Feast",
    category: "kitty-party",
    categoryLabel: "Kitty Party",
    image: "/images/events/kitty-party-table.png",
    fallback: "/images/events/photos/photo_p13_6.jpeg",
    description:
      "Spacious group seating with platter spreads, refreshing mocktails, and festive hanging ceiling florals at Hidden Café.",
    badge: "Group Feast",
    span: "md:col-span-1",
  },
  {
    id: "kitty-party-memories",
    title: "Kitty Party & Ladies Gathering Squad",
    category: "kitty-party",
    categoryLabel: "Kitty Party",
    image: "/images/events/kitty-party-group.jpg",
    fallback: "/images/events/photos/photo_p12_1.jpeg",
    description:
      "Vibrant ladies group celebrations and memorable gatherings with customized food packages under our floral ceiling.",
    badge: "Real Celebration",
    span: "md:col-span-2",
  },

  // Kids Party
  {
    id: "kids-party-platters",
    title: "Kids Party Snack & Fun Feast",
    category: "kids-party",
    categoryLabel: "Kids Party",
    image: "/images/events/photos/photo_p14_1.jpeg",
    fallback: "/images/events/event-page-14.jpg",
    description:
      "Kids delight table with loaded cheese twisters, french fries, pizzas, pasta and tropical coolers.",
    badge: "Fun & Yummy",
  },
  {
    id: "kids-party-cheer",
    title: "Joyful Kids Celebration Squad",
    category: "kids-party",
    categoryLabel: "Kids Party",
    image: "/images/events/photos/photo_p14_4.jpeg",
    description: "Energetic birthday cheer with colorful balloon backdrops, games, and customized kids party meals.",
  },

  // Get-Together
  {
    id: "get-together-lush",
    title: "Lush Greenery Wall Get-Together",
    category: "get-together",
    categoryLabel: "Get-Together",
    image: "/images/events/photos/photo_p15_3.jpeg",
    fallback: "/images/events/event-page-15.jpg",
    description:
      "Vibrant botanical photo wall with neon light — the go-to selfie spot for reunions, farewells & college groups.",
    badge: "Squad Favorite",
    span: "md:col-span-2",
  },
  {
    id: "get-together-cozy",
    title: "Family & College Reunion Table",
    category: "get-together",
    categoryLabel: "Get-Together",
    image: "/images/events/photos/photo_p15_2.jpeg",
    description: "Comfortable cushioned booth for long conversations, laughter and endless cold coffee refills.",
  },
];

const CATEGORIES: { id: EventCategory; label: string; icon: string }[] = [
  { id: "all", label: "All Celebrations", icon: "✨" },
  { id: "couple", label: "Couple Party", icon: "🌹" },
  { id: "birthday", label: "Party Birthday", icon: "🎂" },
  { id: "baby-shower", label: "Baby Shower", icon: "🍼" },
  { id: "kitty-party", label: "Kitty Party", icon: "☕" },
  { id: "kids-party", label: "Kids Party", icon: "🎈" },
  { id: "get-together", label: "Get-Together", icon: "🌿" },
];

export default function EventsShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>("all");
  const [activeModalItem, setActiveModalItem] = useState<EventItem | null>(null);
  const [viewMode, setViewMode] = useState<"photos" | "brochure">("photos");
  const { toast } = useToast();

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return EVENT_ITEMS;
    return EVENT_ITEMS.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const handleBookSetup = (item: EventItem) => {
    const msg = `Hi Hidden Café! I loved this setup and want to book it 🎈\n• Event: ${item.title}\n• Category: ${item.categoryLabel}\nPlease let me know package details and date availability.`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
    toast({
      title: `${item.categoryLabel} Selected! 🎈`,
      description: `Opening WhatsApp to reserve "${item.title}". We will tailor the lights & décor for you!`,
      type: "party",
    });
  };

  const handleOrderHotline = () => {
    toast({
      title: "Calling Hidden Café Hotline 📞",
      description: `Connecting to ${PHONE_DISPLAY}. Open 10 AM to 10 PM.`,
      type: "coffee",
    });
  };

  return (
    <section id="celebrations" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-12 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full opacity-40 blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(194,160,90,0.22), rgba(114,47,55,0.18), transparent 70%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-1/3 h-96 w-96 rounded-full opacity-35 blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(227,154,69,0.15), transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header & Brochure Info Banner */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            kicker="04 · Events & Celebrations"
            title={
              <>
                Every Milestone, <em className="text-caramel">Celebrated in Style.</em>
              </>
            }
            hand="as featured in our official celebrations brochure"
          />

          <Reveal delay={150}>
            <div className="flex flex-wrap items-center gap-3">
              {/* View Toggle */}
              <div className="inline-flex rounded-full border border-caramel/30 bg-bean-900/90 p-1 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setViewMode("photos")}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-bold tracking-wide transition-all duration-300",
                    viewMode === "photos"
                      ? "bg-caramel text-bean-950 shadow-[0_2px_12px_rgba(194,160,90,0.4)]"
                      : "text-dune hover:text-latte"
                  )}
                >
                  ✨ Curated Gallery ({EVENT_ITEMS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("brochure")}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-bold tracking-wide transition-all duration-300",
                    viewMode === "brochure"
                      ? "bg-caramel text-bean-950 shadow-[0_2px_12px_rgba(194,160,90,0.4)]"
                      : "text-dune hover:text-latte"
                  )}
                >
                  📄 Brochure Pages (17)
                </button>
              </div>

              {/* Call Hotline CTA */}
              <a
                href={`tel:${PHONE_TEL}`}
                onClick={handleOrderHotline}
                className="inline-flex items-center gap-2 rounded-full border border-latte/15 bg-bean-900/80 px-4 py-2 text-xs font-bold tracking-wide text-latte transition-all duration-300 hover:border-caramel hover:text-caramel"
              >
                <PhoneIcon className="h-3.5 w-3.5 text-caramel" />
                <span>Call Hotline: {PHONE_DISPLAY}</span>
              </a>
            </div>
          </Reveal>
        </div>

        {/* Brochure Location & Brand Strip (from Page 1 of PDF) */}
        <Reveal delay={200} className="mt-8">
          <div className="relative overflow-hidden rounded-2xl border border-caramel/30 bg-gradient-to-r from-bean-900/90 via-bean-850/80 to-bean-900/90 p-4 sm:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.5)] backdrop-blur-md">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-caramel/40 bg-bean-950 shadow-[0_0_20px_rgba(194,160,90,0.2)]">
                  <span className="font-display text-2xl font-bold text-caramel">H</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-foam sm:text-xl">
                      HIDDEN CAFÉ & RESTRO
                    </h3>
                    <span className="rounded-full bg-caramel/20 px-2 py-0.5 text-[10px] font-bold tracking-widest text-caramel uppercase">
                      Official
                    </span>
                  </div>
                  <p className="font-hand text-sm text-caramel italic">
                    "It's all about a taste"
                  </p>
                  <p className="mt-1 text-xs text-dune">
                    📍 Plot no-09 Hidden Café near Kotak Mahindra Bank Adarsh Nagar RTO Road Jalgaon (M.S)
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi Hidden Café! I would like to inquire about event booking.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-caramel px-5 py-2.5 text-xs font-bold tracking-wider text-bean-950 uppercase shadow-[0_4px_18px_rgba(194,160,90,0.35)] transition-all duration-300 hover:bg-caramel/90 hover:scale-[1.02]"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Order / Book Event Now
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Featured Spotlight: Couple Party (with the user's uploaded image!) */}
        <Reveal delay={250} className="mt-8">
          <div className="relative overflow-hidden rounded-3xl border border-rosedeep/40 bg-gradient-to-br from-bean-900/90 via-bean-950/90 to-bean-900/90 p-6 sm:p-8 shadow-[0_20px_50px_rgba(114,47,55,0.25)]">
            {/* Glowing corner backdrop */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-35 blur-[70px]"
              style={{ background: "radial-gradient(circle, #ff6e8b, transparent 70%)" }}
            />

            <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1.3fr]">
              {/* Couple Party user image showcase */}
              <div className="relative group overflow-hidden rounded-2xl border border-caramel/40 shadow-2xl">
                <img
                  src="/images/couple-party-special.jpg"
                  alt="Couple Party romantic candlelight dinner setup at Hidden Café"
                  className="h-80 w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-96"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bean-950/90 via-transparent to-black/20" />
                <div className="absolute top-4 left-4 rounded-full border border-caramel/50 bg-bean-950/80 px-3 py-1 text-xs font-bold text-caramel backdrop-blur-md">
                  🌹 Couple Party Special
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="font-display text-lg font-bold text-foam sm:text-xl">
                    Romantic Candlelight Table
                  </p>
                  <p className="text-xs text-latte/80">
                    Red velvet drapery, fairy lights waterfall, rose petals & balloon pillars
                  </p>
                </div>
              </div>

              {/* Description & booking CTA */}
              <div className="flex flex-col justify-center">
                <span className="text-xs font-bold tracking-widest text-roseneon uppercase">
                  Private & Romantic Celebrations
                </span>
                <h3 className="mt-2 font-display text-2xl font-bold text-foam sm:text-3xl">
                  Couple Party • <em className="text-caramel font-serif">Made for Two</em>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-latte/85 sm:text-base">
                  Looking for the perfect anniversary surprise, birthday date, or proposal setting in Jalgaon?
                  Hidden Café sets up our signature private romantic corner with warm fairy lights, cascading red curtains,
                  fresh roses, and balloon towers — complete with customized mocktails and delicious food.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-foam sm:grid-cols-3">
                  <div className="flex items-center gap-2 rounded-lg border border-latte/10 bg-bean-850/60 p-2.5">
                    <span>🕯️</span> <span>Candlelight Setting</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-latte/10 bg-bean-850/60 p-2.5">
                    <span>🌹</span> <span>Rose Petal Decor</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-latte/10 bg-bean-850/60 p-2.5">
                    <span>✨</span> <span>Fairy Lights Curtain</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-latte/10 bg-bean-850/60 p-2.5">
                    <span>🎈</span> <span>Balloon Pillars</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-latte/10 bg-bean-850/60 p-2.5">
                    <span>🎵</span> <span>Romantic Music</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-latte/10 bg-bean-850/60 p-2.5">
                    <span>🍹</span> <span>Welcome Drinks</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      handleBookSetup({
                        id: "couple-special",
                        title: "Couple Party • Romantic Candlelight Dinner",
                        category: "couple",
                        categoryLabel: "Couple Party",
                        image: "/images/couple-party-special.jpg",
                        description: "Romantic candlelight dinner setup",
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-caramel to-amber-500 px-6 py-3 text-xs font-bold tracking-wider text-bean-950 uppercase shadow-[0_6px_22px_rgba(194,160,90,0.35)] transition-all duration-300 hover:scale-[1.03]"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    Book Couple Party Setup
                  </button>

                  <a
                    href="#parties"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-caramel transition-colors hover:text-foam"
                  >
                    View All Party Packages →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* View Mode: Photos or Brochure Pages */}
        {viewMode === "photos" ? (
          <>
            {/* Category Filter Tabs */}
            <div className="mt-12 flex items-center justify-start overflow-x-auto pb-3 scrollbar-none sm:justify-center">
              <div className="inline-flex items-center gap-1.5 rounded-2xl border border-latte/10 bg-bean-900/90 p-1.5 backdrop-blur-md">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  const count =
                    cat.id === "all"
                      ? EVENT_ITEMS.length
                      : EVENT_ITEMS.filter((i) => i.category === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all duration-300",
                        isActive
                          ? "bg-caramel text-bean-950 shadow-[0_4px_16px_rgba(194,160,90,0.3)] scale-[1.02]"
                          : "text-latte/75 hover:bg-bean-800 hover:text-latte"
                      )}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                      <span
                        className={cn(
                          "ml-1 rounded-full px-1.5 py-0.2 text-[10px]",
                          isActive ? "bg-bean-950/20 text-bean-950" : "bg-bean-800 text-dune"
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Event Photo Grid */}
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:auto-rows-[16rem]">
              {filteredItems.map((item, idx) => (
                <Reveal
                  key={item.id}
                  delay={(idx % 4) * 80}
                  className={cn("group relative min-h-[15rem]", item.span)}
                >
                  <div
                    onClick={() => setActiveModalItem(item)}
                    className="relative h-full w-full cursor-pointer overflow-hidden rounded-2xl border border-latte/12 bg-bean-900 shadow-lg transition-all duration-500 hover:border-caramel/60 hover:shadow-[0_12px_32px_rgba(194,160,90,0.22)] hover:-translate-y-1"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      onError={(e) => {
                        if (item.fallback) {
                          (e.target as HTMLImageElement).src = item.fallback;
                        }
                      }}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-bean-950/95 via-bean-950/40 to-transparent opacity-85 transition-opacity duration-300 group-hover:opacity-95" />

                    {/* Badge */}
                    {item.badge && (
                      <div className="absolute top-3 left-3 rounded-full border border-caramel/40 bg-bean-950/80 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-caramel uppercase backdrop-blur-md">
                        {item.badge}
                      </div>
                    )}

                    {/* Quick view button */}
                    <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-bean-900/80 text-foam opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105 backdrop-blur-md">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>

                    {/* Caption & category */}
                    <div className="absolute bottom-0 inset-x-0 p-4 transition-transform duration-300">
                      <span className="text-[10px] font-bold tracking-widest text-caramel uppercase">
                        {item.categoryLabel}
                      </span>
                      <h4 className="mt-1 font-display text-base font-bold text-foam line-clamp-1 group-hover:text-amber-200">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-xs text-latte/70 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="mt-3 flex items-center justify-between border-t border-latte/10 pt-2 text-[11px] font-bold text-caramel opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span>Click to view details & book</span>
                        <span>→</span>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </>
        ) : (
          /* View Mode: Original Brochure Pages Carousel/Grid */
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 17 }).map((_, i) => {
                const pageNum = i + 1;
                const pageLabels: Record<number, string> = {
                  1: "Brochure Cover • Events List",
                  2: "Party Birthday • Ring Arch",
                  3: "Party Birthday • Glow Setups",
                  4: "Party Birthday • Squad Celebration",
                  5: "Party Birthday • Pikachu Theme",
                  6: "Party Birthday • Fairy Drapes",
                  7: "Party Birthday • Night Lighting",
                  8: "Party Birthday • Flower & Foil Arch",
                  9: "Party Birthday • Golden Ring Decor",
                  10: "Party Birthday • Heart & Arch Setups",
                  11: "Baby Shower • Pastel Dream",
                  12: "Kitty Party • Grand Dine-in",
                  13: "Kitty Party • Food & Celebrations",
                  14: "Kids Party • Snack Feast",
                  15: "Get-Together • Greenery Wall",
                  16: "Couple Party • Romantic Dinner",
                  17: "Customer Delight • 5-Star Reviews",
                };

                return (
                  <div
                    key={pageNum}
                    onClick={() =>
                      setActiveModalItem({
                        id: `page-${pageNum}`,
                        title: `Brochure Page ${pageNum} · ${pageLabels[pageNum] || "Events"}`,
                        category: "all",
                        categoryLabel: "Brochure Page",
                        image: `/images/events/event-page-${pageNum}.jpg`,
                        description: `Official brochure page showing ${pageLabels[pageNum] || "decorations"} at Hidden Café.`,
                      })
                    }
                    className="group cursor-pointer overflow-hidden rounded-2xl border border-latte/12 bg-bean-900 shadow-md transition-all duration-300 hover:border-caramel/70 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="aspect-[3/4.2] w-full overflow-hidden bg-bean-950">
                      <img
                        src={`/images/events/event-page-${pageNum}.jpg`}
                        alt={`Brochure Page ${pageNum}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3 bg-bean-850 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-caramel uppercase">Page {pageNum}</span>
                        <p className="text-xs font-bold text-foam line-clamp-1">{pageLabels[pageNum]}</p>
                      </div>
                      <span className="text-xs text-caramel opacity-0 group-hover:opacity-100 transition-opacity">
                        Zoom ↗
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Page 17 Customer Strategy Banner */}
        <Reveal delay={200} className="mt-16">
          <div className="relative overflow-hidden rounded-3xl border border-caramel/30 bg-gradient-to-r from-bean-900/95 via-bean-850/95 to-bean-900/95 p-8 sm:p-12 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
            <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="flex items-center gap-1.5 text-amber-400">
                  {"★★★★★".split("").map((star, i) => (
                    <span key={i} className="text-lg">
                      {star}
                    </span>
                  ))}
                  <span className="ml-2 text-xs font-bold tracking-widest text-caramel uppercase">
                    From Our Official Brochure (Page 17)
                  </span>
                </div>

                <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-foam sm:text-3xl lg:text-4xl">
                  "A SATISFIED CUSTOMER IS THE BEST BUSINESS STRATEGY OF ALL"
                </h3>

                <blockquote className="mt-4 border-l-2 border-caramel/60 pl-4 text-sm leading-relaxed text-latte/85 sm:text-base italic">
                  "A good party can make you feel young again because parties are great for dancing, singing and generally
                  doing all the things that you would do when you're young. A lot of people will go to parties when they're young,
                  and so partying will always remind you of those younger days."
                </blockquote>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <a
                    href="#reviews"
                    className="inline-flex items-center gap-2 rounded-xl border border-caramel/40 bg-bean-950/80 px-5 py-2.5 text-xs font-bold tracking-wider text-caramel uppercase transition-colors hover:bg-caramel hover:text-bean-950"
                  >
                    Read Google Reviews
                  </a>
                  <a
                    href="#parties"
                    className="inline-flex items-center gap-2 text-xs font-bold text-latte/80 hover:text-caramel"
                  >
                    Plan Your Party Today →
                  </a>
                </div>
              </div>

              {/* Decorative graphic card */}
              <div className="relative flex items-center justify-center">
                <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-caramel/25 bg-bean-950/80 p-6 shadow-2xl backdrop-blur-md text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-caramel/40 bg-caramel/10 text-3xl shadow-inner">
                    ✨
                  </div>
                  <h4 className="mt-4 font-display text-lg font-bold text-foam">
                    100+ Celebrations Hosted
                  </h4>
                  <p className="mt-2 text-xs text-dune">
                    Birthdays, Baby Showers, Couple Dates, Kitty Parties & Gatherings in Jalgaon.
                  </p>
                  <div className="mt-5 rounded-xl border border-latte/10 bg-bean-900/60 p-3 text-xs text-latte/90">
                    <p className="font-bold text-caramel">Customized Setups Available</p>
                    <p className="mt-0.5 text-[11px] text-dune">We bring your vision to life with custom neon, flowers & balloons.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Lightbox / Image Detail Modal */}
      {activeModalItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[120] flex items-center justify-center bg-bean-950/85 p-4 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-caramel/40 bg-bean-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-latte/10 px-5 py-3.5 bg-bean-950/80">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-caramel uppercase">
                  {activeModalItem.categoryLabel}
                </span>
                <h3 className="font-display text-base font-bold text-foam sm:text-lg">
                  {activeModalItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="rounded-lg p-1.5 text-dune transition-colors hover:bg-bean-800 hover:text-foam"
                aria-label="Close modal"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative flex-1 overflow-auto bg-black/40 flex items-center justify-center p-2 min-h-[18rem] max-h-[58vh]">
              <img
                src={activeModalItem.image}
                alt={activeModalItem.title}
                className="max-h-[55vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
              />
            </div>

            {/* Modal Footer & Actions */}
            <div className="border-t border-latte/10 bg-bean-950/90 p-5">
              <p className="text-sm text-latte/85 leading-relaxed">
                {activeModalItem.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-latte/10">
                <span className="text-xs text-dune">
                  📍 Jalgaon (Adarsh Nagar RTO Road)
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      handleBookSetup(activeModalItem);
                      setActiveModalItem(null);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-caramel px-5 py-2.5 text-xs font-bold tracking-wider text-bean-950 uppercase shadow-lg transition-all hover:bg-caramel/90"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    Book This Setup via WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModalItem(null)}
                    className="rounded-xl border border-latte/15 px-4 py-2.5 text-xs font-bold text-latte hover:bg-bean-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
