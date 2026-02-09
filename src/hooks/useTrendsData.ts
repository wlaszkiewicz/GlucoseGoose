// hooks/useTrendsData.ts
import { useState, useCallback, useEffect } from "react";
import { fetchBundle } from "../utils/cloudFunctions";
import { NightscoutEntry } from "../types/nightscout";
import {
  calculateTrends,
  AggregatedData,
  TrendMetrics,
} from "../utils/trendCalculations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";

export type TimeRange = "3d" | "1w" | "2w" | "1m" | "3m" | "custom";

export interface TrendDataCache {
  entries: NightscoutEntry[];
  metrics: TrendMetrics;
  aggregatedData: AggregatedData[];
  hourlyAverages: Record<number, number>;
  timestamp: number;
  timeRange: TimeRange;
  customRange?: { start: number; end: number };
}

interface LargeDataWarningState {
  visible: boolean;
  title: string;
  message: string;
  rangeToFetch?: TimeRange;
  customRangeToFetch?: { start: number; end: number };
}

export function useTrendsData() {
  // Get Nightscout URL and secret from auth context
  const { userData } = useAuth();
  const nsUrl = userData?.nightscoutUrl;
  const secret = userData?.nightscoutSecret;

  const [entries, setEntries] = useState<NightscoutEntry[]>([]);
  const [metrics, setMetrics] = useState<TrendMetrics | null>(null);
  const [aggregatedData, setAggregatedData] = useState<AggregatedData[]>([]);
  const [hourlyAverages, setHourlyAverages] = useState<Record<number, number>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("1w");
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  // Track previous time range for cancel functionality
  const [previousTimeRange, setPreviousTimeRange] = useState<TimeRange>("1w");

  // State for the custom modal
  const [largeDataWarning, setLargeDataWarning] =
    useState<LargeDataWarningState>({
      visible: false,
      title: "",
      message: "",
    });

  useEffect(() => {
    if (nsUrl && error === "No Nightscout URL configured") {
      setError(null);
    }
  }, [nsUrl, error]);

  const getCacheKey = useCallback(
    (range: TimeRange, custom?: { start: number; end: number }) => {
      if (range === "custom" && custom) {
        return `trends_cache_${range}_${custom.start}_${custom.end}`;
      }
      return `trends_cache_${range}`;
    },
    [],
  );

  const loadFromCache = useCallback(
    async (range: TimeRange, custom?: { start: number; end: number }) => {
      try {
        const key = getCacheKey(range, custom);
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const data: TrendDataCache = JSON.parse(cached);
          // Cache valid for 1 hour
          if (Date.now() - data.timestamp < 60 * 60 * 1000) {
            setEntries(data.entries);
            setMetrics(data.metrics);
            setAggregatedData(data.aggregatedData);
            setHourlyAverages(data.hourlyAverages);
            return true;
          }
        }
      } catch (err) {
        console.warn("Failed to load from cache:", err);
      }
      return false;
    },
    [getCacheKey],
  );

  const saveToCache = useCallback(
    async (
      range: TimeRange,
      data: Omit<TrendDataCache, "timestamp" | "timeRange">,
      custom?: { start: number; end: number },
    ) => {
      try {
        const key = getCacheKey(range, custom);
        const cacheData: TrendDataCache = {
          ...data,
          timestamp: Date.now(),
          timeRange: range,
          customRange: custom,
        };
        await AsyncStorage.setItem(key, JSON.stringify(cacheData));
      } catch (err) {
        console.warn("Failed to save to cache:", err);
      }
    },
    [getCacheKey],
  );

  const calculateMinutesToFetch = useCallback((range: TimeRange): number => {
    switch (range) {
      case "3d":
        return 4320; // 3 days
      case "1w":
        return 10080; // 7 days
      case "2w":
        return 20160; // 14 days
      case "1m":
        return 43200; // 30 days
      case "3m":
        return 129600; // 90 days
      default:
        return 10080; // default to 1 week
    }
  }, []);

  const analyzeData = useCallback(
    (entries: NightscoutEntry[], range: TimeRange) => {
      setIsAnalyzing(true);
      try {
        let daysBack = 7;
        switch (range) {
          case "3d":
            daysBack = 3;
            break;
          case "1w":
            daysBack = 7;
            break;
          case "2w":
            daysBack = 14;
            break;
          case "1m":
            daysBack = 30;
            break;
          case "3m":
            daysBack = 90;
            break;
          case "custom":
            daysBack =
              customStartDate && customEndDate
                ? Math.ceil(
                    (customEndDate.getTime() - customStartDate.getTime()) /
                      (1000 * 60 * 60 * 24),
                  )
                : 7;
            break;
        }

        const trends = calculateTrends(entries, daysBack);
        setMetrics(trends.metrics);
        setAggregatedData(trends.aggregatedData);
        setHourlyAverages(trends.hourlyAverages);
        return trends;
      } catch (err) {
        setError("Failed to analyze data");
        console.error(err);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [customStartDate, customEndDate],
  );

  const performFetch = useCallback(
    async (range: TimeRange, customRange?: { start: number; end: number }) => {
      if (!nsUrl) {
        setError("No Nightscout URL configured. Please set it in Settings.");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const minutesToFetch =
          range === "custom" && customRange
            ? Math.ceil((customRange.end - customRange.start) / (1000 * 60))
            : calculateMinutesToFetch(range);

        const bundle = await fetchBundle(nsUrl, secret ?? "", minutesToFetch);
        const safeEntries = Array.isArray(bundle.entries) ? bundle.entries : [];

        // Filter by custom range if provided
        let filteredEntries = safeEntries;
        if (range === "custom" && customRange) {
          filteredEntries = safeEntries.filter(
            (e: any) =>
              e?.date >= customRange.start && e?.date <= customRange.end,
          );
        }

        setEntries(filteredEntries);

        // Analyze and cache
        const trends = analyzeData(filteredEntries, range);
        if (trends) {
          await saveToCache(
            range,
            {
              entries: filteredEntries,
              metrics: trends.metrics,
              aggregatedData: trends.aggregatedData,
              hourlyAverages: trends.hourlyAverages,
            },
            customRange,
          );
        }
      } catch (err: any) {
        setError(err?.message ?? "Failed to fetch trends data");
        console.error("Trends fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [nsUrl, secret, calculateMinutesToFetch, analyzeData, saveToCache],
  );

  const fetchTrendsData = useCallback(
    async (
      range: TimeRange = "1w",
      customRange?: { start: number; end: number },
    ) => {
      if (!nsUrl) {
        setError("No Nightscout URL configured. Please set it in Settings.");
        return;
      }

      // Try loading from cache first
      const cached = await loadFromCache(range, customRange);
      if (cached) {
        console.log("Loaded trends from cache");
        return;
      }

      // Show warning for large data fetches
      const minutesToFetch =
        range === "custom" && customRange
          ? Math.ceil((customRange.end - customRange.start) / (1000 * 60))
          : calculateMinutesToFetch(range);

      if (minutesToFetch > 10080) {
        const days = Math.round(minutesToFetch / 1440);
        setLargeDataWarning({
          visible: true,
          title: "Large Data Range",
          message: `You are fetching ${days} days of data which may take some time. Do you want to proceed?`,
          rangeToFetch: range,
          customRangeToFetch: customRange,
        });
        return;
      }

      // If not large data, proceed directly
      performFetch(range, customRange);
    },
    [nsUrl, loadFromCache, calculateMinutesToFetch, performFetch],
  );

  // Handle modal confirm
  const handleConfirmLargeFetch = useCallback(() => {
    const { rangeToFetch, customRangeToFetch } = largeDataWarning;
    if (rangeToFetch) {
      performFetch(rangeToFetch, customRangeToFetch);
    }
    setLargeDataWarning({ visible: false, title: "", message: "" });
  }, [largeDataWarning, performFetch]);

  // Handle modal cancel - revert to previous time range
  const handleCancelLargeFetch = useCallback(() => {
    // Revert to previous time range
    setTimeRange(previousTimeRange);

    // Fetch with previous time range if it's not the same as what we were trying to fetch
    if (previousTimeRange !== largeDataWarning.rangeToFetch) {
      if (previousTimeRange !== "custom") {
        fetchTrendsData(previousTimeRange);
      } else if (customStartDate && customEndDate) {
        fetchTrendsData("custom", {
          start: customStartDate.getTime(),
          end: customEndDate.getTime(),
        });
      }
    }

    setLargeDataWarning({ visible: false, title: "", message: "" });
  }, [
    previousTimeRange,
    largeDataWarning,
    fetchTrendsData,
    customStartDate,
    customEndDate,
  ]);

  // Load initial data
  useEffect(() => {
    fetchTrendsData("1w");
  }, [fetchTrendsData]);

  const refreshData = useCallback(() => {
    if (timeRange === "custom" && customStartDate && customEndDate) {
      fetchTrendsData("custom", {
        start: customStartDate.getTime(),
        end: customEndDate.getTime(),
      });
    } else {
      fetchTrendsData(timeRange);
    }
  }, [fetchTrendsData, timeRange, customStartDate, customEndDate]);

  const setRange = useCallback(
    (range: TimeRange) => {
      // Save current time range as previous before changing
      setPreviousTimeRange(timeRange);
      setTimeRange(range);
      if (range !== "custom") {
        fetchTrendsData(range);
      }
    },
    [fetchTrendsData, timeRange],
  );

  const setCustomRange = useCallback(
    (start: Date, end: Date) => {
      // Save current time range as previous before changing
      setPreviousTimeRange(timeRange);
      setCustomStartDate(start);
      setCustomEndDate(end);
      setTimeRange("custom");
      fetchTrendsData("custom", {
        start: start.getTime(),
        end: end.getTime(),
      });
    },
    [fetchTrendsData, timeRange],
  );

  const clearCache = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const trendKeys = keys.filter((key) => key.startsWith("trends_cache_"));
      await AsyncStorage.multiRemove(trendKeys);
      console.log("Cleared trends cache");
    } catch (err) {
      console.error("Failed to clear cache:", err);
    }
  }, []);

  return {
    entries,
    metrics,
    aggregatedData,
    hourlyAverages,
    isLoading,
    isAnalyzing,
    error,
    timeRange,
    customStartDate,
    customEndDate,
    fetchTrendsData,
    refreshData,
    setRange,
    setCustomRange,
    clearCache,
    largeDataWarning,
    handleConfirmLargeFetch,
    handleCancelLargeFetch,
  };
}
