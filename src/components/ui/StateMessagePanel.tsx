import type { ReactNode } from "react";

type StateMessagePanelTone = "error" | "success" | "neutral";
type StateMessagePanelAlign = "left" | "center";
type StateMessagePanelSize = "regular" | "compact";

type StateMessagePanelProps = {
  actions?: ReactNode;
  align?: StateMessagePanelAlign;
  className?: string;
  description: ReactNode;
  size?: StateMessagePanelSize;
  title?: ReactNode;
  tone?: StateMessagePanelTone;
};

const toneClasses: Record<StateMessagePanelTone, string> = {
  error: "border-error/20 bg-error/10 text-on-surface",
  success: "border-secondary/20 bg-secondary/10 text-secondary",
  neutral:
    "border-outline/10 bg-surface-container-lowest/90 text-on-surface dark:bg-surface-container-low/80",
};

const sizeClasses: Record<StateMessagePanelSize, string> = {
  regular: "rounded-[2rem] p-8",
  compact: "rounded-[1.5rem] px-5 py-4",
};

const alignClasses: Record<StateMessagePanelAlign, string> = {
  left: "text-left",
  center: "text-center",
};

function joinClasses(...tokens: Array<string | false | null | undefined>) {
  return tokens.filter(Boolean).join(" ");
}

function getDescriptionClasses(
  tone: StateMessagePanelTone,
  size: StateMessagePanelSize,
  hasTitle: boolean,
) {
  if (!hasTitle) {
    return size === "compact"
      ? tone === "success"
        ? "text-sm font-bold text-secondary"
        : "text-sm font-medium text-on-surface"
      : "text-lg font-semibold text-on-surface";
  }

  if (tone === "success") {
    return "text-sm leading-6 text-secondary/90";
  }

  return "text-sm leading-6 text-on-surface-variant";
}

export function StateMessagePanel({
  actions,
  align = "left",
  className,
  description,
  size = "regular",
  title,
  tone = "neutral",
}: StateMessagePanelProps) {
  return (
    <div
      className={joinClasses(
        "border",
        toneClasses[tone],
        sizeClasses[size],
        alignClasses[align],
        className,
      )}
    >
      {title ? (
        <p className={size === "compact" ? "text-sm font-bold" : "text-lg font-semibold"}>
          {title}
        </p>
      ) : null}
      <p
        className={joinClasses(
          title ? "mt-2" : null,
          getDescriptionClasses(tone, size, Boolean(title)),
        )}
      >
        {description}
      </p>
      {actions ? (
        <div
          className={joinClasses(
            "mt-3 flex flex-wrap gap-3",
            align === "center" ? "justify-center" : null,
          )}
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}
