import {
  getActivityIcon as getActivityIconOriginal,
  getMealIcon as getMealIconOriginal,
  getMealTypeFromEvent,
  getActivityTypeFromEvent,
} from "../journalUtils/mealsAndActivitiesUtils";

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
  const reasonLower = reason?.toLowerCase() || "";

  if (reasonLower.includes("meal") || reasonLower.includes("pre-meal")) {
    return "food-variant";
  }
  if (reasonLower.includes("activity") || reasonLower.includes("exercise")) {
    return "run";
  }
  if (reasonLower.includes("low") || reasonLower.includes("hypo")) {
    return "exclamation";
  }
  return "target";
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
  return "beaker-question-outline";
};

export const getEventIcon = (event: any): string => {
  const category = require("./eventCategorization").getEventCategory(event);

  switch (category) {
    case "meal":
      return getMealIconFixed(event.eventType);
    case "activity":
      return getActivityIconFixed(event.eventType);
    case "insulin":
    case "basal":
      return getInsulinIcon(event.eventType, event.insulin);
    case "target":
      return getTargetIcon(event.reason || event.eventType);
    default:
      return getSpecialEventIcon(event.eventType);
  }
};
