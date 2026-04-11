import { Link, useLocation, useNavigate } from "react-router-dom";
import { mobileNavRouteDefinitions } from "../../app/router/routes";
import { getSignInRouteState } from "../../features/auth/signInNavigation";
import { useProfile } from "../../features/auth/useProfile";

function isActivePath(currentPath: string, routePath: string) {
  if (routePath === "/") {
    return currentPath === routePath;
  }

  return currentPath === routePath || currentPath.startsWith(`${routePath}/`);
}

export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useProfile();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-safe md:hidden">
      <div className="bottom-nav-pill mx-6 mb-1 flex gap-2 rounded-full p-1.5">
        {mobileNavRouteDefinitions.map((route) => {
          const isActive = isActivePath(location.pathname, route.path);
          return (
            <Link
              key={route.path}
              to={route.path}
              className={`flex min-w-[5.5rem] flex-col items-center gap-0.5 rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-on-surface-variant hover:bg-surface-variant/50"
              }`}
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {route.mobileNavIcon}
              </span>
              <span className="text-[0.625rem]">{route.label}</span>
            </Link>
          );
        })}
        {isAuthenticated ? (
          <Link
            to="/settings"
            className={`flex min-w-[5.5rem] flex-col items-center gap-0.5 rounded-full px-5 py-2 text-xs font-semibold transition-all ${
              isActivePath(location.pathname, "/settings")
                ? "bg-primary/15 text-primary"
                : "text-on-surface-variant hover:bg-surface-variant/50"
            }`}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={isActivePath(location.pathname, "/settings") ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              account_circle
            </span>
            <span className="text-[0.625rem]">Account</span>
          </Link>
        ) : (
          <button
            type="button"
            aria-label="Account"
            onClick={() => navigate("/signin", { state: getSignInRouteState(location) })}
            className="flex min-w-[5.5rem] flex-col items-center gap-0.5 rounded-full px-5 py-2 text-xs font-semibold text-on-surface-variant transition-all hover:bg-surface-variant/50"
          >
            <span className="material-symbols-outlined text-2xl">account_circle</span>
            <span className="text-[0.625rem]">Account</span>
          </button>
        )}
      </div>
    </nav>
  );
}
