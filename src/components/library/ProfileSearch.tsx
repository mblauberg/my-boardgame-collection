import { useState } from "react";
import { Link } from "react-router-dom";
import { useProfileSearchQuery } from "../../features/library/useProfileSearchQuery";

export function ProfileSearch() {
  const [query, setQuery] = useState("");
  const { data: results } = useProfileSearchQuery(query);

  return (
    <div className="relative hidden md:block">
      <label className="sr-only" htmlFor="profile-search">
        Search public profiles
      </label>
      <input
        id="profile-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Find a public profile"
        className="w-56 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm text-[#2e2f2d] outline-none transition focus:border-amber-500"
      />

      {query.trim().length > 0 && results && results.length > 0 ? (
        <div className="absolute right-0 top-12 min-w-full rounded-2xl border border-black/10 bg-white p-2 shadow-xl">
          {results.map((result) => (
            <Link
              key={result.username}
              className="block rounded-xl px-3 py-2 text-sm text-[#2e2f2d] transition hover:bg-amber-50"
              to={`/u/${result.username}`}
            >
              @{result.username}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
