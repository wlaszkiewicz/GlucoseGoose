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
}

const NightscoutContext = createContext<NightscoutContextType | null>(null);

export const NightscoutProvider = ({ children }: { children: ReactNode }) => {
  const { userData } = useAuth();
  const nightscoutUrl = userData?.nightscoutUrl;
  const nightscoutSecret = userData?.nightscoutSecret;
  const [isLoading, setIsLoading] = useState(false);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const loadInitial = useCallback(async () => {
    if (!nightscoutUrl) return;

    if (entries.length > 0) return; // already loaded
    setIsLoading(true);
    console.log("Loading initial Nightscout data...");

    const res = await fetchLast24h(
      `https://us-central1-glucose-goose.cloudfunctions.net/getLast24h?url=${nightscoutUrl}`,
      nightscoutSecret ? nightscoutSecret : undefined
    );
    const data: Entry[] = await res;

    setEntries(data);
    if (data.length > 0) setLastTimestamp(data[0].date);
    setIsLoading(false);
  }, [nightscoutUrl, nightscoutSecret, entries.length]);

  const fetchUpdates = useCallback(async () => {
    if (!nightscoutUrl || !lastTimestamp) return;

    console.log("Fetching new Nightscout updates...");

    const res = await fetchSince(
      `https://us-central1-glucose-goose.cloudfunctions.net/getSince?url=${nightscoutUrl}`,
      lastTimestamp,
      nightscoutSecret ? nightscoutSecret : undefined
    );
    const newEntries: Entry[] = await res;

    if (newEntries.length > 0) {
      setEntries((prev) => [...newEntries, ...prev]);
      setLastTimestamp(newEntries[0].date);
    }
  }, [nightscoutUrl, nightscoutSecret, lastTimestamp]);

  const startPolling = useCallback(() => {
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
