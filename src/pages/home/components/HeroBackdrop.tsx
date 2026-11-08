const particles = [
  { left: 6, top: 18, size: 3, delay: 0, duration: 9 },
  { left: 14, top: 62, size: 2, delay: 1.4, duration: 11 },
  { left: 22, top: 34, size: 4, delay: 2.6, duration: 10 },
  { left: 31, top: 76, size: 2, delay: 0.8, duration: 12 },
  { left: 38, top: 12, size: 3, delay: 3.2, duration: 9.5 },
  { left: 46, top: 52, size: 2, delay: 1.9, duration: 13 },
  { left: 54, top: 26, size: 4, delay: 0.4, duration: 10.5 },
  { left: 61, top: 68, size: 2, delay: 2.2, duration: 11.5 },
  { left: 68, top: 16, size: 3, delay: 3.8, duration: 9 },
  { left: 76, top: 44, size: 2, delay: 1.1, duration: 12.5 },
  { left: 83, top: 72, size: 3, delay: 2.9, duration: 10 },
  { left: 91, top: 30, size: 2, delay: 0.6, duration: 11 },
  { left: 96, top: 58, size: 4, delay: 3.5, duration: 9.5 },
  { left: 11, top: 88, size: 2, delay: 2.4, duration: 12 },
  { left: 72, top: 90, size: 3, delay: 1.7, duration: 10.5 },
];

const chartBars = [
  { height: 18, delay: 0.1 },
  { height: 32, delay: 0.2 },
  { height: 26, delay: 0.3 },
  { height: 44, delay: 0.4 },
  { height: 38, delay: 0.5 },
  { height: 56, delay: 0.6 },
  { height: 48, delay: 0.7 },
  { height: 68, delay: 0.8 },
  { height: 60, delay: 0.9 },
  { height: 82, delay: 1 },
  { height: 74, delay: 1.1 },
  { height: 96, delay: 1.2 },
];

export default function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-28 top-[-14%] h-[420px] w-[420px] rounded-full bg-primary-500/30 blur-[90px] anim-aurora" />
      <div className="absolute right-[-12%] top-[6%] h-[380px] w-[380px] rounded-full bg-accent-500/22 blur-[100px] anim-aurora-reverse" />
      <div className="absolute bottom-[-22%] left-1/3 h-[360px] w-[360px] rounded-full bg-primary-400/18 blur-[110px] anim-aurora" />

      <div className="hero-grid absolute inset-0 opacity-[0.55]" />

      <div className="absolute inset-x-0 bottom-0 flex h-40 items-end justify-center gap-2 px-6 opacity-[0.28] md:gap-3">
        {chartBars.map((bar) => (
          <span
            key={bar.height}
            className="hero-bar w-full max-w-[26px] rounded-t-sm bg-gradient-to-t from-transparent via-primary-300/60 to-background-50/80"
            style={{ height: `${bar.height}%`, animationDelay: `${bar.delay}s` }}
          />
        ))}
      </div>

      {particles.map((particle) => (
        <span
          key={`${particle.left}-${particle.top}`}
          className="spark-dot"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: particle.size,
            height: particle.size,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
}