import { Route, Routes } from "react-router-dom";
import { AdminPage } from "../../pages/AdminPage";
import { CollectionPage } from "../../pages/CollectionPage";
import { WishlistPage } from "../../pages/WishlistPage";
import { ExplorePage } from "../../pages/ExplorePage";
import { GameDetailPage } from "../../pages/GameDetailPage";
import { NotFoundPage } from "../../pages/NotFoundPage";
import { AuthCallbackPage } from "../../pages/AuthCallbackPage";
import { SignInPage } from "../../pages/SignInPage";
import { RequireOwner } from "../../features/auth/RequireOwner";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CollectionPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/game/:slug" element={<GameDetailPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route
        path="/admin"
        element={
          <RequireOwner>
            <AdminPage />
          </RequireOwner>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
