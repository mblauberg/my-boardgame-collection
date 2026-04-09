import { useEffect, useRef, type ReactNode } from "react";

type GameDetailOverlayProps = {
  title: string;
  titleId: string;
  onRequestClose: () => void;
  isStandalone?: boolean;
  children: ReactNode;
};

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function GameDetailOverlay({
  title,
  titleId,
  onRequestClose,
  isStandalone = false,
  children,
}: GameDetailOverlayProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousActiveElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onRequestClose();
        return;
      }

      if (e.key !== "Tab") {
        return;
      }

      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
        FOCUSABLE_SELECTOR,
      );

      if (!focusableElements || focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (e.shiftKey && activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [onRequestClose]);

  return (
    <div
      className={[
        "fixed inset-0 z-50 flex px-4 py-4 sm:px-6 sm:py-6",
        isStandalone
          ? "items-start justify-center bg-surface"
          : "items-start justify-center bg-on-surface/10 backdrop-blur-md",
      ].join(" ")}
      onClick={onRequestClose}
      data-testid="overlay-backdrop"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative mt-4 flex h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[1.75rem] bg-surface shadow-[0_12px_40px_rgba(46,47,45,0.06)] sm:mt-8 sm:h-auto sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between bg-surface/85 px-6 py-5 backdrop-blur-xl sm:px-8 sm:py-6"
          data-testid="overlay-header"
        >
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
        <div className="overlay-scrollbar flex-1 overflow-y-auto px-6 pb-6 sm:px-8 sm:pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}
