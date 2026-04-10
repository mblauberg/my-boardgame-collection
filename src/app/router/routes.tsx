import { Suspense, lazy } from "react";
import { Navigate, Route, Routes, type Location } from "react-router-dom";
import { RequireOwner } from "../../features/auth/RequireOwner";

const CollectionPage = lazy(async () => ({
  default: (await import("../../pages/CollectionPage")).CollectionPage,
}));
const SavedPage = lazy(async () => ({
  default: (await import("../../pages/SavedPage")).SavedPage,
}));
const ExplorePage = lazy(async () => ({
  default: (await import("../../pages/ExplorePage")).ExplorePage,
}));
const GameDetailPage = lazy(async () => ({
  default: (await import("../../pages/GameDetailPage")).GameDetailPage,
}));
const NotFoundPage = lazy(async () => ({
  default: (await import("../../pages/NotFoundPage")).NotFoundPage,
}));
const AuthCallbackPage = lazy(async () => ({
  default: (await import("../../pages/AuthCallbackPage")).AuthCallbackPage,
}));
const SignInPage = lazy(async () => ({
  default: (await import("../../pages/SignInPage")).SignInPage,
}));
const ScenariosPage = lazy(async () => ({
  default: (await import("../../pages/ScenariosPage")).ScenariosPage,
}));
const PublicProfilePage = lazy(async () => ({
  default: (await import("../../pages/PublicProfilePage")).PublicProfilePage,
}));
const PublicCollectionPage = lazy(async () => ({
  default: (await import("../../pages/PublicCollectionPage")).PublicCollectionPage,
}));
const PublicSavedPage = lazy(async () => ({
  default: (await import("../../pages/PublicSavedPage")).PublicSavedPage,
}));
const AccountSettingsPage = lazy(async () => ({
  default: (await import("../../pages/AccountSettingsPage")).AccountSettingsPage,
}));
const SignInMethodsPage = lazy(async () => ({
  default: (await import("../../pages/SignInMethodsPage")).SignInMethodsPage,
}));
const AdminPage = lazy(async () => ({
  default: (await import("../../pages/AdminPage")).AdminPage,
}));

export type AppRouteDefinition = {
  path: string;
  label: string;
  showInNav: boolean;
  requiresOwner?: boolean;
};

export const appRouteDefinitions: AppRouteDefinition[] = [
  { path: "/", label: "Collection", showInNav: true },
  { path: "/saved", label: "Saved", showInNav: true },
  { path: "/explore", label: "Explore", showInNav: true },
  { path: "/game/:slug", label: "Game Detail", showInNav: false },
  { path: "/scenarios", label: "Scenarios", showInNav: true },
  { path: "/signin", label: "Sign In", showInNav: false },
  { path: "/auth/callback", label: "Auth Callback", showInNav: false },
  { path: "/admin", label: "Admin", showInNav: true, requiresOwner: true },
  { path: "/settings", label: "Settings", showInNav: false },
  { path: "/settings/sign-in-methods", label: "Sign-In Methods", showInNav: false },
  { path: "/u/:username", label: "Profile", showInNav: false },
  { path: "/u/:username/collection", label: "Public Collection", showInNav: false },
  { path: "/u/:username/saved", label: "Public Saved", showInNav: false },
];

type AppRoutesProps = {
  location?: Location;
};

function RouteLoadingFallback() {
  return <div className="py-16 text-center text-sm text-on-surface-variant">Loading...</div>;
}

export function AppRoutes({ location }: AppRoutesProps) {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes location={location}>
        <Route path="/" element={<CollectionPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/recommendations" element={<Navigate replace to="/explore" />} />
        <Route path="/game/:slug" element={<GameDetailPage />} />
        <Route path="/scenarios" element={<ScenariosPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/settings" element={<AccountSettingsPage />} />
        <Route path="/settings/sign-in-methods" element={<SignInMethodsPage />} />
        <Route path="/u/:username" element={<PublicProfilePage />} />
        <Route path="/u/:username/collection" element={<PublicCollectionPage />} />
        <Route path="/u/:username/saved" element={<PublicSavedPage />} />
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
    </Suspense>
  );
}
