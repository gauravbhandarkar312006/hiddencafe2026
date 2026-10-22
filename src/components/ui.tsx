import { useState } from "react";
import type { CSSProperties, ReactNode, SVGProps } from "react";
import { cn } from "../utils/cn";
import { useInView } from "../hooks";

/* ================= Image with source priority chain ================= */

export function Img({
  sources,
  alt,
  className,
  style,
  loading = "lazy",
}: {
  sources: string[];
  alt: string;
  className?: string;
  style?: CSSProperties;
  loading?: "lazy" | "eager";
}) {
  const [i, setI] = useState(0);
  const src = sources[Math.min(i, sources.length - 1)];
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      onError={(e) => {
        if (i >= sources.length - 1) {
          // final source missing — keep the frame, hide the broken glyph
          e.currentTarget.style.visibility = "hidden";
        } else {
          setI((v) => Math.min(v + 1, sources.length - 1));
        }
      }}
    />
  );
}

/* ================= Reveal ================= */

type RevealProps = {
  children: ReactNode;
  delay?: number;
  variant?: "up" | "left" | "right" | "mask";
  className?: string;
};

export function Reveal({ children, delay = 0, variant = "up", className }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      data-reveal={variant}
      className={cn(inView && "is-in", className)}
      style={{ "--rd": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

/* ================= Section heading ================= */

export function SectionHeading({
  kicker,
  title,
  hand,
  className,
}: {
  kicker: string;
  title: ReactNode;
  hand?: string;
  className?: string;
}) {
  return (
    <Reveal className={cn("relative", className)}>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.32em] text-caramel">
          <SparkIcon className="h-3.5 w-3.5" />
          {kicker}
        </span>
        <span className="h-px flex-1 bg-gradient-to-r from-caramel/40 to-transparent" />
      </div>
      <h2 className="font-display mt-5 text-[clamp(2.1rem,4.6vw,3.6rem)] leading-[1.02] font-semibold text-foam">
        {title}
      </h2>
      {hand && (
        <p className="font-hand mt-3 inline-block text-base text-roseneon italic sm:text-lg">{hand}</p>
      )}
    </Reveal>
  );
}

/* ================= Ticker ================= */

export function Ticker({
  items,
  speed = 44,
  className,
  accent = "caramel",
}: {
  items: string[];
  speed?: number;
  className?: string;
  accent?: "caramel" | "rose";
}) {
  const row = (ariaHidden: boolean) => (
    <div aria-hidden={ariaHidden} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="font-display px-5 text-lg font-medium tracking-wide text-latte/85 italic sm:px-7 sm:text-xl">
            {item}
          </span>
          <SparkIcon
            className={cn("h-4 w-4 shrink-0", accent === "rose" ? "text-roseneon" : "text-caramel")}
          />
        </span>
      ))}
    </div>
  );
  return (
    <div className={cn("ticker overflow-hidden", className)}>
      <div
        className="ticker-track flex w-max items-center"
        style={{ "--speed": `${speed}s` } as CSSProperties}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

/* ================= Stars & veg mark ================= */

export function Stars({ n, className }: { n: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${n} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <StarIcon
          key={i}
          className={cn("h-3.5 w-3.5", i < n ? "text-caramel" : "text-bean-600")}
          filled={i < n}
        />
      ))}
    </span>
  );
}

export function VegMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[3px] border-[1.5px] border-pista",
        className
      )}
      title="Pure veg"
    >
      <span className="h-[6px] w-[6px] rounded-full bg-pista" />
    </span>
  );
}

/* ================= Icons (hand-drawn inline SVG) ================= */

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

export function SparkIcon({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...rest}>
      <path d="M12 2v20M3.5 7l17 10M20.5 7l-17 10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function StarIcon({ className, filled = true, ...rest }: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      {...rest}
    >
      <path d="M12 2.6l2.8 6 6.4.8-4.7 4.4 1.2 6.4L12 17l-5.7 3.2 1.2-6.4L2.8 9.4l6.4-.8L12 2.6z" strokeLinejoin="round" />
    </svg>
  );
}

export function PinIcon({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" {...rest}>
      <path d="M12 21.5S5 15.2 5 10a7 7 0 1 1 14 0c0 5.2-7 11.5-7 11.5z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export function ClockIcon({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" {...rest}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.4 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PhoneIcon({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" {...rest}>
      <path
        d="M5.5 3.5h3l1.7 4.3-2 1.6a12.5 12.5 0 0 0 6.4 6.4l1.6-2 4.3 1.7v3c0 .9-.7 1.6-1.6 1.6C10.6 20.1 3.9 13.4 3.9 5.1c0-.9.7-1.6 1.6-1.6z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WhatsAppIcon({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" {...rest}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function LeafIcon({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" {...rest}>
      <path d="M4.5 19.5C4.5 10 11 4.5 20 4.5c0 9.5-6 15-15.5 15z" strokeLinejoin="round" />
      <path d="M4.5 19.5C8 15 12 11.5 16.5 9" strokeLinecap="round" />
    </svg>
  );
}

export function FlameIcon({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" {...rest}>
      <path
        d="M12 2.5s1.2 3.2-1.5 6C8 11 6 12.7 6 15.5a6 6 0 0 0 12 0c0-2.4-1.2-4.2-2.5-5.7-.5 1-1.2 1.7-2 2 .5-2.8-.3-6.8-1.5-9.3z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CakeIcon({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.7" {...rest}>
      <path d="M4 20.5h16M5 20.5v-7c0-1 .8-1.8 1.8-1.8h10.4c1 0 1.8.8 1.8 1.8v7M4.5 16.2c1.5 1.2 3 1.2 4.5 0s3-1.2 4.5 0 3 1.2 4.5 0 1.5-.6 1.5-.6M12 11.7V8.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 5.5c-.8-1-.8-2 0-3 .8 1 .8 2 0 3z" strokeLinejoin="round" />
    </svg>
  );
}

export function BalloonIcon({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.7" {...rest}>
      <path d="M12 2.5a5.5 6.5 0 0 1 5.5 6.5c0 3.6-2.5 6.5-5.5 6.5S6.5 12.6 6.5 9A5.5 6.5 0 0 1 12 2.5z" />
      <path d="M12 15.5l-.8 1.5h1.6l-.8-1.5zM12 17c0 2 1.5 2.2 1.5 4.5" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowIcon({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" {...rest}>
      <path d="M7 17L17 7M17 7H9M17 7v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BeanIcon({ className, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" {...rest}>
      <path d="M7.2 3.6c4.4-2.3 9.6.2 11.2 5 1.7 5-1 10.6-5.6 12.4-4.6 1.9-9.7-.8-10.6-5.7-.9-4.6 1.6-9.9 5-11.7z" strokeLinejoin="round" />
      <path d="M8.5 4.5c3.4 2.7 5.3 5.3 6 8.2.7 2.8.4 5.6-.8 8.4" strokeLinecap="round" />
    </svg>
  );
}

export function SteamCup({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path className="steam-puff" d="M24 26c-2-3 2-4 0-8" opacity="0.7" />
        <path className="steam-puff" style={{ animationDelay: "0.9s" }} d="M32 26c-2-3 2-4 0-8" opacity="0.7" />
        <path className="steam-puff" style={{ animationDelay: "1.7s" }} d="M40 26c-2-3 2-4 0-8" opacity="0.7" />
      </g>
      <path
        d="M14 34h32v8a12 12 0 0 1-12 12h-8a12 12 0 0 1-12-12v-8z"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M46 36h4a6 6 0 0 1 0 12h-5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M18 58h24" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}
