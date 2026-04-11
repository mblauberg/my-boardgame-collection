import { useEffect, useRef, useState } from "react";

export type ExpandingSearchInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputLabel: string;
  expandButtonLabel: string;
  containerClassName?: string;
};

export function ExpandingSearchInput({
  id,
  value,
  onChange,
  placeholder,
  inputLabel,
  expandButtonLabel,
  containerClassName = "relative flex items-center justify-end",
}: ExpandingSearchInputProps) {
  const [isExpanded, setIsExpanded] = useState(value.length > 0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    if (value) {
      setIsExpanded(true);
    }
  }, [value]);

  return (
    <div className={containerClassName}>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? "w-full opacity-100" : "w-14 pointer-events-none opacity-0"
        }`}
      >
        <span
          aria-hidden="true"
          className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-lg text-on-surface-variant"
        >
          search
        </span>
        <label htmlFor={id} className="sr-only">
          {inputLabel}
        </label>
        <input
          ref={inputRef}
          id={id}
          aria-label={inputLabel}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => !value && setIsExpanded(false)}
          placeholder={placeholder}
          className="glass-input-field w-full rounded-full py-3 pl-10 pr-4 text-base text-on-surface outline-none transition"
        />
      </div>

      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        aria-label={expandButtonLabel}
        className={`glass-action-button group flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition hover:border-primary/35 ${
          isExpanded ? "pointer-events-none absolute right-0 opacity-0" : "opacity-100"
        }`}
      >
        <span className="material-symbols-outlined text-3xl text-on-surface transition group-hover:text-primary">
          search
        </span>
      </button>
    </div>
  );
}
