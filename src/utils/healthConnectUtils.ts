import { ActivityType, MealType } from "../types/events";
import {
  calculateCaloriesBurned,
  type UserProfile,
} from "../utils/journalUtils/calorieCalculations";

export const inferActivityType = (
  exerciseTypeRaw?: string | number,
  titleRaw?: string,
): ActivityType => {
  if (typeof exerciseTypeRaw === "number") {
    switch (exerciseTypeRaw) {
      case 79: // WALKING
        return "Walking";
      case 8: // BIKING
      case 9: // BIKING_STATIONARY
        return "Cycling";
      case 56: // RUNNING
      case 57: // RUNNING_TREADMILL
        return "Running";
      case 73: // SWIMMING_OPEN_WATER
      case 74: // SWIMMING_POOL
        return "Swimming";
      case 83: // YOGA
        return "Yoga";
      case 70: // STRENGTH_TRAINING
      case 81: // WEIGHTLIFTING
        return "Weight Training";
      case 37: // HIKING
        return "Hiking";
      case 16: // DANCING
        return "Dancing";
      case 5: // BASKETBALL
      case 64: // SOCCER
      case 78: // VOLLEYBALL
      case 28: // FOOTBALL_AMERICAN
      case 29: // FOOTBALL_AUSTRALIAN
      case 35: // HANDBALL
        return "Team Sports";
      default:
        break;
    }
  }

  const combined = `${exerciseTypeRaw ?? ""} ${titleRaw ?? ""}`.toLowerCase();

  if (combined.includes("run")) return "Running";
  if (combined.includes("walk")) return "Walking";
  if (
    combined.includes("cycle") ||
    combined.includes("bike") ||
    combined.includes("biking")
  )
    return "Cycling";
  if (combined.includes("swim")) return "Swimming";
  if (combined.includes("yoga")) return "Yoga";
  if (
    combined.includes("weight") ||
    combined.includes("strength") ||
    combined.includes("lifting") ||
    combined.includes("gym")
  )
    return "Weight Training";
  if (combined.includes("hike")) return "Hiking";
  if (combined.includes("dance")) return "Dancing";
  if (
    combined.includes("team") ||
    combined.includes("soccer") ||
    combined.includes("football") ||
    combined.includes("basketball") ||
    combined.includes("volleyball")
  )
    return "Team Sports";
  return "Other";
};

export const getEnergyKcal = (energy: any): number => {
  if (energy == null) return 0;
  if (typeof energy === "number" && !isNaN(energy)) return energy;

  if (typeof energy === "object") {
    const kcal =
      energy.inKilocalories ??
      energy.inCalories ??
      energy.kilocalories ??
      energy.calories;
    if (typeof kcal === "number" && !isNaN(kcal)) return kcal;

    if (typeof energy.value === "number" && typeof energy.unit === "string") {
      const value = energy.value;
      switch (energy.unit) {
        case "kilocalories":
        case "calories":
          return value;
        case "kilojoules":
          return value * 0.239005736; // kJ -> kcal
        case "joules":
          return value * 0.000239005736; // J -> kcal
        default:
          return value;
      }
    }
  }

  return 0;
};

export const getMassGrams = (mass: any): number => {
  if (mass == null) return 0;
  if (typeof mass === "number" && !isNaN(mass)) return mass;

  if (typeof mass === "object") {
    const grams =
      mass.inGrams ??
      mass.grams ??
      (typeof mass.value === "number" && mass.unit === "grams"
        ? mass.value
        : undefined);
    if (typeof grams === "number" && !isNaN(grams)) return grams;

    if (typeof mass.value === "number" && typeof mass.unit === "string") {
      const value = mass.value;
      switch (mass.unit) {
        case "kilograms":
          return value * 1000;
        case "milligrams":
          return value / 1000;
        case "micrograms":
          return value / 1_000_000;
        case "ounces":
          return value * 28.3495;
        case "pounds":
          return value * 453.592;
        default:
          return value;
      }
    }
  }

  return 0;
};

