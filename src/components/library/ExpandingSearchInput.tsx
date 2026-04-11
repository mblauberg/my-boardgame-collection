import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { motionTokens } from "../../lib/motion";

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
  const prefersReducedMotion = usePrefersReducedMotion();

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
      <motion.div
        data-motion="search-field"
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? "w-full opacity-100" : "w-14 pointer-events-none opacity-0"
        }`}
        initial={false}
        animate={
          prefersReducedMotion
            ? { opacity: isExpanded ? 1 : 0 }
            : { opacity: isExpanded ? 1 : 0, scale: isExpanded ? 1 : 0.98 }
        }
        transition={{
          duration: motionTokens.duration.fast,
          ease: motionTokens.ease.standard,
        }}
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
      </motion.div>

      <motion.button
        type="button"
        onClick={() => setIsExpanded(true)}
        aria-label={expandButtonLabel}
        className={`glass-action-button group flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition hover:border-primary/35 ${
          isExpanded ? "pointer-events-none absolute right-0 opacity-0" : "opacity-100"
        }`}
        initial={false}
        animate={
          prefersReducedMotion
            ? { opacity: isExpanded ? 0 : 1 }
            : { opacity: isExpanded ? 0 : 1, scale: isExpanded ? 0.92 : 1 }
        }
        transition={{
          duration: motionTokens.duration.fast,
          ease: motionTokens.ease.standard,
        }}
      >
        <span className="material-symbols-outlined text-3xl text-on-surface transition group-hover:text-primary">
          search
        </span>
      </motion.button>
    </div>
  );
}
