import type { ComponentPropsWithoutRef, ElementType } from "react";

type SurfacePanelSpacing = "regular" | "compact";

type SurfacePanelOwnProps<TElement extends ElementType> = {
  as?: TElement;
  spacing?: SurfacePanelSpacing;
};

type SurfacePanelProps<TElement extends ElementType> = SurfacePanelOwnProps<TElement> &
  Omit<ComponentPropsWithoutRef<TElement>, keyof SurfacePanelOwnProps<TElement>>;

const spacingClasses: Record<SurfacePanelSpacing, string> = {
  regular: "p-6",
  compact: "p-4",
};

function joinClasses(...tokens: Array<string | false | null | undefined>) {
  return tokens.filter(Boolean).join(" ");
}

export function SurfacePanel<TElement extends ElementType = "div">({
  as,
  spacing = "regular",
  className,
  children,
  ...props
}: SurfacePanelProps<TElement>) {
  const Component = as ?? "div";

  return (
    <Component
      {...props}
      className={joinClasses(
        "glass-surface-panel rounded-2xl border shadow-ambient",
        spacingClasses[spacing],
        className,
      )}
    >
      {children}
    </Component>
  );
}
