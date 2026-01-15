import { EventCategory, EventPosition } from "../../types/chart";

export const CHART_COLORS = {
  // Meal colors
  mealBreakfast: "#F9BAD4FF",
  mealLunch: "#96BFD6FF",
  mealDinner: "#B1BCE7FF",
  mealSnack: "#FCCAA9FF",
  mealOther: "#D5EDAEFF",

  mornigSnack: "#B77AADFF",
  afternoonSnack: "#B5A3F3FF",
  eveningSnack: "#F4A0AEFF",
  otherSnack: "#FECBA9FF",

  // Activity colors
  activityWalking: "#7CB29FFF",
  activityRunning: "#F6B7D1FF",
  activityTraining: "#AEB8E1FF",
  activityYoga: "#EFBE9EFF",
  activityCycling: "#86BC86FF",
  activitySwimming: "#7E9CCCFF",
  activityHiking: "#7AA193FF",
  activityDancing: "#DBB3C4FF",
  activityTeamSports: "#95728AFF",
  activityOther: "#ACB996FF",

  // Insulin colors
  bolusTiny: "#FFE5E0",
  bolusSmall: "#FCB7B2FF",
  bolusMedium: "#FA8B94FF",
  bolusLarge: "#F9858DFF",
  bolusVeryLarge: "#FF8C94",

  // Basal colors
  basalStrongReduction: "#8CB3E3",
  basalReduced: "#AFCBFF",
  basalNormal: "#C7CEEA",
  basalIncreased: "#FFDAC1",
  basalStrongIncrease: "#FFB347",

  // Target colors
  targetMeal: "#F9C9A9FF",
  targetActivity: "#B5EAD7",
  targetHypo: "#FFB7B2",
  targetCustom: "#BFDA99FF",

  // Device colors
  deviceSite: "#C7CEEA",
  deviceSensor: "#B5EAD7",
  devicePump: "#FFD6E7",

  // Other colors
  note: "#D8D8D8",
  announcement: "#EC9279FF",
  other: "#E2F0CB",
};

