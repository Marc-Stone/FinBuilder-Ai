import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalPortalProps = {
  children: ReactNode;
};

/**
 * Renders overlay UI (modals, dialogs, toasts) directly under <body>.
 * This keeps them independent from animated/transformed page containers,
 * which otherwise become the containing block for `position: fixed`
 * elements and clip or shift them inside the scrollable content area.
 */
export default function ModalPortal({ children }: ModalPortalProps) {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    setHost(document.body);
  }, []);

  if (!host) return null;

  return createPortal(children, host);
}