import type { PropsWithChildren } from "react";
import { TopNavBar } from "./TopNavBar";
import { BottomTabBar } from "./BottomTabBar";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <>
      {/* iOS Safari Chrome Layers: These fixed elements "paint through" the safe-area insets
          to ensure status bar (top) and URL bar (bottom) areas match the app's glass theme. */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-[env(safe-area-inset-top,0px)] pointer-events-none glass-nav bg-surface-bright/72" />
      <div className="fixed bottom-0 left-0 right-0 z-[100] h-[env(safe-area-inset-bottom,0px)] pointer-events-none glass-nav bg-surface-bright/72" />
      
      <TopNavBar />
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-[calc(7rem+env(safe-area-inset-top,0px))] md:px-8 md:pb-20 md:pt-28">
        {children}
      </main>
      <BottomTabBar />
    </>
  );
}
