import { Link, useLocation } from "react-router-dom";

const TABS = [
  { to: "/explore", icon: "explore", label: "Explore" },
  { to: "/saved", icon: "bookmark", label: "Saved" },
  { to: "/", icon: "shelves", label: "Collection" },
];

export function BottomTabBar() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 flex md:hidden bg-surface-bright/90 backdrop-blur-xl border-t border-outline-variant/10 pb-safe">
      {TABS.map(({ to, icon, label }) => {
        const isActive = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors ${
              isActive ? "text-primary" : "text-on-surface-variant"
            }`}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {icon}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
