type FilterChipProps = {
  label: string;
  onRemove: () => void;
};

export function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="group flex items-center gap-1.5 rounded-full bg-gradient-to-br from-primary-container to-primary px-3 py-1.5 text-sm font-semibold text-on-primary-fixed transition-transform hover:scale-105 dark:from-primary-container dark:to-primary"
    >
      {label}
      <span className="material-symbols-outlined text-base transition-transform group-hover:rotate-90">
        close
      </span>
    </button>
  );
}
