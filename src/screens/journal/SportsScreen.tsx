import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons, Feather, FontAwesome5 } from "@expo/vector-icons";
import { useNightscout } from "../../contexts/NightscoutContext";
import {
  addTreatment,
  updateTreatment,
  deleteTreatment,
} from "../../utils/cloudFunctions";
import Constants from "expo-constants";
import { useAuth } from "../../contexts/AuthContext";
import { NightscoutTreatment } from "../../types/nightscout";
import alert from "../../utils/alert";
import { VintageStyles } from "../../themes/vintage/styles_vintage";
import { VintageColors } from "../../themes/vintage/colors";
import { VintageStylesSports } from "../../themes/vintage/styles_vintage_sports";
import {
  calculateCaloriesBurned,
  estimateDistance,
  getIntensityDescription,
  type UserProfile,
} from "../../utils/journalUtils/calorieCalculations";
import { ActivityType, activityTypes } from "../../types/events";
import {
  extractMetricsFromActivity,
  getTodayActivityStats,
  getActivityTypeFromEvent,
  getActivityIcon,
  getActivityColor,
} from "../../utils/journalUtils/mealsAndActivitiesUtils";

import TimePicker from "../../components/common/TimePicker";
import { useLiveTime } from "../../hooks/journal/useLiveTime";
import { useJournalData } from "../../hooks/journal/useJournalData";
import { JournalStackParamList } from "../../navigation/JournalStackNavigator";
import { RouteProp } from "@react-navigation/native";

type SportsScreenRouteProp = RouteProp<JournalStackParamList, "Sports">;

interface SportsScreenProps {
  route: SportsScreenRouteProp;
}

