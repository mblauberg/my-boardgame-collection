import { createContext, useContext, useState, type PropsWithChildren } from "react";

type ExploreSearchContextValue = {
  query: string;
  setQuery: (query: string) => void;
};

const ExploreSearchContext = createContext<ExploreSearchContextValue | null>(null);

export function ExploreSearchProvider({ children }: PropsWithChildren) {
  const [query, setQuery] = useState("");

  return (
    <ExploreSearchContext.Provider value={{ query, setQuery }}>
      {children}
    </ExploreSearchContext.Provider>
  );
}

export function useExploreSearchContext() {
  const context = useContext(ExploreSearchContext);
  if (!context) {
    throw new Error("useExploreSearchContext must be used within ExploreSearchProvider");
  }
  return context;
}
