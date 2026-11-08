type AmbientGlowProps = {
  className?: string;
  variant?: "primary" | "accent" | "mixed";
};

export default function AmbientGlow({ className = "", variant = "mixed" }: AmbientGlowProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`.trim()} aria-hidden="true">
      {(variant === "primary" || variant === "mixed") && (
        <div className="anim-aurora absolute -left-24 top-[-18%] h-[380px] w-[380px] rounded-full bg-primary-200/35 blur-3xl" />
      )}
      {(variant === "accent" || variant === "mixed") && (
        <div className="anim-aurora-reverse absolute -right-24 top-[-10%] h-[320px] w-[320px] rounded-full bg-accent-200/30 blur-3xl" />
      )}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background-100/70 to-transparent" />
    </div>
  );
}