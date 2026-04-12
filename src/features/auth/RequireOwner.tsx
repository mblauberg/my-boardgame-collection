import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getSignInRouteState } from "./signInNavigation";
import { useProfile } from "./useProfile";

export function RequireOwner({ children }: PropsWithChildren) {
  const { isOwner, isLoading, isAuthenticated } = useProfile();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-on-surface-variant">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isOwner) {
    return <Navigate to="/signin" replace state={getSignInRouteState(location)} />;
  }

  return <>{children}</>;
}
