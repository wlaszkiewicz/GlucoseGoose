import { VintageColors } from "../themes/vintage/colors";

import { NightscoutEntry } from "../types/nightscout";

export interface TrendMetrics {
  dailyAverage: number;
  dailyStdDev: number;
  dailyCV: number;
  timeInRanges: {
    veryLow: number;
    low: number;
    target: number;
    high: number;
    veryHigh: number;
  };
  averageByHour: Record<number, number>;
  trendsByPeriod: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  gmi: number;
  dataQuality: {
    completeness: number;
    gaps: number;
    totalReadings: number;
    expectedReadings: number;
  };
}

export interface AggregatedData {
  date: string;
  dateObj: Date;
  average: number;
  min: number;
  max: number;
  timeInRange: number;
  readings: number;
  readingsPercentage: number;
}

const TARGET_RANGE = { min: 70, max: 180 };
const VERY_LOW = 54;
const LOW = 69;
const HIGH = 181;
const VERY_HIGH = 250;

// utils/trendCalculations.ts - Updated calculateTrends function
export const calculateTrends = (
  entries: NightscoutEntry[],
  daysBack: number = 7,
): {
  metrics: TrendMetrics;
  aggregatedData: AggregatedData[];
  hourlyAverages: Record<number, number>;
} => {
  if (!entries.length) {
    return {
      metrics: getEmptyMetrics(),
      aggregatedData: [],
      hourlyAverages: {},
    };
  }

  const validEntries = entries.filter((e) => e.sgv && e.date);

  // Group by date
  const entriesByDate = validEntries.reduce(
    (acc, entry) => {
      const date = new Date(entry.date);
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(entry);
      return acc;
    },
    {} as Record<string, NightscoutEntry[]>,
  );

  // Calculate aggregated data for each day
  const aggregatedData: AggregatedData[] = Object.entries(entriesByDate)
    .map(([dateKey, dayEntries]) => {
      const glucoseValues = dayEntries.map((e) => e.sgv);
      const average = Math.round(
        glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length,
      );
      const min = Math.min(...glucoseValues);
      const max = Math.max(...glucoseValues);

      const inRangeCount = dayEntries.filter(
        (e) => e.sgv >= TARGET_RANGE.min && e.sgv <= TARGET_RANGE.max,
      ).length;
      const timeInRange = Math.round((inRangeCount / dayEntries.length) * 100);

      return {
        date: dateKey,
        dateObj: new Date(dateKey),
        average,
        min,
        max,
        timeInRange,
        readings: dayEntries.length,
        readingsPercentage: Math.round((dayEntries.length / (24 * 6)) * 100),
      };
    })
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
    .slice(-daysBack); // Last N days

  // Get the date range we're actually analyzing (from aggregatedData, not from all entries)
  const analysisStartDate =
    aggregatedData.length > 0 ? aggregatedData[0].dateObj : new Date();
  const analysisEndDate =
    aggregatedData.length > 0
      ? aggregatedData[aggregatedData.length - 1].dateObj
      : new Date();

  // Calculate actual days in the analyzed period
  const analyzedDays = Math.max(1, aggregatedData.length);

  // Calculate expected readings based on analyzed days, not data span
  const expectedReadingsPerDay = 24 * 6; // 5-min intervals = 288 readings/day
  const expectedReadings = analyzedDays * expectedReadingsPerDay;
  const totalReadings = validEntries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= analysisStartDate && entryDate <= analysisEndDate;
  }).length;

  // Calculate completeness more accurately
  const completeness = Math.min(
    100,
    Math.round((totalReadings / expectedReadings) * 1000) / 10,
  );

  // ... rest of the hourly averages calculation stays the same
  const hourlyAverages: Record<number, number> = {};
  for (let hour = 0; hour < 24; hour++) {
    const hourEntries = validEntries.filter((e) => {
      const date = new Date(e.date);
      return date.getHours() === hour;
    });
    if (hourEntries.length > 0) {
      hourlyAverages[hour] = Math.round(
        hourEntries.reduce((sum, e) => sum + e.sgv, 0) / hourEntries.length,
      );
    }
  }

  // Calculate overall metrics (using only entries in the analyzed period)
  const entriesInPeriod = validEntries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= analysisStartDate && entryDate <= analysisEndDate;
  });

  const allGlucoseValues = entriesInPeriod.map((e) => e.sgv);
  const dailyAverage = Math.round(
    allGlucoseValues.reduce((a, b) => a + b, 0) / allGlucoseValues.length,
  );

  const variance =
    allGlucoseValues.reduce(
      (sum, value) => sum + Math.pow(value - dailyAverage, 2),
      0,
    ) / allGlucoseValues.length;
  const dailyStdDev = Math.round(Math.sqrt(variance));
  const dailyCV = Math.round((dailyStdDev / dailyAverage) * 1000) / 10; // 1 decimal place

  // Time in ranges (using entries in period)
  const veryLowCount = entriesInPeriod.filter((e) => e.sgv < VERY_LOW).length;
  const lowCount = entriesInPeriod.filter(
    (e) => e.sgv >= VERY_LOW && e.sgv <= LOW,
  ).length;
  const targetCount = entriesInPeriod.filter(
    (e) => e.sgv > LOW && e.sgv < HIGH,
  ).length;
  const highCount = entriesInPeriod.filter(
    (e) => e.sgv >= HIGH && e.sgv <= VERY_HIGH,
  ).length;
  const veryHighCount = entriesInPeriod.filter((e) => e.sgv > VERY_HIGH).length;

  // Trends by period
  const trendsByPeriod = {
    morning: calculatePeriodAverage(entriesInPeriod, 6, 12),
    afternoon: calculatePeriodAverage(entriesInPeriod, 12, 18),
    evening: calculatePeriodAverage(entriesInPeriod, 18, 24),
    night: calculatePeriodAverage(entriesInPeriod, 0, 6),
  };

  // GMI
  const gmi = 3.31 + 0.02392 * dailyAverage;

  // Calculate gaps (consecutive missing readings > 30 minutes)
  let gaps = 0;
  const sortedEntries = [...entriesInPeriod].sort((a, b) => a.date - b.date);
  for (let i = 1; i < sortedEntries.length; i++) {
    const timeDiff =
      (sortedEntries[i].date - sortedEntries[i - 1].date) / (1000 * 60); // minutes
    if (timeDiff > 30) {
      gaps++;
    }
  }

  const metrics: TrendMetrics = {
    dailyAverage,
    dailyStdDev,
    dailyCV,
    timeInRanges: {
      veryLow: Math.round((veryLowCount / totalReadings) * 1000) / 10,
      low: Math.round((lowCount / totalReadings) * 1000) / 10,
      target: Math.round((targetCount / totalReadings) * 1000) / 10,
      high: Math.round((highCount / totalReadings) * 1000) / 10,
      veryHigh: Math.round((veryHighCount / totalReadings) * 1000) / 10,
    },
    averageByHour: hourlyAverages,
    trendsByPeriod,
    gmi: Math.round(gmi * 10) / 10,
    dataQuality: {
      completeness: Math.max(0, Math.min(100, completeness)),
      gaps,
      totalReadings,
      expectedReadings,
    },
  };

  return {
    metrics,
    aggregatedData,
    hourlyAverages,
  };
};

