import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, Ionicons } from "@expo/vector-icons";
import { VintageStyles } from "../themes/vintage/styles_vintage";
import { VintageColors } from "../themes/vintage/colors";
import { VintageStylesSports } from "../themes/vintage/styles_vintage_sports";
import { useAuth } from "../contexts/AuthContext";
import { useNightscout } from "../contexts/NightscoutContext";
import { addTreatment } from "../utils/cloudFunctions";
import { NightscoutTreatment } from "../types/nightscout";
import { ActivityType } from "../types/events";
import {
  estimateCaloriesFallback,
  getEnergyKcal,
  getMassGrams,
  getMealTypeFromHealthConnect,
  inferActivityType,
  getNutritionRecordTime,
  roundNutrition,
  sumCaloriesForSession,
} from "../utils/healthConnectUtils";
import alert from "../utils/alert";

// Conditionally import Health Connect only on Android
let initialize: any = null;
let requestPermission: any = null;
let readRecords: any = null;
let openHealthConnectSettings: any = null;

if (Platform.OS === 'android') {
  try {
    const healthConnect = require("react-native-health-connect");
    initialize = healthConnect.initialize;
    requestPermission = healthConnect.requestPermission;
    readRecords = healthConnect.readRecords;
    openHealthConnectSettings = healthConnect.openHealthConnectSettings;
  } catch (error) {
    console.warn("react-native-health-connect not available:", error);
  }
}

