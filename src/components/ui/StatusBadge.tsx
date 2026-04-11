import type { ComponentPropsWithoutRef } from "react";

type StatusBadgeTone = "brand" | "neutral";
type StatusBadgeSize = "regular" | "compact";

type StatusBadgeProps = ComponentPropsWithoutRef<"span"> & {
  tone?: StatusBadgeTone;
  size?: StatusBadgeSize;
};

const toneClasses: Record<StatusBadgeTone, string> = {
  brand: "glass-badge text-on-primary-fixed",
  neutral: "border border-outline/25 bg-surface-container-high text-on-surface",
};

const sizeClasses: Record<StatusBadgeSize, string> = {
  regular: "px-3 py-1.5 text-xs",
  compact: "px-2 py-1 text-[10px]",
};

function joinClasses(...tokens: Array<string | false | null | undefined>) {
  return tokens.filter(Boolean).join(" ");
}

export function StatusBadge({
  tone = "brand",
  size = "regular",
  className,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      {...props}
      className={joinClasses(
        "inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wider",
        toneClasses[tone],
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
