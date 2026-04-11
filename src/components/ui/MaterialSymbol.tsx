import type { ComponentPropsWithoutRef } from "react";

type MaterialSymbolProps = Omit<ComponentPropsWithoutRef<"span">, "children"> & {
  icon: string;
  filled?: boolean;
};

const filledClass = "[font-variation-settings:'FILL'_1,'wght'_400,'GRAD'_0,'opsz'_24]";

function joinClasses(...tokens: Array<string | false | null | undefined>) {
  return tokens.filter(Boolean).join(" ");
}

export function MaterialSymbol({ icon, filled = false, className, ...props }: MaterialSymbolProps) {
  return (
    <span
      {...props}
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
