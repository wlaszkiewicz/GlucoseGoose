import {
  getMealIcon as getMealIconOriginal,
  extractNutritionFromMeal,
  getMealTypeFromEvent,
} from "../utils/meals";
import {
  getActivityIcon as getActivityIconOriginal,
  extractMetricsFromActivity,
  getActivityTypeFromEvent,
} from "../utils/activities";
import { getGlucoseColor, getGlucoseStatus } from "./glucoseUtils";
import { VintageColors } from "../themes/vintage/colors_vintage";

export {
  getMealIconFixed as getMealIcon,
  extractNutritionFromMeal,
  getMealTypeFromEvent,
  getActivityIconFixed as getActivityIcon,
  extractMetricsFromActivity,
  getActivityTypeFromEvent,
  getGlucoseColor,
  getGlucoseStatus,
};

export const PASTEL_COLORS = {
  // Meal colors
  mealBreakfast: "#FFD6E7",
  mealLunch: "#B5EAD7",
  mealDinner: "#C7CEEA",
  mealSnack: "#FFDAC1",
  mealOther: "#E2F0CB",

  // Activity colors
  activityWalking: "#B5EAD7",
  activityRunning: "#FFD6E7",
  activityTraining: "#C7CEEA",
  activitySports: "#FFB7B2",
  activityYoga: "#FFDAC1",
  activityOther: "#E2F0CB",

  // Insulin colors
  bolusSmall: "#FCB7B2FF",
  bolusMedium: "#FA8B94FF",
  bolusLarge: "#F9858DFF",

  // Basal colors
  basalReduced: "#AFCBFF",
  basalNormal: "#C7CEEA",
  basalIncreased: "#FFDAC1",

  // Target colors
  targetMeal: "#F9C9A9FF",
  targetActivity: "#B5EAD7",
  targetHypo: "#FFB7B2",
  targetCustom: "#E2F0CB",

  // Device colors
  deviceSite: "#C7CEEA",
  deviceSensor: "#B5EAD7",
  devicePump: "#FFD6E7",

  // Other colors
  note: "#D8D8D8",
  announcement: "#EC9279FF",
  other: "#E2F0CB",
};

export const getEventCategory = (event: any): string => {
  const eventType = event.eventType?.toLowerCase() || "";
  const type = event.type?.toLowerCase() || "";

  if (
    eventType.includes("meal bolus") ||
    eventType.includes("correction bolus") ||
    eventType.includes("bolus")
  ) {
    return "insulin";
  }

  if (eventType.includes("temp basal")) return "basal";
  if (eventType.includes("temp target") || eventType.includes("target"))
    return "target";

  if (type === "meal" && !eventType.includes("bolus")) return "meal";
  if (type === "activity") return "activity";

  if (
    eventType.includes("site") ||
    eventType.includes("sensor") ||
    eventType.includes("pump")
  )
    return "device";
  if (eventType.includes("note") || eventType.includes("comment"))
    return "note";
  if (type === "other") return "other";

  return "unknown";
};

export const getEventColor = (type: string, eventType: string = ""): string => {
  if (eventType === "Meal Bolus" || eventType === "Correction Bolus") {
    return getInsulinColor(eventType);
  }

  if (eventType === "Temp Basal") {
    return getInsulinColor(eventType);
  }

  switch (type) {
    case "meal":
      const mealType = eventType?.replace("Meal: ", "") || "";
      switch (mealType) {
        case "Breakfast":
        case "Morning Snack":
          return PASTEL_COLORS.mealBreakfast;
        case "Lunch":
        case "Team Sports":
          return PASTEL_COLORS.mealLunch;
        case "Dinner":
        case "Weight Training":
          return PASTEL_COLORS.mealDinner;
        case "Afternoon Snack":
        case "Evening Snack":
        case "Dancing":
          return PASTEL_COLORS.mealSnack;
        case "Other":
        default:
          return PASTEL_COLORS.mealOther;
      }
    case "activity":
      const activityType =
        eventType?.replace(/^(Activity|Exercise):?\s*/i, "") || "";
      switch (activityType) {
        case "Walking":
        case "Hiking":
          return PASTEL_COLORS.activityWalking;
        case "Running":
        case "Dancing":
          return PASTEL_COLORS.activityRunning;
        case "Weight Training":
          return PASTEL_COLORS.activityTraining;
        case "Swimming":
        case "Team Sports":
          return PASTEL_COLORS.activitySports;
        case "Yoga":
          return PASTEL_COLORS.activityYoga;
        case "Other":
        default:
          return PASTEL_COLORS.activityOther;
      }
    case "other":
      if (eventType?.toLowerCase().includes("temp target")) {
        return getTargetColor(eventType);
      }
      if (eventType?.toLowerCase().includes("site")) {
        return PASTEL_COLORS.deviceSite;
      }
      if (eventType?.toLowerCase().includes("sensor")) {
        return PASTEL_COLORS.deviceSensor;
      }
      if (eventType?.toLowerCase().includes("pump")) {
        return PASTEL_COLORS.devicePump;
      }
      if (eventType?.toLowerCase().includes("note")) {
        return PASTEL_COLORS.note;
      }
      if (eventType?.toLowerCase().includes("announcement")) {
        return PASTEL_COLORS.announcement;
      }

    default:
      return PASTEL_COLORS.other;
  }
};

