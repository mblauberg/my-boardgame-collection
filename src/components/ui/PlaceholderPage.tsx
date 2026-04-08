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
      <article className="rounded-[2rem] border border-ink/10 bg-white/90 p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine">{eyebrow}</p>
        <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink/75">{description}</p>
      </article>

      <aside className="rounded-[2rem] border border-ink/10 bg-ink p-8 text-parchment shadow-card">
        <h3 className="font-serif text-2xl font-semibold">Planned next</h3>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-parchment/85">
          {highlights.map((highlight) => (
            <li key={highlight} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              {highlight}
            </li>
          ))}
        </ul>
        {footer ? <div className="mt-5 text-sm text-parchment/75">{footer}</div> : null}
      </aside>
    </section>
  );
}
