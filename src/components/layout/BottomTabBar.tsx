import { Link, useLocation } from "react-router-dom";

const TABS = [
  { to: "/explore", icon: "explore", label: "Explore" },
  { to: "/saved", icon: "bookmark", label: "Saved" },
  { to: "/", icon: "shelves", label: "Collection" },
];

export function BottomTabBar() {
  const location = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-safe md:hidden">
      <div className="mx-4 mb-4 flex gap-2 rounded-full border border-outline-variant/20 bg-surface-container-high/95 p-1.5 shadow-ambient backdrop-blur-xl">
        {TABS.map(({ to, icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex min-w-[4.5rem] flex-col items-center gap-0.5 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-on-surface-variant hover:bg-surface-variant/50"
              }`}
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {icon}
              </span>
              <span className="text-[0.625rem]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
