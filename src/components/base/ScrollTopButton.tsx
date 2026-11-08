import { useEffect, useState } from "react";

type ScrollTopButtonProps = {
  /** Hauteur de défilement à partir de laquelle le bouton apparaît (en pixels). */
  threshold?: number;
  label?: string;
};

export default function ScrollTopButton({
  threshold = 520,
  label = "Revenir en haut",
}: ScrollTopButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setVisible(window.scrollY > threshold);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [threshold]);

  const scrollToTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={label}
      title={label}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`group fixed bottom-5 right-4 z-40 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-background-200 bg-background-50/95 text-foreground-800 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-300 hover:bg-primary-500 hover:text-background-50 active:scale-95 md:bottom-7 md:right-7 md:h-12 md:w-12 ${
        visible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <i className="ri-arrow-up-line text-lg transition-transform duration-200 group-hover:-translate-y-0.5" />
    </button>
  );
}