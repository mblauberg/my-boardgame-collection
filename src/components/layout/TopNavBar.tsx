import { Link, useLocation, useNavigate } from "react-router-dom";
import { desktopNavRouteDefinitions } from "../../app/router/routes";
import { getSignInRouteState } from "../../features/auth/signInNavigation";
import { useProfile } from "../../features/auth/useProfile";
import { useTheme } from "../../lib/theme";

export function TopNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useProfile();
  const { theme, toggleTheme } = useTheme();

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    const base = "font-medium font-['Manrope'] tracking-tight transition-colors duration-300 pb-1";
    if (isActive) {
      return `${base} text-primary font-extrabold border-b-2 border-primary`;
    }
    return `${base} text-on-surface hover:text-primary`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex w-full items-center bg-transparent px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] md:px-8 md:py-4">
      {/* All visual styling (including backdrop-filter) lives on the absolute child so iOS 26 sees
          the fixed <nav> as fully transparent — status bar gets native iOS glass, no web colour tint */}
      <div className="glass-nav pointer-events-none absolute inset-0 -z-10 border-b border-outline-variant/15 bg-surface-bright/72 shadow-ambient" />
      
      <div className="flex-1 min-w-0 text-lg font-black text-primary tracking-tighter md:text-2xl">
        <Link to="/" className="block truncate">My Boardgame Collection</Link>
      </div>
      <div className="hidden md:flex items-center gap-8">
        {desktopNavRouteDefinitions.map((route) => (
          <Link key={route.path} className={getLinkClass(route.path)} to={route.path}>
            {route.label}
          </Link>
        ))}
      </div>
      <div className="flex flex-1 items-center justify-end gap-4">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          aria-pressed={theme === "dark"}
          className="glass-action-button inline-flex h-14 w-14 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-on-surface md:h-10 md:w-10"
        >
          <span className="material-symbols-outlined text-3xl text-on-surface md:text-2xl">
            {theme === "dark" ? "light_mode" : "dark_mode"}
          </span>
        </button>
        {isAuthenticated ? (
          <Link
            to="/settings"
            aria-label="Open account settings"
            className="glass-action-button flex h-14 w-14 items-center justify-center rounded-full text-on-surface-variant transition-colors duration-150 hover:text-on-surface active:opacity-80 md:h-10 md:w-10"
          >
            <span className="material-symbols-outlined text-3xl text-on-surface md:text-2xl">account_circle</span>
          </Link>
        ) : (
          <button
            type="button"
            aria-label="Open account"
            onClick={() => navigate("/signin", { state: getSignInRouteState(location) })}
            className="glass-action-button flex h-14 w-14 items-center justify-center rounded-full text-on-surface-variant transition-colors duration-150 hover:text-on-surface active:opacity-80 md:h-10 md:w-10"
          >
            <span className="material-symbols-outlined text-3xl text-on-surface md:text-2xl">account_circle</span>
          </button>
        )}
      </div>
    </nav>
  );
}
