import { Navigate, Route, Routes } from "react-router-dom";
import { AdminPage } from "../../pages/AdminPage";
import { CollectionPage } from "../../pages/CollectionPage";
import { WishlistPage } from "../../pages/WishlistPage";
import { ExplorePage } from "../../pages/ExplorePage";
import { GameDetailPage } from "../../pages/GameDetailPage";
import { NotFoundPage } from "../../pages/NotFoundPage";
import { AuthCallbackPage } from "../../pages/AuthCallbackPage";
import { SignInPage } from "../../pages/SignInPage";
import { ScenariosPage } from "../../pages/ScenariosPage";
import { PublicProfilePage } from "../../pages/PublicProfilePage";
import { PublicCollectionPage } from "../../pages/PublicCollectionPage";
import { PublicWishlistPage } from "../../pages/PublicWishlistPage";
import { AccountSettingsPage } from "../../pages/AccountSettingsPage";
import { RequireOwner } from "../../features/auth/RequireOwner";

export type AppRouteDefinition = {
  path: string;
  label: string;
  showInNav: boolean;
  requiresOwner?: boolean;
};

export const appRouteDefinitions: AppRouteDefinition[] = [
  { path: "/", label: "Collection", showInNav: true },
  { path: "/wishlist", label: "Wishlist", showInNav: true },
  { path: "/explore", label: "Explore", showInNav: true },
  { path: "/game/:slug", label: "Game Detail", showInNav: false },
  { path: "/scenarios", label: "Scenarios", showInNav: true },
  { path: "/signin", label: "Sign In", showInNav: false },
  { path: "/auth/callback", label: "Auth Callback", showInNav: false },
  { path: "/admin", label: "Admin", showInNav: true, requiresOwner: true },
  { path: "/settings", label: "Settings", showInNav: false },
  { path: "/u/:username", label: "Profile", showInNav: false },
  { path: "/u/:username/collection", label: "Public Collection", showInNav: false },
  { path: "/u/:username/wishlist", label: "Public Wishlist", showInNav: false },
];

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CollectionPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/buy-order" element={<Navigate replace to="/wishlist" />} />
      <Route path="/recommendations" element={<Navigate replace to="/explore" />} />
      <Route path="/game/:slug" element={<GameDetailPage />} />
      <Route path="/scenarios" element={<ScenariosPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/settings" element={<AccountSettingsPage />} />
      <Route path="/u/:username" element={<PublicProfilePage />} />
      <Route path="/u/:username/collection" element={<PublicCollectionPage />} />
      <Route path="/u/:username/wishlist" element={<PublicWishlistPage />} />
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
