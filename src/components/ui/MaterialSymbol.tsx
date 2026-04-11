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

const filledClass = "[font-variation-settings:'FILL'_1,'wght'_400,'GRAD'_0,'opsz'_24]";

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
      aria-hidden={ariaLabel ? false : (ariaHidden ?? true)}
      className={joinClasses(
        "material-symbols-outlined leading-none",
        filled ? filledClass : null,
        className,
      )}
    >
      {icon}
    </span>
  );
}
