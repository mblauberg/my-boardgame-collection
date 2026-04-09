import type { SortOption, SortDirection } from "../../features/shared/filters";

type SegmentedControlProps = {
  value: SortOption;
  direction: SortDirection;
  onChange: (value: SortOption, direction: SortDirection) => void;
};

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: "rank", label: "Rank" },
  { value: "rating", label: "Rating" },
  { value: "weight", label: "Weight" },
  { value: "year", label: "Year" },
  { value: "name", label: "Name" },
];

export function SegmentedControl({ value, direction, onChange }: SegmentedControlProps) {
  const handleClick = (option: SortOption) => {
    if (option === value) {
      onChange(option, direction === "asc" ? "desc" : "asc");
    } else {
      onChange(option, "asc");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-2xl bg-surface-container-low p-1 dark:bg-surface-container-low">
      {OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleClick(option.value)}
            className={`relative flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
              isActive
                ? "bg-gradient-to-br from-primary-container to-primary text-on-primary-fixed shadow-sm dark:from-primary-container dark:to-primary"
                : "text-on-surface-variant hover:bg-surface-container-highest dark:text-on-surface-variant dark:hover:bg-surface-container-high"
            }`}
          >
            {option.label}
            {isActive && (
              <span className="material-symbols-outlined text-sm">
                {direction === "asc" ? "arrow_upward" : "arrow_downward"}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
