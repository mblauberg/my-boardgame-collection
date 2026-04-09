import { Link, useLocation } from "react-router-dom";
import { PageSearch } from "../library/PageSearch";
import { useProfile } from "../../features/auth/useProfile";

export function TopNavBar() {
  const location = useLocation();
  const { isAuthenticated } = useProfile();

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    const base = "font-medium font-['Manrope'] tracking-tight transition-colors duration-300";
    if (isActive) {
      return `${base} text-primary font-extrabold border-b-2 border-primary`;
    }
    return `${base} text-on-surface hover:text-primary`;
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface-bright/60 backdrop-blur-xl shadow-[0_12px_40px_rgba(46,47,45,0.06)] flex justify-between items-center px-4 py-3 md:px-8 md:py-4 max-w-full mx-auto">
      <div className="text-lg font-black text-primary tracking-tighter md:text-2xl">
        <Link to="/">My Board Game Collection</Link>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <Link className={getLinkClass("/explore")} to="/explore">Explore</Link>
        <Link className={getLinkClass("/saved")} to="/saved">Saved</Link>
        <Link className={getLinkClass("/")} to="/">Collection</Link>
      </div>
      <div className="flex items-center gap-4">
        <PageSearch />
        <Link to={isAuthenticated ? "/settings" : "/signin"} className="p-2 rounded-full hover:bg-surface-container-low transition-colors scale-95 duration-150 active:opacity-80 flex items-center justify-center">
          <span className="material-symbols-outlined text-on-surface">account_circle</span>
        </Link>
      </div>
    </nav>
  );
}
