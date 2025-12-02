import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { CommonStyles } from "../../themes/styles";
import { Ionicons } from "@expo/vector-icons";
import { useNightscout } from "../../context/NightscoutContext";
import {
  addTreatment,
  updateTreatment,
  deleteTreatment,
} from "../../utils/fns";
import Constants from "expo-constants";
import { useAuth } from "../../context/AuthContext";
import { NightscoutTreatment } from "../../types/nightscout";
import alert from "../../utils/alert";

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
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  const [manualDuration, setManualDuration] = useState("");
  const [manualIntensity, setManualIntensity] = useState<"Low" | "Medium" | "High">("Medium");
  const [manualCaloriesBurned, setManualCaloriesBurned] = useState("");
  const [manualHeartRate, setManualHeartRate] = useState("");
  const [manualDistance, setManualDistance] = useState("");

  const { firebaseUser, userData } = useAuth();
  const {
    activities: nightscoutActivities,
    isLoading: isNightscoutLoading,
    fetchUpdates,
  } = useNightscout();
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
      intensity: activity.intensity as "Low" | "Medium" | "High" || "Medium",
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
    // Extract activity type from eventType (e.g., "Activity: Walking" -> "Walking")
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
          "Walking": 4,
          "Running": 10,
          "Cycling": 8,
          "Swimming": 7,
          "Yoga": 3,
          "Weight Training": 6,
          "Hiking": 5,
          "Dancing": 6,
          "Team Sports": 7,
          "Other": 5,
        };

        const intensityMultiplier: Record<string, number> = {
          "Low": 0.8,
          "Medium": 1.0,
          "High": 1.3,
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

    alert("Delete Activity", `Are you sure you want to delete this ${activityType} activity?`, [
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
            alert("Success", `${activityType} activity deleted successfully!`);

            if (editingActivityId === activity._id) {
              clearForm();
            }
          } catch (error: any) {
            alert(
              "Error",
              `Failed to delete activity: ${error?.message || "Unknown error"}`
            );
          }
        },
      },
    ]);
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

    let caloriesBurned = manualCaloriesBurned ? parseInt(manualCaloriesBurned) : 0;
    
    // Calculate calories if not manually entered
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
          `Failed to ${editingActivityId ? "update" : "save"} activity to Nightscout.`
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
  }, [activityDescription, manualDuration, manualIntensity, showManualInput, editingActivityId, selectedActivityType]);

  const getActivityIcon = (activityType: ActivityType) => {
    const icons: Record<ActivityType, string> = {
      "Walking": "walk",
      "Running": "fitness",
      "Cycling": "bicycle",
      "Swimming": "water",
      "Yoga": "body",
      "Weight Training": "barbell",
      "Hiking": "trail-sign",
      "Dancing": "musical-notes",
      "Team Sports": "football",
      "Other": "ellipse",
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

  const handlePhotoUpload = () => {
    alert("Info", "Photo upload functionality will be implemented soon");
  };

  const renderActivityTypeSelector = () => (
    <>
      <Text style={CommonStyles.sectionLabel}>Select Activity Type</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.activityTypeScroll}
        contentContainerStyle={styles.activityTypeScrollContent}
      >
        {activityTypes.map((activityType) => (
          <TouchableOpacity
            key={activityType}
            style={[
              styles.activityTypeButton,
              selectedActivityType === activityType &&
                styles.activityTypeButtonSelected,
            ]}
            onPress={() => setSelectedActivityType(activityType)}
          >
            <Ionicons
              name={getActivityIcon(activityType) as any}
              size={20}
              color={selectedActivityType === activityType ? "white" : "#007AFF"}
            />
            <Text
              style={[
                styles.activityTypeText,
                selectedActivityType === activityType &&
                  styles.activityTypeTextSelected,
              ]}
            >
              {activityType}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );

  const renderActivityDescription = () => (
    <View style={styles.activityDescriptionSection}>
      <Text style={CommonStyles.sectionLabel}>
        Describe your {selectedActivityType.toLowerCase()} activity
      </Text>
      <TextInput
        style={CommonStyles.textInputLarge}
        placeholder="Describe your activity in detail (e.g., 'Morning jog in the park, felt energetic, sunny weather')"
        value={activityDescription}
        onChangeText={setActivityDescription}
        multiline
        numberOfLines={3}
      />
    </View>
  );

  const renderDurationInput = () => (
    <View style={styles.durationSection}>
      <Text style={CommonStyles.sectionLabel}>Duration (minutes)</Text>
      <View style={styles.durationInputContainer}>
        <TextInput
          style={styles.durationInput}
          placeholder="0"
          value={manualDuration}
          onChangeText={setManualDuration}
          keyboardType="numeric"
        />
        <Text style={styles.durationLabel}>minutes</Text>
      </View>
    </View>
  );

  const renderIntensitySelector = () => (
    <View style={styles.intensitySection}>
      <Text style={CommonStyles.sectionLabel}>Intensity Level</Text>
      <View style={styles.intensityButtons}>
        {(["Low", "Medium", "High"] as const).map((intensity) => (
          <TouchableOpacity
            key={intensity}
            style={[
              styles.intensityButton,
              manualIntensity === intensity && styles.intensityButtonSelected,
            ]}
            onPress={() => setManualIntensity(intensity)}
          >
            <Text
              style={[
                styles.intensityText,
                manualIntensity === intensity && styles.intensityTextSelected,
              ]}
            >
              {intensity}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderManualInputs = () => (
    <View style={styles.manualInputGrid}>
      <View style={CommonStyles.inputRow}>
        <Text style={CommonStyles.nutritionLabel}>Calories Burned</Text>
        <TextInput
          style={CommonStyles.numberInput}
          placeholder="Auto-calculated"
          value={manualCaloriesBurned}
          onChangeText={setManualCaloriesBurned}
          keyboardType="numeric"
        />
      </View>
      <View style={CommonStyles.inputRow}>
        <Text style={CommonStyles.nutritionLabel}>Heart Rate (bpm)</Text>
        <TextInput
          style={CommonStyles.numberInput}
          placeholder="Optional"
          value={manualHeartRate}
          onChangeText={setManualHeartRate}
          keyboardType="numeric"
        />
      </View>
      <View style={CommonStyles.inputRow}>
        <Text style={CommonStyles.nutritionLabel}>Distance (km)</Text>
        <TextInput
          style={CommonStyles.numberInput}
          placeholder="Optional"
          value={manualDistance}
          onChangeText={setManualDistance}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderAIEstimation = () => (
    <>
      {isCalculatingCalories && (
        <View style={CommonStyles.caloriesCalculation}>
          <Ionicons name="sparkles" size={20} color="#007AFF" />
          <Text style={CommonStyles.caloriesCalculationText}>
            Calculating calories burned...
          </Text>
        </View>
      )}

      {manualCaloriesBurned && !isCalculatingCalories && (
        <View style={CommonStyles.aiEstimation}>
          <View style={CommonStyles.aiHeader}>
            <Ionicons name="sparkles" size={20} color="#4CAF50" />
            <Text style={CommonStyles.aiTitle}>Calories Estimation</Text>
          </View>
          <View style={styles.caloriesDisplay}>
            <Text style={styles.caloriesValue}>{manualCaloriesBurned}</Text>
            <Text style={styles.caloriesUnit}>calories burned</Text>
          </View>
          <Text style={styles.caloriesNote}>
            Based on {manualDuration} minutes of {selectedActivityType.toLowerCase()} at {manualIntensity.toLowerCase()} intensity
          </Text>
        </View>
      )}
    </>
  );

  const renderTodayActivities = () => {
    if (!todayActivities || todayActivities.length === 0) return null;

    return (
      <View style={CommonStyles.mealsSummary}>
        <Text style={CommonStyles.summaryTitle}>Today's Activities</Text>
        {todayActivities.map((activity) => {
          const metrics = extractMetricsFromActivity(activity);
          const activityType = getActivityTypeFromEvent(activity.eventType || "");

          return (
            <View key={activity._id || activity.id} style={CommonStyles.mealItem}>
              <View style={CommonStyles.mealHeader}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <Ionicons
                    name={getActivityIcon(activityType) as any}
                    size={16}
                    color="#007AFF"
                  />
                  <Text style={CommonStyles.mealType}>{activityType}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {metrics.duration > 0 && (
                    <Text style={CommonStyles.mealCalories}>
                      {metrics.duration} min
                    </Text>
                  )}
                  <TouchableOpacity
                    onPress={() => loadActivityForEditing(activity)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="create-outline" size={18} color="#666" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteActivity(activity)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={CommonStyles.mealDescription}>
                {activity.notes || "No description"}
              </Text>
              {(metrics.duration > 0 || metrics.caloriesBurned) && (
                <View style={CommonStyles.mealNutrition}>
                  <Text style={CommonStyles.nutritionDetail}>
                    Duration: {metrics.duration} min
                    {metrics.intensity && ` | Intensity: ${metrics.intensity}`}
                    {metrics.caloriesBurned && ` | Calories: ${metrics.caloriesBurned}`}
                    {metrics.heartRate && ` | HR: ${metrics.heartRate} bpm`}
                    {metrics.distance && ` | Distance: ${metrics.distance} km`}
                  </Text>
                </View>
              )}
              <Text style={CommonStyles.nutritionDetail}>
                Time: {new Date(activity.created_at).toLocaleString()}
              </Text>
            </View>
          );
        })}
        <View style={CommonStyles.totalNutrition}>
          <Text style={CommonStyles.totalTitle}>Daily Activity Summary:</Text>
          <Text style={CommonStyles.totalDetail}>
            {totalActivityStats.activityCount} activities | {totalActivityStats.totalDuration} min total | {totalActivityStats.totalCalories} calories burned
            {totalActivityStats.totalDistance > 0 && ` | ${totalActivityStats.totalDistance.toFixed(1)} km`}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={CommonStyles.journalContainer}>
      {renderActivityTypeSelector()}

      {/* Activity Description */}
      {renderActivityDescription()}

      {/* Duration Input */}
      {renderDurationInput()}

      {/* Intensity Selector */}
      {renderIntensitySelector()}

      {/* Additional Metrics Section */}
      <View style={styles.nutritionSection}>
        <View style={CommonStyles.nutritionHeader}>
          <Text style={CommonStyles.sectionLabel}>Additional Metrics</Text>
          <TouchableOpacity
            onPress={toggleManualInput}
            style={CommonStyles.toggleButton}
          >
            <Text style={CommonStyles.toggleButtonText}>
              {showManualInput ? "Use AI Calculation" : "Enter Manually"}
            </Text>
          </TouchableOpacity>
        </View>

        {showManualInput ? renderManualInputs() : renderAIEstimation()}
      </View>


      {/* Today's Activities Summary */}
      {renderTodayActivities()}

      {/* Save/Update Button */}
      <TouchableOpacity
        style={[
          CommonStyles.saveButton,
          editingActivityId && { backgroundColor: "#4CAF50" },
        ]}
        onPress={handleSaveActivity}
        disabled={isCalculatingCalories || !manualDuration}
      >
        <Text style={CommonStyles.saveButtonText}>
          {isCalculatingCalories
            ? "Calculating..."
            : editingActivityId
            ? `Update ${selectedActivityType}`
            : `Log ${selectedActivityType} Activity`}
        </Text>
      </TouchableOpacity>

      {/* Cancel Edit Button */}
      {editingActivityId && (
        <TouchableOpacity
          style={[
            CommonStyles.saveButton,
            { backgroundColor: "#FF6B6B", marginTop: 8 },
          ]}
          onPress={clearForm}
        >
          <Text style={CommonStyles.saveButtonText}>Cancel Edit</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  activityTypeScroll: {
    marginBottom: 24,
  },
  activityTypeScrollContent: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  activityTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#007AFF",
    marginRight: 12,
    backgroundColor: "white",
  },
  activityTypeButtonSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  activityTypeText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#007AFF",
  },
  activityTypeTextSelected: {
    color: "white",
  },
  activityDescriptionSection: {
    marginBottom: 24,
  },
  durationSection: {
    marginBottom: 20,
  },
  durationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "white",
  },
  durationLabel: {
    marginLeft: 12,
    fontSize: 14,
    color: "#666",
  },
  intensitySection: {
    marginBottom: 24,
  },
  intensityButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  intensityButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "white",
    alignItems: "center",
  },
  intensityButtonSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  intensityText: {
    fontSize: 14,
    color: "#666",
  },
  intensityTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  nutritionSection: {
    marginBottom: 24,
  },
  manualInputGrid: {
    backgroundColor: "#F8F9FA",
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E9ECEF",
  },
  caloriesDisplay: {
    alignItems: "center",
    marginVertical: 10,
  },
  caloriesValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  caloriesUnit: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  caloriesNote: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
    borderRadius: 4,
  },
});

export default SportsSection;