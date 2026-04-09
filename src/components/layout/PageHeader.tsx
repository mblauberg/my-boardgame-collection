import { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={`mb-10 md:mb-16 ${className ?? ""}`}>
      <div className="glass-surface-panel relative rounded-3xl p-6 md:p-12 lg:p-16">
        {actions && (
          <div className="mt-6 md:absolute md:right-12 md:top-12 md:mt-0 lg:right-16 lg:top-16">
            {actions}
          </div>
        )}
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary md:mb-3">
          {eyebrow}
        </p>
        <h1 className="max-w-3xl text-3xl font-extrabold leading-[1.1] tracking-tight text-on-surface md:text-5xl lg:text-7xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-on-surface-variant md:mt-6 md:text-lg">
          {description}
        </p>
      </div>
    </header>
  );
}
