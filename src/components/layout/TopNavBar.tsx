import { Link, useLocation } from "react-router-dom";
import { ProfileSearch } from "../library/ProfileSearch";

export function TopNavBar() {
  const location = useLocation();

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    const base = "font-medium font-['Manrope'] tracking-tight transition-colors duration-300";
    if (isActive) {
      return `${base} text-amber-800 dark:text-amber-400 font-extrabold border-b-2 border-amber-600`;
    }
    return `${base} text-[#2e2f2d] dark:text-[#ddddda] hover:text-amber-600 dark:hover:text-amber-300`;
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#f7f6f3]/70 dark:bg-[#1a1b1e]/70 backdrop-blur-xl shadow-[0_12px_40px_rgba(46,47,45,0.06)] flex justify-between items-center px-8 py-4 max-w-full mx-auto">
      <div className="text-2xl font-black text-amber-800 dark:text-amber-400 tracking-tighter">
        <Link to="/">The Game Haven</Link>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <Link className={getLinkClass("/explore")} to="/explore">Explore</Link>
        <Link className={getLinkClass("/wishlist")} to="/wishlist">Wishlist</Link>
        <Link className={getLinkClass("/")} to="/">Collection</Link>
      </div>
      <div className="flex items-center gap-4">
        <ProfileSearch />
        <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors scale-95 duration-150 active:opacity-80">
          <span className="material-symbols-outlined text-on-surface">settings</span>
        </button>
        <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors scale-95 duration-150 active:opacity-80">
          <span className="material-symbols-outlined text-on-surface">account_circle</span>
        </button>
      </div>
    </nav>
  );
}