export const getCategoryIcon = (category: string): string => {
  switch (category) {
    case "meal":
      return "fast-food";
    case "activity":
      return "bicycle";
    case "insulin":
      return "water";
    case "basal":
      return "timer";
    case "target":
      return "target";
    case "device":
      return "bandage";
    case "note":
      return "document-text";
    case "other":
      return "medical";
    default:
      return "help-circle";
  }
};

export const getInsulinColor = (
  eventType: string,
  percent?: number,
  insulin?: number
): string => {
  if (eventType === "Temp Basal") {
    if (percent === undefined) return PASTEL_COLORS.basalNormal;

    if (percent < -50) return "#8CB3E3"; // Deeper blue for strong reduction
    if (percent < 0) return PASTEL_COLORS.basalReduced;
    if (percent > 50) return "#FFB347"; // Orange for strong increase
    if (percent > 0) return PASTEL_COLORS.basalIncreased;
    return PASTEL_COLORS.basalNormal;
  }

  if (eventType.includes("Bolus")) {
    if (insulin && insulin > 3) return "#FF8C94";
    if (insulin && insulin > 1) return PASTEL_COLORS.bolusMedium;
    if (insulin && insulin > 0.5) return PASTEL_COLORS.bolusSmall;
    return "#FFE5E0"; // Very light coral for tiny bolus
  }

  return PASTEL_COLORS.other;
};

export const getTargetColor = (reason: string): string => {
  const reasonLower = reason?.toLowerCase() || "";
  if (reasonLower.includes("meal") || reasonLower.includes("pre-meal")) {
    return PASTEL_COLORS.targetMeal;
  }
  if (reasonLower.includes("activity") || reasonLower.includes("exercise")) {
    return PASTEL_COLORS.targetActivity;
  }
  if (reasonLower.includes("low") || reasonLower.includes("hypo")) {
    return PASTEL_COLORS.targetHypo;
  }
  return PASTEL_COLORS.targetCustom;
};

export const getCategoryDisplayName = (category: string): string => {
  switch (category) {
    case "meal":
      return "Meals";
    case "activity":
      return "Activities";
    case "insulin":
      return "Insulin";
    case "basal":
      return "Temp Basals";
    case "target":
      return "Targets";
    case "device":
      return "Device Events";
    case "note":
      return "Notes";
    case "other":
      return "Other Events";
    default:
      return "Unknown";
  }
};

// Update the shouldShowEvent function to use showOtherEvents:

export const shouldShowEvent = (event: any, settings: any): boolean => {
  const category = getEventCategory(event);

  switch (category) {
    case "meal":
      return settings.showMeals;
    case "activity":
      return settings.showActivities;
    case "insulin":
      return settings.showInsulin;
    case "basal":
      return settings.showTempBasals;
    case "target":
      return settings.showTargets;
    case "device":
      return settings.showDeviceEvents;
    case "note":
      return settings.showNotes;
    case "other":
      return settings.showOtherEvents;
    default:
      return settings.showOtherEvents;
  }
};

export const getVisibleLegendItems = (
  events: any[],
  settings: any
): string[] => {
  const categories = new Set<string>();

  events.forEach((event) => {
    const category = getEventCategory(event);
    categories.add(category);
  });

  return Array.from(categories).filter((category) => {
    switch (category) {
      case "meal":
        return settings.showMeals;
      case "activity":
        return settings.showActivities;
      case "insulin":
        return settings.showInsulin;
      case "basal":
        return settings.showTempBasals;
      case "target":
        return settings.showTargets;
      case "device":
        return settings.showDeviceEvents;
      case "note":
        return settings.showNotes;
      case "other":
        return true;
      default:
        return false;
    }
  });
};

export const getMealIconFixed = (mealType: string) => {
  try {
    const mealTypeEnum = getMealTypeFromEvent(mealType);
    return getMealIconOriginal(mealTypeEnum);
  } catch {
    return "nutrition";
  }
};

