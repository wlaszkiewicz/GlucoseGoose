import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ChartSettings {
  showMeals: boolean;
  showActivities: boolean;
  showInsulin: boolean;
  showTempBasals: boolean;
  showTargets: boolean;
  showDeviceEvents: boolean;
  showNotes: boolean;
  showReferenceLines: boolean;
  showTimeLabels: boolean;
  showGlucosePoints: boolean;
}

const DEFAULT_SETTINGS: ChartSettings = {
  showMeals: true,
  showActivities: true,
  showInsulin: true,
  showTempBasals: true,
  showTargets: true,
  showDeviceEvents: true,
  showNotes: true,
  showReferenceLines: true,
  showTimeLabels: true,
  showGlucosePoints: true,
};

const STORAGE_KEY = "@GlucoseGoose_chart_settings";

export const useChartSettings = () => {
  const [settings, setSettings] = useState<ChartSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error("Error loading chart settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: ChartSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Error saving chart settings:", error);
    }
  };

  const updateSettings = (newSettings: ChartSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const resetSettings = () => {
    updateSettings(DEFAULT_SETTINGS);
  };

  const shouldShowEvent = (event: any): boolean => {
    if (!event) return false;

    const eventType = event.eventType?.toLowerCase() || "";
    const type = event.type?.toLowerCase() || "";

    // Check meal events
    if (type === "meal" && eventType.includes("meal")) {
      return settings.showMeals;
    }

    // Check activity events
    if (type === "activity" || eventType.includes("exercise")) {
      return settings.showActivities;
    }

    // Check insulin events
    if (eventType.includes("bolus")) {
      return settings.showInsulin;
    }

    // Check temp basal events
    if (eventType.includes("temp basal")) {
      return settings.showTempBasals;
    }

    // Check target events
    if (eventType.includes("target")) {
      return settings.showTargets;
    }

    // Check device events
    if (
      eventType.includes("site") ||
      eventType.includes("sensor") ||
      eventType.includes("pump")
    ) {
      return settings.showDeviceEvents;
    }

    // Check notes/comments
    if (eventType.includes("note") || eventType.includes("comment")) {
      return settings.showNotes;
    }

    return true;
  };

  return {
    settings,
    updateSettings,
    resetSettings,
    shouldShowEvent,
    isLoading,
  };
};
