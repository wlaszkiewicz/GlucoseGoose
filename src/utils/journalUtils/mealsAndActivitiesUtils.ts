import {
  ActivityMetrics,
  ActivityType,
  activityTypes,
} from "../../types/events";
import { VintageColors } from "../../themes/vintage/colors";
import { NightscoutTreatment } from "../../types/nightscout";
import { NutritionInfo } from "../../types/events";
import { MealType, mealTypes } from "../../types/events";

const extractMetricsFromActivity = (activity: any): ActivityMetrics => {
  return {
    duration: activity.duration || 0,
    intensity: (activity.intensity as "Low" | "Medium" | "High") || "Medium",
    caloriesBurned: activity.caloriesBurned || activity.calories,
    heartRate: activity.heartRate,
    distance: activity.distance,
    notes: activity.notes,
  };
};

const getTodayActivityStats = (activities: any[]) => {
  return activities.reduce(
    (total: any, activity: any) => {
      const metrics = extractMetricsFromActivity(activity);
      total.totalDuration += metrics.duration || 0;
      total.totalCalories += metrics.caloriesBurned || 0;
      total.totalDistance += metrics.distance || 0;
      total.activityCount += 1;
      return total;
    },
    {
      totalDuration: 0,
      totalCalories: 0,
      totalDistance: 0,
      activityCount: 0,
    }
  );
};

const getActivityTypeFromEvent = (eventType: string): ActivityType => {
  const type = eventType.replace(/^(Activity|Exercise):?\s*/i, "");
  return activityTypes.includes(type as ActivityType)
    ? (type as ActivityType)
    : "Other";
};

const getActivityIcon = (activityType: ActivityType) => {
  const icons: Record<ActivityType, string> = {
    Walking: "walk-outline",
    Running: "fitness-outline",
    Cycling: "bicycle-outline",
    Swimming: "water-outline",
    Yoga: "body-outline",
    "Weight Training": "barbell-outline",
    Hiking: "trail-sign-outline",
    Dancing: "musical-notes-outline",
    "Team Sports": "football-outline",
    Other: "ellipsis-horizontal-outline",
  };
  return icons[activityType] || "ellipsis-horizontal-outline";
};

const getActivityColor = (activityType: ActivityType): string => {
  const colors: Record<ActivityType, string> = {
    Walking: VintageColors.iconGreen,
    Running: VintageColors.iconPink,
    Cycling: VintageColors.iconBlue,
    Swimming: VintageColors.iconPurple,
    Yoga: VintageColors.iconYellow,
    "Weight Training": VintageColors.iconBlue,
    Hiking: VintageColors.iconGreen,
    Dancing: VintageColors.iconPink,
    "Team Sports": VintageColors.iconPurple,
    Other: VintageColors.iconYellow,
  };
  return colors[activityType] || VintageColors.iconBlue;
};

const extractNutritionFromMeal = (meal: NightscoutTreatment): NutritionInfo => {
  return {
    calories: meal.calories || 0,
    carbs: meal.carbs || 0,
    protein: meal.protein || 0,
    fat: meal.fat || 0,
    fiber: meal.fiber || 0,
  };
};

const getMealTypeFromEvent = (eventType: string): MealType => {
  const type = eventType.replace(/^Meal:\s*/i, "").trim();
  return mealTypes.includes(type as MealType)
    ? (type as MealType)
    : "Breakfast";
};
const getTodaysMealsNutrition = (
  meals: NightscoutTreatment[]
): NutritionInfo => {
  return meals.reduce(
    (total: NutritionInfo, meal: any) => {
      const nutrition = extractNutritionFromMeal(meal);
      total.calories = parseFloat(
        (total.calories + nutrition.calories).toFixed(2)
      );
      total.carbs = parseFloat((total.carbs + nutrition.carbs).toFixed(2));
      total.protein = parseFloat(
        (total.protein + nutrition.protein).toFixed(2)
      );
      total.fat = parseFloat((total.fat + nutrition.fat).toFixed(2));
      total.fiber = parseFloat((total.fiber + nutrition.fiber).toFixed(2));
      return total;
    },
    {
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
      fiber: 0,
    }
  );
};

const getMealIcon = (mealType: MealType) => {
  const icons: Record<MealType, string> = {
    Breakfast: "cafe",
    "Morning Snack": "nutrition",
    Lunch: "fast-food",
    "Afternoon Snack": "ice-cream",
    Dinner: "restaurant",
    "Evening Snack": "moon",
  };
  return icons[mealType] || "fast-food";
};

const getMealColor = (mealType: MealType): string => {
  const colors: Record<MealType, string> = {
    Breakfast: VintageColors.iconPink,
    "Morning Snack": VintageColors.iconYellow,
    Lunch: VintageColors.iconBlue,
    "Afternoon Snack": VintageColors.iconPurple,
    Dinner: VintageColors.iconGreen,
    "Evening Snack": VintageColors.iconPink,
  };
  return colors[mealType] || VintageColors.iconBlue;
};

const getConfidenceColor = (confidence: string) => {
  switch (confidence) {
    case "high":
      return "#4CAF50";
    case "medium":
      return "#FF9800";
    case "low":
      return "#FF6B6B";
    default:
      return VintageColors.secondaryText;
  }
};

const getConfidenceText = (confidence: string) => {
  switch (confidence) {
    case "high":
      return "High Confidence";
    case "medium":
      return "Medium Confidence";
    case "low":
      return "Low Confidence";
    default:
      return "Unknown Confidence";
  }
};

export {
  getMealColor,
  getConfidenceColor,
  getConfidenceText,
  getMealIcon,
  extractNutritionFromMeal,
  getMealTypeFromEvent,
  getTodaysMealsNutrition,
  extractMetricsFromActivity,
  getTodayActivityStats,
  getActivityTypeFromEvent,
  getActivityIcon,
  getActivityColor,
};