export const getMealTypeFromHealthConnect = (
  mealTypeRaw: any,
  startTime?: string,
): MealType => {
  const mealTypeNumber =
    typeof mealTypeRaw === "number" ? mealTypeRaw : Number(mealTypeRaw);

  if (mealTypeNumber === 1) return "Breakfast";
  if (mealTypeNumber === 2) return "Lunch";
  if (mealTypeNumber === 3) return "Dinner";
  if (mealTypeNumber === 4) {
    if (startTime) {
      const hour = new Date(startTime).getHours();
      if (hour < 12) return "Morning Snack";
      if (hour < 18) return "Afternoon Snack";
      return "Evening Snack";
    }
    return "Afternoon Snack";
  }

  if (startTime) {
    const hour = new Date(startTime).getHours();
    if (hour < 10) return "Breakfast";
    if (hour < 15) return "Lunch";
    if (hour < 20) return "Dinner";
  }

  return "Lunch";
};

export const getRecordTimeRangeMs = (record: any): {
  startMs: number;
  endMs: number;
} => {
  const parseTime = (value: any): number => {
    if (typeof value === "number" && !isNaN(value)) return value;
    if (typeof value === "string") {
      const parsed = new Date(value).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    if (value instanceof Date) {
      const parsed = value.getTime();
      if (!isNaN(parsed)) return parsed;
    }
    return 0;
  };

  const startMs = parseTime(
    record?.startTime ??
      record?.startTimeMillis ??
      record?.time ??
      record?.metadata?.lastModifiedTime,
  );
  const endMs = parseTime(
    record?.endTime ??
      record?.endTimeMillis ??
      record?.time ??
      record?.metadata?.lastModifiedTime,
  );
  return { startMs, endMs };
};

export const roundNutrition = (value: number, decimals = 1): number => {
  if (!value || isNaN(value)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

export const getNutritionRecordTime = (record: any): Date => {
  const { startMs, endMs } = getRecordTimeRangeMs(record);
  const fallbackMs = (() => {
    const candidate = record?.metadata?.lastModifiedTime;
    const parsed =
      typeof candidate === "string" ? new Date(candidate).getTime() : 0;
    return !isNaN(parsed) && parsed > 0 ? parsed : 0;
  })();

  const chosenMs = startMs || endMs || fallbackMs || Date.now();
  const date = new Date(chosenMs);

  const clampToBucket = (input: Date) => {
    const hour = input.getHours();
    const bucketHour =
      hour < 9
        ? 8
        : hour < 12
        ? 10
        : hour < 15
        ? 13
        : hour < 18
        ? 16
        : hour < 21
        ? 19
        : 21;
    const clamped = new Date(input);
    clamped.setHours(bucketHour, 0, 0, 0);
    return clamped;
  };

  // Cronometer sometimes exports daily summaries at local midnight.
  // If duration is very short and time lands at 00:xx, shift to a
  // reasonable bucket using lastModifiedTime when available.
  const durationMs =
    startMs && endMs && endMs > startMs ? endMs - startMs : 0;
  const isMidnight =
    date.getHours() === 0 && date.getMinutes() <= 1 && date.getSeconds() === 0;

  if (durationMs > 0 && durationMs <= 2 * 60 * 1000 && isMidnight) {
    if (fallbackMs) {
      const fallbackDate = new Date(fallbackMs);
      const fallbackIsMidnight =
        fallbackDate.getHours() === 0 &&
        fallbackDate.getMinutes() <= 1 &&
        fallbackDate.getSeconds() === 0;
      return fallbackIsMidnight ? clampToBucket(fallbackDate) : fallbackDate;
    }
    return clampToBucket(date);
  }

  return date;
};

export const sumCaloriesForSession = (
  session: any,
  activeCalories: any[],
): number => {
  if (!Array.isArray(activeCalories) || activeCalories.length === 0) return 0;

  const { startMs, endMs } = getRecordTimeRangeMs(session);
  if (!startMs || !endMs || endMs <= startMs) return 0;

  let total = 0;
  for (const record of activeCalories) {
    const { startMs: rStart, endMs: rEnd } = getRecordTimeRangeMs(record);
    if (!rStart || !rEnd) continue;
    const overlaps = rStart < endMs && rEnd > startMs;
    if (!overlaps) continue;
    total += getEnergyKcal(record?.energy);
  }

  return total;
};

export const estimateCaloriesFallback = (
  activityType: ActivityType,
  duration: number,
  userProfile?: UserProfile,
): number => {
  if (!duration || duration <= 0) return 0;
  const result = calculateCaloriesBurned({
    activityType,
    duration,
    intensity: "Medium",
    userProfile,
    weight: userProfile?.weight,
  });
  return result.calories || 0;
};
