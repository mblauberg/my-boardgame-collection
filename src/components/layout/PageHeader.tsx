import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { motionTokens } from "../../lib/motion";
import { MaterialSymbol } from "../ui/MaterialSymbol";

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
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.header
      className={`mb-10 md:mb-16 ${className ?? ""}`}
      initial={prefersReducedMotion ? false : "hidden"}
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.06,
          },
        },
      }}
    >
      <div className="glass-surface-panel relative overflow-hidden rounded-2xl p-6 pb-8 shadow-ambient md:p-12 lg:p-16">
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
              <MaterialSymbol icon="arrow_back" className="text-[18px]" />
              {backTo.label}
            </Link>
          )}

          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:gap-12">
            <div className="flex-1 space-y-2 md:space-y-4">
              <motion.p
                className="text-xs font-black uppercase tracking-[0.25em] text-primary md:text-sm"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{
                  duration: motionTokens.duration.base,
                  ease: motionTokens.ease.standard,
                }}
              >
                {eyebrow}
              </motion.p>
              <motion.h1
                className="max-w-4xl text-3xl font-black leading-[1.1] tracking-tight text-on-surface md:text-5xl lg:text-7xl xl:text-8xl"
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{
                  duration: motionTokens.duration.slow,
                  ease: motionTokens.ease.emphasized,
                }}
              >
                {title}
              </motion.h1>
            </div>
            
            {actions && (
              <motion.div
                className="flex shrink-0 items-center gap-3"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{
                  duration: motionTokens.duration.base,
                  ease: motionTokens.ease.standard,
                }}
              >
                {actions}
              </motion.div>
            )}
          </div>
        </div>

        <motion.p
          className="relative z-10 mt-6 max-w-2xl text-base leading-relaxed text-on-surface-variant md:mt-8 md:text-lg lg:text-xl"
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{
            duration: motionTokens.duration.base,
            ease: motionTokens.ease.standard,
          }}
        >
          {description}
        </motion.p>
      </div>
    </motion.header>
  );
}
