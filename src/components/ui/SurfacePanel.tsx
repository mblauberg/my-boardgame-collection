import type { ComponentPropsWithoutRef } from "react";

type SurfacePanelSpacing = "regular" | "compact";

type SurfacePanelProps = ComponentPropsWithoutRef<"div"> & {
  spacing?: SurfacePanelSpacing;
};

const spacingClasses: Record<SurfacePanelSpacing, string> = {
  regular: "p-6",
  compact: "p-4",
};

function joinClasses(...tokens: Array<string | false | null | undefined>) {
  return tokens.filter(Boolean).join(" ");
}

export function SurfacePanel({ spacing = "regular", className, children, ...props }: SurfacePanelProps) {
  return (
    <div
      {...props}
      className={joinClasses(
        "glass-surface-panel rounded-2xl border shadow-ambient",
        spacingClasses[spacing],
        className,
      )}
    >
      {children}
    </div>
  );
}
