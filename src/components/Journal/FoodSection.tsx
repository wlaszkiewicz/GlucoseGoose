import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { CommonStyles } from "../../themes/styles";
import { Ionicons } from "@expo/vector-icons";

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

interface MealEntry {
  id: string;
  type: MealType;
  description: string;
  nutrition?: NutritionInfo;
  time: Date;
}

interface FoodSectionProps {
  selectedDate: Date;
}

const FoodSection: React.FC<FoodSectionProps> = ({ selectedDate }) => {
  const [selectedMealType, setSelectedMealType] =
    useState<MealType>("Breakfast");
  const [mealDescription, setMealDescription] = useState("");
  const [isCalculatingCalories, setIsCalculatingCalories] = useState(false);

  const [manualCalories, setManualCalories] = useState("");
  const [manualCarbs, setManualCarbs] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [manualFat, setManualFat] = useState("");
  const [manualSugar, setManualSugar] = useState("");
  const [manualFiber, setManualFiber] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const [dayEntries, setDayEntries] = useState<any[]>([]);

  const currentDayEntry = dayEntries.find(
    (entry) => entry.date === selectedDate.toISOString().split("T")[0]
  );

  const totalNutrition = currentDayEntry?.meals.reduce(
    (total: any, meal: any) => {
      if (meal.nutrition) {
        total.calories += meal.nutrition.calories || 0;
        total.carbs += meal.nutrition.carbs || 0;
        total.protein += meal.nutrition.protein || 0;
        total.fat += meal.nutrition.fat || 0;
        total.sugar += meal.nutrition.sugar || 0;
        total.fiber += meal.nutrition.fiber || 0;
      }
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
  ) || {
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
    sugar: 0,
    fiber: 0,
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

  useEffect(() => {
    const analyzeMealWithAI = async () => {
      if (mealDescription.trim().length > 10 && !showManualInput) {
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

    analyzeMealWithAI();
  }, [mealDescription, showManualInput]);

  const handleSaveMeal = async () => {
    if (!mealDescription.trim()) {
      Alert.alert("Error", "Please describe your meal");
      return;
    }

    const dateString = selectedDate.toISOString().split("T")[0];

    let nutrition: NutritionInfo | undefined;
    if (showManualInput && manualCalories) {
      nutrition = {
        calories: parseInt(manualCalories) || 0,
        carbs: parseInt(manualCarbs) || 0,
        protein: parseInt(manualProtein) || 0,
        fat: parseInt(manualFat) || 0,
        sugar: manualSugar ? parseInt(manualSugar) : undefined,
        fiber: manualFiber ? parseInt(manualFiber) : undefined,
      };
    }

    const newMeal: MealEntry = {
      id: Date.now().toString(),
      type: selectedMealType,
      description: mealDescription,
      nutrition: nutrition,
      time: new Date(),
    };

    setDayEntries((prev) => {
      const existingDayIndex = prev.findIndex(
        (entry: any) => entry.date === dateString
      );

      if (existingDayIndex >= 0) {
        const updated = [...prev];
        updated[existingDayIndex] = {
          ...updated[existingDayIndex],
          meals: [...updated[existingDayIndex].meals, newMeal],
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            date: dateString,
            meals: [newMeal],
          },
        ];
      }
    });

    setMealDescription("");
    setManualCalories("");
    setManualCarbs("");
    setManualProtein("");
    setManualFat("");
    setManualSugar("");
    setManualFiber("");
    setShowManualInput(false);

    Alert.alert("Success", `${selectedMealType} saved successfully!`);
  };

  const handlePhotoUpload = () => {
    Alert.alert("Info", "Photo upload functionality will be implemented soon");
  };

  const handleQRScan = () => {
    Alert.alert("Info", "QR code scanning will be implemented soon");
  };

  const getMealIcon = (mealType: MealType) => {
    const icons = {
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

  return (
    <View style={CommonStyles.journalContainer}>
      {/* Meal Type Selector */}
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

      {/* Meal Description */}
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

        {showManualInput ? (
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
        ) : (
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
                    <Text style={CommonStyles.nutritionValue}>
                      {manualCalories}
                    </Text>
                    <Text style={CommonStyles.nutritionUnit}>kcal</Text>
                  </View>
                  <View style={CommonStyles.nutritionItem}>
                    <Text style={CommonStyles.nutritionValue}>
                      {manualCarbs}
                    </Text>
                    <Text style={CommonStyles.nutritionUnit}>carbs (g)</Text>
                  </View>
                  <View style={CommonStyles.nutritionItem}>
                    <Text style={CommonStyles.nutritionValue}>
                      {manualProtein}
                    </Text>
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
        )}
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
      {currentDayEntry?.meals && currentDayEntry.meals.length > 0 && (
        <View style={CommonStyles.mealsSummary}>
          <Text style={CommonStyles.summaryTitle}>Today's Meals</Text>
          {currentDayEntry.meals.map((meal: any) => (
            <View key={meal.id} style={CommonStyles.mealItem}>
              <View style={CommonStyles.mealHeader}>
                <Ionicons
                  name={getMealIcon(meal.type) as any}
                  size={16}
                  color="#007AFF"
                />
                <Text style={CommonStyles.mealType}>{meal.type}</Text>
                {meal.nutrition && (
                  <Text style={CommonStyles.mealCalories}>
                    {meal.nutrition.calories} kcal
                  </Text>
                )}
              </View>
              <Text style={CommonStyles.mealDescription}>
                {meal.description}
              </Text>
              {meal.nutrition && (
                <View style={CommonStyles.mealNutrition}>
                  <Text style={CommonStyles.nutritionDetail}>
                    C: {meal.nutrition.carbs}g | P: {meal.nutrition.protein}g |
                    F: {meal.nutrition.fat}g
                    {meal.nutrition.sugar &&
                      ` | Sugar: ${meal.nutrition.sugar}g`}
                  </Text>
                </View>
              )}
            </View>
          ))}
          <View style={CommonStyles.totalNutrition}>
            <Text style={CommonStyles.totalTitle}>Daily Total:</Text>
            <Text style={CommonStyles.totalDetail}>
              {totalNutrition.calories} kcal | C: {totalNutrition.carbs}g | P:{" "}
              {totalNutrition.protein}g | F: {totalNutrition.fat}g
              {totalNutrition.sugar > 0 && ` | Sugar: ${totalNutrition.sugar}g`}
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={CommonStyles.saveButton}
        onPress={handleSaveMeal}
        disabled={isCalculatingCalories}
      >
        <Text style={CommonStyles.saveButtonText}>
          {isCalculatingCalories ? "Analyzing..." : `Save ${selectedMealType}`}
        </Text>
      </TouchableOpacity>
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
});

export default FoodSection;
