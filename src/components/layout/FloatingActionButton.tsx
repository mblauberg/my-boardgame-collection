type FloatingActionButtonProps = {
  onClick?: () => void;
  label?: string;
};

export function FloatingActionButton({
  onClick,
  label = "Open add game wizard",
}: FloatingActionButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="glass-action-button glass-action-button-active fixed bottom-32 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full text-on-primary transition-all duration-200 hover:scale-110 active:scale-95 md:bottom-8 md:right-8"
    >
      <span className="material-symbols-outlined text-3xl">add</span>
    </button>
  );
}
