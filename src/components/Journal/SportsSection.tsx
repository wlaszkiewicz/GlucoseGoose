import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons, Feather, FontAwesome5 } from "@expo/vector-icons";
import { useNightscout } from "../../context/NightscoutContext";
import {
  addTreatment,
  updateTreatment,
  deleteTreatment,
} from "../../utils/cloud_functions";
import Constants from "expo-constants";
import { useAuth } from "../../context/AuthContext";
import { NightscoutTreatment } from "../../types/nightscout";
import alert from "../../utils/alert";
import { VintageStyles } from "../../themes/vintage/styles_vintage";
import { VintageColors } from "../../themes/vintage/colors_vintage";
import { VintageStylesSports } from "../../themes/vintage/styles_vintage_sports";

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
  duration: number; // in minutes
  intensity?: "Low" | "Medium" | "High";
  caloriesBurned?: number;
  heartRate?: number;
  distance?: number; // in km
  notes?: string;
}

interface ActivitySectionProps {
  selectedDate: Date;
}

const SportsSection: React.FC<ActivitySectionProps> = ({ selectedDate }) => {
  const [selectedActivityType, setSelectedActivityType] =
    useState<ActivityType>("Walking");
  const [activityDescription, setActivityDescription] = useState("");
  const [isCalculatingCalories, setIsCalculatingCalories] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(
    null
  );

  const [manualDuration, setManualDuration] = useState("");
  const [manualIntensity, setManualIntensity] = useState<
    "Low" | "Medium" | "High"
  >("Medium");
  const [manualCaloriesBurned, setManualCaloriesBurned] = useState("");
  const [manualHeartRate, setManualHeartRate] = useState("");
  const [manualDistance, setManualDistance] = useState("");

  const { firebaseUser, userData } = useAuth();
  const { activities: nightscoutActivities, loadFullDay: fetchUpdates } =
    useNightscout();
  const CLOUD_FUNCTIONS_HOST = Constants.expoConfig?.extra?.cloudFunctionsHost;

  const todayActivities = useMemo(() => {
    const todayString = selectedDate.toISOString().split("T")[0];
    return nightscoutActivities.filter(
      (activity) =>
        activity.created_at?.startsWith(todayString) &&
        (activity.eventType?.toLowerCase().includes("activity") ||
          activity.eventType?.toLowerCase().includes("exercise"))
    );
  }, [nightscoutActivities, selectedDate]);

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

  const totalActivityStats = useMemo(() => {
    return todayActivities.reduce(
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
  }, [todayActivities]);

  const getActivityTypeFromEvent = (eventType: string): ActivityType => {
    const type = eventType.replace(/^(Activity|Exercise):?\s*/i, "");
    return activityTypes.includes(type as ActivityType)
      ? (type as ActivityType)
      : "Other";
  };

  const calculateCaloriesWithAI = async (
    activityType: ActivityType,
    duration: number,
    intensity: string
  ): Promise<number> => {
    setIsCalculatingCalories(true);

    return new Promise((resolve) => {
      setTimeout(() => {
        setIsCalculatingCalories(false);

        const baseCalories: Record<ActivityType, number> = {
          Walking: 4,
          Running: 10,
          Cycling: 8,
          Swimming: 7,
          Yoga: 3,
          "Weight Training": 6,
          Hiking: 5,
          Dancing: 6,
          "Team Sports": 7,
          Other: 5,
        };

        const intensityMultiplier: Record<string, number> = {
          Low: 0.8,
          Medium: 1.0,
          High: 1.3,
        };

        const caloriesPerMinute = baseCalories[activityType] || 5;
        const multiplier = intensityMultiplier[intensity] || 1.0;

        resolve(Math.round(caloriesPerMinute * duration * multiplier));
      }, 1500);
    });
  };

  const loadActivityForEditing = (activity: NightscoutTreatment) => {
    if (!activity._id) {
      alert("Error", "Cannot edit activity without a valid ID.");
      return;
    }
    setEditingActivityId(activity._id || null);
    setSelectedActivityType(getActivityTypeFromEvent(activity.eventType));
    setActivityDescription(activity.notes || "");

    const metrics = extractMetricsFromActivity(activity);
    setManualDuration(metrics.duration.toString());
    setManualIntensity(metrics.intensity || "Medium");
    setManualCaloriesBurned(metrics.caloriesBurned?.toString() || "");
    setManualHeartRate(metrics.heartRate?.toString() || "");
    setManualDistance(metrics.distance?.toString() || "");
    setShowManualInput(true);
  };

  const clearForm = () => {
    setActivityDescription("");
    setManualDuration("");
    setManualIntensity("Medium");
    setManualCaloriesBurned("");
    setManualHeartRate("");
    setManualDistance("");
    setShowManualInput(false);
    setEditingActivityId(null);
  };

  const handleDeleteActivity = async (activity: NightscoutTreatment) => {
    if (!activity._id) {
      alert("Error", "Cannot delete activity without a valid ID.");
      return;
    }

    if (!firebaseUser || !userData) {
      alert("Error", "You must be logged in to delete activities.");
      return;
    }

    if (!userData.nightscoutUrl) {
      alert("Error", "Nightscout URL is not configured.");
      return;
    }

    const activityType = getActivityTypeFromEvent(activity.eventType);

    alert(
      "Delete Activity",
      `Are you sure you want to delete this ${activityType} activity?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (!userData.nightscoutUrl) return;

              const success = await deleteTreatment(
                CLOUD_FUNCTIONS_HOST,
                userData.nightscoutUrl,
                userData.nightscoutSecret ?? "",
                activity._id!
              );

              if (!success) {
                alert("Error", "Failed to delete activity from Nightscout.");
                console.error("Failed to delete activity:", activity);
                return;
              }
              await fetchUpdates();
              alert(
                "Success",
                `${activityType} activity deleted successfully!`
              );

              if (editingActivityId === activity._id) {
                clearForm();
              }
            } catch (error: any) {
              alert(
                "Error",
                `Failed to delete activity: ${
                  error?.message || "Unknown error"
                }`
              );
            }
          },
        },
      ]
    );
  };

  const handleSaveActivity = async () => {
    if (!activityDescription.trim()) {
      alert("Error", "Please describe your activity");
      return;
    }

    if (!manualDuration || parseInt(manualDuration) <= 0) {
      alert("Error", "Please enter a valid duration in minutes");
      return;
    }

    if (!firebaseUser || !userData) {
      alert("Error", "You must be logged in to save activities.");
      return;
    }

    if (!userData.nightscoutUrl) {
      alert("Error", "Nightscout URL is not configured.");
      return;
    }

    let caloriesBurned = manualCaloriesBurned
      ? parseInt(manualCaloriesBurned)
      : 0;

    if (!manualCaloriesBurned && !isCalculatingCalories) {
      caloriesBurned = await calculateCaloriesWithAI(
        selectedActivityType,
        parseInt(manualDuration),
        manualIntensity
      );
    }

    const treatmentData: NightscoutTreatment = {
      eventType: `Activity: ${selectedActivityType}`,
      notes: activityDescription,
      duration: parseInt(manualDuration),
      intensity: manualIntensity,
      calories: caloriesBurned,
      caloriesBurned: caloriesBurned,
      heartRate: manualHeartRate ? parseInt(manualHeartRate) : undefined,
      distance: manualDistance ? parseFloat(manualDistance) : undefined,
      created_at: new Date().toISOString(),
    };

    try {
      let success;
      if (editingActivityId) {
        treatmentData._id = editingActivityId;
        success = await updateTreatment(
          CLOUD_FUNCTIONS_HOST,
          userData.nightscoutUrl,
          userData.nightscoutSecret ?? "",
          treatmentData
        );
      } else {
        success = await addTreatment(
          CLOUD_FUNCTIONS_HOST,
          userData.nightscoutUrl,
          userData.nightscoutSecret ?? "",
          treatmentData
        );
      }

      if (!success) {
        alert(
          "Error",
          `Failed to ${
            editingActivityId ? "update" : "save"
          } activity to Nightscout.`
        );
        console.error("Failed to save activity to Nightscout:", treatmentData);
        return;
      }

      await fetchUpdates();

      alert(
        "Success",
        `${selectedActivityType} activity ${
          editingActivityId ? "updated" : "saved"
        } to Nightscout!`
      );

      clearForm();
    } catch (error: any) {
      alert(
        "Error",
        `Failed to save activity: ${error?.message || "Unknown error"}`
      );
    }
  };

  useEffect(() => {
    const analyzeActivityWithAI = async () => {
      if (
        activityDescription.trim().length > 5 &&
        manualDuration &&
        parseInt(manualDuration) > 0 &&
        !showManualInput &&
        !editingActivityId
      ) {
        try {
          const calories = await calculateCaloriesWithAI(
            selectedActivityType,
            parseInt(manualDuration),
            manualIntensity
          );
          setManualCaloriesBurned(calories.toString());
        } catch (error) {
          console.error("Error calculating calories:", error);
        }
      }
    };

    const timeoutId = setTimeout(analyzeActivityWithAI, 500);
    return () => clearTimeout(timeoutId);
  }, [
    activityDescription,
    manualDuration,
    manualIntensity,
    showManualInput,
    editingActivityId,
    selectedActivityType,
  ]);

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
    return icons[activityType];
  };

  const toggleManualInput = () => {
    setShowManualInput(!showManualInput);
    if (!showManualInput) {
      setManualCaloriesBurned("");
      setManualHeartRate("");
      setManualDistance("");
    }
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
    return colors[activityType];
  };

  const renderActivityTypeSelector = () => (
    <View style={VintageStylesSports.sectionContainer}>
      <View style={VintageStyles.sectionHeader}>
        <Text style={VintageStyles.sectionTitle}>Select Activity Type</Text>
        <View style={VintageStyles.featherAccent}>
          <FontAwesome5
            name="running"
            size={16}
            color={VintageColors.primaryText}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={VintageStylesSports.activityTypeScroll}
        contentContainerStyle={VintageStylesSports.activityTypeScrollContent}
      >
        {activityTypes.map((activityType) => {
          const isSelected = selectedActivityType === activityType;
          const iconColor = VintageColors.primaryText;
          const backgroundColor = getActivityColor(activityType);

          return (
            <TouchableOpacity
              key={activityType}
              style={[
                VintageStylesSports.activityTypeButton,
                isSelected && VintageStylesSports.activityTypeButtonSelected,
              ]}
              onPress={() => setSelectedActivityType(activityType)}
            >
              <View
                style={[
                  VintageStylesSports.activityIconContainer,
                  { backgroundColor },
                  isSelected &&
                    VintageStylesSports.activityIconContainerSelected,
                ]}
              >
                <Ionicons
                  name={getActivityIcon(activityType) as any}
                  size={20}
                  color={iconColor}
                />
              </View>
              <Text
                style={[
                  VintageStylesSports.activityTypeText,
                  isSelected && VintageStylesSports.activityTypeTextSelected,
                ]}
              >
                {activityType}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderActivityDescription = () => (
    <View style={VintageStylesSports.sectionContainer}>
      <View style={VintageStyles.sectionHeader}>
        <Text style={VintageStyles.sectionTitle}>Activity Description</Text>
        <View style={VintageStyles.featherAccent}>
          <Feather name="edit-3" size={16} color={VintageColors.primaryText} />
        </View>
      </View>

      <View style={VintageStylesSports.descriptionCard}>
        <TextInput
          style={VintageStylesSports.descriptionInput}
          placeholder="Describe your activity in detail (e.g., 'Morning jog in the park, felt energetic, sunny weather')"
          value={activityDescription}
          onChangeText={setActivityDescription}
          multiline
          numberOfLines={3}
          placeholderTextColor={VintageColors.secondaryText}
        />
      </View>
    </View>
  );

  const renderDurationInput = () => (
    <View style={VintageStylesSports.sectionContainer}>
      <View style={VintageStyles.sectionHeader}>
        <Text style={VintageStyles.sectionTitle}>Duration & Intensity</Text>
        <View style={VintageStyles.featherAccent}>
          <Feather name="clock" size={16} color={VintageColors.primaryText} />
        </View>
      </View>

      <View style={VintageStylesSports.durationIntensityCard}>
        <View style={VintageStylesSports.durationSection}>
          <Text style={VintageStylesSports.inputLabel}>Duration (minutes)</Text>
          <View style={VintageStylesSports.durationInputContainer}>
            <TextInput
              style={VintageStylesSports.durationInput}
              placeholder="0"
              value={manualDuration}
              onChangeText={setManualDuration}
              keyboardType="numeric"
              placeholderTextColor={VintageColors.secondaryText}
            />
            <View style={VintageStylesSports.durationUnit}>
              <Text style={VintageStylesSports.durationUnitText}>min</Text>
            </View>
          </View>
        </View>

        <View style={VintageStylesSports.intensitySection}>
          <View style={VintageStyles.spacing10} />
          <Text style={VintageStylesSports.inputLabel}>Intensity Level</Text>
          <View style={VintageStylesSports.intensityButtons}>
            {(["Low", "Medium", "High"] as const).map((intensity) => (
              <TouchableOpacity
                key={intensity}
                style={[
                  VintageStylesSports.intensityButton,
                  manualIntensity === intensity &&
                    VintageStylesSports.intensityButtonSelected,
                ]}
                onPress={() => setManualIntensity(intensity)}
              >
                <Text
                  style={[
                    VintageStylesSports.intensityText,
                    manualIntensity === intensity &&
                      VintageStylesSports.intensityTextSelected,
                  ]}
                >
                  {intensity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const renderManualInputs = () => (
    <View style={VintageStylesSports.sectionContainer}>
      <View style={VintageStylesSports.manualInputsCard}>
        <View style={VintageStylesSports.inputRow}>
          <View style={VintageStylesSports.inputLabelContainer}>
            <Ionicons
              name="flame"
              size={16}
              color={VintageColors.primaryText}
              style={VintageStylesSports.inputIcon}
            />
            <Text style={VintageStylesSports.inputLabel}>Calories Burned</Text>
          </View>
          <TextInput
            style={VintageStylesSports.numberInput}
            placeholder="Auto-calculated"
            value={manualCaloriesBurned}
            onChangeText={setManualCaloriesBurned}
            keyboardType="numeric"
            placeholderTextColor={VintageColors.secondaryText}
          />
        </View>

        <View style={VintageStylesSports.inputRow}>
          <View style={VintageStylesSports.inputLabelContainer}>
            <Ionicons
              name="heart"
              size={16}
              color={VintageColors.primaryText}
              style={VintageStylesSports.inputIcon}
            />
            <Text style={VintageStylesSports.inputLabel}>Heart Rate (bpm)</Text>
          </View>
          <TextInput
            style={VintageStylesSports.numberInput}
            placeholder="Optional"
            value={manualHeartRate}
            onChangeText={setManualHeartRate}
            keyboardType="numeric"
            placeholderTextColor={VintageColors.secondaryText}
          />
        </View>

        <View style={VintageStylesSports.inputRow}>
          <View style={VintageStylesSports.inputLabelContainer}>
            <Feather
              name="map-pin"
              size={16}
              color={VintageColors.primaryText}
              style={VintageStylesSports.inputIcon}
            />
            <Text style={VintageStylesSports.inputLabel}>Distance (km)</Text>
          </View>
          <TextInput
            style={VintageStylesSports.numberInput}
            placeholder="Optional"
            value={manualDistance}
            onChangeText={setManualDistance}
            keyboardType="numeric"
            placeholderTextColor={VintageColors.secondaryText}
          />
        </View>
      </View>
    </View>
  );

  const renderAIEstimation = () => (
    <View style={VintageStylesSports.sectionContainer}>
      {isCalculatingCalories && (
        <View style={VintageStylesSports.caloriesCalculation}>
          <View style={VintageStylesSports.calculationIcon}>
            <Ionicons
              name="sparkles"
              size={24}
              color={VintageColors.primaryText}
            />
          </View>
          <Text style={VintageStylesSports.caloriesCalculationText}>
            Calculating calories burned...
          </Text>
        </View>
      )}

      {manualCaloriesBurned && !isCalculatingCalories && (
        <View style={VintageStylesSports.aiEstimationCard}>
          <View style={VintageStylesSports.aiHeader}>
            <View style={VintageStylesSports.aiIconContainer}>
              <Ionicons name="sparkles" size={20} color="#4CAF50" />
            </View>
            <Text style={VintageStylesSports.aiTitle}>AI Estimation</Text>
          </View>
          <View style={VintageStylesSports.caloriesDisplay}>
            <Text style={VintageStylesSports.caloriesValue}>
              {manualCaloriesBurned}
            </Text>
            <Text style={VintageStylesSports.caloriesUnit}>
              calories burned
            </Text>
          </View>
          <Text style={VintageStylesSports.caloriesNote}>
            Based on {manualDuration} minutes of{" "}
            {selectedActivityType.toLowerCase()} at{" "}
            {manualIntensity.toLowerCase()} intensity
          </Text>
        </View>
      )}
    </View>
  );

  const renderTodayActivities = () => {
    if (!todayActivities || todayActivities.length === 0) return null;

    return (
      <View style={VintageStylesSports.sectionContainer}>
        <View style={VintageStyles.sectionHeader}>
          <Text style={VintageStyles.sectionTitle}>Today's Activities</Text>
          <View style={VintageStylesSports.activitiesCount}>
            <Text style={VintageStylesSports.activitiesCountText}>
              {todayActivities.length}
            </Text>
          </View>
        </View>

        {todayActivities.map((activity) => {
          const metrics = extractMetricsFromActivity(activity);
          const activityType = getActivityTypeFromEvent(
            activity.eventType || ""
          );
          const activityColor = getActivityColor(activityType);

          return (
            <TouchableOpacity
              key={`${activity._id || activity.id}_${activity.created_at}`}
              style={VintageStylesSports.activityCard}
              onPress={() => loadActivityForEditing(activity)}
            >
              <View style={VintageStylesSports.activityHeader}>
                <View style={VintageStylesSports.activityHeaderLeft}>
                  <View
                    style={[
                      VintageStylesSports.activityTypeIcon,
                      { backgroundColor: activityColor },
                    ]}
                  >
                    <Ionicons
                      name={getActivityIcon(activityType) as any}
                      size={18}
                      color={VintageColors.primaryText}
                    />
                  </View>
                  <View>
                    <Text style={VintageStylesSports.activityCardType}>
                      {activityType}
                    </Text>
                    <Text style={VintageStylesSports.activityTime}>
                      {new Date(activity.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>
                <View style={VintageStylesSports.activityHeaderRight}>
                  {metrics.duration > 0 && (
                    <Text style={VintageStylesSports.activityDuration}>
                      {metrics.duration} min
                    </Text>
                  )}
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteActivity(activity);
                    }}
                    style={VintageStylesSports.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={VintageStylesSports.activityDescription}>
                {activity.notes || "No description"}
              </Text>
              {(metrics.duration > 0 ||
                metrics.caloriesBurned ||
                metrics.distance) && (
                <View style={VintageStylesSports.activityMetrics}>
                  <View style={VintageStylesSports.metricsRow}>
                    {metrics.intensity && (
                      <View style={VintageStylesSports.metricItem}>
                        <Ionicons
                          name="speedometer"
                          size={14}
                          color={VintageColors.secondaryText}
                        />
                        <Text style={VintageStylesSports.metricText}>
                          {metrics.intensity}
                        </Text>
                      </View>
                    )}
                    {metrics.caloriesBurned && (
                      <View style={VintageStylesSports.metricItem}>
                        <Ionicons
                          name="flame"
                          size={14}
                          color={VintageColors.secondaryText}
                        />
                        <Text style={VintageStylesSports.metricText}>
                          {metrics.caloriesBurned} cal
                        </Text>
                      </View>
                    )}
                    {metrics.distance && (
                      <View style={VintageStylesSports.metricItem}>
                        <Feather
                          name="map-pin"
                          size={14}
                          color={VintageColors.secondaryText}
                        />
                        <Text style={VintageStylesSports.metricText}>
                          {metrics.distance} km
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={VintageStylesSports.totalStatsCard}>
          <Text style={VintageStylesSports.totalTitle}>Daily Summary</Text>
          <View style={VintageStylesSports.totalStats}>
            <View style={VintageStylesSports.totalStatItem}>
              <Text style={VintageStylesSports.totalStatValue}>
                {totalActivityStats.activityCount}
              </Text>
              <Text style={VintageStylesSports.totalStatLabel}>activities</Text>
            </View>
            <View style={VintageStylesSports.totalStatDivider} />
            <View style={VintageStylesSports.totalStatItem}>
              <Text style={VintageStylesSports.totalStatValue}>
                {totalActivityStats.totalDuration}
              </Text>
              <Text style={VintageStylesSports.totalStatLabel}>minutes</Text>
            </View>
            <View style={VintageStylesSports.totalStatDivider} />
            <View style={VintageStylesSports.totalStatItem}>
              <Text style={VintageStylesSports.totalStatValue}>
                {totalActivityStats.totalCalories}
              </Text>
              <Text style={VintageStylesSports.totalStatLabel}>calories</Text>
            </View>
            {totalActivityStats.totalDistance > 0 && (
              <>
                <View style={VintageStylesSports.totalStatDivider} />
                <View style={VintageStylesSports.totalStatItem}>
                  <Text style={VintageStylesSports.totalStatValue}>
                    {totalActivityStats.totalDistance.toFixed(1)}
                  </Text>
                  <Text style={VintageStylesSports.totalStatLabel}>km</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderInputToggle = () => (
    <View style={VintageStylesSports.sectionContainer}>
      <TouchableOpacity
        style={VintageStylesSports.toggleCard}
        onPress={toggleManualInput}
      >
        <View style={VintageStylesSports.toggleHeader}>
          <Feather
            name={showManualInput ? "edit-3" : "cpu"}
            size={20}
            color={VintageColors.primaryText}
          />
          <Text style={VintageStylesSports.toggleTitle}>
            {showManualInput ? "Manual Input" : "AI Calculation"}
          </Text>
        </View>
        <View style={VintageStylesSports.toggleArrow}>
          <Feather
            name={showManualInput ? "chevron-up" : "chevron-down"}
            size={20}
            color={VintageColors.secondaryText}
          />
        </View>
      </TouchableOpacity>
    </View>
  );

  // Render Log Activity Button
  const renderLogActivityButton = () => (
    <View style={VintageStylesSports.sectionContainer}>
      <TouchableOpacity
        style={[
          VintageStylesSports.saveButton,
          editingActivityId && VintageStylesSports.updateButton,
        ]}
        onPress={handleSaveActivity}
        disabled={isCalculatingCalories || !manualDuration}
      >
        <View style={VintageStylesSports.saveButtonIcon}>
          {editingActivityId ? (
            <Feather name="save" size={20} color="#FFFFFF" />
          ) : (
            <Feather name="plus" size={20} color="#FFFFFF" />
          )}
        </View>
        <Text style={VintageStylesSports.saveButtonText}>
          {isCalculatingCalories
            ? "Calculating..."
            : editingActivityId
            ? `Update ${selectedActivityType}`
            : `Log ${selectedActivityType} Activity`}
        </Text>
      </TouchableOpacity>

      {editingActivityId && (
        <TouchableOpacity
          style={VintageStylesSports.cancelButton}
          onPress={clearForm}
        >
          <Text style={VintageStylesSports.cancelButtonText}>Cancel Edit</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView
      style={VintageStylesSports.container}
      showsVerticalScrollIndicator={false}
    >
      {renderActivityTypeSelector()}
      {renderActivityDescription()}
      {renderDurationInput()}

      {renderInputToggle()}
      {showManualInput ? renderManualInputs() : renderAIEstimation()}

      {renderLogActivityButton()}

      {renderTodayActivities()}

      <View style={VintageStyles.spacing60} />
    </ScrollView>
  );
};

export default SportsSection;
