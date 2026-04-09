import type { PropsWithChildren } from "react";
import { TopNavBar } from "./TopNavBar";
import { BottomTabBar } from "./BottomTabBar";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <>
      <TopNavBar />
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-20 md:px-8 md:pb-20 md:pt-28">
        {children}
      </main>
      <BottomTabBar />
    </>
  );
}
