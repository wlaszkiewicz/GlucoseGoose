// contexts/TrendsContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { useTrendsData } from "../hooks/useTrendsData";
import { useNightscout } from "./NightscoutContext";

const TrendsContext = createContext<ReturnType<typeof useTrendsData> | null>(
  null,
);

export const TrendsProvider = ({ children }: { children: ReactNode }) => {
  const trendsData = useTrendsData();

  return (
    <TrendsContext.Provider value={trendsData}>
      {children}
    </TrendsContext.Provider>
  );
};

export const useTrends = () => {
  const ctx = useContext(TrendsContext);
  if (!ctx) throw new Error("useTrends must be used inside TrendsProvider");
  return ctx;
};
