import { Link, useLocation } from "react-router-dom";
import { useProfile } from "../../features/auth/useProfile";
import { useTheme } from "../../lib/theme";

export function TopNavBar() {
  const location = useLocation();
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
    <nav className="glass-nav fixed top-0 z-50 flex w-full max-w-full items-center border-b border-outline-variant/15 bg-surface-bright/72 px-4 py-3 shadow-ambient md:px-8 md:py-4">
      <div className="flex-1 text-lg font-black text-primary tracking-tighter md:text-2xl">
        <Link to="/">My Board Game Collection</Link>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <Link className={getLinkClass("/explore")} to="/explore">Explore</Link>
        <Link className={getLinkClass("/saved")} to="/saved">Saved</Link>
        <Link className={getLinkClass("/")} to="/">Collection</Link>
      </div>
      <div className="flex flex-1 items-center justify-end gap-4">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          aria-pressed={theme === "dark"}
          className="glass-action-button inline-flex items-center justify-center rounded-full p-2 text-on-surface-variant transition-colors hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-on-surface">
            {theme === "dark" ? "light_mode" : "dark_mode"}
          </span>
        </button>
        <Link
          to={isAuthenticated ? "/settings" : "/signin"}
          className="glass-action-button flex scale-95 items-center justify-center rounded-full p-2 text-on-surface-variant transition-colors duration-150 hover:text-on-surface active:opacity-80"
        >
          <span className="material-symbols-outlined text-on-surface">account_circle</span>
        </Link>
      </div>
    </nav>
  );
}
