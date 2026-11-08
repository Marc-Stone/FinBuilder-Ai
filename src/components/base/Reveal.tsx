import type { CSSProperties, ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

type Direction = "up" | "down" | "left" | "right" | "none";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: Direction;
  distance?: number;
  scale?: number;
  blur?: boolean;
  threshold?: number;
  style?: CSSProperties;
};

function offsetFor(direction: Direction, distance: number) {
  switch (direction) {
    case "down":
      return `translate3d(0, -${distance}px, 0)`;
    case "left":
      return `translate3d(${distance}px, 0, 0)`;
    case "right":
      return `translate3d(-${distance}px, 0, 0)`;
    case "none":
      return "translate3d(0, 0, 0)";
    default:
      return `translate3d(0, ${distance}px, 0)`;
  }
}

export default function Reveal({
  children,
  className = "",
  delay = 0,
  duration = 700,
  direction = "up",
  distance = 26,
  scale = 1,
  blur = false,
  threshold = 0.16,
  style,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold });

  const hiddenTransform = `${offsetFor(direction, distance)} scale(${scale})`;
  const transition = [
    `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
    `transform ${duration + 140}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
    blur ? `filter ${duration}ms ease-out ${delay}ms` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      ref={ref}
      className={`reveal-item ${className}`.trim()}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translate3d(0, 0, 0) scale(1)" : hiddenTransform,
        filter: blur ? (inView ? "blur(0px)" : "blur(8px)") : undefined,
        transition,
        ...style,
      }}
    >
      {children}
    </div>
  );
}