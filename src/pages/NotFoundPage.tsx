import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="rounded-[2rem] border border-outline-variant/15 bg-surface-container-lowest/90 p-8 shadow-[0_12px_40px_rgba(46,47,45,0.06)]">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Missing Route</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-on-surface">Page not found</h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">
        The route does not exist in the current scaffold. Return to the collection home and keep
        building from there.
      </p>
      <Link
        className="mt-6 inline-flex rounded-full bg-gradient-to-br from-primary to-primary-container px-5 py-3 text-sm font-semibold text-on-primary transition hover:brightness-95"
        to="/"
      >
        Back to Collection
      </Link>
    </section>
  );
}
