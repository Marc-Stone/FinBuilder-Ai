import AnimatedCounter from "@/components/base/AnimatedCounter";

type ParsedStat = {
  prefix: string;
  value: number;
  decimals: number;
  suffix: string;
};

function splitStat(text: string): ParsedStat | null {
  const match = text.match(/^([^\d]*)(\d[\d\s.,]*\d|\d)(.*)$/);
  if (!match) return null;

  const [, prefix, rawNumber, suffix] = match;
  const normalized = rawNumber.replace(/\s/g, "").replace(",", ".");
  const numeric = Number(normalized);

  if (!Number.isFinite(numeric)) return null;

  const fraction = normalized.includes(".") ? (normalized.split(".")[1] ?? "").length : 0;

  return { prefix, value: numeric, decimals: fraction, suffix };
}

type AnimatedStatProps = {
  value: string;
  className?: string;
  delay?: number;
};

export default function AnimatedStat({ value, className = "", delay = 0 }: AnimatedStatProps) {
  const parsed = splitStat(value);

  if (!parsed) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span className={className}>
      {parsed.prefix}
      <AnimatedCounter value={parsed.value} decimals={parsed.decimals} delay={delay} />
      {parsed.suffix}
    </span>
  );
}