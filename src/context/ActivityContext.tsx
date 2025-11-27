import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export interface Activity {
  _id?: string;
  eventType: string;
  duration?: number;
  notes?: string;
  created_at: string;
  carbs?: number;
  insulin?: number;
  date?: number;
}

interface ActivityContextType {
  activities: Activity[];
  loadInitial: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  isLoading: boolean;
  reset: () => void;
  error: string | null;
}

const ActivityContext = createContext<ActivityContextType | null>(null);

export const ActivityProvider = ({ children }: { children: ReactNode }) => {
  const { firebaseUser, userData } = useAuth();
  const nightscoutUrl = userData?.nightscoutUrl; // "https://glucose-goose.mooo.com/"
  const nightscoutSecret = userData?.nightscoutSecret;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    setActivities([]);
    setLastTimestamp(null);
    setError(null);
    setIsLoading(false);
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = null;
  }, []);

  const loadInitial = useCallback(async () => {
    if (!nightscoutUrl || !firebaseUser) return;

    setIsLoading(true);
    setError(null);

    try {
      // bezpośredni URL Nightscout z endpointem treatments
      const baseUrl = nightscoutUrl.replace(/\/$/, '');
      const url = `${baseUrl}/api/v1/treatments?count=1000`;
      
      const headers: HeadersInit = {
        'Accept': 'application/json',
      };

      if (nightscoutSecret) {
        headers['api-secret'] = nightscoutSecret;
      }

      const res = await fetch(url, { headers });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format from Nightscout");
      }

      // osttanie 24 godziny
      const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
      const recentActivities = data.filter((activity: Activity) => {
        const activityTime = new Date(activity.created_at).getTime();
        return activityTime >= twentyFourHoursAgo;
      });

      setActivities(recentActivities);
      
      if (recentActivities.length > 0) {
        const latestTimestamp = Math.max(...recentActivities.map(a => new Date(a.created_at).getTime()));
        setLastTimestamp(latestTimestamp);
      }
    } catch (err: any) {
      console.error("Failed to fetch activities:", err);
      setError(err.message || "Failed to fetch activities");
    } finally {
      setIsLoading(false);
    }
  }, [nightscoutUrl, nightscoutSecret, firebaseUser]);

  const fetchUpdates = useCallback(async () => {
    if (!nightscoutUrl || !firebaseUser || !lastTimestamp) return;

    setError(null);
    try {
      const baseUrl = nightscoutUrl.replace(/\/$/, '');
      const url = `${baseUrl}/api/v1/treatments?count=1000&find[created_at][$gte]=${lastTimestamp}`;
      
      const headers: HeadersInit = {
        'Accept': 'application/json',
      };

      if (nightscoutSecret) {
        headers['api-secret'] = nightscoutSecret;
      }

      const res = await fetch(url, { headers });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format from Nightscout");
      }

      const newActivities = data.filter((activity: Activity) => {
        const activityTime = new Date(activity.created_at).getTime();
        return activityTime > lastTimestamp;
      });

      if (newActivities.length > 0) {
        setActivities(prev => [...newActivities, ...prev]);
        const latestTimestamp = Math.max(...newActivities.map(a => new Date(a.created_at).getTime()));
        setLastTimestamp(latestTimestamp);
      }
    } catch (err: any) {
      console.error("Failed to fetch activity updates:", err);
      setError(err.message || "Failed to fetch activity updates");
    }
  }, [nightscoutUrl, nightscoutSecret, lastTimestamp, firebaseUser]);

  const startPolling = useCallback(() => {
    if (!nightscoutUrl || !firebaseUser || pollingRef.current) return;
    pollingRef.current = setInterval(fetchUpdates, 5 * 60 * 1000); 
  }, [fetchUpdates, nightscoutUrl, firebaseUser]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = null;
  }, []);

  return (
    <ActivityContext.Provider value={{ 
      activities, 
      loadInitial, 
      startPolling, 
      stopPolling, 
      isLoading, 
      reset, 
      error 
    }}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error("useActivity must be used inside ActivityProvider");
  return ctx;
};