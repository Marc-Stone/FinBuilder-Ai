import { useEffect, useState } from "react";
import { useInView } from "@/hooks/useInView";

type AnimatedCounterProps = {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  format?: (numeric: number) => string;
  className?: string;
  delay?: number;
};

function defaultFormat(numeric: number, decimals: number) {
  return numeric.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Affiche toujours la valeur finale dès le premier rendu : le chiffre exact ne
 * dépend ni de JavaScript ni d'un défilement. L'animation n'est qu'un bonus
 * visuel, désactivée si l'utilisateur préfère réduire les animations.
 */
export default function AnimatedCounter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  format,
  className = "",
}: AnimatedCounterProps) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.4 });
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (!inView) return undefined;
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    setPlay(true);
    return undefined;
  }, [inView]);

  const text = format ? format(value) : defaultFormat(value, decimals);

  return (
    <span ref={ref} className={`${className} ${play ? "counter-rise" : ""}`.trim()}>
      {`${prefix}${text}${suffix}`}
    </span>
  );
}