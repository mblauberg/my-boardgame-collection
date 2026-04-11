import { Link } from "react-router-dom";
import { SurfacePanel } from "../components/ui/SurfacePanel";

export function NotFoundPage() {
  return (
    <SurfacePanel className="rounded-2xl border-outline-variant/15 p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Not found</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-on-surface">Page not found</h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">
        We couldn&apos;t find that page. Head back to your collection to keep browsing your games.
      </p>
      <Link
        className="glass-action-button-active mt-6 inline-flex rounded-full px-5 py-3 text-sm font-semibold text-on-primary transition hover:brightness-95"
        to="/"
      >
        Back to Collection
      </Link>
    </SurfacePanel>
  );
}
