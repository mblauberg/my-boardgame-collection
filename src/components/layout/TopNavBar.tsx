import { Link, useLocation } from "react-router-dom";
import { useProfile } from "../../features/auth/useProfile";

export function TopNavBar() {
  const location = useLocation();
  const { isAuthenticated } = useProfile();

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    const base = "font-medium font-['Manrope'] tracking-tight transition-colors duration-300 pb-1";
    if (isActive) {
      return `${base} text-primary font-extrabold border-b-2 border-primary`;
    }
    return `${base} text-on-surface hover:text-primary`;
  };

  return (
    <nav className="fixed top-0 z-50 flex w-full max-w-full items-center bg-surface-bright/70 px-4 py-3 shadow-ambient backdrop-blur-xl dark:bg-[rgb(28_27_27/0.86)] md:px-8 md:py-4">
      <div className="flex-1 text-lg font-black text-primary tracking-tighter md:text-2xl">
        <Link to="/">My Board Game Collection</Link>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <Link className={getLinkClass("/explore")} to="/explore">Explore</Link>
        <Link className={getLinkClass("/saved")} to="/saved">Saved</Link>
        <Link className={getLinkClass("/")} to="/">Collection</Link>
      </div>
      <div className="flex flex-1 items-center justify-end gap-4">
        <Link
          to={isAuthenticated ? "/settings" : "/signin"}
          className="flex scale-95 items-center justify-center rounded-full p-2 transition-colors duration-150 hover:bg-surface-container-low active:opacity-80"
        >
          <span className="material-symbols-outlined text-on-surface">account_circle</span>
        </Link>
      </div>
    </nav>
  );
}
