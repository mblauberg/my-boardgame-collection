import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="rounded-[2rem] border border-ink/10 bg-white/90 p-8 shadow-card">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine">Missing Route</p>
      <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight">Page not found</h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-ink/75">
        The route does not exist in the current scaffold. Return to the collection home and keep
        building from there.
      </p>
      <Link
        className="mt-6 inline-flex rounded-full border border-ember bg-ember px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        to="/"
      >
        Back to Collection
      </Link>
    </section>
  );
}
