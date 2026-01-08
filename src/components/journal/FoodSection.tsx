import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
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
import { VintageStylesFood } from "../../themes/vintage/styles_vintage_food";
import { analyzeMeal } from "../../utils/cloudFunctions";
import {
  getMealTypeFromEvent,
  getTodaysMealsNutrition,
  extractNutritionFromMeal,
  getMealIcon,
  getMealColor,
  getConfidenceColor,
  getConfidenceText,
} from "../../utils/journalUtils/mealsAndActivitiesUtils";
import TimePicker from "../../components/common/TimePicker";

import { pickImage, takePhoto } from "../../utils/photoUpload";
import {
  AIAnalysisResult,
  MealType,
  NutritionInfo,
  mealTypes,
} from "../../types/events";
import { useLiveTime } from "../../hooks/useJournal/useLiveTime";

interface FoodSectionProps {
  selectedDate: Date;
  meals: NightscoutTreatment[];
}

const FoodSection: React.FC<FoodSectionProps> = ({
  selectedDate,
  meals: todayMeals,
}) => {
  const [selectedMealType, setSelectedMealType] =
    useState<MealType>("Breakfast");
  const [mealDescription, setMealDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo>({
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
    fiber: 0,
  });

  const { firebaseUser, userData } = useAuth();
  const { fetchTreatments } = useNightscout();
  const CLOUD_FUNCTIONS_HOST = Constants.expoConfig?.extra?.cloudFunctionsHost;

  const totalNutrition = useMemo(() => {
    return getTodaysMealsNutrition(todayMeals);
  }, [todayMeals]);

  const { currentTime, getNowTimeString } = useLiveTime({
    format24Hour: true,
  });

  const [mealTime, setMealTime] = useState<string>(currentTime);

  useEffect(() => {
    setMealTime(currentTime);
  }, [currentTime]);

  const handleTimeChange = (time: string) => {
    setMealTime(time);
    setShowTimePicker(false);
  };

  const openTimePicker = () => {
    setShowTimePicker(true);
  };

  const handleTakePhoto = async () => {
    try {
      const result = await takePhoto();

      if (!result) {
        return;
      }
      if (!result.canceled && result.assets[0].base64) {
        setSelectedImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
        //    await handleAnalyzePhoto(result.assets[0].base64, mealDescription);
        // we dont want to auto anylyze anymore
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      alert("Error", "Failed to take photo");
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await pickImage();
      if (!result) {
        return;
      }

      if (!result.canceled && result.assets[0].base64) {
        setSelectedImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
        //  await handleAnalyzePhoto(result.assets[0].base64, mealDescription);
        //  we dont want to auto anylyze anymore
      }
    } catch (error) {
      console.error("Error picking image:", error);
      alert("Error", "Failed to pick image");
    }
  };

  const handleAnalyzePhoto = async (
    imageBase64: string,
    description?: string
  ) => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    setShowManualInput(false);

    try {
      if (!firebaseUser) {
        alert("Error", "You must be logged in to analyze meals.");
        return;
      }

      const result = await analyzeMeal(
        imageBase64,
        CLOUD_FUNCTIONS_HOST,
        await firebaseUser.getIdToken(),
        description,
        userData?.geminiAPIKey || ""
      );

      if (result.error) {
        if (result.userMessage) {
          alert("Analysis Limit", result.userMessage);
        } else {
          alert("AI Analysis Error", result.error);
        }
        return;
      }

      result.totals.total_weight_grams = result.food_items.reduce(
        (total: number, item: any) =>
          total + (item.estimated_weight_grams || 0),
        0
      );

      setAiAnalysis(result);

      setNutritionInfo({
        calories: result.totals?.calories || 0,
        carbs: result.totals?.carbs_grams || 0,
        protein: result.totals?.protein_grams || 0,
        fat: result.totals?.fat_grams || 0,
        fiber: result.totals?.fiber_grams || 0,
      });

      // const foodNames =
      //   result.food_items?.map((item: any) => item.name).join(", ") ||
      //   "Analyzed meal";
      const foodNames =
        result.description ||
        result.food_items?.map((item: any) => item.name).join(", ") ||
        "Analyzed meal";
      setMealDescription(foodNames);
    } catch (error: any) {
      console.error("Error analyzing meal:", error);
      console.log("AI raw response:", error.response);
      alert(
        "Analysis Error",
        `Failed to analyze meal: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearPhoto = () => {
    setSelectedImage(null);
    setAiAnalysis(null);
  };

  const handleEditAIResults = () => {
    setShowManualInput(true);
  };

  const handleBackToAIAnalysis = () => {
    setShowManualInput(false);
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
    setAiAnalysis(null);

    const mealDate = new Date(meal.created_at);
    const mealTimeString = mealDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMealTime(mealTimeString);
  };

  const clearForm = () => {
    setMealDescription("");
    setNutritionInfo({
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
      fiber: 0,
    });
    setShowManualInput(false);
    setEditingMealId(null);
    setSelectedImage(null);
    setAiAnalysis(null);
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
              userData.nightscoutUrl,
              userData.nightscoutSecret ?? "",
              meal._id!
            );

            if (!success) {
              alert("Error", "Failed to delete meal from Nightscout.");
              console.error("Failed to delete meal:", meal);
              return;
            }
            setMealTime(getNowTimeString());

            await fetchTreatments(selectedDate);

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
      alert("Error", "Please describe your meal in detail or upload a photo");
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

    const [hours24, minutes] = mealTime.split(":").map(Number);
    const timeDate = new Date(selectedDate);
    timeDate.setHours(hours24, minutes, 0, 0);

    const treatmentData: NightscoutTreatment = {
      eventType: `Meal: ${selectedMealType}`,
      notes: mealDescription,
      carbs: nutritionInfo?.carbs || 0,
      protein: nutritionInfo?.protein || 0,
      fat: nutritionInfo?.fat || 0,
      fiber: nutritionInfo?.fiber || 0,
      calories: nutritionInfo?.calories || 0,
      created_at: timeDate.toISOString(),
      enteredBy: "GlucoseGoose App",
    };

    if (aiAnalysis) {
      treatmentData.ai_analysis = JSON.stringify(aiAnalysis);
      treatmentData.ai_confidence = aiAnalysis.confidence;
    }

    try {
      let success;
      if (editingMealId) {
        treatmentData._id = editingMealId;
        success = await updateTreatment(
          userData.nightscoutUrl,
          userData.nightscoutSecret ?? "",
          treatmentData
        );
      } else {
        success = await addTreatment(
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
      setMealTime(getNowTimeString());

      await fetchTreatments(selectedDate);

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

  const renderTimePicker = () => (
    <TimePicker
      visible={showTimePicker}
      onClose={() => setShowTimePicker(false)}
      onTimeSelect={handleTimeChange}
      selectedTime={mealTime}
      selectedDate={selectedDate}
    />
  );

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

  const renderAnalyzeButton = () => {
    if (selectedImage && !mealDescription.trim() && !isAnalyzing) {
      return (
        <View style={VintageStylesFood.sectionContainer}>
          <TouchableOpacity
            style={VintageStylesFood.analyzeButton}
            onPress={() => handleAnalyzePhoto(selectedImage.split(",")[1])}
            disabled={isAnalyzing}
          >
            <Ionicons
              name="sparkles"
              size={18}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text style={VintageStylesFood.analyzeButtonText}>
              {isAnalyzing ? "Analyzing..." : "Analyze Photo"}
            </Text>
          </TouchableOpacity>

          <View style={VintageStylesFood.analyzeHintCard}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={VintageColors.secondaryText}
            />
            <Text style={VintageStylesFood.analyzeHintText}>
              Adding a description with details about the meal (size,
              ingredients) will make the results much more accurate!
            </Text>
          </View>
        </View>
      );
    }

    if (
      selectedImage &&
      mealDescription.trim() &&
      !aiAnalysis &&
      !isAnalyzing
    ) {
      return (
        <View style={VintageStylesFood.sectionContainer}>
          <TouchableOpacity
            style={VintageStylesFood.analyzeButton}
            onPress={() =>
              handleAnalyzePhoto(selectedImage.split(",")[1], mealDescription)
            }
            disabled={isAnalyzing}
          >
            <Ionicons
              name="sparkles"
              size={18}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text style={VintageStylesFood.analyzeButtonText}>
              Analyze Photo with Description
            </Text>
          </TouchableOpacity>

          <View style={VintageStylesFood.analyzeHintCard}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text
              style={[VintageStylesFood.analyzeHintText, { color: "#4CAF50" }]}
            >
              Great! The description will help AI provide more accurate
              nutrition analysis.
            </Text>
          </View>
        </View>
      );
    }

    return null;
  };

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
          placeholder="Describe your meal in detail (e.g. ingredients, portion size) and/or take a photo for AI analysis"
          value={mealDescription}
          onChangeText={setMealDescription}
          multiline
          numberOfLines={3}
          placeholderTextColor={VintageColors.secondaryText}
        />
      </View>
    </View>
  );

  const renderPhotoUpload = () => (
    <View style={VintageStylesFood.sectionContainer}>
      <View style={VintageStyles.sectionHeader}>
        <Text style={VintageStyles.sectionTitle}>Photo Analysis</Text>
        <View style={VintageStyles.featherAccent}>
          <Feather name="camera" size={16} color={VintageColors.primaryText} />
        </View>
      </View>

      {selectedImage ? (
        <View style={VintageStylesFood.photoCard}>
          <Image
            source={{ uri: selectedImage }}
            style={VintageStylesFood.photoImage}
            resizeMode="cover"
          />
          <View style={VintageStylesFood.photoActions}>
            <TouchableOpacity
              style={VintageStylesFood.photoActionButton}
              onPress={clearPhoto}
            >
              <Ionicons name="close" size={20} color="#FF6B6B" />
              <Text style={VintageStylesFood.photoActionText}>Remove</Text>
            </TouchableOpacity>
            {isAnalyzing && (
              <View style={VintageStylesFood.analyzingIndicator}>
                <Ionicons
                  name="sparkles"
                  size={16}
                  color={VintageColors.primaryText}
                />
                <Text style={VintageStylesFood.analyzingText}>
                  Analyzing...
                </Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={VintageStylesFood.uploadCard}>
          <View style={VintageStylesFood.uploadIconContainer}>
            <Feather
              name="camera"
              size={32}
              color={VintageColors.primaryText}
            />
          </View>
          <Text style={VintageStylesFood.uploadTitle}>Take a Photo</Text>
          <Text style={VintageStylesFood.uploadSubtitle}>
            {!mealDescription.trim()
              ? "Upload a photo, then describe your meal for accurate AI analysis"
              : "Great! Now upload a photo for AI analysis"}
          </Text>
          <View style={VintageStylesFood.uploadButtons}>
            <TouchableOpacity
              style={[VintageStylesFood.uploadButton, { marginRight: 8 }]}
              onPress={handleTakePhoto}
              disabled={isAnalyzing}
            >
              <Ionicons
                name="camera-outline"
                size={20}
                color={VintageColors.primaryText}
              />
              <Text style={VintageStylesFood.uploadButtonText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={VintageStylesFood.uploadButton}
              onPress={handlePickImage}
              disabled={isAnalyzing}
            >
              <Ionicons
                name="image-outline"
                size={20}
                color={VintageColors.primaryText}
              />
              <Text style={VintageStylesFood.uploadButtonText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderAIAnalysis = () => {
    if (!aiAnalysis || showManualInput) return null;

    const confidence = aiAnalysis.confidence || "medium";
    const confidenceColor = getConfidenceColor(confidence);
    const confidenceText = getConfidenceText(confidence);

    return (
      <View style={VintageStylesFood.sectionContainer}>
        <View style={VintageStylesFood.aiAnalysisCard}>
          <View style={VintageStylesFood.aiAnalysisHeader}>
            <View style={VintageStylesFood.aiAnalysisIcon}>
              <Ionicons name="sparkles" size={20} color="#4CAF50" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={VintageStylesFood.aiAnalysisTitle}>AI Analysis</Text>
              <View style={VintageStylesFood.confidenceBadge}>
                <View
                  style={[
                    VintageStylesFood.confidenceDot,
                    { backgroundColor: confidenceColor },
                  ]}
                />
                <Text
                  style={[
                    VintageStylesFood.aiAnalysisConfidence,
                    { color: confidenceColor },
                  ]}
                >
                  {confidenceText}
                </Text>
              </View>
            </View>
          </View>

          <View style={VintageStylesFood.detectedFoods}>
            <Text style={VintageStylesFood.detectedFoodsTitle}>
              Detected Foods:
            </Text>
            {aiAnalysis.food_items?.map((item, index) => (
              <View key={index} style={VintageStylesFood.foodItem}>
                <Text style={VintageStylesFood.foodItemName}>{item.name}</Text>
                <Text style={VintageStylesFood.foodItemDetails}>
                  {item.estimated_weight_grams}g • {item.calories} kcal
                </Text>
              </View>
            ))}
          </View>

          <View style={VintageStylesFood.aiTotals}>
            <Text style={VintageStylesFood.aiTotalsTitle}>
              Estimated Nutrition
            </Text>
            <View style={VintageStylesFood.aiTotalsGrid}>
              <View style={VintageStylesFood.aiTotalItem}>
                <View style={VintageStylesFood.aiTotalIconContainer}>
                  <Ionicons
                    name="flame"
                    size={16}
                    color={VintageColors.primaryText}
                  />
                </View>
                <Text style={VintageStylesFood.aiTotalValue}>
                  {aiAnalysis.totals?.calories || 0}
                </Text>
                <Text style={VintageStylesFood.aiTotalLabel}>Calories</Text>
              </View>
              <View style={VintageStylesFood.aiTotalItem}>
                <View style={VintageStylesFood.aiTotalIconContainer}>
                  <Ionicons
                    name="nutrition"
                    size={16}
                    color={VintageColors.primaryText}
                  />
                </View>
                <Text style={VintageStylesFood.aiTotalValue}>
                  {aiAnalysis.totals?.carbs_grams || 0}
                </Text>
                <Text style={VintageStylesFood.aiTotalLabel}>Carbs (g)</Text>
              </View>
              <View style={VintageStylesFood.aiTotalItem}>
                <View style={VintageStylesFood.aiTotalIconContainer}>
                  <Ionicons
                    name="barbell"
                    size={16}
                    color={VintageColors.primaryText}
                  />
                </View>
                <Text style={VintageStylesFood.aiTotalValue}>
                  {aiAnalysis.totals?.protein_grams || 0}
                </Text>
                <Text style={VintageStylesFood.aiTotalLabel}>Protein (g)</Text>
              </View>
              <View style={VintageStylesFood.aiTotalItem}>
                <View style={VintageStylesFood.aiTotalIconContainer}>
                  <Ionicons
                    name="water"
                    size={16}
                    color={VintageColors.primaryText}
                  />
                </View>
                <Text style={VintageStylesFood.aiTotalValue}>
                  {aiAnalysis.totals?.fat_grams || 0}
                </Text>
                <Text style={VintageStylesFood.aiTotalLabel}>Fat (g)</Text>
              </View>
              <View style={VintageStylesFood.aiTotalItem}>
                <View style={VintageStylesFood.aiTotalIconContainer}>
                  <Ionicons
                    name="leaf"
                    size={16}
                    color={VintageColors.primaryText}
                  />
                </View>
                <Text style={VintageStylesFood.aiTotalValue}>
                  {aiAnalysis.totals?.fiber_grams || 0}
                </Text>
                <Text style={VintageStylesFood.aiTotalLabel}>Fiber (g)</Text>
              </View>
              <View style={VintageStylesFood.aiTotalItem}>
                <View style={VintageStylesFood.aiTotalIconContainer}>
                  <Ionicons
                    name="cube"
                    size={16}
                    color={VintageColors.primaryText}
                  />
                </View>
                <Text style={VintageStylesFood.aiTotalValue}>
                  {aiAnalysis.totals?.total_weight_grams || 0}
                </Text>
                <Text style={VintageStylesFood.aiTotalLabel}>Weight (g)</Text>
              </View>
            </View>
          </View>

          <View style={VintageStylesFood.aiDisclaimer}>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={VintageColors.secondaryText}
            />
            <Text style={VintageStylesFood.aiDisclaimerText}>
              AI estimates are approximations. Tap "Edit" to adjust values.
            </Text>
          </View>

          <TouchableOpacity
            style={VintageStylesFood.editAiButton}
            onPress={handleEditAIResults}
          >
            <Feather
              name="edit-2"
              size={16}
              color={VintageColors.primaryText}
            />
            <Text style={VintageStylesFood.editAiButtonText}>
              Edit AI Estimates
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderManualInputs = () => {
    if (!showManualInput) return null;

    return (
      <View style={VintageStylesFood.sectionContainer}>
        <View style={VintageStylesFood.nutritionCard}>
          {aiAnalysis && (
            <TouchableOpacity
              style={VintageStylesFood.backToAIButton}
              onPress={handleBackToAIAnalysis}
            >
              <Ionicons
                name="arrow-back"
                size={16}
                color={VintageColors.primaryText}
              />
              <Text style={VintageStylesFood.backToAIText}>
                Back to AI Analysis
              </Text>
            </TouchableOpacity>
          )}

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
                    calories: parseInt(text) || 0,
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
                <Text style={VintageStylesFood.inputLabel}>Carbs (g)</Text>
              </View>
              <TextInput
                style={VintageStylesFood.numberInput}
                placeholder="0"
                value={nutritionInfo.carbs.toString()}
                onChangeText={(text) =>
                  setNutritionInfo({
                    ...nutritionInfo,
                    carbs: parseInt(text) || 0,
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
                    protein: parseInt(text) || 0,
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
                  setNutritionInfo({
                    ...nutritionInfo,
                    fat: parseInt(text) || 0,
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
                    fiber: parseInt(text) || 0,
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
  };

  const renderManualInputToggle = () => {
    if (isAnalyzing) return null;

    if (aiAnalysis) return null;

    if (editingMealId) return null;

    if (selectedImage) return null;

    return (
      <View style={VintageStylesFood.sectionContainer}>
        <TouchableOpacity
          style={VintageStylesFood.toggleCard}
          onPress={() => setShowManualInput(!showManualInput)}
        >
          <View style={VintageStylesFood.toggleHeader}>
            <Feather
              name={showManualInput ? "edit-3" : "plus-circle"}
              size={20}
              color={VintageColors.primaryText}
            />
            <Text style={VintageStylesFood.toggleTitle}>
              {showManualInput
                ? "Close Manual Input"
                : "Enter Nutrition Manually"}
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
  };

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
            <View key={meal._id || meal.id} style={VintageStylesFood.mealCard}>
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
                  <View style={VintageStylesFood.actionButtonsContainer}>
                    <TouchableOpacity
                      onPress={() => loadMealForEditing(meal)}
                      style={VintageStylesFood.actionButton}
                    >
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color={VintageColors.primaryText}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteMeal(meal)}
                      style={VintageStylesFood.actionButton}
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
              <Text style={VintageStylesFood.mealDescription}>
                {meal.notes || "No description"}
              </Text>
              {(nutrition.carbs > 0 ||
                nutrition.protein > 0 ||
                nutrition.fat > 0) && (
                <View style={VintageStylesFood.mealNutrition}>
                  <Text style={VintageStylesFood.nutritionDetail}>
                    C: {nutrition.carbs}g | P: {nutrition.protein}g | F:{" "}
                    {nutrition.fat}g | Fiber: {nutrition.fiber}g
                  </Text>
                </View>
              )}
            </View>
          );
        })}
        <View style={VintageStylesFood.totalNutritionCard}>
          <View style={VintageStylesFood.totalHeader}>
            <View style={VintageStylesFood.totalIconContainer}>
              <Ionicons
                name="nutrition"
                size={20}
                color={VintageColors.primaryText}
              />
            </View>
            <Text style={VintageStylesFood.totalTitle}>
              Daily Nutrition Summary
            </Text>
          </View>

          <View style={VintageStylesFood.totalStats}>
            {(() => {
              const nutritionItems = [
                {
                  key: "calories",
                  value: totalNutrition.calories,
                  label: "Cal",
                  icon: "flame",
                  color: VintageColors.iconPink,
                  show: totalNutrition.calories > 0,
                },
                {
                  key: "carbs",
                  value: totalNutrition.carbs,
                  label: "Carbs",
                  icon: "nutrition",
                  color: VintageColors.iconYellow,
                  show: totalNutrition.carbs > 0,
                },
                {
                  key: "protein",
                  value: totalNutrition.protein,
                  label: "Protein",
                  icon: "barbell",
                  color: VintageColors.iconBlue,
                  show: totalNutrition.protein > 0,
                },
                {
                  key: "fat",
                  value: totalNutrition.fat,
                  label: "Fat",
                  icon: "water",
                  color: VintageColors.iconPurple,
                  show: totalNutrition.fat > 0,
                },
                {
                  key: "fiber",
                  value: totalNutrition.fiber,
                  label: "Fiber",
                  icon: "leaf",
                  color: VintageColors.iconGreen,
                  show: totalNutrition.fiber > 0,
                },
              ];

              const visibleItems = nutritionItems.filter((item) => item.show);

              if (visibleItems.length === 0) {
                return (
                  <View style={VintageStylesFood.noDataContainer}>
                    <Ionicons
                      name="restaurant-outline"
                      size={24}
                      color={VintageColors.secondaryText}
                    />
                    <Text style={VintageStylesFood.noDataText}>
                      No nutrition data for today
                    </Text>
                  </View>
                );
              }

              return visibleItems.map((item, index) => (
                <React.Fragment key={item.key}>
                  <View style={VintageStylesFood.totalStatItem}>
                    <View style={VintageStylesFood.totalStatContent}>
                      <Text style={VintageStylesFood.totalStatValue}>
                        {item.value}
                      </Text>
                      <View style={VintageStylesFood.totalStatLabelContainer}>
                        <View
                          style={[
                            VintageStylesFood.totalStatIcon,
                            { backgroundColor: item.color },
                          ]}
                        >
                          <Ionicons
                            name={item.icon as any}
                            size={12}
                            color={VintageColors.secondaryText}
                          />
                        </View>
                        <Text style={VintageStylesFood.totalStatLabel}>
                          {item.label}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {index < visibleItems.length - 1 && (
                    <View style={VintageStylesFood.totalStatDivider} />
                  )}
                </React.Fragment>
              ));
            })()}
          </View>
        </View>
      </View>
    );
  };

  const renderSaveMealButton = () => (
    <View style={VintageStylesFood.sectionContainer}>
      <TouchableOpacity
        style={[
          VintageStylesFood.saveButton,
          editingMealId && VintageStylesFood.updateButton,
        ]}
        onPress={handleSaveMeal}
        disabled={isAnalyzing}
      >
        <View style={VintageStylesFood.saveButtonIcon}>
          {editingMealId ? (
            <Feather name="save" size={20} color="#FFFFFF" />
          ) : (
            <Feather name="plus" size={20} color="#FFFFFF" />
          )}
        </View>
        <Text style={VintageStylesFood.saveButtonText}>
          {isAnalyzing
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

  const renderTimeSelection = () => (
    <View style={VintageStylesFood.sectionContainer}>
      <View style={VintageStyles.sectionHeader}>
        <Text style={VintageStyles.sectionTitle}>Meal Time</Text>
        <View style={VintageStyles.featherAccent}>
          <Feather name="clock" size={16} color={VintageColors.primaryText} />
        </View>
      </View>

      <TouchableOpacity
        style={VintageStylesFood.timeCard}
        onPress={openTimePicker}
        activeOpacity={0.7}
      >
        <View style={VintageStylesFood.timeCardLeft}>
          <View style={VintageStylesFood.timeIconContainer}>
            <Feather name="clock" size={20} color={VintageColors.primaryText} />
          </View>
          <View>
            <Text style={VintageStylesFood.timeLabel}>Time</Text>
            <Text style={VintageStylesFood.timeValue}>{mealTime}</Text>
          </View>
        </View>
        <View style={VintageStylesFood.timeCardRight}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={VintageColors.secondaryText}
          />
        </View>
      </TouchableOpacity>

      {/* <Text style={VintageStylesFood.timeHelpText}>
        Meal will be logged for {selectedDate.toLocaleDateString()}
      </Text> */}
    </View>
  );

  const renderAnalyzingMessage = () => {
    if (!isAnalyzing) return null;

    return (
      <View style={VintageStylesFood.sectionContainer}>
        <View style={VintageStylesFood.analyzingCard}>
          <View style={VintageStylesFood.analyzingIconContainer}>
            <Ionicons
              name="sparkles"
              size={24}
              color={VintageColors.primaryText}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={VintageStylesFood.analyzingTitle}>
              Analyzing Your Meal
            </Text>
            <Text style={VintageStylesFood.analyzingSubtitle}>
              This can take up to 30 seconds...
            </Text>
            <Text style={VintageStylesFood.analyzingHint}>
              AI is analyzing the photo and estimating nutrition values
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={VintageStylesFood.container}
        showsVerticalScrollIndicator={false}
      >
        {renderMealTypeSelector()}
        {renderTimeSelection()}
        {renderMealDescription()}
        {renderPhotoUpload()}
        {renderAnalyzeButton()}
        {renderAnalyzingMessage()}
        {renderAIAnalysis()}
        {renderManualInputToggle()}
        {renderManualInputs()}
        {renderSaveMealButton()}
        {renderTodayMeals()}
        <View style={VintageStyles.spacing60} />
      </ScrollView>

      {renderTimePicker()}
    </View>
  );
};
export default FoodSection;