export const getDataQualityInterpretation = (
  completeness: number,
): {
  level: "excellent" | "good" | "fair" | "poor";
  description: string;
  color: string;
} => {
  if (completeness >= 90) {
    return {
      level: "excellent",
      description: "Excellent data coverage",
      color: VintageColors.glucoseBorderInRange, // Green
    };
  } else if (completeness >= 70) {
    return {
      level: "good",
      description: "Good data coverage",
      color: VintageColors.formAccent3, // Your accent color
    };
  } else if (completeness >= 50) {
    return {
      level: "fair",
      description: "Moderate data gaps",
      color: VintageColors.formAccent4, // Yellow
    };
  } else {
    return {
      level: "poor",
      description: "Significant missing data",
      color: VintageColors.glucoseBorderHigh, // Red/orange
    };
  }
};

function calculatePeriodAverage(
  entries: NightscoutEntry[],
  startHour: number,
  endHour: number,
): number {
  const periodEntries = entries.filter((e) => {
    const hour = new Date(e.date).getHours();
    return hour >= startHour && hour < endHour;
  });

  if (periodEntries.length === 0) return 0;

  return Math.round(
    periodEntries.reduce((sum, e) => sum + e.sgv, 0) / periodEntries.length,
  );
}

function getEmptyMetrics(): TrendMetrics {
  return {
    dailyAverage: 0,
    dailyStdDev: 0,
    dailyCV: 0,
    timeInRanges: {
      veryLow: 0,
      low: 0,
      target: 0,
      high: 0,
      veryHigh: 0,
    },
    averageByHour: {},
    trendsByPeriod: {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    },
    gmi: 0,
    dataQuality: {
      completeness: 0,
      gaps: 0,
      totalReadings: 0,
      expectedReadings: 0,
    },
  };
}
