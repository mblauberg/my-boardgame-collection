import { useEffect, useRef, type ReactNode } from "react";

type GameDetailOverlayProps = {
  title: string;
  titleId: string;
  onRequestClose: () => void;
  children: ReactNode;
};

export function GameDetailOverlay({
  title,
  titleId,
  onRequestClose,
  children,
}: GameDetailOverlayProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onRequestClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onRequestClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onRequestClose}
      data-testid="overlay-backdrop"
    >
      <div
        role="dialog"
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-surface rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-surface border-b border-outline-variant">
          <h2 id={titleId} className="text-2xl font-bold text-on-surface">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onRequestClose}
            aria-label="Close game details"
            className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
