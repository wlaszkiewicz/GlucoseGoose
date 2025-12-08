import { Platform } from "react-native";

export const getSpacingForTimeFilter = (timeFilter: "2h" | "12h" | "24h") => {
  switch (timeFilter) {
    case "2h":
      return Platform.select({ ios: 25, default: 25 });
    case "12h":
      return Platform.select({ ios: 20, default: 20 });
    case "24h":
      return Platform.select({ ios: 15, default: 15 });
    default:
      return Platform.select({ ios: 20, default: 20 });
  }
};

export const reduceEntriesForIOS = (
  entries: any[],
  timeFilter: "2h" | "12h" | "24h",
  maxIOS: number = 4096
) => {
  if (Platform.OS !== "ios") return entries;

  const spacing = getSpacingForTimeFilter(timeFilter);
  const maxPoints = Math.floor(maxIOS / spacing);

  if (entries.length > maxPoints) {
    const reductionFactor = Math.ceil(entries.length / maxPoints);
    const reduced: any[] = [];

    reduced.push(entries[0]);

    for (let i = reductionFactor; i < entries.length; i += reductionFactor) {
      if (i < entries.length - 1) {
        reduced.push(entries[i]);
      }
    }

    reduced.push(entries[entries.length - 1]);

    return reduced;
  }

  return entries;
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

export const formatTimeShort = (date: Date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const categorizeEvents = (eventPositions: any[]) => {
  const regularEvents = eventPositions.filter(
    (event) =>
      (event.type === "meal" || event.type === "activity") &&
      event.eventType !== "Meal Bolus"
  );

  const insulinEvents = eventPositions.filter(
    (event) =>
      event.eventType?.includes("Bolus") || event.eventType === "Temp Basal"
  );

  const specialEvents = eventPositions.filter((event) => {
    const isSpecial =
      event.eventType?.includes("Bolus") ||
      event.eventType === "Temp Basal" ||
      event.eventType?.toLowerCase().includes("target") ||
      event.eventType?.toLowerCase().includes("site") ||
      event.eventType?.toLowerCase().includes("sensor") ||
      event.eventType?.toLowerCase().includes("note");

    return isSpecial && event.type !== "meal" && event.type !== "activity";
  });

  return { regularEvents, insulinEvents, specialEvents };
};

export const calculateEventPositions = (
  filteredEvents: any[],
  displayEntries: any[],
  pointSpacing: number
) => {
  if (displayEntries.length === 0 || filteredEvents.length === 0) return [];

  const positions = [];

  for (const event of filteredEvents) {
    const eventTime = new Date(event.created_at).getTime();

    let closestIndex = 0;
    let minDiff = Math.abs(displayEntries[0].date - eventTime);

    for (let i = 1; i < displayEntries.length; i++) {
      const diff = Math.abs(displayEntries[i].date - eventTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    const svgX = 30 + closestIndex * pointSpacing;

    positions.push({
      ...event,
      svgX,
      chartIndex: closestIndex,
      displayTime: formatTimeShort(new Date(event.created_at)),
      iconX: svgX - 16,
    });
  }

  return positions;
};
