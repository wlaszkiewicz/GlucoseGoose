import { useAuth } from "../context/AuthContext";

export interface FoodEntry {
  eventType: string;
  notes?: string;
  carbs?: number;
  protein?: number;
  fat?: number;
  sugar?: number;
  fiber?: number;
  calories?: number;
  created_at: string;
}

export const useNightscoutFood = () => {
  const { userData } = useAuth();
  const nightscoutUrl = userData?.nightscoutUrl;
  const nightscoutSecret = userData?.nightscoutSecret;

  const saveFoodToNightscout = async (
    foodData: FoodEntry
  ): Promise<boolean> => {
    if (!nightscoutUrl) {
      console.error("Nightscout URL not configured");
      return false;
    }

    try {
      const baseUrl = nightscoutUrl.replace(/\/$/, "");
      const url = `${baseUrl}/api/v1/treatments`;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (nightscoutSecret) {
        headers["api-secret"] = nightscoutSecret;
      }

      // Format data for Nightscout treatments API
      const nightscoutData = {
        eventType: foodData.eventType,
        notes: foodData.notes,
        carbs: foodData.carbs || 0,
        created_at: foodData.created_at,
        // Add custom fields for nutrition info
        protein: foodData.protein,
        fat: foodData.fat,
        sugar: foodData.sugar,
        fiber: foodData.fiber,
        calories: foodData.calories,
      };

      console.log("Saving to Nightscout:", nightscoutData);

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify([nightscoutData]), // Nightscout expects array
      });

      if (response.ok) {
        console.log("Food saved to Nightscout successfully");
        return true;
      } else {
        const errorText = await response.text();
        console.error(
          "Failed to save food to Nightscout:",
          response.status,
          errorText
        );
        return false;
      }
    } catch (error) {
      console.error("Error saving food to Nightscout:", error);
      return false;
    }
  };

  return { saveFoodToNightscout };
};
