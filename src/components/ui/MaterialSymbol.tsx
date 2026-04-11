import type { ComponentPropsWithoutRef } from "react";

type SharedMaterialSymbolProps = Omit<
  ComponentPropsWithoutRef<"span">,
  "children" | "aria-hidden" | "aria-label"
> & {
  icon: string;
  filled?: boolean;
};

type DecorativeMaterialSymbolProps = SharedMaterialSymbolProps & {
  "aria-label"?: undefined;
  "aria-hidden"?: true;
};

type LabeledMaterialSymbolProps = SharedMaterialSymbolProps & {
  "aria-label": string;
  "aria-hidden"?: false;
};

type MaterialSymbolProps = DecorativeMaterialSymbolProps | LabeledMaterialSymbolProps;

function joinClasses(...tokens: Array<string | false | null | undefined>) {
  return tokens.filter(Boolean).join(" ");
}

export function MaterialSymbol({
  icon,
  filled = false,
  className,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
  ...props
}: MaterialSymbolProps) {
  return (
    <span
      {...props}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
      aria-hidden={ariaLabel ? false : (ariaHidden ?? true)}
      className={joinClasses(
        "material-symbols-outlined leading-none",
        filled && "material-symbols-filled",
        className,
      )}
    >
      {icon}
    </span>
  );
}