const SportsScreen: React.FC<SportsScreenProps> = ({ route }) => {
  const routeSelectedDateString = route.params?.selectedDate;
  const routeSelectedDate = routeSelectedDateString
    ? new Date(routeSelectedDateString)
    : new Date();

  const { selectedDate, todayActivities } = useJournalData(routeSelectedDate);

  const [selectedActivityType, setSelectedActivityType] =
    useState<ActivityType>("Walking");
  const [activityDescription, setActivityDescription] = useState("");
  const [isCalculatingCalories, setIsCalculatingCalories] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(
    null,
  );
  const [calculationDetails, setCalculationDetails] = useState<{
    metValue: number;
    weightUsed: number;
    formula: string;
    bmr?: number;
  } | null>(null);

  const [manualDuration, setManualDuration] = useState("");
  const [manualIntensity, setManualIntensity] = useState<
    "Low" | "Medium" | "High"
  >("Medium");
  const [manualCaloriesBurned, setManualCaloriesBurned] = useState("");
  const [manualHeartRate, setManualHeartRate] = useState("");
  const [manualDistance, setManualDistance] = useState("");

  const { firebaseUser, userData } = useAuth();
  const { activities: nightscoutActivities, fetchTreatments } = useNightscout();
  const CLOUD_FUNCTIONS_HOST = Constants.expoConfig?.extra?.cloudFunctionsHost;

  const [showTimePicker, setShowTimePicker] = useState(false);

  const { currentTime, getNowTimeString } = useLiveTime({
    format24Hour: true,
  });

  const [activityTime, setActivityTime] = useState<string>(currentTime);

  useEffect(() => {
    setActivityTime(currentTime);
  }, [currentTime]);

  const handleTimeChange = (time: string) => {
    setActivityTime(time);
    setShowTimePicker(false);
  };

  const openTimePicker = () => {
    setShowTimePicker(true);
  };
  const renderTimePicker = () => (
    <TimePicker
      visible={showTimePicker}
      onClose={() => setShowTimePicker(false)}
      onTimeSelect={handleTimeChange}
      selectedTime={activityTime}
      selectedDate={selectedDate}
    />
  );

  const totalActivityStats = useMemo(() => {
    return getTodayActivityStats(todayActivities);
  }, [todayActivities]);

  const calculateCaloriesWithAI = async (
    activityType: ActivityType,
    duration: number,
    intensity: "Low" | "Medium" | "High",
  ): Promise<{
    calories: number;
    estimatedDistance?: number;
    details: any;
  }> => {
    setIsCalculatingCalories(true);
    setCalculationDetails(null);

    return new Promise((resolve) => {
      setTimeout(() => {
        const userProfile: UserProfile = {
          weight: userData?.weight,
          height: userData?.height,
          age: userData?.age,
          gender: userData?.gender as "male" | "female",
        };

        const weight = userData?.weight;

        const calculation = calculateCaloriesBurned({
          activityType,
          duration,
          intensity,
          weight,
          userProfile,
        });

        const estimatedDistance = estimateDistance(
          activityType,
          duration,
          intensity,
        );

        setCalculationDetails(calculation.details);
        setIsCalculatingCalories(false);

        resolve({
          calories: calculation.calories,
          estimatedDistance: estimatedDistance || undefined,
          details: calculation.details,
        });
      }, 800);
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
    setShowManualInput(false);
    setCalculationDetails(null);

    const activityDate = new Date(activity.created_at);
    const activityTimeString = activityDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setActivityTime(activityTimeString);
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
    setCalculationDetails(null);
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
                userData.nightscoutUrl,
                userData.nightscoutSecret ?? "",
                activity._id!,
              );

              if (!success) {
                alert("Error", "Failed to delete activity from Nightscout.");
                console.error("Failed to delete activity:", activity);
                return;
              }
              setActivityTime(getNowTimeString());

              await fetchTreatments(selectedDate);
              alert(
                "Success",
                `${activityType} activity deleted successfully!`,
              );

              if (editingActivityId === activity._id) {
                clearForm();
              }
            } catch (error: any) {
              alert(
                "Error",
                `Failed to delete activity: ${
                  error?.message || "Unknown error"
                }`,
              );
            }
          },
        },
      ],
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
    let distance = manualDistance ? parseFloat(manualDistance) : undefined;

    if (!manualCaloriesBurned || !manualDistance) {
      try {
        const result = await calculateCaloriesWithAI(
          selectedActivityType,
          parseInt(manualDuration),
          manualIntensity,
        );

        if (!manualCaloriesBurned) {
          caloriesBurned = result.calories;
          setManualCaloriesBurned(result.calories.toString());
        }

        if (!manualDistance && result.estimatedDistance) {
          distance = result.estimatedDistance;
          setManualDistance(result.estimatedDistance.toString());
        }
      } catch (error) {
        console.error("Error calculating with AI:", error);
      }
    }

    const [hours24, minutes] = activityTime.split(":").map(Number);
    const timeDate = new Date(selectedDate);
    timeDate.setHours(hours24, minutes, 0, 0);

    const treatmentData: NightscoutTreatment = {
      eventType: `Activity: ${selectedActivityType}`,
      notes: activityDescription,
      duration: parseInt(manualDuration),
      intensity: manualIntensity,
      calories: caloriesBurned,
      caloriesBurned: caloriesBurned,
      heartRate: manualHeartRate ? parseInt(manualHeartRate) : undefined,
      distance: distance,
      created_at: timeDate.toISOString(),
      createdBy: "GlucoseGoose App",
    };

    try {
      let success;
      if (editingActivityId) {
        treatmentData._id = editingActivityId;
        success = await updateTreatment(
          userData.nightscoutUrl,
          userData.nightscoutSecret ?? "",
          treatmentData,
        );
      } else {
        success = await addTreatment(
          userData.nightscoutUrl,
          userData.nightscoutSecret ?? "",
          treatmentData,
        );
      }

      if (!success) {
        alert(
          "Error",
          `Failed to ${
            editingActivityId ? "update" : "save"
          } activity to Nightscout.`,
        );
        console.error("Failed to save activity to Nightscout:", treatmentData);
        return;
      }

      setActivityTime(getNowTimeString());

      await fetchTreatments(selectedDate);

      alert(
        "Success",
        `${selectedActivityType} activity ${
          editingActivityId ? "updated" : "saved"
        } to Nightscout!`,
      );

      clearForm();
    } catch (error: any) {
      alert(
        "Error",
        `Failed to save activity: ${error?.message || "Unknown error"}`,
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
          const result = await calculateCaloriesWithAI(
            selectedActivityType,
            parseInt(manualDuration),
            manualIntensity,
          );

          setManualCaloriesBurned(result.calories.toString());

          if (result.estimatedDistance && !manualDistance) {
            setManualDistance(result.estimatedDistance.toString());
          }
        } catch (error) {
          console.error("Error calculating with AI:", error);
        }
      }
    };

    const timeoutId = setTimeout(analyzeActivityWithAI, 1000);
    return () => clearTimeout(timeoutId);
  }, [
    activityDescription,
    manualDuration,
    manualIntensity,
    showManualInput,
    editingActivityId,
    selectedActivityType,
  ]);

  const toggleManualInput = () => {
    setShowManualInput(!showManualInput);
    if (!showManualInput) {
      setManualCaloriesBurned("");
      setManualHeartRate("");
      setManualDistance("");
      setCalculationDetails(null);
    }
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
              onPress={() => {
                setSelectedActivityType(activityType);
                setCalculationDetails(null);
                if (!showManualInput && manualDuration) {
                  calculateCaloriesWithAI(
                    activityType,
                    parseInt(manualDuration),
                    manualIntensity,
                  ).then((result) => {
                    setManualCaloriesBurned(result.calories.toString());
                    if (result.estimatedDistance) {
                      setManualDistance(result.estimatedDistance.toString());
                    }
                  });
                }
              }}
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
              onChangeText={(text) => {
                setManualDuration(text);
                setCalculationDetails(null);
                if (!showManualInput && text && parseInt(text) > 0) {
                  calculateCaloriesWithAI(
                    selectedActivityType,
                    parseInt(text),
                    manualIntensity,
                  ).then((result) => {
                    setManualCaloriesBurned(result.calories.toString());
                    if (result.estimatedDistance) {
                      setManualDistance(result.estimatedDistance.toString());
                    }
                  });
                }
              }}
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
                onPress={() => {
                  setManualIntensity(intensity);
                  setCalculationDetails(null);
                  if (!showManualInput && manualDuration) {
                    calculateCaloriesWithAI(
                      selectedActivityType,
                      parseInt(manualDuration),
                      intensity,
                    ).then((result) => {
                      setManualCaloriesBurned(result.calories.toString());
                      if (result.estimatedDistance) {
                        setManualDistance(result.estimatedDistance.toString());
                      }
                    });
                  }
                }}
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

  const renderCalculationDetails = () => {
    if (!calculationDetails) return null;

    const weightNote = userData?.weight ? "" : " (default weight)";
    const metInfo = `${calculationDetails.metValue} MET`;
    const metDescription = getIntensityDescription(calculationDetails.metValue);

    return (
      <View style={VintageStylesSports.calculationDetailsCard}>
        <View style={VintageStylesSports.calculationHeader}>
          <Ionicons name="calculator-outline" size={18} color="#4CAF50" />
          <Text style={VintageStylesSports.calculationTitle}>
            Calculation Details
          </Text>
        </View>

        <View style={VintageStylesSports.calculationGrid}>
          <View style={VintageStylesSports.calculationItem}>
            <Text style={VintageStylesSports.calculationLabel}>MET Value</Text>
            <Text style={VintageStylesSports.calculationValue}>{metInfo}</Text>
            <Text style={VintageStylesSports.calculationNote}>
              {metDescription}
            </Text>
          </View>

          <View style={VintageStylesSports.calculationItem}>
            <Text style={VintageStylesSports.calculationLabel}>
              Weight Used
            </Text>
            <Text style={VintageStylesSports.calculationValue}>
              {calculationDetails.weightUsed}kg{weightNote}
            </Text>
            <Text style={VintageStylesSports.calculationNote}>
              {userData?.weight ? "Your weight" : "Default 70kg"}
            </Text>
          </View>
        </View>

        <View style={VintageStylesSports.formulaContainer}>
          <Text style={VintageStylesSports.formulaLabel}>Formula:</Text>
          <Text style={VintageStylesSports.formulaText}>
            Calories = {calculationDetails.formula}
          </Text>
        </View>

        {calculationDetails.bmr && (
          <View style={VintageStylesSports.advancedInfo}>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color="#666"
            />
            <Text style={VintageStylesSports.advancedInfoText}>
              Includes BMR adjustment ({calculationDetails.bmr.toFixed(0)}{" "}
              kcal/day)
            </Text>
          </View>
        )}

        {userData?.age && userData?.gender && (
          <View style={VintageStylesSports.advancedInfo}>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color="#666"
            />
            <Text style={VintageStylesSports.advancedInfoText}>
              Adjusted for your {userData.age}y/o {userData.gender} profile
            </Text>
          </View>
        )}
      </View>
    );
  };

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
            <Text style={VintageStylesSports.aiTitle}>AI Calculation</Text>
            <Text style={VintageStylesSports.aiSubtitle}>
              Based on scientific MET values
            </Text>
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
            {manualDuration} min of {selectedActivityType.toLowerCase()} at{" "}
            {manualIntensity.toLowerCase()} intensity
          </Text>

          {renderCalculationDetails()}
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
            activity.eventType || "",
          );
          const activityColor = getActivityColor(activityType);
          const hasMetrics =
            metrics.duration > 0 ||
            !!metrics.caloriesBurned ||
            !!metrics.distance;

          return (
            <View
              key={`${activity._id || activity.id}_${activity.created_at}`}
              style={VintageStylesSports.activityCard}
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
                  <View style={VintageStylesSports.actionButtonsContainer}>
                    <TouchableOpacity
                      onPress={() => loadActivityForEditing(activity)}
                      style={VintageStylesSports.actionButton}
                    >
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color={VintageColors.primaryText}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteActivity(activity)}
                      style={VintageStylesSports.actionButton}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#FF6B6B"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <Text style={VintageStylesSports.activityDescription}>
                {activity.notes || "No description"}
              </Text>
              {hasMetrics && (
                <View style={VintageStylesSports.activityMetrics}>
                  <View style={VintageStylesSports.metricsRow}>
                    {!!metrics.intensity && (
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
                    {metrics.caloriesBurned != null &&
                      metrics.caloriesBurned > 0 && (
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
                    {metrics.distance != null && metrics.distance > 0 && (
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
            </View>
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
            {showManualInput ? "Manual Input" : "Scientific Calculation"}
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

  const renderWeightWarning = () => {
    if (userData?.weight) return null;

    return (
      <View style={VintageStylesSports.sectionContainer}>
        <View style={VintageStylesSports.weightWarningCard}>
          <Ionicons name="warning-outline" size={20} color="#FFA000" />
          <View style={VintageStylesSports.weightWarningContent}>
            <Text style={VintageStylesSports.weightWarningTitle}>
              Improve Accuracy
            </Text>
            <Text style={VintageStylesSports.weightWarningText}>
              Add your weight in profile settings for more accurate calorie
              calculations
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTimeSelection = () => (
    <View style={VintageStylesSports.sectionContainer}>
      <View style={VintageStyles.sectionHeader}>
        <Text style={VintageStyles.sectionTitle}>Activity Time</Text>
        <View style={VintageStyles.featherAccent}>
          <Feather name="clock" size={16} color={VintageColors.primaryText} />
        </View>
      </View>

      <TouchableOpacity
        style={VintageStylesSports.timeCard}
        onPress={openTimePicker}
        activeOpacity={0.7}
      >
        <View style={VintageStylesSports.timeCardLeft}>
          <View style={VintageStylesSports.timeIconContainer}>
            <Feather name="clock" size={20} color={VintageColors.primaryText} />
          </View>
          <View>
            <Text style={VintageStylesSports.timeLabel}>Time</Text>
            <Text style={VintageStylesSports.timeValue}>{activityTime}</Text>
          </View>
        </View>
        <View style={VintageStylesSports.timeCardRight}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={VintageColors.secondaryText}
          />
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: VintageColors.background }}>
      <ScrollView
        style={VintageStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={VintageStyles.spacing30} />
        {renderActivityTypeSelector()}
        {renderTimeSelection()}
        {renderActivityDescription()}
        {renderDurationInput()}
        {renderWeightWarning()}
        {renderInputToggle()}
        {showManualInput ? renderManualInputs() : renderAIEstimation()}
        {renderLogActivityButton()}
        {renderTodayActivities()}
        <View style={VintageStyles.spacing60} />
      </ScrollView>

      {renderTimePicker()}
    </View>
  );
};

export default SportsScreen;
