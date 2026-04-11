import { MaterialSymbol } from "../ui/MaterialSymbol";

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
    : "h-9 w-9 p-0 text-[1.05rem]";
  const glassClass = isActive
    ? "glass-action-button-active text-on-primary-fixed"
    : "glass-action-button text-on-surface-variant";
  const hoverClass = disabled
    ? "cursor-not-allowed opacity-60"
    : isActive
      ? ""
      : "hover:text-on-surface";

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full font-semibold transition-colors ${sizeClass} ${glassClass} ${hoverClass}`}
    >
      <MaterialSymbol icon={icon} filled={isActive} className="text-[1.15rem]" />
      {showLabel ? <span>{label}</span> : <span className="sr-only">{label}</span>}
    </button>
  );
}
