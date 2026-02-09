import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";
import { addTreatment } from "../utils/cloudFunctions";
import { NightscoutTreatment } from "../types/nightscout";
import {
  getMassGrams,
  getMealTypeFromHealthConnect,
  estimateCaloriesFallback,
  getEnergyKcal,
  inferActivityType,
  getNutritionRecordTime,
  roundNutrition,
  sumCaloriesForSession,
} from "../utils/healthConnectUtils";

const GRANTED_KEY = "healthConnectGranted";
const LAST_SYNC_KEY = "healthConnectLastSync";
const SYNCED_IDS_KEY = "healthConnectSyncedIds";
const AUTO_SYNC_KEY = "healthConnectAutoSyncEnabled";

// Conditionally import Health Connect only on Android
let initialize: any = null;
let readRecords: any = null;

if (Platform.OS === "android") {
  try {
    const healthConnect = require("react-native-health-connect");
    initialize = healthConnect.initialize;
    readRecords = healthConnect.readRecords;
  } catch (error) {
    console.warn("react-native-health-connect not available:", error);
  }
}

const readAllRecords = async (
  recordType: string,
  timeRangeFilter: {
    operator: "between";
    startTime: string;
    endTime: string;
  },
) => {
  if (!readRecords) return [];

  try {
    const all: any[] = [];
    let pageToken: string | undefined = undefined;
    let pageCount = 0;

    do {
      const result: any = await readRecords(recordType, {
        timeRangeFilter,
        pageSize: 1000,
        pageToken,
      });

      const records = Array.isArray(result?.records) ? result.records : [];
      all.push(...records);

      pageToken =
        typeof result?.pageToken === "string" && result.pageToken.length > 0
          ? result.pageToken
          : undefined;

      pageCount += 1;
      if (pageCount > 50) break;
    } while (pageToken);

    return all;
  } catch (error: any) {
    console.warn(
      `Health Connect read failed for ${recordType}:`,
      error?.message || error,
    );
    return [];
  }
};

