import { NightscoutTreatment } from "../types/nightscout";
import { NutritionInfo } from "../types/events";
import { VintageColors } from "../themes/vintage/colors_vintage";
import { MealType, mealTypes } from "../types/events";

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
  const type = eventType.replace("Meal: ", "");
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
  return icons[mealType];
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
  return colors[mealType];
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
};
