import type { PropsWithChildren } from "react";
import { TopNavBar } from "./TopNavBar";
import { BottomTabBar } from "./BottomTabBar";
import { BggAttribution } from "./BggAttribution";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNavBar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-[calc(7rem+env(safe-area-inset-top,0px))] md:px-8 md:pb-20 md:pt-28">
        {children}
      </main>
      <BggAttribution />
      <BottomTabBar />
    </div>
  );
}
