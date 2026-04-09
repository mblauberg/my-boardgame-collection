type LibraryStateIconButtonProps = {
  label: string;
  icon: string;
  isActive: boolean;
  disabled?: boolean;
  showLabel?: boolean;
  onClick: (e: React.MouseEvent) => void;
};

export function LibraryStateIconButton({
  label,
  icon,
  isActive,
  disabled = false,
  showLabel = false,
  onClick,
}: LibraryStateIconButtonProps) {
  const sizeClass = showLabel
    ? "gap-2 px-3 py-2 text-sm"
    : "h-9 w-9 p-0 text-[1.05rem] backdrop-blur-sm";
  const stateClass = isActive
    ? "border-primary/70 bg-gradient-to-br from-primary-container to-primary text-on-primary-fixed"
    : "border-outline/35 bg-surface/70 text-on-surface-variant";
  const hoverClass = disabled
    ? "cursor-not-allowed opacity-60"
    : isActive
      ? "hover:brightness-95"
      : "hover:border-primary/55 hover:bg-surface-container-high hover:text-on-surface";

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full border font-semibold shadow-ambient transition-colors ${sizeClass} ${stateClass} ${hoverClass}`}
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
