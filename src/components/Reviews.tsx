import type { CSSProperties } from "react";
import { REVIEWS, MAPS_QUERY, type Review } from "../data";
import { Reveal, SectionHeading, Stars, SparkIcon, ArrowIcon } from "./ui";
import { useInView } from "../hooks";

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="flex w-[19rem] shrink-0 flex-col rounded-md border border-latte/12 bg-bean-950/80 p-5 transition-colors duration-300 hover:border-caramel/40 sm:w-[22rem]">
      <div className="flex items-center justify-between">
        <Stars n={review.stars} />
        <span className="rounded-full border border-latte/12 px-2.5 py-0.5 text-[10px] font-extrabold tracking-[0.14em] text-dune uppercase">
          Google
        </span>
      </div>
      <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-latte/85">“{review.quote}”</p>
      <footer className="mt-4 flex items-center gap-3 border-t border-latte/8 pt-3.5">
        <span className="font-display flex h-9 w-9 items-center justify-center rounded-full bg-caramel/15 text-lg font-bold text-caramel italic">
          {review.name.charAt(0)}
        </span>
        <div>
          <p className="text-[13px] font-extrabold text-foam">{review.name}</p>
          <p className="font-hand text-sm leading-none text-roseneon italic">{review.detail}</p>
        </div>
      </footer>
    </article>
  );
}

function MarqueeRow({ reviews, reverse, speed }: { reviews: Review[]; reverse?: boolean; speed: number }) {
  const row = (hidden: boolean) => (
    <div aria-hidden={hidden} className="flex shrink-0 items-stretch gap-5 pr-5">
      {reviews.map((r, i) => (
        <ReviewCard key={i} review={r} />
      ))}
    </div>
  );
  return (
    <div className="ticker overflow-hidden">
      <div
        className="ticker-track flex w-max items-stretch py-1"
        style={
          {
            "--speed": `${speed}s`,
            animationDirection: reverse ? "reverse" : "normal",
          } as CSSProperties
        }
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

export default function Reviews() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const rowA = REVIEWS.slice(0, 4);
  const rowB = [...REVIEWS.slice(4), REVIEWS[1]];

  return (
    <section id="reviews" className="relative scroll-mt-24 overflow-hidden border-y border-latte/8 bg-bean-900/45 py-24 sm:py-32">
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[30rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
        style={{ background: "radial-gradient(ellipse, rgba(227,154,69,0.1), transparent 62%)" }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            kicker="05 · Word on the Street"
            title={
              <>
                Jalgaon keeps the secret.
                <br />
                <em className="text-caramel">Sort of.</em>
              </>
            }
            hand="the regulars talk, we listen"
          />
          <Reveal delay={150}>
            <div ref={ref} className="flex items-end gap-4">
              <p className="font-display text-[4.4rem] leading-none font-bold text-foam sm:text-[5.4rem]">
                4.4
                <span className="align-top text-2xl text-caramel">★</span>
              </p>
              <div className="pb-2.5">
                <Stars n={4} className="scale-125 origin-bottom-left" />
                <p className="mt-2 text-[12px] font-extrabold tracking-[0.18em] text-dune uppercase">
                  360+ Google reviews
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <div className={`mt-14 space-y-5 transition-opacity duration-1000 ${inView ? "opacity-100" : "opacity-0"}`}>
          <MarqueeRow reviews={rowA} speed={40} />
          <MarqueeRow reviews={rowB} reverse speed={48} />
        </div>

        <Reveal delay={100}>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-5">
            <p className="flex items-center gap-2 text-[13px] font-bold tracking-wide text-dune">
              <SparkIcon className="h-3.5 w-3.5 text-roseneon" />
              Every review above is from a real table that sat here.
            </p>
            <a
              href={MAPS_QUERY}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 rounded-full border border-caramel/50 px-6 py-3 text-[13px] font-extrabold tracking-[0.1em] text-caramel uppercase transition-all duration-300 hover:bg-caramel hover:text-bean-950"
            >
              Had your moment here? Tell Google
              <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
