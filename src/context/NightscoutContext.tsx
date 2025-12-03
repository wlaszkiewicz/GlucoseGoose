import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import Constants from "expo-constants";
import { useAuth } from "./AuthContext";
import { fetchBundle } from "../utils/cloud_functions";
import {
  NightscoutEntry,
  NightscoutTreatment,
  NightscoutBundleResponse,
} from "../types/nightscout";

interface NightscoutContextType {
  entries: NightscoutEntry[];
  meals: NightscoutTreatment[];
  activities: NightscoutTreatment[];
  loadFullDay: () => Promise<void>;
  fetchIncremental: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  reset: () => void;
  isLoading: boolean;
  error: string | null;
  otherEntries?: NightscoutTreatment[];
}

const NightscoutContext = createContext<NightscoutContextType | null>(null);

export const NightscoutProvider = ({ children }: { children: ReactNode }) => {
  const CLOUD = Constants.expoConfig?.extra?.cloudFunctionsHost;

  const { firebaseUser, userData } = useAuth();
  const nightscoutUrl = userData?.nightscoutUrl;
  const secret = userData?.nightscoutSecret;

  const [entries, setEntries] = useState<NightscoutEntry[]>([]);
  const [meals, setMeals] = useState<NightscoutTreatment[]>([]);
  const [activities, setActivities] = useState<NightscoutTreatment[]>([]);
  const [otherEntries, setOtherEntries] = useState<NightscoutTreatment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastEntryDateRef = useRef<number | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    setEntries([]);
    setMeals([]);
    setActivities([]);
    setOtherEntries([]);
    lastEntryDateRef.current = null;
    setError(null);
    setIsLoading(false);

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const loadFullDay = useCallback(async () => {
    if (!firebaseUser || !nightscoutUrl) return;

    console.log("Loading full day of Nightscout data...");

    setIsLoading(true);
    setError(null);

    try {
      const bundle = await fetchBundle(
        CLOUD,
        nightscoutUrl,
        secret ?? "",
        1440 // last 24h
      );

      const since = Date.now() - 1440 * 60 * 1000;

      setEntries(bundle.entries.filter((e) => e.date >= since));
      setMeals(bundle.meals ?? []);
      setActivities(bundle.activities ?? []);
      const otherTreatments = bundle.treatments.filter(
        (t) =>
          !t.eventType.includes("Meal") && !t.eventType.includes("Activity")
      );
      setOtherEntries(otherTreatments);

      lastEntryDateRef.current = bundle.entries[0]?.date ?? null;
    } catch (err: any) {
      setError(err.message ?? "Failed to load Nightscout");
    } finally {
      setIsLoading(false);
    }
  }, [CLOUD, firebaseUser, nightscoutUrl, secret]);

  const fetchIncremental = useCallback(async () => {
    if (!firebaseUser || !nightscoutUrl) return;
    if (!lastEntryDateRef.current) return;

    const now = Date.now();
    const last = lastEntryDateRef.current;

    const minutesToFetch = Math.ceil((now - last) / 1000 / 60);
    if (minutesToFetch <= 0) return;

    try {
      const bundle = await fetchBundle(
        CLOUD,
        nightscoutUrl,
        secret ?? "",
        minutesToFetch
      );

      const newEntries = bundle.entries;
      const newMeals = bundle.meals ?? [];
      const newActivities = bundle.activities ?? [];
      const newOtherEntries = bundle.treatments.filter(
        (t) =>
          !t.eventType.includes("Meal") && !t.eventType.includes("Activity")
      );

      const getId = (o: any) => o?._id ?? o?.id;

      if (newEntries.length > 0) {
        setEntries((prev) => {
          const existingIds = new Set(prev.map(getId));
          const diff = newEntries.filter((e) => !existingIds.has(getId(e)));

          if (diff.length > 0) {
            lastEntryDateRef.current = diff[0].date;
            return [...diff, ...prev];
          }

          return prev;
        });
      }

      if (newMeals.length > 0) {
        setMeals((prev) => {
          const existing = new Set(prev.map(getId));
          const diff = newMeals.filter((m) => !existing.has(getId(m)));
          return diff.length > 0 ? [...diff, ...prev] : prev;
        });
      }

      if (newActivities.length > 0) {
        setActivities((prev) => {
          const existing = new Set(prev.map(getId));
          const diff = newActivities.filter((a) => !existing.has(getId(a)));
          return diff.length > 0 ? [...diff, ...prev] : prev;
        });
      }
      if (newOtherEntries.length > 0) {
        setOtherEntries((prev) => {
          const existing = new Set(prev.map(getId));
          const diff = newOtherEntries.filter((o) => !existing.has(getId(o)));
          return diff.length > 0 ? [...diff, ...prev] : prev;
        });
      }
    } catch (err: any) {
      setError(err.message ?? "Incremental update failed");
    }
  }, [CLOUD, firebaseUser, nightscoutUrl, secret]);

  const startPolling = useCallback(() => {
    if (!firebaseUser || !nightscoutUrl) return;

    console.log("Starting Nightscout polling...");
    if (pollingRef.current) return;

    pollingRef.current = setInterval(fetchIncremental, 5 * 60 * 1000);

    fetchIncremental();
  }, [firebaseUser, nightscoutUrl, fetchIncremental]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
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
        loadFullDay,
        fetchIncremental,
        startPolling,
        stopPolling,
        reset,
        isLoading,
        error,
        otherEntries,
      }}
    >
      {children}
    </NightscoutContext.Provider>
  );
};

export const useNightscout = () => {
  const ctx = useContext(NightscoutContext);
  if (!ctx) throw new Error("useNightscout must be used inside provider");
  return ctx;
};
