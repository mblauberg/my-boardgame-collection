import type { PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";
import { appRouteDefinitions } from "../../app/router/routes";
import { useProfile } from "../../features/auth/useProfile";

function navLinkClassName({ isActive }: { isActive: boolean }) {
  return [
    "rounded-full border px-4 py-2 text-sm font-semibold transition",
    isActive
      ? "border-ember bg-ember text-white"
      : "border-ink/15 bg-white/70 text-ink hover:border-ink/30 hover:bg-white",
  ].join(" ");
}

export function AppShell({ children }: PropsWithChildren) {
  const { isOwner } = useProfile();
  const navigationItems = appRouteDefinitions.filter((route) => {
    if (!route.showInNav) return false;
    if (route.requiresOwner && !isOwner) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-parchment text-ink">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] border border-ink/10 bg-white/85 p-6 shadow-card backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine">
                Personal Dashboard
              </p>
              <div className="space-y-2">
                <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
                  Board Game Collection
                </h1>
                <p className="max-w-xl text-sm leading-6 text-ink/75 sm:text-base">
                  A public collection browser with private owner editing, structured around live
                  Supabase data instead of hard-coded arrays.
                </p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-gold/40 bg-gold/10 px-4 py-3 text-sm">
              <p className="font-semibold text-ink">Project status</p>
              <p className="mt-1 text-ink/70">
                Collection, admin, buy-order, recommendations, scenarios, auth, and BGG refresh
                are implemented. Local browsing still depends on a Supabase project with
                `schema.sql` applied and seed data imported.
              </p>
            </div>
          </div>

          <nav aria-label="Primary" className="mt-6 flex flex-wrap gap-3">
            {navigationItems.map((route) => (
              <NavLink key={route.path} className={navLinkClassName} to={route.path}>
                {route.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="flex-1 py-8">{children}</main>
      </div>
    </div>
  );
}
