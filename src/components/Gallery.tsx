import { useState, useEffect, useCallback } from "react";
import { Reveal, SectionHeading, SparkIcon, WhatsAppIcon, PhoneIcon } from "./ui";
import { WHATSAPP, PHONE_TEL, PHONE_DISPLAY } from "../data";
import { cn } from "../utils/cn";

export interface GalleryPhoto {
  id: string;
  title: string;
  category: "seating" | "ambience";
  categoryLabel: string;
  src: string;
  description: string;
  badge: string;
  aspect: "landscape" | "portrait" | "wide";
  colSpan: string;
}

const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: "cafe-hall",
    title: "Main Dining Hall & Ambient Lighting",
    category: "seating",
    categoryLabel: "Cafe Seating",
    src: "/images/gallery/cafe-seating-hall.jpg",
    description:
      "A wide look into our dining hall featuring warm hanging pendant lamps, sleek black tables & chairs, and geometric wall decor.",
    badge: "Main Dining Hall",
    aspect: "landscape",
    colSpan: "lg:col-span-8 sm:col-span-2",
  },
  {
    id: "cafe-entrance-floral",
    title: "Floral Ceiling & Entrance Walkway",
    category: "ambience",
    categoryLabel: "Cafe Ambience",
    src: "/images/gallery/cafe-entrance-floral-view.jpg",
    description:
      "Warm and inviting view from the cafe entrance framed with hanging floral wisteria, welcome easel board, and wooden pallet benches.",
    badge: "Entrance & Floral Decor",
    aspect: "portrait",
    colSpan: "lg:col-span-4 sm:col-span-1",
  },
  {
    id: "cafe-hall-counter",
    title: "Cafe Hallway & Reception Counter",
    category: "ambience",
    categoryLabel: "Interior & Hall",
    src: "/images/gallery/cafe-hall-counter-view.jpg",
    description:
      "Spacious dining hallway showing our reception desk, ice cream bar, modern lighting trellis, and long pallet seating.",
    badge: "Interior Hallway",
    aspect: "landscape",
    colSpan: "lg:col-span-7 sm:col-span-2",
  },
  {
    id: "cafe-menu-view",
    title: "Cafe Dining View with Menu Card",
    category: "seating",
    categoryLabel: "Dining Space",
    src: "/images/gallery/cafe-seating-menu.jpg",
    description:
      "First-person dining view presenting our offerings, warm lighting fixtures, and welcoming cafe ambiance.",
    badge: "Dining Ambience",
    aspect: "portrait",
    colSpan: "lg:col-span-5 sm:col-span-1",
  },
  {
    id: "pallet-lounge",
    title: "Signature Pallet Bench Lounge",
    category: "seating",
    categoryLabel: "Group Lounge",
    src: "/images/gallery/cafe-seating-pallet-lounge.jpg",
    description:
      "Custom wooden pallet bench seating with plush charcoal cushions, comfortable throw pillows, and modern overhead grid lighting.",
    badge: "Pallet Lounge",
    aspect: "portrait",
    colSpan: "lg:col-span-5 sm:col-span-1",
  },
  {
    id: "cafe-franchise-dining-crowd",
    title: "Full House Dining & All-India Franchise",
    category: "ambience",
    categoryLabel: "Cafe Atmosphere",
    src: "/images/gallery/cafe-franchise-dining-crowd.jpg",
    description:
      "A bustling evening at Hidden Café with happy diners, groups, and families, featuring our official franchise invitation across India.",
    badge: "Full House & Franchise",
    aspect: "wide",
    colSpan: "lg:col-span-7 sm:col-span-2",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Photos", count: 6 },
  { id: "seating", label: "Seating & Dining", count: 3 },
  { id: "ambience", label: "Interior & Ambiance", count: 3 },
] as const;

