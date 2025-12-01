import { NightscoutTreatment } from "../types/nightscout";
import { addTreatment } from "./fns";

export async function submitMeal({
  userData,
  host,
  mealType,
  description,
  nutrition,
}: any) {
  const foodEntry: NightscoutTreatment = {
    eventType: "Meal: " + mealType,
    notes: description,
    carbs: Number(nutrition.carbs) || 0,
    protein: nutrition.protein ? Number(nutrition.protein) : undefined,
    fat: nutrition.fat ? Number(nutrition.fat) : undefined,
    sugar: nutrition.sugar ? Number(nutrition.sugar) : undefined,
    fiber: nutrition.fiber ? Number(nutrition.fiber) : undefined,
    calories: nutrition.calories ? Number(nutrition.calories) : undefined,
    created_at: new Date().toISOString(),
  };

  return await addTreatment(
    host,
    userData.nightscoutUrl,
    userData.nightscoutSecret ?? "",
    foodEntry
  );
}