export const getActivityIconFixed = (activityType: string) => {
  try {
    const activityTypeEnum = getActivityTypeFromEvent(activityType);
    return getActivityIconOriginal(activityTypeEnum);
  } catch {
    return "fitness-outline";
  }
};

export const getInsulinIcon = (eventType: string, insulin?: number): string => {
  if (eventType === "Correction Bolus") {
    return "water";
  }
  if (eventType === "Meal Bolus") {
    return "fast-food";
  }
  if (eventType === "Temp Basal") {
    return "timer";
  }
  return "medical";
};

export const getTargetIcon = (reason: string): string => {
  switch (reason?.toLowerCase()) {
    case "meal soon":
    case "pre-meal":
      return "food-variant";
    case "activity":
    case "exercise":
      return "run";
    case "low":
    case "hypo":
      return "exclamation";
    case "custom":
    default:
      return "target";
  }
};

export const getSpecialEventIcon = (eventType: string): string => {
  const type = eventType?.toLowerCase() || "";

  if (type.includes("temp target") || type.includes("temporary target")) {
    return "target";
  }
  if (type.includes("temp basal")) {
    return "timer-star-outline";
  }
  if (type.includes("correction bolus")) {
    return "water";
  }
  if (type.includes("meal bolus")) {
    return "food";
  }
  if (type.includes("note") || type.includes("comment")) {
    return "file-document-alert";
  }
  if (type.includes("site change")) {
    return "bandage";
  }
  if (type.includes("sensor insert") || type.includes("sensor change")) {
    return "signal-cellular-2";
  }
  if (type.includes("announcement")) {
    return "bullhorn";
  }
  return "medical";
};

export const isSpecialEvent = (event: any): boolean => {
  const eventType = event.eventType?.toLowerCase() || "";
  const category = getEventCategory(event);

  return category !== "meal" && category !== "activity";
};

export const formatTargetValue = (event: any): string => {
  if (!event.eventType?.toLowerCase().includes("target")) return "";

  if (event.targetBottom && event.targetTop) {
    if (event.targetBottom === event.targetTop) {
      return `${event.targetBottom} mg/dL`;
    }
    return `${event.targetBottom}-${event.targetTop} mg/dL`;
  }

  if (event.targetBottom) {
    return `${event.targetBottom} mg/dL`;
  }

  if (event.targetTop) {
    return `${event.targetTop} mg/dL`;
  }

  return "";
};

export const formatInsulinValue = (insulin?: number): string => {
  if (!insulin || insulin <= 0) return "";
  return `${insulin.toFixed(1)}U`;
};

export const formatTempBasalValue = (
  rate?: number,
  percent?: number
): string => {
  if (!rate && rate !== 0) return "";

  let text = `${rate.toFixed(1)}U/h`;
  if (percent !== undefined) {
    text += ` (${percent > 0 ? "+" : ""}${percent}%)`;
  }
  return text;
};

export const filterEntriesByTime = (
  entries: any[],
  timeFilter: "2h" | "12h" | "24h"
) => {
  const now = Date.now();
  const hours = timeFilter === "2h" ? 2 : timeFilter === "12h" ? 12 : 24;
  const cutoff = now - hours * 60 * 60 * 1000;

  return entries
    .filter(
      (entry) =>
        entry.date >= cutoff &&
        typeof entry.sgv === "number" &&
        !isNaN(entry.sgv)
    )
    .sort((a, b) => a.date - b.date);
};

export const filterEventsByTime = (
  meals: any[],
  activities: any[],
  otherEntries: any[],
  timeFilter: "2h" | "12h" | "24h"
) => {
  const now = Date.now();
  const hours = timeFilter === "2h" ? 2 : timeFilter === "12h" ? 12 : 24;
  const cutoff = now - hours * 60 * 60 * 1000;

  const allEvents = [
    ...(meals || []).map((m) => ({ ...m, type: "meal" as const })),
    ...(activities || []).map((a) => ({ ...a, type: "activity" as const })),
    ...(otherEntries || []).map((o) => ({ ...o, type: "other" as const })),
  ];

  return allEvents
    .filter((event) => new Date(event.created_at).getTime() >= cutoff)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
};

export const calculateGlucoseRange = (entries: any[]) => {
  if (entries.length === 0) return { min: 70, max: 180 };

  const values = entries.map((entry) => entry.sgv);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const displayMin = Math.min(40, min, 70);
  const displayMax = Math.max(250, max, 180);

  const roundedMin = Math.floor(displayMin / 10) * 10;
  const roundedMax = Math.ceil(displayMax / 10) * 10;

  return { min: roundedMin, max: roundedMax };
};

export const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const formatTimeShort = (date: Date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};
