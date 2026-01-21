import React, { createContext, useContext, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useNightscoutData } from "../hooks/useNightscoutData";

const NightscoutContext = createContext<ReturnType<
  typeof useNightscoutData
> | null>(null);

export const NightscoutProvider = ({ children }: { children: ReactNode }) => {
  const { userData } = useAuth();
  const nsUrl = userData?.nightscoutUrl;
  const secret = userData?.nightscoutSecret;

  const data = useNightscoutData(nsUrl, secret);
  return (
    <NightscoutContext.Provider value={data}>
      {children}
    </NightscoutContext.Provider>
  );
};

export const useNightscout = () => {
  const ctx = useContext(NightscoutContext);
  if (!ctx) throw new Error("useNightscout must be used inside provider");
  return ctx;
};
