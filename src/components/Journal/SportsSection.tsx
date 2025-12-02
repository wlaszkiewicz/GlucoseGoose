import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons, Feather, FontAwesome5 } from "@expo/vector-icons";
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
import { VintageStyles } from "../../themes/vintage/styles_vintage";
import { VintageColors } from "../../themes/vintage/colors_vintage";

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
      "Walking": "walk-outline",
      "Running": "fitness-outline",
      "Cycling": "bicycle-outline",
      "Swimming": "water-outline",
      "Yoga": "body-outline",
      "Weight Training": "barbell-outline",
      "Hiking": "trail-sign-outline",
      "Dancing": "musical-notes-outline",
      "Team Sports": "football-outline",
      "Other": "ellipsis-horizontal-outline",
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

  // Funkcja zwracająca kolor dla każdego typu aktywności (zawsze ten sam)
  const getActivityColor = (activityType: ActivityType): string => {
    const colors: Record<ActivityType, string> = {
      "Walking": VintageColors.iconGreen,
      "Running": VintageColors.iconPink,
      "Cycling": VintageColors.iconBlue,
      "Swimming": VintageColors.iconPurple,
      "Yoga": VintageColors.iconYellow,
      "Weight Training": VintageColors.iconBlue,
      "Hiking": VintageColors.iconGreen,
      "Dancing": VintageColors.iconPink,
      "Team Sports": VintageColors.iconPurple,
      "Other": VintageColors.iconYellow,
    };
    return colors[activityType];
  };

  const renderActivityTypeSelector = () => (
    <View style={styles.sectionContainer}>
      <View style={VintageStyles.sectionHeader}>
        <Text style={VintageStyles.sectionTitle}>Select Activity Type</Text>
        <View style={VintageStyles.featherAccent}>
          <FontAwesome5 name="running" size={16} color={VintageColors.primaryText} />
        </View>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.activityTypeScroll}
        contentContainerStyle={styles.activityTypeScrollContent}
      >
        {activityTypes.map((activityType) => {
          const isSelected = selectedActivityType === activityType;
          // Zawsze używaj primaryText dla ikony, niezależnie od stanu
          const iconColor = VintageColors.primaryText;
          // Zawsze używaj tego samego koloru dla danego typu aktywności
          const backgroundColor = getActivityColor(activityType);
          
          return (
            <TouchableOpacity
              key={activityType}
              style={[
                styles.activityTypeButton,
                isSelected && styles.activityTypeButtonSelected,
              ]}
              onPress={() => setSelectedActivityType(activityType)}
            >
              <View style={[
                styles.activityIconContainer,
                { backgroundColor },
                isSelected && styles.activityIconContainerSelected,
              ]}>
                <Ionicons
                  name={getActivityIcon(activityType) as any}
                  size={20}
                  color={iconColor}
                />
              </View>
              <Text
                style={[
                  styles.activityTypeText,
                  isSelected && styles.activityTypeTextSelected,
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
    <View style={styles.sectionContainer}>
      <View style={VintageStyles.sectionHeader}>
        <Text style={VintageStyles.sectionTitle}>Activity Description</Text>
        <View style={VintageStyles.featherAccent}>
          <Feather name="edit-3" size={16} color={VintageColors.primaryText} />
        </View>
      </View>
      
      <View style={styles.descriptionCard}>
        <TextInput
          style={styles.descriptionInput}
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
    <View style={styles.sectionContainer}>
      <View style={VintageStyles.sectionHeader}>
        <Text style={VintageStyles.sectionTitle}>Duration & Intensity</Text>
        <View style={VintageStyles.featherAccent}>
          <Feather name="clock" size={16} color={VintageColors.primaryText} />
        </View>
      </View>
      
      <View style={styles.durationIntensityCard}>
        <View style={styles.durationSection}>
          <Text style={styles.inputLabel}>Duration (minutes)</Text>
          <View style={styles.durationInputContainer}>
            <TextInput
              style={styles.durationInput}
              placeholder="0"
              value={manualDuration}
              onChangeText={setManualDuration}
              keyboardType="numeric"
              placeholderTextColor={VintageColors.secondaryText}
            />
            <View style={styles.durationUnit}>
              <Text style={styles.durationUnitText}>min</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.intensitySection}>
          <View style={VintageStyles.spacing10} />
          <Text style={styles.inputLabel}>Intensity Level</Text>
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
      </View>
    </View>
  );

  const renderManualInputs = () => (
  <View style={styles.sectionContainer}>
    <View style={styles.manualInputsCard}>
      <View style={styles.inputRow}>
        <View style={styles.inputLabelContainer}>
          <Ionicons name="flame" size={16} color={VintageColors.primaryText} style={styles.inputIcon} />
          <Text style={styles.inputLabel}>Calories Burned</Text>
        </View>
        <TextInput
          style={styles.numberInput}
          placeholder="Auto-calculated"
          value={manualCaloriesBurned}
          onChangeText={setManualCaloriesBurned}
          keyboardType="numeric"
          placeholderTextColor={VintageColors.secondaryText}
        />
      </View>
      
      <View style={styles.inputRow}>
        <View style={styles.inputLabelContainer}>
          <Ionicons name="heart" size={16} color={VintageColors.primaryText} style={styles.inputIcon} />
          <Text style={styles.inputLabel}>Heart Rate (bpm)</Text>
        </View>
        <TextInput
          style={styles.numberInput}
          placeholder="Optional"
          value={manualHeartRate}
          onChangeText={setManualHeartRate}
          keyboardType="numeric"
          placeholderTextColor={VintageColors.secondaryText}
        />
      </View>
      
      <View style={styles.inputRow}>
        <View style={styles.inputLabelContainer}>
          <Feather name="map-pin" size={16} color={VintageColors.primaryText} style={styles.inputIcon} />
          <Text style={styles.inputLabel}>Distance (km)</Text>
        </View>
        <TextInput
          style={styles.numberInput}
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
    <View style={styles.sectionContainer}>
      {isCalculatingCalories && (
        <View style={styles.caloriesCalculation}>
          <View style={styles.calculationIcon}>
            <Ionicons name="sparkles" size={24} color={VintageColors.primaryText} />
          </View>
          <Text style={styles.caloriesCalculationText}>
            Calculating calories burned...
          </Text>
        </View>
      )}

      {manualCaloriesBurned && !isCalculatingCalories && (
        <View style={styles.aiEstimationCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIconContainer}>
              <Ionicons name="sparkles" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.aiTitle}>AI Estimation</Text>
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
    </View>
  );

  const renderTodayActivities = () => {
    if (!todayActivities || todayActivities.length === 0) return null;

    return (
      <View style={styles.sectionContainer}>
        <View style={VintageStyles.sectionHeader}>
          <Text style={VintageStyles.sectionTitle}>Today's Activities</Text>
          <View style={styles.activitiesCount}>
            <Text style={styles.activitiesCountText}>{todayActivities.length}</Text>
          </View>
        </View>
        
        {todayActivities.map((activity) => {
          const metrics = extractMetricsFromActivity(activity);
          const activityType = getActivityTypeFromEvent(activity.eventType || "");
          const activityColor = getActivityColor(activityType);

          return (
            <TouchableOpacity 
              key={`${activity._id || activity.id}_${activity.created_at}`} 
              style={styles.activityCard}
              onPress={() => loadActivityForEditing(activity)}
            >
              <View style={styles.activityHeader}>
                <View style={styles.activityHeaderLeft}>
                  <View style={[styles.activityTypeIcon, { backgroundColor: activityColor }]}>
                    <Ionicons
                      name={getActivityIcon(activityType) as any}
                      size={18}
                      color={VintageColors.primaryText}
                    />
                  </View>
                  <View>
                    <Text style={styles.activityCardType}>{activityType}</Text>
                    <Text style={styles.activityTime}>
                      {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
                <View style={styles.activityHeaderRight}>
                  {metrics.duration > 0 && (
                    <Text style={styles.activityDuration}>
                      {metrics.duration} min
                    </Text>
                  )}
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteActivity(activity);
                    }}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.activityDescription}>
                {activity.notes || "No description"}
              </Text>
              {(metrics.duration > 0 || metrics.caloriesBurned || metrics.distance) && (
                <View style={styles.activityMetrics}>
                  <View style={styles.metricsRow}>
                    {metrics.intensity && (
                      <View style={styles.metricItem}>
                        <Ionicons name="speedometer" size={14} color={VintageColors.secondaryText} />
                        <Text style={styles.metricText}>{metrics.intensity}</Text>
                      </View>
                    )}
                    {metrics.caloriesBurned && (
                      <View style={styles.metricItem}>
                        <Ionicons name="flame" size={14} color={VintageColors.secondaryText} />
                        <Text style={styles.metricText}>{metrics.caloriesBurned} cal</Text>
                      </View>
                    )}
                    {metrics.distance && (
                      <View style={styles.metricItem}>
                        <Feather name="map-pin" size={14} color={VintageColors.secondaryText} />
                        <Text style={styles.metricText}>{metrics.distance} km</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        
        <View style={styles.totalStatsCard}>
          <Text style={styles.totalTitle}>Daily Summary</Text>
          <View style={styles.totalStats}>
            <View style={styles.totalStatItem}>
              <Text style={styles.totalStatValue}>{totalActivityStats.activityCount}</Text>
              <Text style={styles.totalStatLabel}>activities</Text>
            </View>
            <View style={styles.totalStatDivider} />
            <View style={styles.totalStatItem}>
              <Text style={styles.totalStatValue}>{totalActivityStats.totalDuration}</Text>
              <Text style={styles.totalStatLabel}>minutes</Text>
            </View>
            <View style={styles.totalStatDivider} />
            <View style={styles.totalStatItem}>
              <Text style={styles.totalStatValue}>{totalActivityStats.totalCalories}</Text>
              <Text style={styles.totalStatLabel}>calories</Text>
            </View>
            {totalActivityStats.totalDistance > 0 && (
              <>
                <View style={styles.totalStatDivider} />
                <View style={styles.totalStatItem}>
                  <Text style={styles.totalStatValue}>{totalActivityStats.totalDistance.toFixed(1)}</Text>
                  <Text style={styles.totalStatLabel}>km</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderInputToggle = () => (
    <View style={styles.sectionContainer}>
      <TouchableOpacity
        style={styles.toggleCard}
        onPress={toggleManualInput}
      >
        <View style={styles.toggleHeader}>
          <Feather 
            name={showManualInput ? "edit-3" : "cpu"} 
            size={20} 
            color={VintageColors.primaryText} 
          />
          <Text style={styles.toggleTitle}>
            {showManualInput ? "Manual Input" : "AI Calculation"}
          </Text>
        </View>
        <View style={styles.toggleArrow}>
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
    <View style={styles.sectionContainer}>
      <TouchableOpacity
        style={[
          styles.saveButton,
          editingActivityId && styles.updateButton,
        ]}
        onPress={handleSaveActivity}
        disabled={isCalculatingCalories || !manualDuration}
      >
        <View style={styles.saveButtonIcon}>
          {editingActivityId ? (
            <Feather name="save" size={20} color="#FFFFFF" />
          ) : (
            <Feather name="plus" size={20} color="#FFFFFF" />
          )}
        </View>
        <Text style={styles.saveButtonText}>
          {isCalculatingCalories
            ? "Calculating..."
            : editingActivityId
            ? `Update ${selectedActivityType}`
            : `Log ${selectedActivityType} Activity`}
        </Text>
      </TouchableOpacity>

      {editingActivityId && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={clearForm}
        >
          <Text style={styles.cancelButtonText}>Cancel Edit</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderActivityTypeSelector()}
      {renderActivityDescription()}
      {renderDurationInput()}
      
      {renderInputToggle()}
      {showManualInput ? renderManualInputs() : renderAIEstimation()}
      
      {/* Log Activity Button - PRZENIESIONY NAD Today's Activities */}
      {renderLogActivityButton()}
      
      {renderTodayActivities()}

      <View style={VintageStyles.spacing60} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  sectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  
  // Activity Type Selector
  activityTypeScroll: {
    marginTop: 8,
  },
  
  activityTypeScrollContent: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  
  activityTypeButton: {
    alignItems: 'center',
    marginHorizontal: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: VintageColors.cardBackground,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  
  activityTypeButtonSelected: {
    borderColor: VintageColors.primaryText,
    backgroundColor: VintageColors.lightBackground,
    transform: [{ scale: 1.05 }], // Lekkie powiększenie dla zaznaczonej
  },
  
  activityIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  
  activityIconContainerSelected: {
    borderColor: VintageColors.primaryText,
    borderWidth: 2, // Grubsze obramowanie dla zaznaczonej
  },
  
  activityTypeText: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  
  activityTypeTextSelected: {
    color: VintageColors.primaryText,
    fontWeight: '600',
  },
  
  // Description
  descriptionCard: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  
  descriptionInput: {
    fontSize: 14,
    color: VintageColors.primaryText,
    lineHeight: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  
  // Duration & Intensity
  durationIntensityCard: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    flexDirection: 'column',
  },

  durationSection: {
    flex: 1,
    marginRight: 12,
  },

  intensitySection: {
    flex: 1,
  },
  
  inputLabel: {
    fontSize: 14,
    color: VintageColors.primaryText,
    fontWeight: '500',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  
  durationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  durationInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: VintageColors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: VintageColors.primaryText,
    backgroundColor: VintageColors.lightBackground,
  },
  
  durationUnit: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  
  durationUnitText: {
    fontSize: 14,
    color: VintageColors.secondaryText,
    fontWeight: '400',
  },
  
  intensityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  intensityButton: {
    flex: 1,
    marginHorizontal: 2,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
    backgroundColor: VintageColors.lightBackground,
    alignItems: 'center',
  },
  
  intensityButtonSelected: {
    backgroundColor: VintageColors.primaryText,
    borderColor: VintageColors.primaryText,
  },
  
  intensityText: {
    fontSize: 13,
    color: VintageColors.secondaryText,
    fontWeight: '500',
  },
  
  intensityTextSelected: {
    color: '#FFFFFF',
  },
  
  // Manual Inputs
  manualInputsCard: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  inputIcon: {
    marginRight: 8,
    // Dodaj to, aby ikona była na tej samej wysokości co tekst
    marginTop: 1,
  },
  
  inputLabelText: {
    fontSize: 15,
    color: VintageColors.primaryText,
    fontWeight: '400',
  },
  
  numberInput: {
    width: 140, // Zwiększona szerokość pól do wpisywania
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
    fontSize: 15,
    color: VintageColors.primaryText,
    textAlign: 'right',
    marginLeft: 12,
    // Dodaj to, aby pole było na tej samej wysokości co etykieta
    height: 40,
  },
  
  // AI Estimation
  caloriesCalculation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: VintageColors.lightBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  
  calculationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: VintageColors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  
  caloriesCalculationText: {
    fontSize: 14,
    color: VintageColors.primaryText,
    fontWeight: '400',
    flex: 1,
  },
  
  aiEstimationCard: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  aiIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  
  aiTitle: {
    fontSize: 16,
    color: VintageColors.primaryText,
    fontWeight: '500',
  },
  
  caloriesDisplay: {
    alignItems: 'center',
    marginVertical: 10,
  },
  
  caloriesValue: {
    fontSize: 36,
    fontWeight: '300',
    color: VintageColors.primaryText,
    marginBottom: 4,
  },
  
  caloriesUnit: {
    fontSize: 14,
    color: VintageColors.secondaryText,
    fontWeight: '400',
  },
  
  caloriesNote: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  
  // Toggle
  toggleCard: {
    backgroundColor: VintageColors.cardBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  toggleTitle: {
    fontSize: 16,
    color: VintageColors.primaryText,
    fontWeight: '500',
    marginLeft: 12,
  },
  
  toggleArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  
  // Activities List
  activitiesCount: {
    backgroundColor: VintageColors.lightBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  
  activitiesCountText: {
    fontSize: 12,
    color: VintageColors.primaryText,
    fontWeight: '600',
  },
  
  activityCard: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  activityHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  activityTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  
  activityCardType: {
    fontSize: 16,
    color: VintageColors.primaryText,
    fontWeight: '500',
    marginBottom: 2,
  },
  
  activityTime: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    fontWeight: '300',
  },
  
  activityHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  activityDuration: {
    fontSize: 14,
    color: VintageColors.primaryText,
    fontWeight: '500',
    marginRight: 12,
  },
  
  deleteButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: VintageColors.lightBackground,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  
  activityDescription: {
    fontSize: 14,
    color: VintageColors.primaryText,
    lineHeight: 20,
    marginBottom: 12,
  },
  
  activityMetrics: {
    borderTopWidth: 1,
    borderTopColor: VintageColors.border,
    paddingTop: 12,
  },
  
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  
  metricText: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    marginLeft: 6,
    fontWeight: '400',
  },
  
  // Total Stats
  totalStatsCard: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  
  totalTitle: {
    fontSize: 16,
    color: VintageColors.primaryText,
    fontWeight: '500',
    marginBottom: 16,
  },
  
  totalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  
  totalStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  
  totalStatValue: {
    fontSize: 20,
    fontWeight: '300',
    color: VintageColors.primaryText,
    marginBottom: 4,
  },
  
  totalStatLabel: {
    fontSize: 11,
    color: VintageColors.secondaryText,
    fontWeight: '400',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  totalStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: VintageColors.border,
  },
  
  // Save Button
  saveButton: {
    backgroundColor: VintageColors.signOutButton,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: VintageColors.signOutBorder,
    shadowColor: VintageColors.signOutButton,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 10,
    marginBottom: 20,
  },
  
  updateButton: {
    backgroundColor: '#77b779ff',
    borderColor: '#77b779ff',
  },
  
  saveButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  saveButtonText: {
    color: VintageColors.signOutText,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  
  // Cancel Button
  cancelButton: {
    backgroundColor: VintageColors.lightBackground,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  
  cancelButtonText: {
    color: VintageColors.primaryText,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SportsSection;