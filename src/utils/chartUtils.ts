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

export const getMealIconFixed = (mealType: string) => {
  try {
    const mealTypeEnum = getMealTypeFromEvent(mealType);
    return getMealIconOriginal(mealTypeEnum);
  } catch {
    return "nutrition"; // default icon
  }
};

export const getActivityIconFixed = (activityType: string) => {
  try {
    const activityTypeEnum = getActivityTypeFromEvent(activityType);
    return getActivityIconOriginal(activityTypeEnum);
  } catch {
    return "fitness-outline"; // default icon
  }
};

export const filterEntriesByTime = (
  entries: any[],
  timeFilter: "2h" | "12h" | "24h"
) => {
  const now = Date.now();
  const hours = timeFilter === "2h" ? 2 : timeFilter === "12h" ? 12 : 24;
  const cutoff = now - hours * 60 * 60 * 1000;

  console.log(
    `Filtering entries for the last ${hours} hours, cutoff: ${new Date(
      cutoff
    ).toISOString()}`
  );
  console.log(`Total entries before filtering: ${entries.length}`);
  console.log(
    `Entries after filtering: ${
      entries.filter((entry) => entry.date >= cutoff).length
    }`
  );

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
export const getEventColor = (type: string, eventType: string = "") => {
  switch (type) {
    case "meal":
      const mealType = eventType?.replace("Meal: ", "") || "";
      switch (mealType) {
        case "Breakfast":
        case "Evening Snack":
          return "#F48FB1";
        case "Morning Snack":
        case "Other":
          return "#FFB74D";
        case "Lunch":
        case "Team Sports":
          return "#64B5F6";
        case "Afternoon Snack":
        case "Dancing":
          return "#BA68C8";
        case "Dinner":
        case "Weight Training":
          return "#81C784";
        default:
          return VintageColors.primaryText;
      }
    case "activity":
      const activityType =
        eventType?.replace(/^(Activity|Exercise):?\s*/i, "") || "";
      switch (activityType) {
        case "Walking":
        case "Hiking":
          return "#81C784";
        case "Running":
        case "Dancing":
          return "#F48FB1";
        case "Weight Training":
          return "#64B5F6";
        case "Swimming":
        case "Team Sports":
          return "#BA68C8";
        case "Yoga":
        case "Other":
          return "#FFB74D";
        default:
          return VintageColors.secondaryText;
      }
    case "other":
      return "#FF8A65";
    default:
      return VintageColors.primaryText;
  }
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
