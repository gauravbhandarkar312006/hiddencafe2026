import { useState } from "react";
import { cn } from "../utils/cn";

/**
 * Renders the genuine uploaded logo artwork untouched — no redraw, no crop,
 * no recolor. The image is constrained by height only, with width:auto and
 * object-fit:contain, so its original aspect ratio is always preserved and
 * the full badge + wordmark stay visible on desktop and mobile.
 *
 * The artwork is looked up at standard paths; drop the cropped original at
 * public/logo.png (or .jpg / .svg / .webp) and it is picked up automatically.
 * Until the file exists, a plain brand-name wordmark is shown instead.
 */
const SOURCES = ["/logo.png", "/logo.jpg", "/logo.svg", "/logo.webp"];

const IMG_SIZE = {
  nav: "h-10 w-auto sm:h-12",
  hero: "h-16 w-auto lg:h-20",
} as const;

const TEXT_SIZE = {
  nav: "text-[17px] sm:text-lg",
  hero: "text-2xl",
} as const;

export default function Logo({ size = "nav", className }: { size?: keyof typeof IMG_SIZE; className?: string }) {
  const [idx, setIdx] = useState(0);

  if (idx < SOURCES.length) {
    return (
      <img
        src={SOURCES[idx]}
        alt="Hidden Café & Restro"
        onError={() => setIdx((i) => i + 1)}
        className={cn("block select-none", IMG_SIZE[size], className)}
        style={{ objectFit: "contain", maxWidth: "220px" }}
        draggable={false}
      />
    );
  }

  return (
    <span className={cn("font-display leading-none whitespace-nowrap text-foam", TEXT_SIZE[size], className)}>
      <span className="font-semibold tracking-[0.01em]">Hidden Café</span>
      <span className="mx-1 text-caramel">&</span>
      <span className="font-semibold tracking-[0.01em]">Restro</span>
    </span>
  );
}
