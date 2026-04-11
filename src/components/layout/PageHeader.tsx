import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SurfacePanel } from "../ui/SurfacePanel";

type PageHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  backTo?: {
    label: string;
    href: string;
  };
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ eyebrow, title, description, backTo, actions, className }: PageHeaderProps) {
  return (
    <header className={`mb-10 md:mb-16 ${className ?? ""}`}>
      <SurfacePanel className="relative overflow-hidden rounded-2xl p-6 pb-8 shadow-ambient md:p-12 lg:p-16">
        {/* Decorative Background Element */}
        <div 
          className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-[80px] dark:bg-primary/20" 
          aria-hidden="true" 
        />
        
        <div className="relative z-10">
          {backTo && (
            <Link 
              to={backTo.href}
              className="mb-6 flex w-fit items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant/60 transition hover:text-primary"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              {backTo.label}
            </Link>
          )}

          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:gap-12">
            <div className="flex-1 space-y-2 md:space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-primary md:text-sm">
                {eyebrow}
              </p>
              <h1 className="max-w-4xl text-3xl font-black leading-[1.1] tracking-tight text-on-surface md:text-5xl lg:text-7xl xl:text-8xl">
                {title}
              </h1>
            </div>
            
            {actions && (
              <div className="flex shrink-0 items-center gap-3">
                {actions}
              </div>
            )}
          </div>
        </div>

        <p className="relative z-10 mt-6 max-w-2xl text-base leading-relaxed text-on-surface-variant md:mt-8 md:text-lg lg:text-xl">
          {description}
        </p>
      </SurfacePanel>
    </header>
  );
}

