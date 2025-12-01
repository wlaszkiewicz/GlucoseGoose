import { useState, useEffect } from "react";

export const useMealForm = () => {
  const [mealDescription, setMealDescription] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [manual, setManual] = useState(false);

  const [nutrition, setNutrition] = useState({
    calories: "",
    carbs: "",
    protein: "",
    fat: "",
    sugar: "",
    fiber: "",
  });

  const reset = () => {
    setMealDescription("");
    setManual(false);
    setNutrition({
      calories: "",
      carbs: "",
      protein: "",
      fat: "",
      sugar: "",
      fiber: "",
    });
  };

  // Simulated AI
  const fakeAIAnalysis = async (text: string) => {
    setIsCalculating(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsCalculating(false);
        resolve({
          calories: (100 + Math.random() * 400).toFixed(0),
          carbs: (10 + Math.random() * 50).toFixed(0),
          protein: (5 + Math.random() * 25).toFixed(0),
          fat: (5 + Math.random() * 20).toFixed(0),
          sugar: (3 + Math.random() * 15).toFixed(0),
          fiber: (1 + Math.random() * 8).toFixed(0),
        });
      }, 1200);
    });
  };

  useEffect(() => {
    if (manual) return;
    if (mealDescription.trim().length < 10) return;

    fakeAIAnalysis(mealDescription).then((res: any) => {
      setNutrition({
        calories: res.calories,
        carbs: res.carbs,
        protein: res.protein,
        fat: res.fat,
        sugar: res.sugar,
        fiber: res.fiber,
      });
    });
  }, [mealDescription, manual]);

  return {
    mealDescription,
    setMealDescription,
    nutrition,
    setNutrition,
    manual,
    setManual,
    isCalculating,
    reset,
  };
};
