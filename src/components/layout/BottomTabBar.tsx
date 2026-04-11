import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { mobileNavRouteDefinitions } from "../../app/router/routes";
import { useSlidingIndicator } from "../../hooks/useSlidingIndicator";
import { motionTokens } from "../../lib/motion";
import { MaterialSymbol } from "../ui/MaterialSymbol";

function isActivePath(currentPath: string, routePath: string) {
  if (routePath === "/") {
    return currentPath === routePath;
  }

  return currentPath === routePath || currentPath.startsWith(`${routePath}/`);
}

export function BottomTabBar() {
  const location = useLocation();
  const activeNavIndex = mobileNavRouteDefinitions.findIndex((route) =>
    isActivePath(location.pathname, route.path),
  );
  const { containerRef, indicatorStyle } = useSlidingIndicator({
    activeIndex: activeNavIndex,
    selector: "a",
  });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center bg-transparent pb-safe md:hidden">
      <div ref={containerRef} className="bottom-nav-pill relative mx-6 mb-1 flex gap-2 rounded-full p-1.5">
        <motion.div
          data-testid="bottom-nav-indicator"
          aria-hidden="true"
          className="bottom-nav-indicator absolute rounded-full bg-primary/15"
          animate={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            opacity: indicatorStyle.width > 0 ? 1 : 0,
          }}
          initial={false}
          transition={motionTokens.spring.soft}
          style={{ top: 6, bottom: 6 }}
        />
        {mobileNavRouteDefinitions.map((route) => {
          const isActive = isActivePath(location.pathname, route.path);
          return (
            <Link
              key={route.path}
              to={route.path}
              className={`relative z-10 flex min-w-[5.5rem] flex-col items-center gap-0.5 rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? "text-primary"
                  : "text-on-surface-variant hover:bg-surface-variant/50"
              }`}
            >
              <MaterialSymbol
                icon={route.mobileNavIcon ?? ""}
                filled={isActive}
                className={`text-2xl transition-transform duration-300 ${isActive ? "scale-110" : ""}`}
              />
              <span className="text-[0.625rem]">{route.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
