import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useProfile } from "./useProfile";

export function RequireOwner({ children }: PropsWithChildren) {
  const { isOwner, isLoading, isAuthenticated } = useProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isOwner) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}
