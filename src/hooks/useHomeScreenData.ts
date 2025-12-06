import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNightscout } from "../context/NightscoutContext";
import { filterEntriesByTime, filterEventsByTime } from "../utils/chartUtils";

export const useHomeScreenData = () => {
  const { userData } = useAuth();
  const nightscoutUrl = userData?.nightscoutUrl;
  const {
    entries,
    meals,
    activities,
    loadFullDay,
    startPolling,
    stopPolling,
    isLoading,
    error,
    otherEntries,
  } = useNightscout();

  const [timeFilter, setTimeFilter] = useState<"2h" | "12h" | "24h">("24h");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    if (!nightscoutUrl) return;

    (async () => {
      setIsRefreshing(true);
      try {
        await loadFullDay();
        setDataLoaded(true);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setIsRefreshing(false);
        startPolling();
      }
    })();

    return () => stopPolling();
  }, [nightscoutUrl]);

  const filteredEntries = useMemo(() => {
    if (!dataLoaded || entries.length === 0) return [];
    return filterEntriesByTime(entries, timeFilter);
  }, [entries, timeFilter, dataLoaded]);

  const filteredEvents = useMemo(() => {
    if (!dataLoaded) return [];
    return filterEventsByTime(
      meals,
      activities,
      otherEntries ?? [],
      timeFilter
    );
  }, [meals, activities, otherEntries, timeFilter, dataLoaded]);

  const handleTimeFilterChange = (filter: "2h" | "12h" | "24h") => {
    setTimeFilter(filter);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadFullDay();
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEventPress = (event: any) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  return {
    filteredEntries,
    filteredEvents,
    timeFilter,
    isLoading,
    isRefreshing,
    error,
    showEventModal,
    selectedEvent,
    handleTimeFilterChange,
    handleRefresh,
    handleEventPress,
    setShowEventModal,
  };
};
