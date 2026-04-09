import { Link, useParams } from "react-router-dom";
import { usePublicProfileQuery } from "../features/profiles/usePublicProfileQuery";

export function PublicProfilePage() {
  const { username = "" } = useParams();
  const { data: profile, isLoading, error } = usePublicProfileQuery(username);

  if (isLoading) {
    return (
      <section className="rounded-[2rem] border border-outline-variant/15 bg-surface-container-lowest/90 p-8 shadow-[0_12px_40px_rgba(46,47,45,0.06)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Profiles</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-on-surface">Loading profile</h2>
      </section>
    );
  }

  if (error || !profile || !profile.is_profile_public) {
    return (
      <section className="rounded-[2rem] border border-outline-variant/15 bg-surface-container-lowest/90 p-8 shadow-[0_12px_40px_rgba(46,47,45,0.06)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Profiles</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-on-surface">Profile not found</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">
          This profile is private or does not exist.
        </p>
      </section>
    );
  }

  const visibleSections = [
    profile.is_collection_public
      ? { href: `/u/${profile.username}/collection`, label: "Collection" }
      : null,
    profile.is_saved_public
      ? { href: `/u/${profile.username}/saved`, label: "Saved" }
      : null,
  ].filter((section): section is { href: string; label: string } => section !== null);

  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <article className="rounded-[2rem] border border-outline-variant/15 bg-surface-container-lowest/90 p-8 shadow-[0_12px_40px_rgba(46,47,45,0.06)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Public Profile</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-on-surface">@{profile.username}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">
          Browse the sections this collector has chosen to share publicly.
        </p>
      </article>

      <aside className="rounded-[2rem] border border-outline-variant/15 bg-surface-container-low p-8 text-on-surface shadow-[0_12px_40px_rgba(46,47,45,0.06)]">
        <h2 className="text-2xl font-semibold">Visible sections</h2>
        {visibleSections.length > 0 ? (
          <div className="mt-4 flex flex-col gap-3">
            {visibleSections.map((section) => (
              <Link
                key={section.href}
                className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container-high"
                to={section.href}
              >
                {section.label}
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-on-surface-variant">
            No collection sections are public yet.
          </p>
        )}
      </aside>
    </section>
  );
}
