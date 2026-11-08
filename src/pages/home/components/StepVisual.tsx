type StepVisualProps = {
  index: number;
};

const streams = [
  { width: 30, delay: 0 },
  { width: 44, delay: 0.5 },
  { width: 24, delay: 1 },
];

const nodes = [
  { left: 18, top: 22 },
  { left: 50, top: 10 },
  { left: 78, top: 26 },
  { left: 30, top: 56 },
  { left: 62, top: 62 },
  { left: 44, top: 38 },
];

const curveBars = [
  { height: 20, delay: 0.1 },
  { height: 34, delay: 0.25 },
  { height: 50, delay: 0.4 },
  { height: 72, delay: 0.55 },
  { height: 92, delay: 0.7 },
];

export default function StepVisual({ index }: StepVisualProps) {
  const shell = "pointer-events-none absolute bottom-4 right-4 h-20 w-24 opacity-60 md:h-24 md:w-28";

  if (index === 0) {
    return (
      <div className={shell} aria-hidden="true">
        <div className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border border-primary-200 bg-primary-50 text-primary-600">
          <i className="ri-wallet-3-line text-lg" />
        </div>
        {streams.map((stream, position) => (
          <span
            key={stream.width}
            className="fx-stream absolute right-11 h-1.5 rounded-full bg-primary-300"
            style={{
              width: `${stream.width}px`,
              top: `${18 + position * 22}px`,
              animationDelay: `${stream.delay}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className={shell} aria-hidden="true">
        <span className="absolute left-4 top-3 h-px w-14 rotate-[18deg] bg-primary-300/70" />
        <span className="absolute left-8 top-12 h-px w-12 -rotate-[26deg] bg-accent-300/70" />
        <span className="absolute left-3 top-8 h-px w-16 rotate-[62deg] bg-primary-200" />
        {nodes.map((node, position) => (
          <span
            key={`${node.left}-${node.top}`}
            className={`fx-node absolute h-2 w-2 rounded-full ${
              position % 3 === 0 ? "bg-accent-500" : "bg-primary-500"
            }`}
            style={{ left: `${node.left}%`, top: `${node.top}%`, animationDelay: `${position * 0.35}s` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`${shell} flex items-end gap-1.5`} aria-hidden="true">
      {curveBars.map((bar) => (
        <span
          key={bar.height}
          className="fx-bar w-2.5 rounded-t-sm bg-gradient-to-t from-primary-300 to-primary-500"
          style={{ height: `${bar.height}%`, animationDelay: `${bar.delay}s` }}
        />
      ))}
      <span className="absolute right-1 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-accent-100 text-accent-700">
        <i className="ri-flag-2-line text-xs" />
      </span>
    </div>
  );
}