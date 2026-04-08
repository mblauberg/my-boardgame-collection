import type { PropsWithChildren } from "react";
import { TopNavBar } from "./TopNavBar";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <>
      <TopNavBar />
      <main className="pt-28 pb-20 px-8 max-w-7xl mx-auto">
        {children}
      </main>
    </>
  );
}
