import { Route, Routes } from "react-router-dom";
import { AdminPage } from "../../pages/AdminPage";
import { BuyOrderPage } from "../../pages/BuyOrderPage";
import { CollectionPage } from "../../pages/CollectionPage";
import { GameDetailPage } from "../../pages/GameDetailPage";
import { NotFoundPage } from "../../pages/NotFoundPage";
import { RecommendationsPage } from "../../pages/RecommendationsPage";
import { ScenariosPage } from "../../pages/ScenariosPage";
import { SignInPage } from "../../pages/SignInPage";
import { RequireOwner } from "../../features/auth/RequireOwner";

export type AppRouteDefinition = {
  path: string;
  label: string;
  showInNav: boolean;
  requiresOwner?: boolean;
};

export const appRouteDefinitions: AppRouteDefinition[] = [
  { path: "/", label: "Collection", showInNav: true },
  { path: "/game/:slug", label: "Game Detail", showInNav: false },
  { path: "/scenarios", label: "Scenarios", showInNav: true },
  { path: "/buy-order", label: "Buy Order", showInNav: true },
  { path: "/recommendations", label: "Recommendations", showInNav: true },
  { path: "/signin", label: "Sign In", showInNav: false },
  { path: "/admin", label: "Admin", showInNav: true, requiresOwner: true },
];

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CollectionPage />} />
      <Route path="/game/:slug" element={<GameDetailPage />} />
      <Route path="/scenarios" element={<ScenariosPage />} />
      <Route path="/buy-order" element={<BuyOrderPage />} />
      <Route path="/recommendations" element={<RecommendationsPage />} />
      <Route path="/signin" element={<SignInPage />} />
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
