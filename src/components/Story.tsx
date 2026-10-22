import { Reveal, SectionHeading, BeanIcon, LeafIcon, BalloonIcon, CakeIcon, ArrowIcon } from "./ui";
import { useCountUp, useInView } from "../hooks";
import { cn } from "../utils/cn";

function StatNumber({ target, decimals = 0, suffix = "" }: { target: number; decimals?: number; suffix?: string }) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.4);
  const value = useCountUp(target, inView, 1500, decimals);
  return (
    <span ref={ref} className="tabular-nums">
      {value}
      {suffix}
    </span>
  );
}

function Stat({
  value,
  label,
  sub,
  tone = "caramel",
  delay = 0,
}: {
  value: React.ReactNode;
  label: string;
  sub: string;
  tone?: "caramel" | "rose";
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <div
        className={cn(
          "group relative h-full overflow-hidden rounded-md border border-latte/10 bg-bean-900/70 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-latte/20",
          "hover:shadow-[0_18px_44px_rgba(0,0,0,0.45)]"
        )}
      >
        <span
          className={cn(
            "absolute -top-10 -right-10 h-24 w-24 rounded-full blur-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100",
            tone === "rose" ? "bg-roseneon/20" : "bg-caramel/20"
          )}
        />
        <p
          className={cn(
            "font-display text-[2.6rem] leading-none font-bold",
            tone === "rose" ? "text-roseneon" : "neon-amber"
          )}
        >
          {value}
        </p>
        <p className="mt-3 text-sm font-extrabold tracking-[0.14em] text-latte uppercase">{label}</p>
        <p className="mt-1 text-[13px] text-dune">{sub}</p>
      </div>
    </Reveal>
  );
}

const KNOW = [
  { icon: LeafIcon, text: "100% veg kitchen" },
  { icon: BeanIcon, text: "Jain options on request" },
  { icon: BalloonIcon, text: "Birthday décor in-house" },
  { icon: CakeIcon, text: "Cake-friendly tables" },
];

export default function Story() {
  return (
    <section id="hideout" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
        {/* sticky narrative */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            kicker="01 · The Hideout"
            title={
              <>
                Tucked off the main road,
                <br />
                <em className="text-caramel">on purpose.</em>
              </>
            }
            hand="look for the warm glow ↗"
          />
          <Reveal delay={150}>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-dune">
              Some cafés want to be seen from every corner. We wanted the opposite — a place you{" "}
              <span className="font-bold text-latte">stumble into and keep coming back to</span>. Low lights, warm
              brick, playlists that stay just under conversation level, and a kitchen that plates food like it's
              going on someone's story. Because it usually is.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-dune">
              And when it's your birthday? The owner personally strings up the balloons and switches on the{" "}
              <span className="text-roseneon">neon happy-birthday sign</span> — the one glowing in half of Jalgaon's
              reels. Walk in a guest, leave a regular.
            </p>
          </Reveal>
          <Reveal delay={360}>
            <a
              href="#reviews"
              className="group mt-8 inline-flex items-center gap-3 text-sm font-extrabold tracking-[0.14em] text-caramel uppercase transition-colors hover:text-foam"
            >
              Read what the regulars say
              <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </Reveal>
        </div>

        {/* scrolling column */}
        <div className="space-y-8">
          <Reveal variant="right">
            <figure className="group relative overflow-hidden rounded-md border border-latte/12">
              <div className="overflow-hidden">
                <img
                  src="/images/interior.jpg"
                  alt="Warm interior of Hidden Café with brick wall and string lights"
                  className="kenburns aspect-[16/11] w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bean-950/70 via-transparent to-transparent" />
              <figcaption className="font-hand absolute bottom-4 left-5 text-lg text-foam italic drop-shadow">
                the corner table, 6:47 pm
              </figcaption>
            </figure>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            <Stat
              delay={0}
              value={
                <>
                  <StatNumber target={4.4} decimals={1} />
                  <span className="text-caramel">★</span>
                </>
              }
              label="Google rating"
              sub="rated by the neighbourhood"
            />
            <Stat
              delay={100}
              tone="rose"
              value={<StatNumber target={360} suffix="+" />}
              label="Reviews"
              sub="and counting every week"
            />
            <Stat
              delay={200}
              tone="rose"
              value={<StatNumber target={45} suffix="+" />}
              label="Menu items"
              sub="brews, bakes & boards"
            />
            <Stat delay={300} value={<>₹200–400</>} label="Per person" sub="a full, happy table" />
          </div>

          <Reveal delay={120}>
            <ul className="flex flex-wrap gap-2.5">
              {KNOW.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-2 rounded-full border border-latte/12 bg-bean-900/60 px-4 py-2 text-[13px] font-bold text-latte/85 transition-all duration-300 hover:-translate-y-0.5 hover:border-caramel/45 hover:text-foam"
                >
                  <Icon className="h-4 w-4 text-caramel" />
                  {text}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
