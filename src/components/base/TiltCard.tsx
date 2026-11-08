import { useCallback, useRef } from "react";
import type { MouseEvent, ReactNode } from "react";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  max?: number;
};

export default function TiltCard({ children, className = "", max = 6 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(hover: none)").matches) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      el.style.setProperty("--tilt-x", `${(0.5 - py) * max}deg`);
      el.style.setProperty("--tilt-y", `${(px - 0.5) * max}deg`);
    },
    [max],
  );

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  }, []);

  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} className={`tilt-3d ${className}`.trim()}>
      {children}
    </div>
  );
}