export default function HealthConnectScreen() {
  const [steps, setSteps] = useState<any[]>([]);
  const [heartRate, setHeartRate] = useState<any[]>([]);
  const [activeCalories, setActiveCalories] = useState<any[]>([]);
  const [distance, setDistance] = useState<any[]>([]);
  const [exerciseSessions, setExerciseSessions] = useState<any[]>([]);
  const [nutritionRecords, setNutritionRecords] = useState<any[]>([]);
  const [granted, setGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [healthAutoSyncEnabled, setHealthAutoSyncEnabled] = useState(true);

  const { firebaseUser, userData } = useAuth();
  const { fetchTreatments } = useNightscout();

  // Load permission status from AsyncStorage on component mount
  useEffect(() => {
    const loadPermissionStatus = async () => {
      try {
        const storedGranted = await AsyncStorage.getItem('healthConnectGranted');
        if (storedGranted === 'true') {
          setGranted(true);
          // Automatically load data if permissions are already granted
          await loadDataWithoutPermissions();
        }
      } catch (error) {
        console.error('Error loading permission status:', error);
      }
    };
    loadPermissionStatus();
  }, []);

  useEffect(() => {
    const loadHealthAutoSync = async () => {
      const stored = await AsyncStorage.getItem("healthConnectAutoSyncEnabled");
      if (stored === null) {
        await AsyncStorage.setItem("healthConnectAutoSyncEnabled", "true");
        setHealthAutoSyncEnabled(true);
        return;
      }
      setHealthAutoSyncEnabled(stored === "true");
    };
    loadHealthAutoSync();
  }, []);

  const loadDataWithoutPermissions = async () => {
    if (!initialize || !readRecords) {
      alert("Error", "Health Connect is not available on this device.");
      return;
    }

    setIsLoading(true);
    try {
      const isInit = await initialize();
      if (!isInit) {
        console.log("Health Connect not available");
        return;
      }

      const readAllRecords = async (
        recordType: string,
        timeRangeFilter: {
          operator: "between";
          startTime: string;
          endTime: string;
        },
      ) => {
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
          console.warn(`Health Connect read failed for ${recordType}:`, error?.message || error);
          return [];
        }
      };

      const start = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24h
      const end = new Date();
      const timeRangeFilter = {
        operator: "between" as const,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      };

      const [
        stepsRecords,
        hrRecords,
        caloriesRecords,
        distanceRecords,
        exerciseRecords,
        nutritionRecordsData,
      ] = await Promise.all([
        readAllRecords("Steps", timeRangeFilter),
        readAllRecords("HeartRate", timeRangeFilter),
        readAllRecords("ActiveCaloriesBurned", timeRangeFilter),
        readAllRecords("Distance", timeRangeFilter),
        readAllRecords("ExerciseSession", timeRangeFilter),
        readAllRecords("Nutrition", timeRangeFilter),
      ]);

      setSteps(stepsRecords);
      setHeartRate(hrRecords);
      setActiveCalories(caloriesRecords);
      setDistance(distanceRecords);
      setExerciseSessions(exerciseRecords);
      setNutritionRecords(nutritionRecordsData);
    } catch (error) {
      console.error("Error loading health data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncActivitiesToJournal = async () => {
    if (!firebaseUser || !userData) {
      alert("Error", "You must be logged in to sync activities.");
      return;
    }

    if (!userData.nightscoutUrl) {
      alert("Error", "Nightscout URL is not configured.");
      return;
    }

    setIsSyncing(true);
    let syncedCount = 0;

    try {
      // Process exercise sessions
      for (const session of exerciseSessions) {
        const startTime = new Date(session.startTime || session.startTimeMillis);
        const endTime = new Date(session.endTime || session.endTimeMillis);
        const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // minutes

        // Map exercise type to our activity types
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
          duration: duration,
          intensity: "Medium", // Default, could be improved with more data
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
          if (success) syncedCount++;
        } catch (error) {
          console.error("Failed to sync exercise session:", error);
        }
      }

      // Process active calories if no exercise sessions
      if (exerciseSessions.length === 0 && activeCalories.length > 0) {
        for (const calorieData of activeCalories) {
          const startTime = new Date(calorieData.startTime || calorieData.startTimeMillis);
          const endTime = new Date(calorieData.endTime || calorieData.endTimeMillis);
          const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // minutes

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
            duration: duration,
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
            if (success) syncedCount++;
          } catch (error) {
            console.error("Failed to sync active calories:", error);
          }
        }
      }

      // Process nutrition records (meals)
      if (nutritionRecords.length > 0) {
        for (const record of nutritionRecords) {
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
            if (success) syncedCount++;
          } catch (error) {
            console.error("Failed to sync nutrition record:", error);
          }
        }
      }

      await fetchTreatments(new Date()); // Refresh today's data

      alert("Success", `Successfully synced ${syncedCount} activities to your journal!`);

    } catch (error: any) {
      alert("Error", `Failed to sync activities: ${error?.message || "Unknown error"}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const loadData = async () => {
    if (!initialize || !requestPermission || !readRecords) {
      alert("Error", "Health Connect is not available on this device.");
      return;
    }

    setIsLoading(true);
    try {
      const isInit = await initialize();
      if (!isInit) {
        console.log("Health Connect not available");
        return;
      }

      const readAllRecords = async (
        recordType: string,
        timeRangeFilter: {
          operator: "between";
          startTime: string;
          endTime: string;
        },
      ) => {
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
          console.warn(`Health Connect read failed for ${recordType}:`, error?.message || error);
          return [];
        }
      };

      const permissions: any[] = [
        { accessType: "read", recordType: "Steps" },
        { accessType: "read", recordType: "HeartRate" },
        { accessType: "read", recordType: "ActiveCaloriesBurned" },
        { accessType: "read", recordType: "Distance" },
        { accessType: "read", recordType: "ExerciseSession" },
        { accessType: "read", recordType: "Nutrition" },
      ];

      const grantedPermissions = await requestPermission(permissions);

      const hasPermissions = grantedPermissions.length > 0;
      setGranted(hasPermissions);

      // Save permission status to AsyncStorage
      try {
        await AsyncStorage.setItem('healthConnectGranted', hasPermissions ? 'true' : 'false');
      } catch (error) {
        console.error('Error saving permission status:', error);
      }

      if (grantedPermissions) {
        const start = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24h
        const end = new Date();
        const timeRangeFilter = {
          operator: "between" as const,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        };

        const [
          stepsRecords,
          hrRecords,
          caloriesRecords,
          distanceRecords,
          exerciseRecords,
          nutritionRecordsData,
        ] = await Promise.all([
          readAllRecords("Steps", timeRangeFilter),
          readAllRecords("HeartRate", timeRangeFilter),
          readAllRecords("ActiveCaloriesBurned", timeRangeFilter),
          readAllRecords("Distance", timeRangeFilter),
          readAllRecords("ExerciseSession", timeRangeFilter),
          readAllRecords("Nutrition", timeRangeFilter),
        ]);

        setSteps(stepsRecords);
        setHeartRate(hrRecords);
        setActiveCalories(caloriesRecords);
        setDistance(distanceRecords);
        setExerciseSessions(exerciseRecords);
        setNutritionRecords(nutritionRecordsData);
      }
    } catch (error) {
      console.error("Error loading health data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPermissionStatus = () => (
    <View style={VintageStylesSports.sectionContainer}>
      <View style={VintageStyles.sectionHeader}>
        <Text style={VintageStyles.sectionTitle}>Health Connect Status</Text>
        <View style={VintageStyles.featherAccent}>
          <Ionicons
            name="shield-checkmark"
            size={16}
            color={VintageColors.primaryText}
          />
        </View>
      </View>

      <View style={VintageStylesSports.descriptionCard}>
        <View style={VintageStylesSports.statusIndicator}>
          <Ionicons
            name={granted ? "checkmark-circle" : "close-circle"}
            size={24}
            color={granted ? VintageColors.iconGreen : VintageColors.iconRed}
          />
          <Text style={VintageStylesSports.statusText}>
            Permissions: {granted ? "Granted" : "Not Granted"}
          </Text>
        </View>
        {Platform.OS === "android" && openHealthConnectSettings && (
          <TouchableOpacity
            style={[VintageStylesSports.saveButton, { marginTop: 12 }]}
            onPress={() => openHealthConnectSettings()}
          >
            <View style={VintageStylesSports.saveButtonIcon}>
              <Ionicons name="settings" size={20} color="#FFFFFF" />
            </View>
            <Text style={VintageStylesSports.saveButtonText}>
              Open Health Connect Settings
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderDataSection = (title: string, data: any[], icon: string, unit: string, valueKey: string) => (
    <View style={VintageStylesSports.sectionContainer}>
      <View style={VintageStyles.sectionHeader}>
        <Text style={VintageStyles.sectionTitle}>{title}</Text>
        <View style={VintageStyles.featherAccent}>
          <Ionicons name={icon as any} size={16} color={VintageColors.primaryText} />
        </View>
      </View>

      {data.length > 0 ? (
        <View style={VintageStylesSports.descriptionCard}>
          {data.slice(0, 5).map((item, i) => (
            <View key={i} style={VintageStylesSports.dataItem}>
              <Text style={VintageStylesSports.dataTime}>
                {new Date(item.startTime || item.startTimeMillis).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Text style={VintageStylesSports.dataValue}>
                {valueKey === "title" ? item.title : item[valueKey]} {unit}
              </Text>
            </View>
          ))}
          {data.length > 5 && (
            <Text style={VintageStylesSports.moreDataText}>
              ... and {data.length - 5} more entries
            </Text>
          )}
        </View>
      ) : (
        <View style={VintageStylesSports.descriptionCard}>
          <Text style={VintageStylesSports.noDataText}>No data available</Text>
        </View>
      )}
    </View>
  );

  const renderNutritionSection = () => (
    <View style={VintageStylesSports.sectionContainer}>
      <View style={VintageStyles.sectionHeader}>
        <Text style={VintageStyles.sectionTitle}>Nutrition (Last 24h)</Text>
        <View style={VintageStyles.featherAccent}>
          <Ionicons
            name="nutrition"
            size={16}
            color={VintageColors.primaryText}
          />
        </View>
      </View>

      {nutritionRecords.length > 0 ? (
        <View style={VintageStylesSports.descriptionCard}>
          {nutritionRecords.slice(0, 5).map((item, i) => {
            const kcal = getEnergyKcal(item.energy);
            const name = item.name || "Meal";
            return (
              <View key={i} style={VintageStylesSports.dataItem}>
                <Text style={VintageStylesSports.dataTime}>
                  {new Date(
                    item.startTime || item.startTimeMillis,
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                <Text style={VintageStylesSports.dataValue}>
                  {name} {kcal > 0 ? `• ${Math.round(kcal)} kcal` : ""}
                </Text>
              </View>
            );
          })}
          {nutritionRecords.length > 5 && (
            <Text style={VintageStylesSports.moreDataText}>
              ... and {nutritionRecords.length - 5} more entries
            </Text>
          )}
        </View>
      ) : (
        <View style={VintageStylesSports.descriptionCard}>
          <Text style={VintageStylesSports.noDataText}>No data available</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: VintageColors.background }}>
      <ScrollView
        style={VintageStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={VintageStyles.spacing30} />

        <View style={VintageStylesSports.sectionContainer}>
          <View style={VintageStyles.sectionHeader}>
            <Text style={VintageStyles.sectionTitle}>Connect Health Data</Text>
            <View style={VintageStyles.featherAccent}>
              <Feather name="activity" size={16} color={VintageColors.primaryText} />
            </View>
          </View>

          <View style={VintageStylesSports.descriptionCard}>
            <Text style={VintageStylesSports.descriptionText}>
              Connect to Google Health Connect to access your fitness data from other apps like Google Fit, Strava, etc. Sync activities automatically to your journal for better glucose management.
            </Text>
          </View>
        </View>

        <View style={VintageStylesSports.sectionContainer}>
          <View style={VintageStyles.sectionHeader}>
            <Text style={VintageStyles.sectionTitle}>Auto-Sync</Text>
            <View style={VintageStyles.featherAccent}>
              <Feather name="refresh-cw" size={16} color={VintageColors.primaryText} />
            </View>
          </View>

          <View style={VintageStylesSports.descriptionCard}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={VintageStylesSports.descriptionText}>
                  Sync Health Connect automatically when the app opens.
                </Text>
              </View>
              <Switch
                value={healthAutoSyncEnabled}
                onValueChange={async (value) => {
                  setHealthAutoSyncEnabled(value);
                  await AsyncStorage.setItem(
                    "healthConnectAutoSyncEnabled",
                    value ? "true" : "false",
                  );
                }}
                trackColor={{
                  false: VintageColors.border,
                  true: VintageColors.iconGreen,
                }}
                thumbColor={
                  healthAutoSyncEnabled
                    ? "#FFFFFF"
                    : VintageColors.lightBackground
                }
              />
            </View>
          </View>
        </View>

        <View style={VintageStylesSports.sectionContainer}>
          <TouchableOpacity
            style={[VintageStylesSports.saveButton, isLoading && VintageStylesSports.saveButtonDisabled]}
            onPress={loadData}
            disabled={isLoading}
          >
            <View style={VintageStylesSports.saveButtonIcon}>
              <Ionicons
                name={isLoading ? "hourglass" : "link"}
                size={20}
                color="#FFFFFF"
              />
            </View>
            <Text style={VintageStylesSports.saveButtonText}>
              {isLoading ? "Connecting..." : "Request Permissions & Load Data"}
            </Text>
          </TouchableOpacity>
        </View>

        {granted && (exerciseSessions.length > 0 || activeCalories.length > 0) && (
          <View style={VintageStylesSports.sectionContainer}>
            <TouchableOpacity
              style={[VintageStylesSports.saveButton, isSyncing && VintageStylesSports.saveButtonDisabled]}
              onPress={syncActivitiesToJournal}
              disabled={isSyncing}
            >
              <View style={VintageStylesSports.saveButtonIcon}>
                <Ionicons
                  name={isSyncing ? "hourglass" : "sync"}
                  size={20}
                  color="#FFFFFF"
                />
              </View>
              <Text style={VintageStylesSports.saveButtonText}>
                {isSyncing ? "Syncing..." : "Sync Activities to Journal"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {renderPermissionStatus()}

        {renderDataSection("Steps (Last 24h)", steps, "footsteps", "steps", "count")}

        {renderDataSection("Heart Rate (Last 24h)", heartRate, "heart", "bpm", "bpm")}

        {renderNutritionSection()}

        <View style={VintageStyles.spacing60} />
      </ScrollView>
    </View>
  );
}
