import { useParams } from "react-router-dom";
import { LibraryList } from "../components/library/LibraryList";
import { usePublicLibraryQuery } from "../features/library/usePublicLibraryQuery";

export function PublicWishlistPage() {
  const { username = "" } = useParams();
  const { data, isLoading, error } = usePublicLibraryQuery(username, "wishlist");

  if (isLoading) {
    return <div className="p-8 text-center">Loading public wishlist...</div>;
  }

  if (error || !data) {
    return <div className="p-8 text-center">Public wishlist not found.</div>;
  }

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Public wishlist</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">@{data.username}</h1>
      </header>

      <LibraryList
        entries={data.entries}
        getGameLinkState={() => ({ from: `/u/${data.username}/wishlist` })}
      />
    </section>
  );
}
