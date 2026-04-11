import { lazy, type ReactNode } from "react";

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
  requiresOwner?: boolean;
  showInDesktopNav?: boolean;
  showInMobileNav?: boolean;
  mobileNavIcon?: string;
  allowBackgroundOverlay?: boolean;
};

export type AppRouteEntry = AppRouteDefinition & {
  element: ReactNode;
};

export const appRouteEntries: AppRouteEntry[] = [
  {
    path: "/explore",
    label: "Explore",
    showInDesktopNav: true,
    showInMobileNav: true,
    mobileNavIcon: "explore",
    element: <ExplorePage />,
  },
  {
    path: "/saved",
    label: "Saved",
    showInDesktopNav: true,
    showInMobileNav: true,
    mobileNavIcon: "bookmark",
    element: <SavedPage />,
  },
  {
    path: "/",
    label: "Collection",
    showInDesktopNav: true,
    showInMobileNav: true,
    mobileNavIcon: "shelves",
    element: <CollectionPage />,
  },
  {
    path: "/game/:slug",
    label: "Game Detail",
    allowBackgroundOverlay: true,
    element: <GameDetailPage />,
  },
  {
    path: "/scenarios",
    label: "Scenarios",
    element: <ScenariosPage />,
  },
  {
    path: "/signin",
    label: "Sign In",
    allowBackgroundOverlay: true,
    element: <SignInPage />,
  },
  {
    path: "/auth/callback",
    label: "Auth Callback",
    element: <AuthCallbackPage />,
  },
  {
    path: "/admin",
    label: "Admin",
    requiresOwner: true,
    element: <AdminPage />,
  },
  {
    path: "/settings",
    label: "Settings",
    element: <AccountSettingsPage />,
  },
  {
    path: "/settings/sign-in-methods",
    label: "Sign-In Methods",
    element: <SignInMethodsPage />,
  },
  {
    path: "/u/:username",
    label: "Profile",
    element: <PublicProfilePage />,
  },
  {
    path: "/u/:username/collection",
    label: "Public Collection",
    element: <PublicCollectionPage />,
  },
  {
    path: "/u/:username/saved",
    label: "Public Saved",
    element: <PublicSavedPage />,
  },
  {
    path: "*",
    label: "Not Found",
    element: <NotFoundPage />,
  },
];

export const appRouteDefinitions: AppRouteDefinition[] = appRouteEntries.map(
  ({ element: _element, ...definition }) => definition,
);

export const desktopNavRouteDefinitions = appRouteDefinitions.filter((route) => route.showInDesktopNav);

export const mobileNavRouteDefinitions = appRouteDefinitions.filter((route) => route.showInMobileNav);

export const backgroundOverlayRouteEntries = appRouteEntries.filter((route) => route.allowBackgroundOverlay);
