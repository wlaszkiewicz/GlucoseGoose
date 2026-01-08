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
import { fetchBundle, fetchTreatmentsDate } from "../utils/cloudFunctions";
import { NightscoutEntry, NightscoutTreatment } from "../types/nightscout";

interface NightscoutContextType {
  entries: NightscoutEntry[];
  meals: NightscoutTreatment[];
  activities: NightscoutTreatment[];
  loadFullDay: () => Promise<void>;
  fetchIncremental: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  fetchTreatments: (date: Date) => Promise<void>;
  reset: () => void;
  isLoading: boolean;
  error: string | null;
  otherEntries?: NightscoutTreatment[];
}

const NightscoutContext = createContext<NightscoutContextType | null>(null);

export const NightscoutProvider = ({ children }: { children: ReactNode }) => {
  const { userData } = useAuth();
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
    if (!nightscoutUrl) return;

    console.log("Loading full day of Nightscout data...");

    setIsLoading(true);
    setError(null);

    try {
      const bundle = await fetchBundle(
        nightscoutUrl,
        secret ?? "",
        1440 // last 24h,
      );

      const since = Date.now() - 1440 * 60 * 1000;

      setEntries(bundle.entries.filter((e) => e.date >= since));
      setMeals(bundle.meals ?? []);
      setActivities(bundle.activities ?? []);
      setOtherEntries(bundle.otherTreatments ?? []);

      lastEntryDateRef.current = bundle.entries[0]?.date ?? null;
    } catch (err: any) {
      setError(err.message ?? "Failed to load Nightscout");
    } finally {
      setIsLoading(false);
    }
  }, [nightscoutUrl, secret]);

  const fetchIncremental = useCallback(async () => {
    if (!nightscoutUrl) return;
    if (!lastEntryDateRef.current) return; // no last date to compare to

    const now = Date.now();
    const last = lastEntryDateRef.current;

    let minutesToFetch = Math.ceil((now - last) / 1000 / 60);
    if (minutesToFetch <= 5) return; // don't fetch if less than 5 minutes have passed

    if (minutesToFetch > 1440) {
      minutesToFetch = 1440; // cap at 24 hours so it doesn't get too large
    }

    try {
      const bundle = await fetchBundle(
        nightscoutUrl,
        secret ?? "",
        minutesToFetch
      );

      const newEntries = bundle.entries;
      const newMeals = bundle.meals ?? [];
      const newActivities = bundle.activities ?? [];
      const newOtherEntries = bundle.otherTreatments ?? [];

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
  }, [nightscoutUrl, secret]);

  const startPolling = useCallback(() => {
    if (!nightscoutUrl) return;

    console.log("Starting Nightscout polling...");
    if (pollingRef.current) return;

    pollingRef.current = setInterval(fetchIncremental, 5 * 60 * 1000);

    fetchIncremental();
  }, [nightscoutUrl, fetchIncremental]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const mergeDayById = <
    T extends { _id?: string; id?: string; created_at: string }
  >(
    prev: T[],
    incomingDay: T[],
    startOfDay: Date,
    endOfDay: Date
  ) => {
    const getId = (o: any) => o?._id ?? o?.id;

    const keep = prev.filter((item) => {
      const d = new Date(item.created_at);
      return d < startOfDay || d > endOfDay;
    });

    return [...incomingDay, ...keep];
  };

  const fetchTreatments = useCallback(
    async (date: Date) => {
      if (!nightscoutUrl) return;

      setIsLoading(true);
      setError(null);

      try {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const treatments = await fetchTreatmentsDate(
          nightscoutUrl,
          secret ?? "",
          date
        );

        const dayMeals = treatments.filter(
          (t) =>
            t.eventType.startsWith("Meal:") &&
            new Date(t.created_at) >= startOfDay &&
            new Date(t.created_at) <= endOfDay
        );

        const dayActivities = treatments.filter(
          (t) =>
            t.eventType.startsWith("Activity:") &&
            new Date(t.created_at) >= startOfDay &&
            new Date(t.created_at) <= endOfDay
        );

        const dayOther = treatments.filter(
          (t) =>
            !t.eventType.startsWith("Meal:") &&
            !t.eventType.startsWith("Activity:") &&
            new Date(t.created_at) >= startOfDay &&
            new Date(t.created_at) <= endOfDay
        );

        setMeals((prev) => mergeDayById(prev, dayMeals, startOfDay, endOfDay));

        setActivities((prev) =>
          mergeDayById(prev, dayActivities, startOfDay, endOfDay)
        );

        setOtherEntries((prev) =>
          mergeDayById(prev, dayOther, startOfDay, endOfDay)
        );
      } catch (err: any) {
        setError(err.message ?? "Failed to fetch treatments");
      } finally {
        setIsLoading(false);
      }
    },
    [nightscoutUrl, secret]
  );

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
        fetchTreatments,
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
