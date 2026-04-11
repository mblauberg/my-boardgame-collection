import { useSlidingIndicator } from "../../hooks/useSlidingIndicator";

export type PillOption<T> = {
  label: string;
  value: T;
  icon?: string;
};

type PillSelectorProps<T> = {
  options: PillOption<T>[];
  activeValue: T;
  onChange: (value: T) => void;
  className?: string;
  indicatorClassName?: string;
};

export function PillSelector<T>({
  options,
  activeValue,
  onChange,
  className = "",
  indicatorClassName = "bg-primary",
}: PillSelectorProps<T>) {
  const activeIndex = options.findIndex((opt) => opt.value === activeValue);
  const { containerRef, indicatorStyle } = useSlidingIndicator({
    activeIndex,
    selector: "button",
  });

  return (
    <div
      ref={containerRef}
      className={`relative flex min-h-[44px] items-center gap-1 overflow-x-auto rounded-full p-1 no-scrollbar glass-input-field ${className}`}
    >
      {/* Animated Indicator */}
      <div
        data-testid="pill-selector-indicator"
        className={`absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] glass-action-button-active ${indicatorClassName}`}
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
        }}
      />

      {/* Options */}
      {options.map((option, index) => {
        const isActive = option.value === activeValue;
        return (
          <button
            key={index}
            type="button"
            onClick={() => onChange(option.value)}
            className={`relative z-10 flex min-h-[36px] items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
              isActive 
                ? "text-on-primary" 
                : "text-on-surface-variant hover:text-on-surface hover:bg-on-surface/5"
            }`}
          >
            {option.icon && (
              <span className={`material-symbols-outlined text-lg ${isActive ? "filled" : ""}`}>
                {option.icon}
              </span>
            )}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
