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

  const setAuthOrMessage = (err: any, fallback: string) => {
    if (err?.code === "AUTH_REQUIRED" || err?.message === "AUTH_REQUIRED") {
      setError("AUTH_REQUIRED");
      return;
    }
    setError(err?.message ?? fallback);
  };

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

      const safeEntries = Array.isArray(bundle.entries) ? bundle.entries : [];
      setEntries(safeEntries.filter((e: any) => Number(e?.date ?? 0) >= since));
      setMeals(Array.isArray(bundle.meals) ? bundle.meals : []);
      setActivities(Array.isArray(bundle.activities) ? bundle.activities : []);
      setOtherEntries(
        Array.isArray(bundle.otherTreatments) ? bundle.otherTreatments : [],
      );

      // for incremental: track newest date
      const newest = safeEntries.reduce(
        (best: any, cur: any) =>
          Number(cur?.date ?? 0) > Number(best?.date ?? 0) ? cur : best,
        safeEntries[0],
      );
      lastEntryDateRef.current = newest?.date ?? null;
    } catch (err: any) {
      setAuthOrMessage(err, "Failed to load Nightscout");
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

      if (Array.isArray(bundle.entries) && bundle.entries.length) {
        setEntries((prev) => {
          const existingIds = new Set(prev.map(getId));
          const diff = bundle.entries.filter(
            (e: any) => !existingIds.has(getId(e)),
          );
          if (diff.length > 0) {
            const newest = diff.reduce(
              (best: any, cur: any) =>
                Number(cur?.date ?? 0) > Number(best?.date ?? 0) ? cur : best,
              diff[0],
            );
            lastEntryDateRef.current = newest?.date ?? lastEntryDateRef.current;
          }
          return diff.length > 0 ? [...diff, ...prev] : prev;
        });
      }

      const mergeFront = <T>(prev: T[], incoming: T[]) => {
        const existing = new Set((prev as any[]).map(getId));
        const diff = (incoming as any[]).filter((x) => !existing.has(getId(x)));
        return diff.length > 0 ? ([...(diff as any), ...prev] as any) : prev;
      };

      if (Array.isArray(bundle.meals) && bundle.meals.length)
        setMeals((prev) => mergeFront(prev, bundle.meals!));
      if (Array.isArray(bundle.activities) && bundle.activities.length)
        setActivities((prev) => mergeFront(prev, bundle.activities!));
      if (
        Array.isArray(bundle.otherTreatments) &&
        bundle.otherTreatments.length
      )
        setOtherEntries((prev) => mergeFront(prev, bundle.otherTreatments!));
    } catch (err: any) {
      setAuthOrMessage(err, "Incremental update failed");
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

    // de-dupe within day as well
    const getId = (o: any) => o?._id ?? o?.id;
    const seen = new Set<string>();
    const day = (incomingDay ?? []).filter((x: any) => {
      const id = String(getId(x));
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    return [...day, ...keep];
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
        if (!Array.isArray(treatments)) return;

        const dayMeals = treatments.filter(
          (t: any) =>
            typeof t?.eventType === "string" &&
            t.eventType.startsWith("Meal:") &&
            new Date(t.created_at) >= startOfDay &&
            new Date(t.created_at) <= endOfDay,
        );

        const dayActivities = treatments.filter(
          (t: any) =>
            typeof t?.eventType === "string" &&
            t.eventType.startsWith("Activity:") &&
            new Date(t.created_at) >= startOfDay &&
            new Date(t.created_at) <= endOfDay,
        );

        const dayOther = treatments.filter(
          (t: any) =>
            typeof t?.eventType === "string" &&
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
        setAuthOrMessage(err, "Failed to fetch treatments");
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
