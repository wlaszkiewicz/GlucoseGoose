type MealType =
  | "Breakfast"
  | "Morning Snack"
  | "Lunch"
  | "Afternoon Snack"
  | "Dinner"
  | "Evening Snack";

const mealTypes: MealType[] = [
  "Breakfast",
  "Morning Snack",
  "Lunch",
  "Afternoon Snack",
  "Dinner",
  "Evening Snack",
];

interface NutritionInfo {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
}

interface AIAnalysisResult {
  food_items: Array<{
    name: string;
    estimated_weight_grams: number;
    calories: number;
    protein_grams: number;
    carbs_grams: number;
    fat_grams: number;
    fiber_grams: number;
  }>;
  totals: {
    calories: number;
    protein_grams: number;
    carbs_grams: number;
    fat_grams: number;
    fiber_grams: number;
    total_weight_grams: number;
  };
  confidence: "low" | "medium" | "high";
}

type ActivityType =
  | "Walking"
  | "Running"
  | "Cycling"
  | "Swimming"
  | "Yoga"
  | "Weight Training"
  | "Hiking"
  | "Dancing"
  | "Team Sports"
  | "Other";

const activityTypes: ActivityType[] = [
  "Walking",
  "Running",
  "Cycling",
  "Swimming",
  "Yoga",
  "Weight Training",
  "Hiking",
  "Dancing",
  "Team Sports",
  "Other",
];

interface ActivityMetrics {
  duration: number;
  intensity?: "Low" | "Medium" | "High";
  caloriesBurned?: number;
  heartRate?: number;
  distance?: number;
  notes?: string;
}

export {
  MealType,
  mealTypes,
  NutritionInfo,
  AIAnalysisResult,
  ActivityType,
  activityTypes,
  ActivityMetrics,
};
