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
} from "../../utils/fns";
import Constants from "expo-constants";
import { useAuth } from "../../context/AuthContext";
import { NightscoutTreatment } from "../../types/nightscout";
import alert from "../../utils/alert";
import { VintageStyles } from "../../themes/vintage/styles_vintage";
import { VintageColors } from "../../themes/vintage/colors_vintage";
import { VintageStylesFood } from "../../themes/vintage/styles_vintage_food";

type MealType =
  | "Breakfast"
  | "Morning Snack"
  | "Lunch"
  | "Afternoon Snack"
  | "Dinner"
  | "Evening Snack";

const mealTypes: MealType[] = [
  "Breakfast",
  "Morning Snack",
  "Lunch",
  "Afternoon Snack",
  "Dinner",
  "Evening Snack",
];

interface NutritionInfo {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  sugar: number;
  fiber: number;
}

interface FoodSectionProps {
  selectedDate: Date;
}

const FoodSection: React.FC<FoodSectionProps> = ({ selectedDate }) => {
  const [selectedMealType, setSelectedMealType] =
    useState<MealType>("Breakfast");
  const [mealDescription, setMealDescription] = useState("");
  const [isCalculatingCalories, setIsCalculatingCalories] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);

  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo>({
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
    sugar: 0,
    fiber: 0,
  });

  const { firebaseUser, userData } = useAuth();
  const { meals: nightscoutMeals, loadFullDay: fetchUpdates } = useNightscout();
  const CLOUD_FUNCTIONS_HOST = Constants.expoConfig?.extra?.cloudFunctionsHost;

  const todayMeals = useMemo(() => {
    const todayString = selectedDate.toISOString().split("T")[0];
    return nightscoutMeals.filter(
      (meal) =>
        meal.created_at?.startsWith(todayString) &&
        meal.eventType?.includes("Meal:")
    );
  }, [nightscoutMeals, selectedDate]);

  const extractNutritionFromMeal = (
    meal: NightscoutTreatment
  ): NutritionInfo => {
    return {
      calories: meal.calories || 0,
      carbs: meal.carbs || 0,
      protein: meal.protein || 0,
      fat: meal.fat || 0,
      sugar: meal.sugar || 0,
      fiber: meal.fiber || 0,
    };
  };

  const getMealTypeFromEvent = (eventType: string): MealType => {
    const type = eventType.replace("Meal: ", "");
    return mealTypes.includes(type as MealType)
      ? (type as MealType)
      : "Breakfast";
  };

  const totalNutrition = useMemo(() => {
    return todayMeals.reduce(
      (total: NutritionInfo, meal: any) => {
        const nutrition = extractNutritionFromMeal(meal);
        total.calories += nutrition.calories;
        total.carbs += nutrition.carbs;
        total.protein += nutrition.protein;
        total.fat += nutrition.fat;
        total.sugar += nutrition.sugar;
        total.fiber += nutrition.fiber;
        return total;
      },
      {
        calories: 0,
        carbs: 0,
        protein: 0,
        fat: 0,
        sugar: 0,
        fiber: 0,
      }
    );
  }, [todayMeals]);

  const calculateNutritionWithAI = async (
    description: string
  ): Promise<NutritionInfo> => {
    setIsCalculatingCalories(true);

    return new Promise((resolve) => {
      setTimeout(() => {
        setIsCalculatingCalories(false);
        resolve({
          calories: Math.floor(Math.random() * 500) + 100,
          carbs: Math.floor(Math.random() * 50) + 10,
          protein: Math.floor(Math.random() * 30) + 5,
          fat: Math.floor(Math.random() * 20) + 5,
          sugar: Math.floor(Math.random() * 25) + 5,
          fiber: Math.floor(Math.random() * 10) + 2,
        });
      }, 2000);
    });
  };

  const loadMealForEditing = (meal: NightscoutTreatment) => {
    if (!meal._id) {
      alert("Error", "Cannot edit meal without a valid ID.");
      return;
    }
    setEditingMealId(meal._id || null);
    setSelectedMealType(getMealTypeFromEvent(meal.eventType));
    setMealDescription(meal.notes || "");

    const nutrition = extractNutritionFromMeal(meal);
    setNutritionInfo(nutrition);
    setShowManualInput(true);
  };

  const clearForm = () => {
    setMealDescription("");
    setNutritionInfo({
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
      sugar: 0,
      fiber: 0,
    });
    setShowManualInput(false);
    setEditingMealId(null);
  };

  const handleDeleteMeal = async (meal: NightscoutTreatment) => {
    if (!meal._id) {
      alert("Error", "Cannot delete meal without a valid ID.");
      return;
    }

    if (!firebaseUser || !userData) {
      alert("Error", "You must be logged in to delete meals.");
      return;
    }

    if (!userData.nightscoutUrl) {
      alert("Error", "Nightscout URL is not configured.");
      return;
    }

    const mealType = getMealTypeFromEvent(meal.eventType);

    alert("Delete Meal", `Are you sure you want to delete this ${mealType}?`, [
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
              meal._id!
            );

            if (!success) {
              alert("Error", "Failed to delete meal from Nightscout.");
              console.error("Failed to delete meal:", meal);
              return;
            }
            await fetchUpdates();
            alert("Success", `${mealType} deleted successfully!`);

            if (editingMealId === meal._id) {
              clearForm();
            }
          } catch (error: any) {
            alert(
              "Error",
              `Failed to delete meal: ${error?.message || "Unknown error"}`
            );
          }
        },
      },
    ]);
  };

  const handleSaveMeal = async () => {
    if (!mealDescription.trim()) {
      alert("Error", "Please describe your meal");
      return;
    }

    if (!firebaseUser || !userData) {
      alert("Error", "You must be logged in to save meals.");
      return;
    }

    if (!userData.nightscoutUrl) {
      alert("Error", "Nightscout URL is not configured.");
      return;
    }

    const treatmentData: NightscoutTreatment = {
      eventType: `Meal: ${selectedMealType}`,
      notes: mealDescription,
      carbs: nutritionInfo?.carbs || 0,
      protein: nutritionInfo?.protein || 0,
      fat: nutritionInfo?.fat || 0,
      sugar: nutritionInfo?.sugar || 0,
      fiber: nutritionInfo?.fiber || 0,
      calories: nutritionInfo?.calories || 0,
      created_at: new Date().toISOString(),
    };

    try {
      let success;
      if (editingMealId) {
        treatmentData._id = editingMealId;
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
          `Failed to ${editingMealId ? "update" : "save"} meal to Nightscout.`
        );
        console.error("Failed to save meal to Nightscout:", treatmentData);
        return;
      }

      await fetchUpdates();

      alert(
        "Success",
        `${selectedMealType} ${
          editingMealId ? "updated" : "saved"
        } to Nightscout!`
      );

      clearForm();
    } catch (error: any) {
      alert(
        "Error",
        `Failed to save meal: ${error?.message || "Unknown error"}`
      );
    }
  };

  useEffect(() => {
    const analyzeMealWithAI = async () => {
      if (
        mealDescription.trim().length > 10 &&
        !showManualInput &&
        !editingMealId
      ) {
        try {
          const nutrition = await calculateNutritionWithAI(mealDescription);
          setNutritionInfo(nutrition);
        } catch (error) {
          console.error("Error calculating nutrition:", error);
        }
      }
    };

    const timeoutId = setTimeout(analyzeMealWithAI, 500);
    return () => clearTimeout(timeoutId);
  }, [mealDescription, showManualInput, editingMealId]);

  const getMealIcon = (mealType: MealType) => {
    const icons: Record<MealType, string> = {
      Breakfast: "cafe",
      "Morning Snack": "nutrition",
      Lunch: "fast-food",
      "Afternoon Snack": "ice-cream",
      Dinner: "restaurant",
      "Evening Snack": "moon",
    };
    return icons[mealType];
  };

  const getMealColor = (mealType: MealType): string => {
    const colors: Record<MealType, string> = {
      Breakfast: VintageColors.iconPink,
      "Morning Snack": VintageColors.iconYellow,
      Lunch: VintageColors.iconBlue,
      "Afternoon Snack": VintageColors.iconPurple,
      Dinner: VintageColors.iconGreen,
      "Evening Snack": VintageColors.iconPink,
    };
    return colors[mealType];
  };

  const toggleManualInput = () => {
    setShowManualInput(!showManualInput);
    if (!showManualInput) {
      if (mealDescription.trim().length > 10) {
        calculateNutritionWithAI(mealDescription).then((nutrition) => {
          setNutritionInfo(nutrition);
        });
      }
    }
  };

  const handlePhotoUpload = () => {
    alert("Info", "Photo upload functionality will be implemented soon");
  };

  const handleQRScan = () => {
    alert("Info", "QR code scanning will be implemented soon");
  };

  const renderMealTypeSelector = () => (
    <View style={VintageStylesFood.sectionContainer}>
      <View style={VintageStyles.sectionHeader}>
        <Text style={VintageStyles.sectionTitle}>Select Meal Type</Text>
        <View style={VintageStyles.featherAccent}>
          <FontAwesome5
            name="utensils"
            size={16}
            color={VintageColors.primaryText}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={VintageStylesFood.mealTypeScroll}
        contentContainerStyle={VintageStylesFood.mealTypeScrollContent}
      >
        {mealTypes.map((mealType) => {
          const isSelected = selectedMealType === mealType;
          const iconColor = VintageColors.primaryText;
          const backgroundColor = getMealColor(mealType);

          return (
            <TouchableOpacity
              key={mealType}
              style={[
                VintageStylesFood.mealTypeButton,
                isSelected && VintageStylesFood.mealTypeButtonSelected,
              ]}
              onPress={() => setSelectedMealType(mealType)}
            >
              <View
                style={[
                  VintageStylesFood.mealIconContainer,
                  { backgroundColor },
                  isSelected && VintageStylesFood.mealIconContainerSelected,
                ]}
              >
                <Ionicons
                  name={getMealIcon(mealType) as any}
                  size={20}
                  color={iconColor}
                />
              </View>
              <Text
                style={[
                  VintageStylesFood.mealTypeText,
                  isSelected && VintageStylesFood.mealTypeTextSelected,
                ]}
              >
                {mealType}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderMealDescription = () => (
    <View style={VintageStylesFood.sectionContainer}>
      <View style={VintageStyles.sectionHeader}>
        <Text style={VintageStyles.sectionTitle}>Meal Description</Text>
        <View style={VintageStyles.featherAccent}>
          <Feather name="edit-3" size={16} color={VintageColors.primaryText} />
        </View>
      </View>

      <View style={VintageStylesFood.descriptionCard}>
        <TextInput
          style={VintageStylesFood.descriptionInput}
          placeholder="Describe your food in detail (e.g., '2 eggs, toast with butter, orange juice')"
          value={mealDescription}
          onChangeText={setMealDescription}
          multiline
          numberOfLines={4}
          placeholderTextColor={VintageColors.secondaryText}
        />
      </View>
    </View>
  );

  const renderNutritionInputs = () => (
    <View style={VintageStylesFood.sectionContainer}>
      <View style={VintageStylesFood.nutritionCard}>
        <View style={VintageStylesFood.nutritionGrid}>
          <View style={VintageStylesFood.nutritionInputRow}>
            <View style={VintageStylesFood.inputLabelContainer}>
              <Ionicons
                name="flame"
                size={16}
                color={VintageColors.primaryText}
                style={VintageStylesFood.inputIcon}
              />
              <Text style={VintageStylesFood.inputLabel}>Calories</Text>
            </View>
            <TextInput
              style={VintageStylesFood.numberInput}
              placeholder="0"
              value={nutritionInfo.calories.toString()}
              onChangeText={(text) =>
                setNutritionInfo({
                  ...nutritionInfo,
                  calories: parseInt(text),
                })
              }
              keyboardType="numeric"
              placeholderTextColor={VintageColors.secondaryText}
            />
          </View>

          <View style={VintageStylesFood.nutritionInputRow}>
            <View style={VintageStylesFood.inputLabelContainer}>
              <Ionicons
                name="nutrition"
                size={16}
                color={VintageColors.primaryText}
                style={VintageStylesFood.inputIcon}
              />
              <Text style={VintageStylesFood.inputLabel}>Carbs (g)*</Text>
            </View>
            <TextInput
              style={VintageStylesFood.numberInput}
              placeholder="0"
              value={nutritionInfo.carbs.toString()}
              onChangeText={(text) =>
                setNutritionInfo({
                  ...nutritionInfo,
                  carbs: parseInt(text),
                })
              }
              keyboardType="numeric"
              placeholderTextColor={VintageColors.secondaryText}
            />
          </View>

          <View style={VintageStylesFood.nutritionInputRow}>
            <View style={VintageStylesFood.inputLabelContainer}>
              <Ionicons
                name="barbell"
                size={16}
                color={VintageColors.primaryText}
                style={VintageStylesFood.inputIcon}
              />
              <Text style={VintageStylesFood.inputLabel}>Protein (g)</Text>
            </View>
            <TextInput
              style={VintageStylesFood.numberInput}
              placeholder="0"
              value={nutritionInfo.protein.toString()}
              onChangeText={(text) =>
                setNutritionInfo({
                  ...nutritionInfo,
                  protein: parseInt(text),
                })
              }
              keyboardType="numeric"
              placeholderTextColor={VintageColors.secondaryText}
            />
          </View>

          <View style={VintageStylesFood.nutritionInputRow}>
            <View style={VintageStylesFood.inputLabelContainer}>
              <Ionicons
                name="water"
                size={16}
                color={VintageColors.primaryText}
                style={VintageStylesFood.inputIcon}
              />
              <Text style={VintageStylesFood.inputLabel}>Fat (g)</Text>
            </View>
            <TextInput
              style={VintageStylesFood.numberInput}
              placeholder="0"
              value={nutritionInfo.fat.toString()}
              onChangeText={(text) =>
                setNutritionInfo({ ...nutritionInfo, fat: parseInt(text) })
              }
              keyboardType="numeric"
              placeholderTextColor={VintageColors.secondaryText}
            />
          </View>

          <View style={VintageStylesFood.nutritionInputRow}>
            <View style={VintageStylesFood.inputLabelContainer}>
              <Ionicons
                name="ice-cream"
                size={16}
                color={VintageColors.primaryText}
                style={VintageStylesFood.inputIcon}
              />
              <Text style={VintageStylesFood.inputLabel}>Sugar (g)*</Text>
            </View>
            <TextInput
              style={VintageStylesFood.numberInput}
              placeholder="0"
              value={nutritionInfo.sugar.toString()}
              onChangeText={(text) =>
                setNutritionInfo({
                  ...nutritionInfo,
                  sugar: parseInt(text),
                })
              }
              keyboardType="numeric"
              placeholderTextColor={VintageColors.secondaryText}
            />
          </View>

          <View style={VintageStylesFood.nutritionInputRow}>
            <View style={VintageStylesFood.inputLabelContainer}>
              <Ionicons
                name="leaf"
                size={16}
                color={VintageColors.primaryText}
                style={VintageStylesFood.inputIcon}
              />
              <Text style={VintageStylesFood.inputLabel}>Fiber (g)</Text>
            </View>
            <TextInput
              style={VintageStylesFood.numberInput}
              placeholder="0"
              value={nutritionInfo.fiber.toString()}
              onChangeText={(text) =>
                setNutritionInfo({
                  ...nutritionInfo,
                  fiber: parseInt(text),
                })
              }
              keyboardType="numeric"
              placeholderTextColor={VintageColors.secondaryText}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderAIEstimation = () => (
    <View style={VintageStylesFood.sectionContainer}>
      {isCalculatingCalories && (
        <View style={VintageStylesFood.caloriesCalculation}>
          <View style={VintageStylesFood.calculationIcon}>
            <Ionicons
              name="sparkles"
              size={24}
              color={VintageColors.primaryText}
            />
          </View>
          <Text style={VintageStylesFood.caloriesCalculationText}>
            Analyzing your meal with AI...
          </Text>
        </View>
      )}

      {nutritionInfo.calories > 0 && !isCalculatingCalories && (
        <View style={VintageStylesFood.aiEstimationCardHorizontal}>
          <View style={VintageStylesFood.aiHeaderHorizontal}>
            <View style={VintageStylesFood.aiIconContainerHorizontal}>
              <Ionicons name="sparkles" size={20} color="#4CAF50" />
            </View>
            <Text style={VintageStylesFood.aiTitleHorizontal}>
              AI Estimation
            </Text>
          </View>
          <View style={VintageStylesFood.nutritionRow}>
            <View style={VintageStylesFood.nutritionRowItem}>
              <Text style={VintageStylesFood.nutritionRowValue}>
                {nutritionInfo.calories}
              </Text>
              <Text style={VintageStylesFood.nutritionRowUnit}>kcal</Text>
            </View>
            <View style={VintageStylesFood.nutritionRowItem}>
              <Text style={VintageStylesFood.nutritionRowValue}>
                {nutritionInfo.carbs}
              </Text>
              <Text style={VintageStylesFood.nutritionRowUnit}>carbs</Text>
            </View>
            <View style={VintageStylesFood.nutritionRowItem}>
              <Text style={VintageStylesFood.nutritionRowValue}>
                {nutritionInfo.protein}
              </Text>
              <Text style={VintageStylesFood.nutritionRowUnit}>protein</Text>
            </View>
            <View style={VintageStylesFood.nutritionRowItem}>
              <Text style={VintageStylesFood.nutritionRowValue}>
                {nutritionInfo.fat}
              </Text>
              <Text style={VintageStylesFood.nutritionRowUnit}>fat</Text>
            </View>
            {nutritionInfo.sugar && nutritionInfo.sugar > 0 && (
              <View style={VintageStylesFood.nutritionRowItem}>
                <Text style={VintageStylesFood.nutritionRowValue}>
                  {nutritionInfo.sugar}
                </Text>
                <Text style={VintageStylesFood.nutritionRowUnit}>sugar</Text>
              </View>
            )}
            {nutritionInfo.fiber && nutritionInfo.fiber > 0 && (
              <View style={VintageStylesFood.nutritionRowItem}>
                <Text style={VintageStylesFood.nutritionRowValue}>
                  {nutritionInfo.fiber}
                </Text>
                <Text style={VintageStylesFood.nutritionRowUnit}>fiber</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );

  const renderTodayMeals = () => {
    if (!todayMeals || todayMeals.length === 0) return null;

    return (
      <View style={VintageStylesFood.sectionContainer}>
        <View style={VintageStyles.sectionHeader}>
          <Text style={VintageStyles.sectionTitle}>Today's Meals</Text>
          <View style={VintageStylesFood.mealsCount}>
            <Text style={VintageStylesFood.mealsCountText}>
              {todayMeals.length}
            </Text>
          </View>
        </View>

        {todayMeals.map((meal) => {
          const nutrition = extractNutritionFromMeal(meal);
          const mealType = getMealTypeFromEvent(meal.eventType);
          const mealColor = getMealColor(mealType);

          return (
            <TouchableOpacity
              key={meal._id || meal.id}
              style={VintageStylesFood.mealCard}
              onPress={() => loadMealForEditing(meal)}
            >
              <View style={VintageStylesFood.mealHeader}>
                <View style={VintageStylesFood.mealHeaderLeft}>
                  <View
                    style={[
                      VintageStylesFood.mealTypeIcon,
                      { backgroundColor: mealColor },
                    ]}
                  >
                    <Ionicons
                      name={getMealIcon(mealType) as any}
                      size={18}
                      color={VintageColors.primaryText}
                    />
                  </View>
                  <View>
                    <Text style={VintageStylesFood.mealCardType}>
                      {mealType}
                    </Text>
                    <Text style={VintageStylesFood.mealTime}>
                      {new Date(meal.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>
                <View style={VintageStylesFood.mealHeaderRight}>
                  {nutrition.calories > 0 && (
                    <Text style={VintageStylesFood.mealCalories}>
                      {nutrition.calories} kcal
                    </Text>
                  )}
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteMeal(meal);
                    }}
                    style={VintageStylesFood.actionButton}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={VintageStylesFood.mealDescription}>
                {meal.notes || "No description"}
              </Text>
              {(nutrition.carbs > 0 ||
                nutrition.protein > 0 ||
                nutrition.fat > 0) && (
                <View style={VintageStylesFood.mealNutrition}>
                  <Text style={VintageStylesFood.nutritionDetail}>
                    C: {nutrition.carbs}g | P: {nutrition.protein}g | F:{" "}
                    {nutrition.fat}g | Sugar: {nutrition.sugar}g | Fiber:{" "}
                    {nutrition.fiber}g
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={VintageStylesFood.totalNutritionCard}>
          <Text style={VintageStylesFood.totalTitle}>
            Daily Nutrition Summary
          </Text>
          <View style={VintageStylesFood.totalStats}>
            {totalNutrition.calories > 0 && (
              <View style={VintageStylesFood.totalStatItem}>
                <Text style={VintageStylesFood.totalStatValue}>
                  {totalNutrition.calories}
                </Text>
                <Text style={VintageStylesFood.totalStatLabel}>calories</Text>
              </View>
            )}
            {totalNutrition.carbs > 0 && (
              <View style={VintageStylesFood.totalStatItem}>
                <Text style={VintageStylesFood.totalStatValue}>
                  {totalNutrition.carbs}
                </Text>
                <Text style={VintageStylesFood.totalStatLabel}>carbs (g)</Text>
              </View>
            )}
            {totalNutrition.protein > 0 && (
              <View style={VintageStylesFood.totalStatItem}>
                <Text style={VintageStylesFood.totalStatValue}>
                  {totalNutrition.protein}
                </Text>
                <Text style={VintageStylesFood.totalStatLabel}>
                  protein (g)
                </Text>
              </View>
            )}
            {totalNutrition.fat > 0 && (
              <View style={VintageStylesFood.totalStatItem}>
                <Text style={VintageStylesFood.totalStatValue}>
                  {totalNutrition.fat}
                </Text>
                <Text style={VintageStylesFood.totalStatLabel}>fat (g)</Text>
              </View>
            )}
            {totalNutrition.sugar > 0 && (
              <View style={VintageStylesFood.totalStatItem}>
                <Text style={VintageStylesFood.totalStatValue}>
                  {totalNutrition.sugar}
                </Text>
                <Text style={VintageStylesFood.totalStatLabel}>sugar (g)</Text>
              </View>
            )}
            {totalNutrition.fiber > 0 && (
              <View style={VintageStylesFood.totalStatItem}>
                <Text style={VintageStylesFood.totalStatValue}>
                  {totalNutrition.fiber}
                </Text>
                <Text style={VintageStylesFood.totalStatLabel}>fiber (g)</Text>
              </View>
            )}
            {totalNutrition.calories === 0 &&
            totalNutrition.carbs === 0 &&
            totalNutrition.protein === 0 &&
            totalNutrition.fat === 0 &&
            totalNutrition.sugar === 0 &&
            totalNutrition.fiber === 0 ? (
              <Text style={VintageStylesFood.totalStatLabel}>
                No nutrition data for today
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  const renderInputToggle = () => (
    <View style={VintageStylesFood.sectionContainer}>
      <TouchableOpacity
        style={VintageStylesFood.toggleCard}
        onPress={toggleManualInput}
      >
        <View style={VintageStylesFood.toggleHeader}>
          <Feather
            name={showManualInput ? "edit-3" : "cpu"}
            size={20}
            color={VintageColors.primaryText}
          />
          <Text style={VintageStylesFood.toggleTitle}>
            {showManualInput ? "Manual Input" : "AI Calculation"}
          </Text>
        </View>
        <View style={VintageStylesFood.toggleArrow}>
          <Feather
            name={showManualInput ? "chevron-up" : "chevron-down"}
            size={20}
            color={VintageColors.secondaryText}
          />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderActionButtons = () => (
    <View style={VintageStylesFood.sectionContainer}>
      <View style={VintageStylesFood.actionButtonsRow}>
        <TouchableOpacity
          style={VintageStylesFood.actionButtonCard}
          onPress={handlePhotoUpload}
        >
          <View style={VintageStylesFood.actionButtonIcon}>
            <Ionicons
              name="camera"
              size={24}
              color={VintageColors.primaryText}
            />
          </View>
          <Text style={VintageStylesFood.actionButtonLabel}>Add Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={VintageStylesFood.actionButtonCard}
          onPress={handleQRScan}
        >
          <View style={VintageStylesFood.actionButtonIcon}>
            <Ionicons
              name="qr-code"
              size={24}
              color={VintageColors.primaryText}
            />
          </View>
          <Text style={VintageStylesFood.actionButtonLabel}>Scan Food</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSaveMealButton = () => (
    <View style={VintageStylesFood.sectionContainer}>
      <TouchableOpacity
        style={[
          VintageStylesFood.saveButton,
          editingMealId && VintageStylesFood.updateButton,
        ]}
        onPress={handleSaveMeal}
        disabled={isCalculatingCalories}
      >
        <View style={VintageStylesFood.saveButtonIcon}>
          {editingMealId ? (
            <Feather name="save" size={20} color="#FFFFFF" />
          ) : (
            <Feather name="plus" size={20} color="#FFFFFF" />
          )}
        </View>
        <Text style={VintageStylesFood.saveButtonText}>
          {isCalculatingCalories
            ? "Analyzing..."
            : editingMealId
            ? `Update ${selectedMealType}`
            : `Save ${selectedMealType}`}
        </Text>
      </TouchableOpacity>

      {editingMealId && (
        <TouchableOpacity
          style={VintageStylesFood.cancelButton}
          onPress={clearForm}
        >
          <Text style={VintageStylesFood.cancelButtonText}>Cancel Edit</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView
      style={VintageStylesFood.container}
      showsVerticalScrollIndicator={false}
    >
      {renderMealTypeSelector()}
      {renderMealDescription()}
      {renderInputToggle()}
      {showManualInput ? renderNutritionInputs() : renderAIEstimation()}
      {renderActionButtons()}
      {renderSaveMealButton()}
      {renderTodayMeals()}
      <View style={VintageStyles.spacing60} />
    </ScrollView>
  );
};

export default FoodSection;
