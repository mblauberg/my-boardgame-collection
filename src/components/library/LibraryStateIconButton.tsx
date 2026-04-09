type LibraryStateIconButtonProps = {
  label: string;
  icon: string;
  isActive: boolean;
  disabled?: boolean;
  showLabel?: boolean;
  onClick: () => void;
};

export function LibraryStateIconButton({
  label,
  icon,
  isActive,
  disabled = false,
  showLabel = false,
  onClick,
}: LibraryStateIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
        isActive
          ? "border-primary bg-primary text-on-primary"
          : "border-outline/40 bg-surface-container-low text-on-surface"
      } ${disabled ? "cursor-not-allowed opacity-60" : "hover:border-primary/60 hover:bg-surface-container-high"}`}
    >
      <span
        aria-hidden="true"
        className="material-symbols-outlined text-[1.15rem]"
        style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}
      >
        {icon}
      </span>
      {showLabel ? <span>{label}</span> : <span className="sr-only">{label}</span>}
    </button>
  );
}
