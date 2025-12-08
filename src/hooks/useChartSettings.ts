import { useState, useCallback } from "react";

interface ChartSettings {
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
  showOtherEvents: boolean;
}

const defaultSettings: ChartSettings = {
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
  showOtherEvents: true,
};

export const shouldShowEvent = (
  event: any,
  settings: ChartSettings
): boolean => {
  const eventType = event.eventType?.toLowerCase() || "";
  const type = event.type?.toLowerCase() || "";

  if (
    eventType.includes("meal bolus") ||
    eventType.includes("correction bolus") ||
    eventType.includes("bolus")
  ) {
    return settings.showInsulin;
  }

  if (eventType.includes("temp basal")) {
    return settings.showTempBasals;
  }

  if (eventType.includes("temp target") || eventType.includes("target")) {
    return settings.showTargets;
  }

  if (type === "meal" && !eventType.includes("bolus")) {
    return settings.showMeals;
  }

  if (type === "activity") {
    return settings.showActivities;
  }

  if (
    eventType.includes("site") ||
    eventType.includes("sensor") ||
    eventType.includes("pump")
  ) {
    return settings.showDeviceEvents;
  }

  if (eventType.includes("note") || eventType.includes("comment")) {
    return settings.showNotes;
  }

  return settings.showOtherEvents;
};

export const useChartSettings = () => {
  const [settings, setSettings] = useState<ChartSettings>(defaultSettings);

  const updateSettings = useCallback((newSettings: ChartSettings) => {
    setSettings(newSettings);
  }, []);

  const shouldShowEventCallback = useCallback(
    (event: any) => shouldShowEvent(event, settings),
    [settings]
  );

  return {
    settings,
    updateSettings,
    shouldShowEvent: shouldShowEventCallback,
  };
};
