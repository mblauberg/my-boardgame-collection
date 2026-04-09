import type { ReactNode } from "react";

type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  footer?: ReactNode;
};

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  highlights,
  footer,
}: PlaceholderPageProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <article className="rounded-[2rem] border border-outline-variant/15 bg-surface-container-lowest/90 p-8 shadow-ambient">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">{title}</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">{description}</p>
      </article>

      <aside className="rounded-[2rem] border border-outline-variant/15 bg-surface-container-low p-8 text-on-surface shadow-ambient">
        <h3 className="text-2xl font-semibold">Planned next</h3>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-on-surface-variant">
          {highlights.map((highlight) => (
            <li key={highlight} className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-on-surface">
              {highlight}
            </li>
          ))}
        </ul>
        {footer ? <div className="mt-5 text-sm text-on-surface-variant">{footer}</div> : null}
      </aside>
    </section>
  );
}