export const useHealthConnectAutoSync = () => {
  const { firebaseUser, userData } = useAuth();
  const isSyncingRef = useRef(false);

  const runSync = async () => {
    if (Platform.OS !== "android") return;
    if (!initialize || !readRecords) return;
    if (!firebaseUser || !userData?.nightscoutUrl) return;
    if (isSyncingRef.current) return;

    const granted = await AsyncStorage.getItem(GRANTED_KEY);
    if (granted !== "true") return;
    const autoSync = await AsyncStorage.getItem(AUTO_SYNC_KEY);
    if (autoSync === "false") return;

    isSyncingRef.current = true;
    try {
      const isInit = await initialize();
      if (!isInit) return;

      const now = Date.now();
      const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
      const windowStart = twentyFourHoursAgo;

      const timeRangeFilter = {
        operator: "between" as const,
        startTime: new Date(windowStart).toISOString(),
        endTime: new Date(now).toISOString(),
      };

      const [exerciseSessions, activeCalories, nutritionRecords] =
        await Promise.all([
        readAllRecords("ExerciseSession", timeRangeFilter),
        readAllRecords("ActiveCaloriesBurned", timeRangeFilter),
        readAllRecords("Nutrition", timeRangeFilter),
      ]);

      let syncedCount = 0;
      const syncedRaw = await AsyncStorage.getItem(SYNCED_IDS_KEY);
      const syncedMap: Record<string, number> = syncedRaw
        ? JSON.parse(syncedRaw)
        : {};

      const pruneBefore = now - 7 * 24 * 60 * 60 * 1000;
      for (const [key, ts] of Object.entries(syncedMap)) {
        if (typeof ts !== "number" || ts < pruneBefore) delete syncedMap[key];
      }

      const getSessionId = (session: any) => {
        const meta = session?.metadata;
        return (
          meta?.id ||
          meta?.clientRecordId ||
          `${session.exerciseType ?? "unknown"}_${session.startTime || session.startTimeMillis}_${session.endTime || session.endTimeMillis}`
        );
      };

      for (const session of exerciseSessions) {
        const startTime = new Date(session.startTime || session.startTimeMillis);
        const endTime = new Date(session.endTime || session.endTimeMillis);
        const duration = Math.round(
          (endTime.getTime() - startTime.getTime()) / (1000 * 60),
        );

        const sessionId = String(getSessionId(session));
        if (syncedMap[sessionId]) continue;

        const exerciseType = session.exerciseType;
        const title = session.title;
        const activityType = inferActivityType(
          typeof exerciseType === "string" || typeof exerciseType === "number"
            ? exerciseType
            : undefined,
          typeof title === "string" ? title : undefined,
        );

        let caloriesKcal = getEnergyKcal(session.totalEnergyBurned);
        if (!caloriesKcal) {
          caloriesKcal = sumCaloriesForSession(session, activeCalories);
        }
        if (!caloriesKcal) {
          caloriesKcal = estimateCaloriesFallback(activityType, duration, {
            weight: userData?.weight,
            height: userData?.height,
            age: userData?.age,
            gender: userData?.gender as "male" | "female" | undefined,
          });
        }
        const treatmentData: NightscoutTreatment = {
          eventType: `Activity: ${activityType}`,
          notes: `Synced from Health Connect: ${session.title || exerciseType || "Exercise"}`,
          duration,
          intensity: "Medium",
          calories: caloriesKcal,
          caloriesBurned: caloriesKcal,
          distance: session.totalDistance || undefined,
          created_at: startTime.toISOString(),
          createdBy: "GlucoseGoose Health Connect Sync",
        };

        try {
          const success = await addTreatment(
            userData.nightscoutUrl,
            userData.nightscoutSecret ?? "",
            treatmentData,
          );
          if (success) {
            syncedCount++;
            syncedMap[sessionId] = now;
          }
        } catch (error) {
          console.error("Failed to auto-sync exercise session:", error);
        }
      }

      const getNutritionId = (record: any) => {
        const meta = record?.metadata;
        return (
          meta?.id ||
          meta?.clientRecordId ||
          `${record.startTime || record.startTimeMillis}_${record.endTime || record.endTimeMillis}_${record.name || "nutrition"}`
        );
      };

      for (const record of nutritionRecords ?? []) {
        const startTime = getNutritionRecordTime(record);

        const mealType = getMealTypeFromHealthConnect(
          record.mealType,
          record.startTime || record.time,
        );
        const calories = Math.round(getEnergyKcal(record.energy));
        const carbs = roundNutrition(getMassGrams(record.totalCarbohydrate));
        const protein = roundNutrition(getMassGrams(record.protein));
        const fat = roundNutrition(getMassGrams(record.totalFat));
        const fiber = roundNutrition(getMassGrams(record.dietaryFiber));
        const sugar = roundNutrition(getMassGrams(record.sugar));

        if (
          calories === 0 &&
          carbs === 0 &&
          protein === 0 &&
          fat === 0 &&
          fiber === 0 &&
          sugar === 0
        ) {
          continue;
        }

        const nutritionId = String(getNutritionId(record));
        if (syncedMap[nutritionId]) continue;

        const treatmentData: NightscoutTreatment = {
          eventType: `Meal: ${mealType}`,
          notes: `Synced from Health Connect: ${record.name || "Meal"}`,
          carbs,
          protein,
          fat,
          fiber,
          sugar,
          calories,
          created_at: startTime.toISOString(),
          createdBy: "GlucoseGoose Health Connect Sync",
        };

        try {
          const success = await addTreatment(
            userData.nightscoutUrl,
            userData.nightscoutSecret ?? "",
            treatmentData,
          );
          if (success) {
            syncedCount++;
            syncedMap[nutritionId] = now;
          }
        } catch (error) {
          console.error("Failed to auto-sync nutrition record:", error);
        }
      }

      if (exerciseSessions.length === 0 && activeCalories.length > 0) {
        for (const calorieData of activeCalories) {
          const startTime = new Date(
            calorieData.startTime || calorieData.startTimeMillis,
          );
          const endTime = new Date(
            calorieData.endTime || calorieData.endTimeMillis,
          );
          const duration = Math.round(
            (endTime.getTime() - startTime.getTime()) / (1000 * 60),
          );

          const calorieId = String(
            calorieData?.metadata?.id ||
              calorieData?.metadata?.clientRecordId ||
              `cal_${calorieData.startTime || calorieData.startTimeMillis}_${calorieData.endTime || calorieData.endTimeMillis}`,
          );
          if (syncedMap[calorieId]) continue;

          let caloriesKcal = getEnergyKcal(calorieData.energy);
          if (!caloriesKcal) {
            caloriesKcal = estimateCaloriesFallback("Other", duration, {
              weight: userData?.weight,
              height: userData?.height,
              age: userData?.age,
              gender: userData?.gender as "male" | "female" | undefined,
            });
          }
          const treatmentData: NightscoutTreatment = {
            eventType: `Activity: Other`,
            notes: `Synced from Health Connect: Active calories burned`,
            duration,
            intensity: "Medium",
            calories: caloriesKcal,
            caloriesBurned: caloriesKcal,
            created_at: startTime.toISOString(),
            createdBy: "GlucoseGoose Health Connect Sync",
          };

          try {
            const success = await addTreatment(
              userData.nightscoutUrl,
              userData.nightscoutSecret ?? "",
              treatmentData,
            );
            if (success) {
              syncedCount++;
              syncedMap[calorieId] = now;
            }
          } catch (error) {
            console.error("Failed to auto-sync active calories:", error);
          }
        }
      }

      await AsyncStorage.setItem(SYNCED_IDS_KEY, JSON.stringify(syncedMap));
      await AsyncStorage.setItem(LAST_SYNC_KEY, String(now));
    } catch (error) {
      console.error("Auto-sync failed:", error);
    } finally {
      isSyncingRef.current = false;
    }
  };

  useEffect(() => {
    runSync();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") runSync();
    });
    return () => sub.remove();
  }, [firebaseUser, userData?.nightscoutUrl, userData?.nightscoutSecret]);
};
