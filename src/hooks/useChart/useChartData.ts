import { useMemo, useCallback } from "react";
import { Platform, Dimensions } from "react-native";
import {
  calculateGlucoseRange,
  getGlucoseColor,
  GLUCOSE_RANGES,
  isSpecialEvent,
  getEventTimeMs,
  EventPosition,
} from "../../utils/chartUtils/chartUtils";

const MAX_IOS = 4096;

interface UseChartDataProps {
  entries: any[];
  events: any[];
  timeFilter: "2h" | "12h" | "24h";
  shouldShowEvent: (event: any) => boolean;
  settings?: any;
}

export const useChartData = ({
  entries,
  events,
  timeFilter,
  shouldShowEvent,
  settings,
}: UseChartDataProps) => {
  const { width: screenWidth } = Dimensions.get("window");

  const getSpacingForTimeFilter = useCallback(() => {
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
  }, [timeFilter]);

  const displayEntries = useMemo(() => {
    if (Platform.OS !== "ios") return entries;

    const spacing = getSpacingForTimeFilter();
    const maxPoints = Math.floor(MAX_IOS / spacing);

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
  }, [entries, timeFilter, getSpacingForTimeFilter]);

  const glucoseRange = useMemo(
    () => calculateGlucoseRange(displayEntries),
    [displayEntries]
  );

  const chartWidth = useMemo(() => {
    if (displayEntries.length === 0) return screenWidth * 1.5;

    const spacing = getSpacingForTimeFilter();
    const calculatedWidth = 30 + displayEntries.length * spacing + 40;
    const minWidth = screenWidth * 1.5;

    const maxSafeWidth = Platform.select({
      ios: 4096,
      default: 10000,
    });

    return Math.min(Math.max(minWidth, calculatedWidth), maxSafeWidth);
  }, [displayEntries, screenWidth, timeFilter, getSpacingForTimeFilter]);

  const pointSpacing = useMemo(() => {
    if (displayEntries.length <= 1) return getSpacingForTimeFilter();
    return (chartWidth - 30 - 40) / displayEntries.length;
  }, [chartWidth, displayEntries.length, getSpacingForTimeFilter]);

  const filteredEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    return events.filter((event) => shouldShowEvent(event));
  }, [events, shouldShowEvent]);

  const calculateEventPositions = useCallback(
    (eventsToPosition: any[]): EventPosition[] => {
      if (displayEntries.length === 0 || eventsToPosition.length === 0)
        return [];

      const positions: EventPosition[] = [];

      for (const event of eventsToPosition) {
        const eventTime = getEventTimeMs(event);

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
    },
    [displayEntries, pointSpacing]
  );

  const calculateY = useCallback(
    (glucose: number) => {
      const range = glucoseRange.max - glucoseRange.min;
      if (range === 0) return 160;

      const normalized = (glucose - glucoseRange.min) / range;
      return 40 + (1 - normalized) * 240;
    },
    [glucoseRange]
  );

  const calculateInsulinPositions = useCallback(
    (insulinEvents: any[]): EventPosition[] => {
      if (displayEntries.length === 0 || insulinEvents.length === 0) return [];

      const positions: EventPosition[] = [];

      for (const event of insulinEvents) {
        const eventTime = getEventTimeMs(event);

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

        let yPosition = 80;
        const entryAtIndex = displayEntries[closestIndex];
        if (entryAtIndex) {
          const glucoseY = calculateY(entryAtIndex.sgv);
          yPosition = Math.max(60, Math.min(240, glucoseY - 20));
        }

        positions.push({
          ...event,
          svgX,
          chartIndex: closestIndex,
          displayTime: formatTimeShort(new Date(event.created_at)),
          iconX: svgX - 14,
          iconY: yPosition,
        });
      }

      return positions;
    },
    [displayEntries, pointSpacing, calculateY]
  );

  const calculateSpecialEventPositions = useCallback(
    (specialEvents: any[]): EventPosition[] => {
      if (displayEntries.length === 0 || specialEvents.length === 0) return [];

      const positions: EventPosition[] = [];

      for (const event of specialEvents) {
        const eventTime = getEventTimeMs(event);

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

        let yPosition = 35;
        const entryAtIndex = displayEntries[closestIndex];
        if (entryAtIndex) {
          const glucoseY = calculateY(entryAtIndex.sgv);
          yPosition = Math.max(60, Math.min(240, glucoseY - 20)) + 20;
        }

        positions.push({
          ...event,
          svgX,
          chartIndex: closestIndex,
          displayTime: formatTimeShort(new Date(event.created_at)),
          iconX: svgX - 12,
          iconY: yPosition,
        });
      }

      return positions;
    },
    [displayEntries, pointSpacing, calculateY]
  );

  const categorizedEvents = useMemo(() => {
    const regularEvents = filteredEvents.filter(
      (event) =>
        (event.type === "meal" || event.type === "activity") &&
        event.eventType !== "Meal Bolus"
    );

    const insulinEvents = filteredEvents.filter(
      (event) =>
        event.eventType?.includes("Bolus") || event.eventType === "Temp Basal"
    );

    const specialEvents = filteredEvents.filter(
      (event) =>
        isSpecialEvent(event) &&
        !event.eventType?.includes("Bolus") &&
        event.eventType !== "Temp Basal" &&
        event.type !== "meal" &&
        event.type !== "activity"
    );

    return {
      regularEvents: calculateEventPositions(regularEvents),
      insulinEvents: calculateInsulinPositions(insulinEvents),
      specialEvents: calculateSpecialEventPositions(specialEvents),
    };
  }, [filteredEvents, calculateEventPositions]);

  const yAxisLabels = useMemo(() => {
    const keyValues = [40, GLUCOSE_RANGES.LOW, 130, GLUCOSE_RANGES.HIGH, 250];
    const labels = new Set<number>();

    keyValues.forEach((value) => {
      const paddedMin = Math.min(glucoseRange.min, GLUCOSE_RANGES.LOW - 20);
      const paddedMax = Math.max(glucoseRange.max, GLUCOSE_RANGES.HIGH + 20);

      if (value >= paddedMin && value <= paddedMax) {
        labels.add(value);
      }
    });

    const range = glucoseRange.max - glucoseRange.min;
    if (labels.size < 3 && range > 0) {
      const step = Math.max(10, Math.round(range / 4));

      let start = Math.floor(glucoseRange.min / 10) * 10;
      start = Math.max(40, start);

      let current = start;
      while (current <= glucoseRange.max + step && labels.size < 5) {
        labels.add(current);
        current += step;
      }
    }

    return Array.from(labels)
      .sort((a, b) => a - b)
      .filter(
        (value, index, array) => index === 0 || value - array[index - 1] >= 15
      );
  }, [glucoseRange]);

  const referenceLines = useMemo(() => {
    if (!settings?.showReferenceLines) return [];

    const lines = [];

    if (
      GLUCOSE_RANGES.VERY_LOW >= glucoseRange.min - 20 &&
      GLUCOSE_RANGES.VERY_LOW <= glucoseRange.max + 20
    ) {
      lines.push({
        value: GLUCOSE_RANGES.VERY_LOW,
        color: getGlucoseColor(GLUCOSE_RANGES.VERY_LOW),
        label: `Very Low`,
      });
    }

    if (
      GLUCOSE_RANGES.LOW >= glucoseRange.min - 20 &&
      GLUCOSE_RANGES.LOW <= glucoseRange.max + 20
    ) {
      lines.push({
        value: GLUCOSE_RANGES.LOW,
        color: getGlucoseColor(GLUCOSE_RANGES.LOW),
        label: `Low`,
      });
    }

    if (
      GLUCOSE_RANGES.HIGH >= glucoseRange.min - 20 &&
      GLUCOSE_RANGES.HIGH <= glucoseRange.max + 20
    ) {
      lines.push({
        value: GLUCOSE_RANGES.HIGH,
        color: getGlucoseColor(GLUCOSE_RANGES.HIGH),
        label: `High`,
      });
    }

    const targetValue = Math.round(
      (GLUCOSE_RANGES.NORMAL_LOW + GLUCOSE_RANGES.NORMAL_HIGH) / 2
    );
    if (
      targetValue >= glucoseRange.min - 20 &&
      targetValue <= glucoseRange.max + 20
    ) {
      lines.push({
        value: targetValue,
        color: getGlucoseColor(targetValue),
        label: `Target`,
      });
    }

    if (
      GLUCOSE_RANGES.VERY_HIGH >= glucoseRange.min - 20 &&
      GLUCOSE_RANGES.VERY_HIGH <= glucoseRange.max + 20
    ) {
      lines.push({
        value: GLUCOSE_RANGES.VERY_HIGH,
        color: getGlucoseColor(GLUCOSE_RANGES.VERY_HIGH),
        label: `Very High`,
      });
    }

    return lines;
  }, [glucoseRange, settings?.showReferenceLines]);
  return {
    displayEntries,
    glucoseRange,
    chartWidth,
    pointSpacing,
    yAxisLabels,
    referenceLines,
    categorizedEvents,
    calculateY,
    calculateEventPositions,
  };
};

const formatTimeShort = (date: Date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};
