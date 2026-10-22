import { useState, useRef, useEffect } from "react";
import { Reveal, StarIcon, PinIcon, BeanIcon, SteamCup, ArrowIcon } from "./ui";

function VolumeMuteIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function VolumeUpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function RotatingStamp() {
  return (
    <div className="absolute -bottom-8 -left-6 z-20 hidden h-36 w-36 sm:block lg:-left-10 lg:h-40 lg:w-40 pointer-events-none">
      <svg viewBox="0 0 160 160" className="spin-slow absolute inset-0 h-full w-full">
        <defs>
          <path id="stamp-circle" d="M80 80 m -60 0 a 60 60 0 1 1 120 0 a 60 60 0 1 1 -120 0" />
        </defs>
        <circle cx="80" cy="80" r="78" fill="rgba(31,26,22,0.72)" stroke="rgba(194,160,90,0.4)" strokeWidth="1" />
        <text fontSize="11.5" letterSpacing="2.6" fill="rgba(232,220,198,0.8)" fontFamily="DM Sans, sans-serif" fontWeight="600">
          <textPath href="#stamp-circle">HIDDEN CAFÉ · ADARSH NAGAR · JALGAON · 10 TO 10 ·</textPath>
        </text>
      </svg>
      <BeanIcon className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-caramel" />
    </div>
  );
}

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, []);

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section id="top" className="relative flex min-h-svh flex-col justify-center overflow-hidden">
      {/* ================= Cinematic Video Background ================= */}
      <div className="absolute inset-0 overflow-hidden bg-bean-950">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster="/videos/owner-poster.png"
          className="h-full w-full object-cover object-[45%_25%] md:object-[55%_30%] lg:object-[60%_35%] filter brightness-[0.85] contrast-[1.04]"
          aria-label="Hidden Cafe owner cinematic cafe video"
        >
          <source src="/videos/owner-cinematic.mp4" type="video/mp4" />
          <source src="/owner-cinematic.mp4" type="video/mp4" />
        </video>

        {/* Ambient Warm Golden Glow from the cafe lamps */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen"
          style={{
            background:
              "radial-gradient(ellipse 65% 55% at 60% 30%, rgba(194, 160, 90, 0.35), transparent 75%)",
          }}
        />

        {/* Dark Vignette and Text Protection Gradients */}
        {/* Horizontal gradient: heavy on left for text legibility, transparent on right to showcase owner */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-bean-950/95 via-bean-950/80 to-transparent lg:via-bean-950/65 lg:to-bean-950/20" />
        {/* Top gradient for nav clarity */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-bean-950/90 via-bean-950/40 to-transparent" />
        {/* Bottom gradient to seamlessly blend into MenuSection */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-bean-950 via-bean-950/70 to-transparent" />
      </div>

      {/* Floating subtle cafe beans */}
      <BeanIcon className="bob absolute top-[22%] left-[4%] hidden h-7 w-7 text-caramel/25 lg:block pointer-events-none" />
      <BeanIcon
        className="bob absolute bottom-[24%] left-[42%] hidden h-5 w-5 text-roseneon/25 lg:block pointer-events-none"
        style={{ animationDelay: "1.1s" }}
      />
      <BeanIcon className="bob absolute top-[18%] right-[32%] hidden h-6 w-6 text-dune/25 xl:block pointer-events-none" />

      {/* ================= Hero Content ================= */}
      <div className="relative mx-auto grid w-full max-w-7xl flex-1 items-center gap-10 px-5 pt-32 pb-20 sm:px-8 lg:grid-cols-[1.18fr_0.82fr] lg:pt-36">
        {/* Left Column: Heading, Subtitle & CTAs */}
        <div className="relative z-10 max-w-2xl">
          <Reveal>
            <p className="flex items-center gap-3.5 text-[11px] font-bold tracking-[0.32em] text-caramel uppercase">
              <span className="h-px w-10 bg-caramel/80" />
              The Hideout Café · Adarsh Nagar, Jalgaon
            </p>
          </Reveal>

          <h1 className="mt-5">
            <Reveal variant="mask" delay={100}>
              <span className="mask-line">
                <span className="font-display block text-[clamp(2.7rem,6.2vw,5.2rem)] leading-[1.03] font-semibold tracking-[-0.01em] text-foam drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
                  More Than Coffee.
                </span>
              </span>
            </Reveal>
            <Reveal variant="mask" delay={240}>
              <span className="mask-line">
                <span className="font-display block text-[clamp(2.2rem,5vw,3.8rem)] leading-tight font-medium text-caramel italic drop-shadow-[0_4px_22px_rgba(194,160,90,0.45)]">
                  A Hidden Feeling.
                </span>
              </span>
            </Reveal>
          </h1>

          <Reveal delay={380}>
            <p className="mt-6 max-w-xl text-[16.5px] leading-relaxed text-latte/95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
              Discover the vibe. Experience <span className="font-semibold text-foam">Hidden Café</span> — slow
              coffee, crispy twisters, cheesy pastas, and birthdays that glow under warm amber lights.
              Jalgaon's favourite hideout off <span className="font-semibold text-latte">Adarsh Nagar Road</span>.
            </p>
          </Reveal>

          {/* Key Cafe Status Badges */}
          <Reveal delay={480}>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 rounded-full border border-caramel/30 bg-bean-950/80 px-4 py-2 text-[13px] font-semibold tracking-wide text-latte shadow-[0_4px_16px_rgba(0,0,0,0.5)] backdrop-blur-md">
                <span className="pulse-dot h-2 w-2 rounded-full bg-pista" />
                Open today · 10 AM – 10 PM
              </span>
              <span className="flex items-center gap-2 rounded-full border border-latte/15 bg-bean-950/80 px-4 py-2 text-[13px] font-semibold tracking-wide text-latte shadow-[0_4px_16px_rgba(0,0,0,0.5)] backdrop-blur-md">
                <StarIcon className="h-4 w-4 text-caramel" filled /> 4.4 · 360+ reviews
              </span>
              <span className="hidden items-center gap-2 rounded-full border border-latte/15 bg-bean-950/80 px-4 py-2 text-[13px] font-semibold tracking-wide text-latte shadow-[0_4px_16px_rgba(0,0,0,0.5)] backdrop-blur-md sm:flex">
                <PinIcon className="h-4 w-4 text-caramel" /> Adarsh Nagar Rd
              </span>
            </div>
          </Reveal>

          {/* Action Buttons */}
          <Reveal delay={580}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#menu"
                className="group inline-flex items-center gap-3 rounded-full bg-caramel px-7 py-4 text-sm font-bold tracking-[0.06em] text-bean-950 uppercase shadow-[0_4px_25px_rgba(194,160,90,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-foam hover:shadow-[0_8px_30px_rgba(246,240,228,0.45)]"
              >
                Explore Our Cafe
                <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
              <a
                href="#parties"
                className="neon-frame group inline-flex items-center gap-3 rounded-full bg-bean-950/70 px-7 py-4 text-sm font-bold tracking-[0.06em] text-roseneon uppercase backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-roseneon/15"
              >
                Book a party
                <span className="inline-block text-caramel transition-transform duration-300 group-hover:rotate-12">✦</span>
              </a>
            </div>
          </Reveal>

          <Reveal delay={700}>
            <p className="font-hand mt-9 text-xl text-dune italic">Not lost — just hidden.</p>
          </Reveal>
        </div>

        {/* Right Column: Owner Spotlight & Ambient Cinema Controls */}
        <div className="relative hidden h-[32rem] lg:flex lg:h-[36rem] flex-col justify-end items-end">
          <Reveal variant="right" delay={300} className="relative z-10 w-full max-w-sm">
            {/* Glassmorphic Atmosphere Card */}
            <div className="rounded-2xl border border-caramel/35 bg-bean-950/75 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all duration-300 hover:border-caramel/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-caramel opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-caramel" />
                  </span>
                  <span className="text-[11px] font-bold tracking-widest text-caramel uppercase">
                    Owner's Table · Live Cinema
                  </span>
                </div>
                <SteamCup className="h-5 w-5 text-caramel/80" />
              </div>

              <h3 className="font-display mt-3 text-xl font-medium text-foam">
                Crafted with Passion
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-dune">
                Welcome to Hidden Café. Where every cold coffee is brewed with craft, every party glows in style, and you're always invited to unwind.
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-latte/10 pt-3">
                <span className="font-hand text-sm text-latte/80 italic">The Hideout Vibe</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    type="button"
                    className="flex items-center gap-1.5 rounded-full border border-latte/20 bg-bean-900/80 px-2.5 py-1.5 text-xs font-semibold text-latte transition-all hover:border-caramel hover:text-caramel"
                    title={isPlaying ? "Pause video" : "Play video"}
                  >
                    <span>{isPlaying ? "❚❚" : "▶"}</span>
                  </button>
                  <button
                    onClick={toggleMute}
                    type="button"
                    className="flex items-center gap-1.5 rounded-full border border-caramel/40 bg-bean-900/90 px-3 py-1.5 text-xs font-semibold text-caramel transition-all hover:bg-caramel hover:text-bean-950 shadow-sm"
                    title={isMuted ? "Unmute video audio" : "Mute audio"}
                  >
                    {isMuted ? (
                      <>
                        <VolumeMuteIcon className="h-3.5 w-3.5" />
                        <span>Sound</span>
                      </>
                    ) : (
                      <>
                        <VolumeUpIcon className="h-3.5 w-3.5" />
                        <span>Mute</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Reveal>

          <RotatingStamp />
        </div>
      </div>

      {/* Mobile Floating Ambient Sound Button */}
      <div className="absolute bottom-5 right-5 z-20 flex items-center gap-2 lg:hidden">
        <button
          onClick={toggleMute}
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-caramel/40 bg-bean-950/85 px-3 py-1.5 text-xs font-semibold text-caramel shadow-[0_4px_16px_rgba(0,0,0,0.5)] backdrop-blur-md"
        >
          {isMuted ? (
            <>
              <VolumeMuteIcon className="h-3.5 w-3.5" />
              <span>Sound</span>
            </>
          ) : (
            <>
              <VolumeUpIcon className="h-3.5 w-3.5" />
              <span>Muted</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
