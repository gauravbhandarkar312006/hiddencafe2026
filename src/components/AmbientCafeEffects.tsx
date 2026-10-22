import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  color: string;
}

export default function AmbientCafeEffects() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate gentle warm bokeh embers and fairy sparkles
    const colors = [
      "rgba(194, 160, 90, 0.4)",  // antique gold
      "rgba(255, 110, 139, 0.3)", // soft rose neon
      "rgba(227, 154, 69, 0.35)", // warm caramel
      "rgba(246, 240, 228, 0.25)", // ivory foam
    ];

    const generated: Particle[] = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: Math.random() * 96 + 2,
      y: Math.random() * 94 + 3,
      size: Math.random() * 6 + 3,
      opacity: Math.random() * 0.4 + 0.2,
      duration: Math.random() * 6 + 5,
      delay: Math.random() * 4,
      color: colors[i % colors.length],
    }));

    setParticles(generated);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-10 overflow-hidden"
    >
      {/* Warm ambient corner vignettes */}
      <div
        className="cafe-pulse absolute -top-40 -left-40 h-[38rem] w-[38rem] rounded-full opacity-40 blur-[120px]"
        style={{
          background: "radial-gradient(circle, rgba(194, 160, 90, 0.18), transparent 70%)",
          animationDuration: "9s",
        }}
      />
      <div
        className="cafe-pulse absolute top-1/2 -right-48 h-[44rem] w-[44rem] -translate-y-1/2 rounded-full opacity-35 blur-[130px]"
        style={{
          background: "radial-gradient(circle, rgba(114, 47, 55, 0.16), transparent 70%)",
          animationDuration: "12s",
        }}
      />
      <div
        className="cafe-pulse absolute -bottom-32 left-1/3 h-[36rem] w-[36rem] rounded-full opacity-30 blur-[110px]"
        style={{
          background: "radial-gradient(circle, rgba(227, 154, 69, 0.14), transparent 70%)",
          animationDuration: "10s",
        }}
      />

      {/* Floating fairy light orbs */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="fairy-light absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
