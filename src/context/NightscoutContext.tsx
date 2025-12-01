import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { fetchBundle } from "../utils/fns";
import Constants from "expo-constants";
import { NightscoutEntry, NightscoutTreatment } from "../types/nightscout";

interface NightscoutContextType {
  entries: NightscoutEntry[];
  meals: NightscoutTreatment[];
  activities: NightscoutTreatment[];
  loadInitial: () => Promise<void>;
  startPolling: () => void;
  fetchUpdates: () => Promise<void>;
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

  const [entries, setEntries] = useState<NightscoutEntry[]>([]);
  const [meals, setMeals] = useState<NightscoutTreatment[]>([]);
  const [activities, setActivities] = useState<NightscoutTreatment[]>([]);

  const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  //TODO: FOR SOME WEIRD FYCKING READON IT STARTS FETCHING WHEN SOMEONE REGISTERS AND IS ON LOGIN PAGE ????????
  // idk why tho xd - prob cuz context is loaded at app start and userData gets set when registering so the effect triggers?? but why tho
  // honestly we can just leave it idc atp

  const reset = useCallback(() => {
    setEntries([]);
    setMeals([]);
    setActivities([]);
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

    if (entries.length > 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchBundle(
        CLOUD_FUNCTIONS_HOST,
        nightscoutUrl,
        nightscoutSecret,
        1440 // last 24 hours
      );

      setEntries(data.entries);
      setMeals(data.meals || []);
      setActivities(data.activities || []);
      setLastTimestamp(data.entries[0]?.date ?? null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [nightscoutUrl, nightscoutSecret, firebaseUser, entries.length]);

  const fetchUpdates = useCallback(async () => {
    if (!nightscoutUrl || !firebaseUser || !lastTimestamp) return;

    try {
      const data = await fetchBundle(
        CLOUD_FUNCTIONS_HOST,
        nightscoutUrl,
        nightscoutSecret,
        5 // 5 minutes
      );

      const newEntries = data.entries;
      const newMeals = data.meals || [];
      const newActivities = data.activities || [];

      const getId = (item: any) => item?.id ?? item?._id;

      if (newEntries.length > 0) {
        setEntries((prev) => {
          const existingIds = new Set(prev.map(getId));
          const filtered = newEntries.filter((e) => !existingIds.has(getId(e)));
          if (filtered.length === 0) return prev;
          setLastTimestamp(filtered[0]?.date ?? lastTimestamp);
          return [...filtered, ...prev];
        });
      }

      if (newMeals.length > 0) {
        setMeals((prev) => {
          const existingIds = new Set(prev.map(getId));
          const filtered = newMeals.filter((m) => !existingIds.has(getId(m)));
          if (filtered.length === 0) return prev;
          return [...filtered, ...prev];
        });
      }

      if (newActivities.length > 0) {
        setActivities((prev) => {
          const existingIds = new Set(prev.map(getId));
          const filtered = newActivities.filter(
            (a) => !existingIds.has(getId(a))
          );
          if (filtered.length === 0) return prev;
          return [...filtered, ...prev];
        });
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [nightscoutUrl, nightscoutSecret, lastTimestamp, firebaseUser]);

  const startPolling = useCallback(() => {
    if (!nightscoutUrl || !firebaseUser) return;
    if (pollingRef.current) return;

    console.log("Starting Nightscout polling...");

    pollingRef.current = setInterval(fetchUpdates, 5 * 60 * 1000);
    fetchUpdates();
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
        meals,
        activities,
        loadInitial,
        startPolling,
        stopPolling,
        fetchUpdates,
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
