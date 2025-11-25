import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { fetchLast24h, fetchSince } from "../utils/fns";
import Constants from "expo-constants";

interface Entry {
  sgv: number;
  date: number;
  [key: string]: any;
}

interface NightscoutContextType {
  entries: Entry[];
  loadInitial: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  isLoading: boolean;
  reset: () => void;
  error: string | null;
}

const NightscoutContext = createContext<NightscoutContextType | null>(null);

export const NightscoutProvider = ({ children }: { children: ReactNode }) => {
  const CLOUD_FUNCTIONS_HOST = Constants.expoConfig?.extra?.cloudFunctionsHost;

  const { firebaseUser, userData } = useAuth();
  const nightscoutUrl = userData?.nightscoutUrl;
  const nightscoutSecret = userData?.nightscoutSecret;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [entries, setEntries] = useState<Entry[]>([]);

  const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  //TODO: FOR SOME WEIRD FYCKING READON IT STARTS FETCHING WHEN SOMEONE REGISTERS AND IS ON LOGIN PAGE

  const reset = useCallback(() => {
    setEntries([]);
    setLastTimestamp(null);
    setError(null);
    setIsLoading(false);
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const loadInitial = useCallback(async () => {
    if (!nightscoutUrl || !firebaseUser) return;

    setError(null);

    console.log("Current entries length:", entries.length);
    if (entries.length > 0) return;

    setIsLoading(true);
    console.log("Loading initial Nightscout data...");

    try {
      const data = await fetchLast24h(
        `https://${CLOUD_FUNCTIONS_HOST}/getLast24h?url=${nightscoutUrl}`,
        nightscoutSecret
      );
      setEntries(data);
      if (data.length > 0) setLastTimestamp(data[0].date);
    } catch (err: any) {
      setError(err.message || "Failed to fetch Nightscout data");
    } finally {
      setIsLoading(false);
    }
  }, [nightscoutUrl, nightscoutSecret]);

  const fetchUpdates = useCallback(async () => {
    if (!nightscoutUrl || !firebaseUser || !lastTimestamp) return;

    setError(null);

    console.log("Fetching new Nightscout updates...");

    try {
      const res = await fetchSince(
        `https://${CLOUD_FUNCTIONS_HOST}/getSince?url=${nightscoutUrl}`,
        lastTimestamp,
        nightscoutSecret ? nightscoutSecret : undefined
      );
      const newEntries: Entry[] = res;

      if (newEntries.length > 0) {
        setEntries((prev) => [...newEntries, ...prev]);
        setLastTimestamp(newEntries[0].date);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch Nightscout updates");
    }
  }, [nightscoutUrl, nightscoutSecret, lastTimestamp]);

  const startPolling = useCallback(() => {
    if (!nightscoutUrl || !firebaseUser) return;
    if (pollingRef.current) return; // already running

    console.log("Starting Nightscout polling...");

    pollingRef.current = setInterval(fetchUpdates, 5 * 60 * 1000);
    fetchUpdates(); // immediate refresh when entering Home
  }, [fetchUpdates]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      console.log("Stopping Nightscout polling...");
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  return (
    <NightscoutContext.Provider
      value={{
        entries,
        loadInitial,
        startPolling,
        stopPolling,
        isLoading,
        reset,
        error,
      }}
    >
      {children}
    </NightscoutContext.Provider>
  );
};

export const useNightscout = () => {
  const ctx = useContext(NightscoutContext);
  if (!ctx) throw new Error("useNightscout must be inside provider");
  return ctx;
};
