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
  sugar?: number;
  fiber?: number;
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

  const [manualCalories, setManualCalories] = useState("");
  const [manualCarbs, setManualCarbs] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [manualFat, setManualFat] = useState("");
  const [manualSugar, setManualSugar] = useState("");
  const [manualFiber, setManualFiber] = useState("");

  const { firebaseUser, userData } = useAuth();
  const {
    meals: nightscoutMeals,
    isLoading: isNightscoutLoading,
    fetchUpdates,
  } = useNightscout();
  const CLOUD_FUNCTIONS_HOST = Constants.expoConfig?.extra?.cloudFunctionsHost;

  const todayMeals = useMemo(() => {
    const todayString = selectedDate.toISOString().split("T")[0];
    return nightscoutMeals.filter(
      (meal) =>
        meal.created_at?.startsWith(todayString) &&
        meal.eventType?.includes("Meal:")
    );
  }, [nightscoutMeals, selectedDate]);

  const extractNutritionFromMeal = (meal: any): NutritionInfo => {
    return {
      calories: meal.calories || 0,
      carbs: meal.carbs || 0,
      protein: meal.protein || 0,
      fat: meal.fat || 0,
      sugar: meal.sugar,
      fiber: meal.fiber,
    };
  };

  const totalNutrition = useMemo(() => {
    return todayMeals.reduce(
      (total: NutritionInfo, meal: any) => {
        const nutrition = extractNutritionFromMeal(meal);
        total.calories += nutrition.calories || 0;
        total.carbs += nutrition.carbs || 0;
        total.protein += nutrition.protein || 0;
        total.fat += nutrition.fat || 0;
        total.sugar = (total.sugar || 0) + (nutrition.sugar || 0);
        total.fiber = (total.fiber || 0) + (nutrition.fiber || 0);
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

  const getMealTypeFromEvent = (eventType: string): MealType => {
    const type = eventType.replace("Meal: ", "");
    return mealTypes.includes(type as MealType)
      ? (type as MealType)
      : "Breakfast";
  };

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
    setManualCalories(nutrition.calories.toString());
    setManualCarbs(nutrition.carbs.toString());
    setManualProtein(nutrition.protein.toString());
    setManualFat(nutrition.fat.toString());
    setManualSugar(nutrition.sugar?.toString() || "");
    setManualFiber(nutrition.fiber?.toString() || "");
    setShowManualInput(true);
  };

  const clearForm = () => {
    setMealDescription("");
    setManualCalories("");
    setManualCarbs("");
    setManualProtein("");
    setManualFat("");
    setManualSugar("");
    setManualFiber("");
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

    let nutrition: NutritionInfo = {
      calories: manualCalories ? parseInt(manualCalories) : 0,
      carbs: manualCarbs ? parseInt(manualCarbs) : 0,
      protein: manualProtein ? parseInt(manualProtein) : 0,
      fat: manualFat ? parseInt(manualFat) : 0,
      sugar: manualSugar ? parseInt(manualSugar) : undefined,
      fiber: manualFiber ? parseInt(manualFiber) : undefined,
    };

    const treatmentData: NightscoutTreatment = {
      eventType: `Meal: ${selectedMealType}`,
      notes: mealDescription,
      carbs: nutrition?.carbs || 0,
      protein: nutrition?.protein,
      fat: nutrition?.fat,
      sugar: nutrition?.sugar,
      fiber: nutrition?.fiber,
      calories: nutrition?.calories,
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
          setManualCalories(nutrition.calories.toString());
          setManualCarbs(nutrition.carbs.toString());
          setManualProtein(nutrition.protein.toString());
          setManualFat(nutrition.fat.toString());
          setManualSugar(nutrition.sugar?.toString() || "");
          setManualFiber(nutrition.fiber?.toString() || "");
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

  const toggleManualInput = () => {
    setShowManualInput(!showManualInput);
    if (!showManualInput) {
      setManualCalories("");
      setManualCarbs("");
      setManualProtein("");
      setManualFat("");
      setManualSugar("");
      setManualFiber("");
    }
  };

  const handlePhotoUpload = () => {
    alert("Info", "Photo upload functionality will be implemented soon");
  };

  const handleQRScan = () => {
    alert("Info", "QR code scanning will be implemented soon");
  };

  const renderMealTypeSelector = () => (
    <>
      <Text style={CommonStyles.sectionLabel}>Select Meal Type</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.mealTypeScroll}
        contentContainerStyle={styles.mealTypeScrollContent}
      >
        {mealTypes.map((mealType) => (
          <TouchableOpacity
            key={mealType}
            style={[
              CommonStyles.mealTypeButton,
              selectedMealType === mealType &&
                CommonStyles.mealTypeButtonSelected,
            ]}
            onPress={() => setSelectedMealType(mealType)}
          >
            <Ionicons
              name={getMealIcon(mealType) as any}
              size={20}
              color={selectedMealType === mealType ? "white" : "#007AFF"}
            />
            <Text
              style={[
                CommonStyles.mealTypeText,
                selectedMealType === mealType &&
                  CommonStyles.mealTypeTextSelected,
              ]}
            >
              {mealType}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );

  const renderMealDescription = () => (
    <View style={styles.mealDescriptionSection}>
      <Text style={CommonStyles.sectionLabel}>
        What did you eat for {selectedMealType.toLowerCase()}?
      </Text>
      <TextInput
        style={CommonStyles.textInputLarge}
        placeholder="Describe your food in detail (e.g., '2 eggs, toast with butter, orange juice')"
        value={mealDescription}
        onChangeText={setMealDescription}
        multiline
        numberOfLines={4}
      />
    </View>
  );

  const renderManualInputs = () => (
    <View style={styles.manualInputGrid}>
      <View style={CommonStyles.inputRow}>
        <Text style={CommonStyles.nutritionLabel}>Calories (kcal)</Text>
        <TextInput
          style={CommonStyles.numberInput}
          placeholder="0"
          value={manualCalories}
          onChangeText={setManualCalories}
          keyboardType="numeric"
        />
      </View>
      <View style={CommonStyles.inputRow}>
        <Text style={CommonStyles.nutritionLabel}>Carbs (g)*</Text>
        <TextInput
          style={CommonStyles.numberInput}
          placeholder="0"
          value={manualCarbs}
          onChangeText={setManualCarbs}
          keyboardType="numeric"
        />
      </View>
      <View style={CommonStyles.inputRow}>
        <Text style={CommonStyles.nutritionLabel}>Protein (g)</Text>
        <TextInput
          style={CommonStyles.numberInput}
          placeholder="0"
          value={manualProtein}
          onChangeText={setManualProtein}
          keyboardType="numeric"
        />
      </View>
      <View style={CommonStyles.inputRow}>
        <Text style={CommonStyles.nutritionLabel}>Fat (g)</Text>
        <TextInput
          style={CommonStyles.numberInput}
          placeholder="0"
          value={manualFat}
          onChangeText={setManualFat}
          keyboardType="numeric"
        />
      </View>
      <View style={CommonStyles.inputRow}>
        <Text style={CommonStyles.nutritionLabel}>Sugar (g)*</Text>
        <TextInput
          style={CommonStyles.numberInput}
          placeholder="0"
          value={manualSugar}
          onChangeText={setManualSugar}
          keyboardType="numeric"
        />
      </View>
      <View style={CommonStyles.inputRow}>
        <Text style={CommonStyles.nutritionLabel}>Fiber (g)</Text>
        <TextInput
          style={CommonStyles.numberInput}
          placeholder="0"
          value={manualFiber}
          onChangeText={setManualFiber}
          keyboardType="numeric"
        />
      </View>
      <Text style={styles.requiredHint}>
        * Particularly important for diabetes
      </Text>
    </View>
  );

  const renderAIEstimation = () => (
    <>
      {isCalculatingCalories && (
        <View style={CommonStyles.caloriesCalculation}>
          <Ionicons name="sparkles" size={20} color="#007AFF" />
          <Text style={CommonStyles.caloriesCalculationText}>
            AI is analyzing your meal...
          </Text>
        </View>
      )}

      {manualCalories && !isCalculatingCalories && (
        <View style={CommonStyles.aiEstimation}>
          <View style={CommonStyles.aiHeader}>
            <Ionicons name="sparkles" size={20} color="#4CAF50" />
            <Text style={CommonStyles.aiTitle}>AI Estimation</Text>
          </View>
          <View style={CommonStyles.nutritionPreview}>
            <View style={CommonStyles.nutritionItem}>
              <Text style={CommonStyles.nutritionValue}>{manualCalories}</Text>
              <Text style={CommonStyles.nutritionUnit}>kcal</Text>
            </View>
            <View style={CommonStyles.nutritionItem}>
              <Text style={CommonStyles.nutritionValue}>{manualCarbs}</Text>
              <Text style={CommonStyles.nutritionUnit}>carbs (g)</Text>
            </View>
            <View style={CommonStyles.nutritionItem}>
              <Text style={CommonStyles.nutritionValue}>{manualProtein}</Text>
              <Text style={CommonStyles.nutritionUnit}>protein (g)</Text>
            </View>
            <View style={CommonStyles.nutritionItem}>
              <Text style={CommonStyles.nutritionValue}>{manualFat}</Text>
              <Text style={CommonStyles.nutritionUnit}>fat (g)</Text>
            </View>
          </View>
        </View>
      )}
    </>
  );

  const renderTodayMeals = () => {
    if (!todayMeals || todayMeals.length === 0) return null;

    return (
      <View style={CommonStyles.mealsSummary}>
        <Text style={CommonStyles.summaryTitle}>Today's Meals</Text>
        {todayMeals.map((meal) => {
          const nutrition = extractNutritionFromMeal(meal);
          const mealType = getMealTypeFromEvent(meal.eventType || "");

          return (
            <View key={meal._id || meal.id} style={CommonStyles.mealItem}>
              <View style={CommonStyles.mealHeader}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <Ionicons
                    name={getMealIcon(mealType) as any}
                    size={16}
                    color="#007AFF"
                  />
                  <Text style={CommonStyles.mealType}>{mealType}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {nutrition.calories > 0 && (
                    <Text style={CommonStyles.mealCalories}>
                      {nutrition.calories} kcal
                    </Text>
                  )}
                  <TouchableOpacity
                    onPress={() => loadMealForEditing(meal)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="create-outline" size={18} color="#666" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteMeal(meal)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={CommonStyles.mealDescription}>
                {meal.notes || "No description"}
              </Text>
              {(nutrition.carbs > 0 ||
                nutrition.protein > 0 ||
                nutrition.fat > 0) && (
                <View style={CommonStyles.mealNutrition}>
                  <Text style={CommonStyles.nutritionDetail}>
                    C: {nutrition.carbs}g | P: {nutrition.protein}g | F:{" "}
                    {nutrition.fat}g
                    {nutrition.sugar && ` | Sugar: ${nutrition.sugar}g`}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
        <View style={CommonStyles.totalNutrition}>
          <Text style={CommonStyles.totalTitle}>Daily Total:</Text>
          <Text style={CommonStyles.totalDetail}>
            {totalNutrition.calories} kcal | C: {totalNutrition.carbs}g | P:{" "}
            {totalNutrition.protein}g | F: {totalNutrition.fat}g
            {(totalNutrition.sugar ?? 0) > 0 &&
              ` | Sugar: ${totalNutrition.sugar ?? 0}g`}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={CommonStyles.journalContainer}>
      {renderMealTypeSelector()}

      {/* Meal Description */}
      {renderMealDescription()}

      {/* Nutrition Input Section */}
      <View style={styles.nutritionSection}>
        <View style={CommonStyles.nutritionHeader}>
          <Text style={CommonStyles.sectionLabel}>Nutrition Information</Text>
          <TouchableOpacity
            onPress={toggleManualInput}
            style={CommonStyles.toggleButton}
          >
            <Text style={CommonStyles.toggleButtonText}>
              {showManualInput ? "Use AI Analysis" : "Enter Manually"}
            </Text>
          </TouchableOpacity>
        </View>

        {showManualInput ? renderManualInputs() : renderAIEstimation()}
      </View>

      {/* Action Buttons */}
      <View style={CommonStyles.buttonRow}>
        <TouchableOpacity
          style={CommonStyles.iconButton}
          onPress={handlePhotoUpload}
        >
          <Ionicons name="camera" size={24} color="#007AFF" />
          <Text style={CommonStyles.iconButtonText}>Add Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={CommonStyles.iconButton}
          onPress={handleQRScan}
        >
          <Ionicons name="qr-code" size={24} color="#007AFF" />
          <Text style={CommonStyles.iconButtonText}>Scan Food</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Meals Summary */}
      {renderTodayMeals()}

      {/* Save/Update Button */}
      <TouchableOpacity
        style={[
          CommonStyles.saveButton,
          editingMealId && { backgroundColor: "#4CAF50" },
        ]}
        onPress={handleSaveMeal}
        disabled={isCalculatingCalories}
      >
        <Text style={CommonStyles.saveButtonText}>
          {isCalculatingCalories
            ? "Analyzing..."
            : editingMealId
            ? `Update ${selectedMealType}`
            : `Save ${selectedMealType}`}
        </Text>
      </TouchableOpacity>

      {/* Cancel Edit Button */}
      {editingMealId && (
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
  mealTypeScroll: {
    marginBottom: 24,
  },
  mealTypeScrollContent: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  mealDescriptionSection: {
    marginBottom: 24,
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
  requiredHint: {
    fontSize: 12,
    color: "#FF6B6B",
    fontStyle: "italic",
    marginTop: 8,
    textAlign: "center",
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
    borderRadius: 4,
  },
});

export default FoodSection;
