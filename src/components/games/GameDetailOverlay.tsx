import { useEffect, useRef, type ReactNode } from "react";

type GameDetailOverlayProps = {
  title: string;
  titleId: string;
  onRequestClose: () => void;
  isStandalone?: boolean;
  children: ReactNode;
  onEdit?: () => void;
  isEditing?: boolean;
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
  onEdit,
  isEditing = false,
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
        "fixed inset-0 z-50 flex items-start md:items-center justify-center md:px-4 md:py-4 sm:px-6 sm:py-6",
        isStandalone
          ? "bg-surface"
          : "bg-on-surface/10 backdrop-blur-md",
      ].join(" ")}
      onClick={onRequestClose}
      data-testid="overlay-backdrop"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative flex h-full w-full flex-col overflow-hidden bg-surface shadow-ambient md:mt-4 md:h-auto md:max-h-[calc(100vh-2rem)] md:max-w-4xl md:rounded-[1.75rem] sm:mt-8 sm:h-auto sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="overlay-floating-header absolute top-0 left-0 right-0 z-10 flex items-center justify-between bg-transparent px-4 py-4 md:px-6 md:py-5 sm:px-8 sm:py-6"
          data-testid="overlay-header"
        >
          <h2 id={titleId} className="overlay-header-title-pill text-xl font-bold text-on-surface md:text-2xl">
            {title}
          </h2>
          <div className="flex flex-shrink-0 items-center gap-1 md:gap-2">
            {onEdit && !isEditing && (
                <button
                  onClick={onEdit}
                  aria-label="Edit game"
                  className="overlay-header-action-pill flex h-10 w-10 items-center justify-center rounded-full p-0 text-on-surface-variant transition-[color,transform] hover:scale-[1.03] hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-xl leading-none md:text-2xl">edit</span>
                </button>
              )}
              <button
                ref={closeButtonRef}
                onClick={onRequestClose}
                aria-label="Close game details"
                className="overlay-header-action-pill flex h-10 w-10 items-center justify-center rounded-full p-0 text-on-surface-variant transition-[color,transform] hover:scale-[1.03] hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-xl leading-none md:text-2xl">close</span>
              </button>
          </div>
        </div>
        <div className="overlay-scrollbar flex-1 overflow-y-auto px-4 pt-16 pb-4 md:px-6 md:pt-20 md:pb-6 sm:px-8 sm:pt-24 sm:pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}