export const getEventCategory = (event: any): EventCategory => {
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

export const getCategoryDisplayName = (category: EventCategory): string => {
  const displayMap: Record<EventCategory, string> = {
    meal: "Meals",
    snack: "Snacks",
    activity: "Activities",
    insulin: "Insulin",
    basal: "Temp Basals",
    target: "Targets",
    device: "Device Events",
    note: "Notes",
    other: "Other Events",
    unknown: "Unknown",
  };
  return displayMap[category];
};

export const getCategoryColor = (category: EventCategory): string => {
  const colorMap: Record<EventCategory, string> = {
    meal: "rgba(255, 214, 231, 0.2)",
    snack: "rgba(255, 218, 193, 0.2)",
    activity: "rgba(181, 234, 215, 0.2)",
    insulin: "rgba(255, 183, 178, 0.2)",
    basal: "rgba(175, 203, 255, 0.2)",
    target: "rgba(226, 240, 203, 0.2)",
    device: "rgba(199, 206, 234, 0.2)",
    note: "rgba(226, 240, 203, 0.2)",
    other: "rgba(226, 240, 203, 0.2)",
    unknown: "rgba(226, 240, 203, 0.2)",
  };
  return colorMap[category];
};

export const getInsulinColor = (
  eventType: string,
  percent?: number,
  insulin?: number
): string => {
  if (eventType === "Temp Basal") {
    if (percent === undefined) return CHART_COLORS.basalNormal;

    if (percent < -50) return CHART_COLORS.basalStrongReduction;
    if (percent < 0) return CHART_COLORS.basalReduced;
    if (percent > 50) return CHART_COLORS.basalStrongIncrease;
    if (percent > 0) return CHART_COLORS.basalIncreased;
    return CHART_COLORS.basalNormal;
  }

  if (eventType.includes("Bolus")) {
    if (insulin && insulin >= 3) return CHART_COLORS.bolusVeryLarge;
    if (insulin && insulin >= 1) return CHART_COLORS.bolusMedium;
    if (insulin && insulin >= 0.5) return CHART_COLORS.bolusSmall;
    return CHART_COLORS.bolusTiny;
  }

  return CHART_COLORS.other;
};

export const getTargetColor = (reason: string): string => {
  const reasonLower = reason?.toLowerCase() || "";
  if (reasonLower.includes("meal") || reasonLower.includes("pre-meal")) {
    return CHART_COLORS.targetMeal;
  }
  if (reasonLower.includes("activity") || reasonLower.includes("exercise")) {
    return CHART_COLORS.targetActivity;
  }
  if (reasonLower.includes("low") || reasonLower.includes("hypo")) {
    return CHART_COLORS.targetHypo;
  }
  return CHART_COLORS.targetCustom;
};

export const getEventColor = (type: string, eventType: string = ""): string => {
  const category = getEventCategory({ type, eventType });

  switch (category) {
    case "insulin":
      return getInsulinColor(eventType);
    case "basal":
      return getInsulinColor(eventType);
    case "target":
      return getTargetColor(eventType);
    case "meal":
      const mealType = eventType?.replace("Meal: ", "") || "";
      switch (mealType) {
        case "Breakfast":
          return CHART_COLORS.mealBreakfast;
        case "Morning Snack":
          return CHART_COLORS.mornigSnack;
        case "Lunch":
          return CHART_COLORS.mealLunch;
        case "Afternoon Snack":
          return CHART_COLORS.afternoonSnack;
        case "Dinner":
          return CHART_COLORS.mealDinner;
        case "Evening Snack":
          return CHART_COLORS.eveningSnack;
        case "Other":
        default:
          return CHART_COLORS.mealOther;
      }
    case "activity":
      const activityType =
        eventType?.replace(/^(Activity|Exercise):?\s*/i, "") || "";
      switch (activityType) {
        case "Walking":
          return CHART_COLORS.activityWalking;
        case "Hiking":
          return CHART_COLORS.activityHiking;
        case "Running":
          return CHART_COLORS.activityRunning;
        case "Cycling":
          return CHART_COLORS.activityCycling;
        case "Swimming":
          return CHART_COLORS.activitySwimming;
        case "Yoga":
          return CHART_COLORS.activityYoga;
        case "Dancing":
          return CHART_COLORS.activityDancing;
        case "Weight Training":
          return CHART_COLORS.activityTraining;
        case "Team Sports":
          return CHART_COLORS.activityTeamSports;

        case "Other":
        default:
          return CHART_COLORS.activityOther;
      }

    case "device":
      if (eventType?.toLowerCase().includes("site")) {
        return CHART_COLORS.deviceSite;
      }
      if (eventType?.toLowerCase().includes("sensor")) {
        return CHART_COLORS.deviceSensor;
      }
      if (eventType?.toLowerCase().includes("pump")) {
        return CHART_COLORS.devicePump;
      }
      return CHART_COLORS.other;
    case "note":
      return CHART_COLORS.note;
    default:
      return CHART_COLORS.announcement;
  }
};

export const isSpecialEvent = (event: any): boolean => {
  const category = getEventCategory(event);
  return category !== "meal" && category !== "activity";
};

export const getColorExplanation = (category: EventCategory) => {
  switch (category) {
    case "insulin":
      return {
        colors: [
          CHART_COLORS.bolusTiny,
          CHART_COLORS.bolusSmall,
          CHART_COLORS.bolusMedium,
          CHART_COLORS.bolusLarge,
          CHART_COLORS.bolusVeryLarge,
        ],
        labels: [
          "Tiny dose (<0.5)",
          "Small dose (0.5-1)",
          "Medium dose (1-2)",
          "Large dose (2-3)",
          "Very large dose (>3)",
        ],
      };
    case "basal":
      return {
        colors: [
          CHART_COLORS.basalStrongReduction,
          CHART_COLORS.basalReduced,
          CHART_COLORS.basalNormal,
          CHART_COLORS.basalIncreased,
          CHART_COLORS.basalStrongIncrease,
        ],
        labels: [
          "Strong reduction (>50%)",
          "Reduction (0-50%)",
          "No change (0%)",
          "Increase (0-50%)",
          "Strong increase (>50%)",
        ],
      };
    case "target":
      return {
        colors: [
          CHART_COLORS.targetMeal,
          CHART_COLORS.targetActivity,
          CHART_COLORS.targetHypo,
          CHART_COLORS.targetCustom,
        ],
        labels: [
          "Meal target",
          "Activity target",
          "Hypo target",
          "Custom target",
        ],
      };
    case "meal":
      return {
        colors: [
          CHART_COLORS.mealBreakfast,
          CHART_COLORS.mealLunch,
          CHART_COLORS.mealDinner,
        ],
        labels: ["Breakfast", "Lunch", "Dinner"],
        icons: ["cafe", "fast-food", "restaurant"],
      };
    case "activity":
      return {
        colors: [
          CHART_COLORS.activityWalking,
          CHART_COLORS.activityRunning,
          CHART_COLORS.activityCycling,
          CHART_COLORS.activitySwimming,
          CHART_COLORS.activityTraining,
          CHART_COLORS.activityYoga,
          CHART_COLORS.activityHiking,
          CHART_COLORS.activityDancing,
          CHART_COLORS.activityTeamSports,
          CHART_COLORS.activityOther,
        ],
        labels: [
          "Walking",
          "Running",
          "Cycling",
          "Swimming",
          "Weight Training",
          "Yoga",
          "Hiking",
          "Dancing",
          "Team Sports",
          "Other",
        ],
        icons: [
          "walk-outline",
          "fitness-outline",
          "bicycle-outline",
          "water-outline",
          "barbell-outline",
          "body-outline",
          "trail-sign-outline",
          "musical-notes-outline",
          "football-outline",
          "ellipsis-horizontal-outline",
        ],
      };
    case "snack":
      return {
        colors: [
          CHART_COLORS.mornigSnack,
          CHART_COLORS.afternoonSnack,
          CHART_COLORS.eveningSnack,
          CHART_COLORS.otherSnack,
        ],
        labels: [
          "Morning Snack",
          "Afternoon Snack",
          "Evening Snack",
          "Other Snack",
        ],
        icons: ["nutrition", "ice-cream", "moon", "nutrition"],
      };
    default:
      return undefined;
  }
};

export const getEventDisplayName = (event: any) => {
  if (event.eventType) {
    return event.eventType
      .replace("Meal: ", "")
      .replace("Activity: ", "")
      .replace("Exercise: ", "");
  }
  switch (event.type) {
    case "meal":
      return "Meal";
    case "activity":
      return "Activity";
    case "other":
      return event.eventType || "Other";
    default:
      return "Event";
  }
};
