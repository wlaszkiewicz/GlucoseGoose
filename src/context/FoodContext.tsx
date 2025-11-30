import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

export interface FoodActivity {
  _id?: string;
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

interface FoodContextType {
  foodActivities: FoodActivity[];
  loadFoodActivities: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const FoodContext = createContext<FoodContextType | null>(null);

export const FoodProvider = ({ children }: { children: ReactNode }) => {
  const { firebaseUser, userData } = useAuth();
  const nightscoutUrl = userData?.nightscoutUrl;
  const nightscoutSecret = userData?.nightscoutSecret;

  const [foodActivities, setFoodActivities] = useState<FoodActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFoodActivities = useCallback(async () => {
    if (!nightscoutUrl || !firebaseUser) return;

    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = nightscoutUrl.replace(/\/$/, "");
      // Filter for food-related activities using regex
      const url = `${baseUrl}/api/v1/treatments?find[eventType][$regex]=Meal&count=1000`;

      const headers: HeadersInit = {
        Accept: "application/json",
      };

      if (nightscoutSecret) {
        headers["api-secret"] = nightscoutSecret;
      }

      const res = await fetch(url, { headers });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format from Nightscout");
      }

      // Get last 24 hours of food activities
      const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
      const recentFood = data.filter((activity: FoodActivity) => {
        const activityTime = new Date(activity.created_at).getTime();
        return activityTime >= twentyFourHoursAgo;
      });

      setFoodActivities(recentFood);
    } catch (err: any) {
      console.error("Failed to fetch food activities:", err);
      setError(err.message || "Failed to fetch food activities");
    } finally {
      setIsLoading(false);
    }
  }, [nightscoutUrl, nightscoutSecret, firebaseUser]);

  return (
    <FoodContext.Provider
      value={{
        foodActivities,
        loadFoodActivities,
        isLoading,
        error,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
};

export const useFood = () => {
  const ctx = useContext(FoodContext);
  if (!ctx) throw new Error("useFood must be used inside FoodProvider");
  return ctx;
};