export default function Gallery() {
  const [activeTab, setActiveTab] = useState<"all" | "seating" | "ambience">("all");
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  const filteredPhotos =
    activeTab === "all"
      ? GALLERY_PHOTOS
      : GALLERY_PHOTOS.filter((p) => p.category === activeTab);

  // Keyboard navigation for lightbox modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!selectedPhoto) return;
      if (e.key === "Escape") {
        setSelectedPhoto(null);
      } else if (e.key === "ArrowRight") {
        const currentIndex = filteredPhotos.findIndex((p) => p.id === selectedPhoto.id);
        const nextIndex = (currentIndex + 1) % filteredPhotos.length;
        setSelectedPhoto(filteredPhotos[nextIndex]);
      } else if (e.key === "ArrowLeft") {
        const currentIndex = filteredPhotos.findIndex((p) => p.id === selectedPhoto.id);
        const prevIndex = (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
        setSelectedPhoto(filteredPhotos[prevIndex]);
      }
    },
    [selectedPhoto, filteredPhotos]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleWhatsAppInquiry = (photo: GalleryPhoto) => {
    const text = `Hi Hidden Café! I saw this photo from "Our Cafe Gallery" and wanted to inquire about table seating / visiting:
• Photo: ${photo.title} (${photo.categoryLabel})
Please share cafe timings and table booking details.`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="gallery" className="relative scroll-mt-24 overflow-hidden border-t border-latte/10 bg-bean-950/60 py-24 sm:py-32">
      {/* Background ambient lighting accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 right-0 h-96 w-96 rounded-full opacity-25 blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(194,160,90,0.2), transparent 70%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1/4 left-0 h-96 w-96 rounded-full opacity-20 blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(194,160,90,0.15), transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            kicker="Our Cafe Gallery"
            title={
              <>
                Original Photos,{" "}
                <em className="text-caramel">Real Space.</em>
              </>
            }
            hand="actual photos of our cafe seating, interior & dining ambience"
          />

          {/* Filter Pills */}
          <Reveal delay={100}>
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-latte/12 bg-bean-900/80 p-1.5 backdrop-blur-md">
              {CATEGORIES.map((cat) => {
                const isActive = activeTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveTab(cat.id)}
                    className={cn(
                      "rounded-xl px-4 py-2 text-xs font-bold tracking-wide transition-all duration-300",
                      isActive
                        ? "bg-caramel text-bean-950 shadow-[0_2px_12px_rgba(194,160,90,0.35)]"
                        : "text-dune hover:text-latte hover:bg-latte/5"
                    )}
                  >
                    {cat.label} ({cat.count})
                  </button>
                );
              })}
            </div>
          </Reveal>
        </div>

        {/* Gallery Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12">
          {filteredPhotos.map((photo, index) => {
            return (
              <Reveal
                key={photo.id}
                delay={index * 60}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-latte/12 bg-bean-900/60 transition-all duration-300 hover:border-caramel/50 hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)]",
                  photo.colSpan
                )}
              >
                <div
                  className="relative flex flex-col h-full cursor-pointer overflow-hidden"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  {/* Photo Container */}
                  <div
                    className={cn(
                      "relative w-full overflow-hidden bg-bean-950 flex items-center justify-center",
                      photo.aspect === "landscape"
                        ? "aspect-[16/10] sm:aspect-[16/9]"
                        : photo.aspect === "portrait"
                        ? "aspect-[3/4] max-h-[520px]"
                        : "aspect-[16/11] sm:aspect-[16/9] lg:aspect-[16/9]"
                    )}
                  >
                    <img
                      src={photo.src}
                      alt={photo.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Subtle vignette gradient */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bean-950 via-bean-950/25 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10 pointer-events-none">
                      <span className="rounded-full border border-caramel/40 bg-bean-950/85 px-3 py-1 text-[11px] font-bold tracking-wider text-caramel uppercase backdrop-blur-md shadow-md">
                        {photo.badge}
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bean-950/80 text-latte border border-latte/15 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <SparkIcon className="h-4 w-4 text-caramel" />
                      </span>
                    </div>

                    {/* Bottom Caption Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-5 z-10">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-caramel">
                        {photo.categoryLabel}
                      </p>
                      <h3 className="font-display mt-1 text-lg font-semibold text-foam group-hover:text-caramel transition-colors">
                        {photo.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-latte/75 leading-relaxed">
                        {photo.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Quick Action Bar */}
                  <div className="flex items-center justify-between border-t border-latte/10 bg-bean-950/80 px-5 py-3 text-xs">
                    <span className="text-[11px] text-dune flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-caramel" />
                      Click to expand photo
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWhatsAppInquiry(photo);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-caramel hover:text-foam transition-colors"
                    >
                      <WhatsAppIcon className="h-3.5 w-3.5" />
                      Inquire
                    </button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Gallery Summary Callout */}
        <Reveal delay={180}>
          <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-2xl border border-latte/12 bg-gradient-to-r from-bean-900/90 via-bean-900/60 to-bean-950/90 p-6 sm:flex-row sm:p-8">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-caramel/30 bg-caramel/10 text-caramel shadow-md">
                <SparkIcon className="h-6 w-6" />
              </span>
              <div>
                <h4 className="font-display text-base font-semibold text-foam sm:text-lg">
                  Planning a visit, meetup, or group gathering?
                </h4>
                <p className="text-xs text-latte/75 sm:text-sm">
                  Enjoy our cozy seating, warm ambient lighting, and delicious food & drinks at Adarsh Nagar RTO Road, Jalgaon.
                </p>
              </div>
            </div>

            <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
              <a
                href={`tel:${PHONE_TEL}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-latte/20 bg-bean-850 px-5 py-2.5 text-xs font-bold tracking-wider text-latte uppercase transition-colors hover:border-caramel hover:text-caramel sm:w-auto"
              >
                <PhoneIcon className="h-4 w-4" />
                Call {PHONE_DISPLAY}
              </a>
              <button
                type="button"
                onClick={() => {
                  const text = `Hi Hidden Café! I would like to reserve a table / visit your cafe. Please let me know table availability.`;
                  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-caramel px-5 py-2.5 text-xs font-bold tracking-wider text-bean-950 uppercase shadow-lg transition-all hover:bg-caramel/90 sm:w-auto"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Reserve via WhatsApp
              </button>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Lightbox / Fullscreen Modal */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedPhoto.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-bean-950/95 p-4 sm:p-6 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative flex flex-col max-h-[95vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-latte/20 bg-bean-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-latte/12 bg-bean-950/90 px-5 py-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-caramel">
                  {selectedPhoto.categoryLabel} • {selectedPhoto.badge}
                </span>
                <h3 className="font-display text-base font-semibold text-foam sm:text-lg">
                  {selectedPhoto.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-latte/15 text-latte hover:border-caramel hover:text-caramel transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Image Display */}
            <div className="relative flex flex-1 items-center justify-center bg-bean-950 p-2 sm:p-4 overflow-hidden min-h-[300px] max-h-[70vh]">
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.title}
                className="max-h-[68vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
              />

              {/* Prev / Next controls */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const cur = filteredPhotos.findIndex((p) => p.id === selectedPhoto.id);
                  const prev = (cur - 1 + filteredPhotos.length) % filteredPhotos.length;
                  setSelectedPhoto(filteredPhotos[prev]);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-latte/20 bg-bean-950/80 text-latte hover:bg-caramel hover:text-bean-950 transition-all backdrop-blur-md"
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const cur = filteredPhotos.findIndex((p) => p.id === selectedPhoto.id);
                  const next = (cur + 1) % filteredPhotos.length;
                  setSelectedPhoto(filteredPhotos[next]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-latte/20 bg-bean-950/80 text-latte hover:bg-caramel hover:text-bean-950 transition-all backdrop-blur-md"
                aria-label="Next photo"
              >
                ›
              </button>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-latte/12 bg-bean-950/90 px-5 py-4">
              <p className="text-xs text-latte/85 sm:text-sm leading-relaxed">
                {selectedPhoto.description}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-latte/10">
                <span className="text-xs text-dune">
                  📍 Hidden Café & Restro • Adarsh Nagar RTO Road, Jalgaon
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleWhatsAppInquiry(selectedPhoto)}
                    className="inline-flex items-center gap-2 rounded-xl bg-caramel px-4 py-2 text-xs font-bold tracking-wider text-bean-950 uppercase shadow-md transition-all hover:bg-caramel/90"
                  >
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                    Inquire via WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(null)}
                    className="rounded-xl border border-latte/15 px-3 py-2 text-xs font-bold text-latte hover:bg-bean-800 transition-colors"
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
