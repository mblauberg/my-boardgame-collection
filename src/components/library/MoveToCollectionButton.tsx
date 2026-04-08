type MoveToCollectionButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export function MoveToCollectionButton({ onClick, disabled = false }: MoveToCollectionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      Move to collection
    </button>
  );
}
