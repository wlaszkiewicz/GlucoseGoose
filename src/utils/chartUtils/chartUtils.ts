export {
  getGlucoseColor,
  getGlucoseStatus,
  GLUCOSE_RANGES,
} from "./glucoseUtils";

export {
  getEventCategory,
  getEventColor,
  getCategoryDisplayName,
  CHART_COLORS,
  getInsulinColor,
  getCategoryColor,
  getTargetColor,
  isSpecialEvent,
  getColorExplanation,
  getEventDisplayName,
} from "./eventCategorization";
export {
  getMealIconFixed as getMealIcon,
  getActivityIconFixed as getActivityIcon,
  getInsulinIcon,
  getTargetIcon,
  getSpecialEventIcon,
  getEventIcon,
} from "./eventIcons";

export { EventCategory, EventPosition } from "../../types/chart";

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
    .filter((event) => getEventTimeMs(event) >= cutoff)
    .sort(
      (a, b) =>
        getEventTimeMs(a) - getEventTimeMs(b)
    );
};

export const getEventTimeMs = (event: any): number => {
  const candidates = [
    event?.created_at,
    event?.createdAt,
    event?.timestamp,
    event?.date,
    event?.sysTime,
  ];

  for (const value of candidates) {
    if (typeof value === "number" && !isNaN(value)) return value;
    if (typeof value === "string") {
      const parsed = new Date(value).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    if (value instanceof Date) {
      const parsed = value.getTime();
      if (!isNaN(parsed)) return parsed;
    }
  }

  return 0;
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
