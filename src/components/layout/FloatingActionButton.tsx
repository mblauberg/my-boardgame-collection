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
      className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-16 h-16 rounded-full bg-primary/80 backdrop-blur-md text-on-primary flex items-center justify-center shadow-xl shadow-primary/30 border border-primary/20 transform hover:scale-110 hover:bg-primary/90 active:scale-95 transition-all duration-200 z-50">
      <span className="material-symbols-outlined text-3xl">add</span>
    </button>
  );
}
