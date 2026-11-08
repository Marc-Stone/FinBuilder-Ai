type FeatureVisualProps = {
  index: number;
};

const coins = [
  { left: 6, bottom: 0, delay: 0 },
  { left: 30, bottom: 6, delay: 0.6 },
  { left: 54, bottom: 0, delay: 1.2 },
  { left: 78, bottom: 8, delay: 1.8 },
];

const progressBars = [
  { height: 34, delay: 0.1 },
  { height: 58, delay: 0.24 },
  { height: 46, delay: 0.38 },
  { height: 74, delay: 0.52 },
];

const simBars = [
  { height: 26, delay: 0.1 },
  { height: 46, delay: 0.22 },
  { height: 38, delay: 0.34 },
  { height: 68, delay: 0.46 },
  { height: 54, delay: 0.58 },
];

const lineItems = [
  { width: 78, delay: 0 },
  { width: 56, delay: 0.3 },
  { width: 66, delay: 0.6 },
];

const profileDots = [
  { left: 16, top: 26 },
  { left: 36, top: 14 },
  { left: 58, top: 24 },
  { left: 76, top: 12 },
  { left: 26, top: 56 },
  { left: 62, top: 58 },
];

export default function FeatureVisual({ index }: FeatureVisualProps) {
  const shell =
    "pointer-events-none absolute bottom-3 right-3 h-20 w-24 opacity-45 transition-opacity duration-500 group-hover:opacity-100 md:h-24 md:w-28";

  // 0 — Assistant IA : réseau de points reliés
  if (index === 0) {
    return (
      <div className={shell} aria-hidden="true">
        <span className="fx-node absolute right-3 top-2 h-2.5 w-2.5 rounded-full bg-primary-500" />
        <span className="fx-node absolute right-14 top-8 h-2 w-2 rounded-full bg-accent-500" style={{ animationDelay: "0.6s" }} />
        <span className="fx-node absolute right-6 top-14 h-2.5 w-2.5 rounded-full bg-primary-400" style={{ animationDelay: "1.2s" }} />
        <span className="absolute right-4 top-3 h-px w-12 origin-left rotate-[26deg] bg-primary-300/80" />
        <span className="absolute right-6 top-12 h-px w-10 origin-left -rotate-[32deg] bg-accent-300/80" />
        <span className="absolute right-3 top-8 h-px w-8 rotate-[8deg] bg-secondary-300/80" />
      </div>
    );
  }

  // 1 — Budget intelligent : anneaux concentriques
  if (index === 1) {
    return (
      <div className={shell} aria-hidden="true">
        <span className="fx-ring absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary-400/70" />
        <span
          className="fx-ring absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-400/70"
          style={{ animationDelay: "1.1s" }}
        />
        <span
          className="fx-ring absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-secondary-400/70"
          style={{ animationDelay: "2.2s" }}
        />
        <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500" />
      </div>
    );
  }

  // 2 — Objectifs : barres de progression
  if (index === 2) {
    return (
      <div className={`${shell} flex items-end gap-1.5`} aria-hidden="true">
        {progressBars.map((bar) => (
          <span
            key={bar.height}
            className="fx-bar w-2.5 rounded-t-sm bg-primary-400/70"
            style={{ height: `${bar.height}%`, animationDelay: `${bar.delay}s` }}
          />
        ))}
        <span className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-accent-100 text-accent-700">
          <i className="ri-flag-2-line text-xs" />
        </span>
      </div>
    );
  }

  // 3 — Projets : blocs empilés
  if (index === 3) {
    return (
      <div className={`${shell} space-y-1.5`} aria-hidden="true">
        {[100, 76, 56].map((width, row) => (
          <span
            key={width}
            className={`fx-sweep block h-4 overflow-hidden rounded-sm ${
              row === 0 ? "bg-primary-100" : row === 1 ? "bg-accent-100" : "bg-secondary-100"
            }`}
            style={{ width: `${width}%`, animationDelay: `${row * 0.4}s` }}
          >
            <span
              className={`block h-full w-1/2 ${
                row === 0 ? "bg-primary-300/70" : row === 1 ? "bg-accent-300/70" : "bg-secondary-300/70"
              }`}
            />
          </span>
        ))}
      </div>
    );
  }

  // 4 — Profil financier : points de situations
  if (index === 4) {
    return (
      <div className={shell} aria-hidden="true">
        {profileDots.map((dot, position) => (
          <span
            key={`${dot.left}-${dot.top}`}
            className={`fx-node absolute h-2.5 w-2.5 rounded-full ${
              position % 3 === 0 ? "bg-accent-500" : position % 3 === 1 ? "bg-primary-500" : "bg-secondary-500"
            }`}
            style={{ left: `${dot.left}%`, top: `${dot.top}%`, animationDelay: `${position * 0.32}s` }}
          />
        ))}
        <span className="absolute bottom-0 left-0 h-px w-full bg-background-300" />
      </div>
    );
  }

  // 5 — Simulations : barres ascendantes
  if (index === 5) {
    return (
      <div className={`${shell} flex items-end gap-1.5`} aria-hidden="true">
        {simBars.map((bar) => (
          <span
            key={bar.height}
            className="fx-bar w-2.5 rounded-t-sm bg-primary-400/70"
            style={{ height: `${bar.height}%`, animationDelay: `${bar.delay}s` }}
          />
        ))}
      </div>
    );
  }

  // 6 — Conseiller logement
  if (index === 6) {
    return (
      <div className={shell} aria-hidden="true">
        <span className="fx-ring absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary-400/60" />
        <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md bg-primary-100/80 text-primary-600">
          <i className="ri-home-4-line text-lg" />
        </span>
      </div>
    );
  }

  // 7 — Éducation financière : pièces qui tombent
  if (index === 7) {
    return (
      <div className={shell} aria-hidden="true">
        <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md bg-accent-100/80 text-accent-700">
          <i className="ri-book-open-line text-lg" />
        </span>
        {coins.slice(0, 3).map((coin) => (
          <span
            key={coin.left}
            className="fx-coin absolute h-2.5 w-2.5 rounded-full border border-secondary-400/80 bg-background-200/70"
            style={{ left: `${coin.left + 10}%`, bottom: coin.bottom, animationDelay: `${coin.delay}s` }}
          />
        ))}
        <span className="absolute bottom-0 left-0 h-1.5 w-full rounded-full bg-primary-200/60" />
      </div>
    );
  }

  // 8 — Rapports & exports
  return (
    <div className={`${shell} space-y-2 pt-4`} aria-hidden="true">
      {lineItems.map((line) => (
        <span
          key={line.width}
          className="relative block h-1.5 overflow-hidden rounded-full bg-background-200"
          style={{ width: `${line.width}%` }}
        >
          <span
            className="fx-sweep absolute inset-y-0 left-0 w-1/2 rounded-full bg-primary-400/70"
            style={{ animationDelay: `${line.delay}s` }}
          />
        </span>
      ))}
    </div>
  );
}