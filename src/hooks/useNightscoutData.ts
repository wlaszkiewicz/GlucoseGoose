import { useCallback, useRef, useState } from "react";
import { fetchBundle, fetchTreatmentsDate } from "../utils/cloudFunctions";
import { NightscoutEntry, NightscoutTreatment } from "../types/nightscout";

export function useNightscoutData(nsUrl?: string, secret?: string) {
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
    if (!nsUrl) return;

    setIsLoading(true);
    setError(null);

    try {
      const bundle = await fetchBundle(nsUrl, secret ?? "", 1440);
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
  }, [nsUrl, secret]);

  const fetchIncremental = useCallback(async () => {
    if (!nsUrl) return;
    if (!lastEntryDateRef.current) return;

    const now = Date.now();
    const last = lastEntryDateRef.current;

    let minutesToFetch = Math.ceil((now - last) / 1000 / 60);
    if (minutesToFetch <= 5) return;
    if (minutesToFetch > 1440) minutesToFetch = 1440;

    try {
      const bundle = await fetchBundle(nsUrl, secret ?? "", minutesToFetch);

      const getId = (o: any) => o?._id ?? o?.id;

      if (bundle.entries?.length) {
        setEntries((prev) => {
          const existingIds = new Set(prev.map(getId));
          const diff = bundle.entries.filter((e) => !existingIds.has(getId(e)));
          if (diff.length > 0) lastEntryDateRef.current = diff[0].date;
          return diff.length > 0 ? [...diff, ...prev] : prev;
        });
      }

      const mergeFront = <T>(prev: T[], incoming: T[]) => {
        const existing = new Set((prev as any[]).map(getId));
        const diff = (incoming as any[]).filter((x) => !existing.has(getId(x)));
        return diff.length > 0 ? [...(diff as any), ...prev] : prev;
      };

      if (bundle.meals?.length)
        setMeals((prev) => mergeFront(prev, bundle.meals!));
      if (bundle.activities?.length)
        setActivities((prev) => mergeFront(prev, bundle.activities!));
      if (bundle.otherTreatments?.length)
        setOtherEntries((prev) => mergeFront(prev, bundle.otherTreatments!));
    } catch (err: any) {
      setError(err.message ?? "Incremental update failed");
    }
  }, [nsUrl, secret]);

  const startPolling = useCallback(() => {
    if (!nsUrl) return;
    if (pollingRef.current) return;

    pollingRef.current = setInterval(fetchIncremental, 5 * 60 * 1000);
    fetchIncremental();
  }, [nsUrl, fetchIncremental]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const mergeDayById = <
    T extends { _id?: string; id?: string; created_at: string },
  >(
    prev: T[],
    incomingDay: T[],
    startOfDay: Date,
    endOfDay: Date,
  ) => {
    const keep = prev.filter((item) => {
      const d = new Date(item.created_at);
      return d < startOfDay || d > endOfDay;
    });
    return [...incomingDay, ...keep];
  };

  const fetchTreatments = useCallback(
    async (date: Date) => {
      if (!nsUrl) return;

      setIsLoading(true);
      setError(null);

      try {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const treatments = await fetchTreatmentsDate(nsUrl, secret ?? "", date);

        if (!treatments) {
          setIsLoading(false);
          return;
        }

        const dayMeals = treatments?.filter(
          (t) =>
            t.eventType.startsWith("Meal:") &&
            new Date(t.created_at) >= startOfDay &&
            new Date(t.created_at) <= endOfDay,
        );

        const dayActivities = treatments?.filter(
          (t) =>
            t.eventType.startsWith("Activity:") &&
            new Date(t.created_at) >= startOfDay &&
            new Date(t.created_at) <= endOfDay,
        );

        const dayOther = treatments?.filter(
          (t) =>
            !t.eventType.startsWith("Meal:") &&
            !t.eventType.startsWith("Activity:") &&
            new Date(t.created_at) >= startOfDay &&
            new Date(t.created_at) <= endOfDay,
        );

        setMeals((prev) => mergeDayById(prev, dayMeals, startOfDay, endOfDay));
        setActivities((prev) =>
          mergeDayById(prev, dayActivities, startOfDay, endOfDay),
        );
        setOtherEntries((prev) =>
          mergeDayById(prev, dayOther, startOfDay, endOfDay),
        );
      } catch (err: any) {
        setError(err.message ?? "Failed to fetch treatments");
      } finally {
        setIsLoading(false);
      }
    },
    [nsUrl, secret],
  );

  return {
    entries,
    meals,
    activities,
    otherEntries,
    isLoading,
    error,
    loadFullDay,
    fetchIncremental,
    startPolling,
    stopPolling,
    fetchTreatments,
    reset,
  };
}
