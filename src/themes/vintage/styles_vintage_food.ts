// styles_vintage_food.ts
import { StyleSheet } from "react-native";
import { VintageColors } from "./colors_vintage";

export const VintageStylesFood = StyleSheet.create({
  container: {
    flex: 1,
  },

  sectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },

  // Meal Type Selector
  mealTypeScroll: {
    marginTop: 8,
  },

  mealTypeScrollContent: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },

  mealTypeButton: {
    alignItems: "center",
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

  mealTypeButtonSelected: {
    borderColor: VintageColors.primaryText,
    backgroundColor: VintageColors.lightBackground,
    transform: [{ scale: 1.05 }],
  },

  mealIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  mealIconContainerSelected: {
    borderColor: VintageColors.primaryText,
    borderWidth: 2,
  },

  mealTypeText: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    fontWeight: "400",
    textAlign: "center",
    letterSpacing: 0.3,
  },

  mealTypeTextSelected: {
    color: VintageColors.primaryText,
    fontWeight: "600",
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
    textAlignVertical: "top",
  },

  // Nutrition Inputs
  nutritionCard: {
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

  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  nutritionInputRow: {
    width: "48%",
    marginBottom: 16,
  },

  inputLabel: {
    fontSize: 14,
    color: VintageColors.primaryText,
    fontWeight: "500",
    marginBottom: 8,
    letterSpacing: 0.3,
  },

  inputLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  inputIcon: {
    marginRight: 8,
    marginTop: 1,
  },

  numberInput: {
    height: 50,
    borderWidth: 1,
    borderColor: VintageColors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: VintageColors.primaryText,
    backgroundColor: VintageColors.lightBackground,
    width: "100%",
  },

  // AI Estimation
  caloriesCalculation: {
    flexDirection: "row",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  caloriesCalculationText: {
    fontSize: 14,
    color: VintageColors.primaryText,
    fontWeight: "400",
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  aiIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },

  aiTitle: {
    fontSize: 16,
    color: VintageColors.primaryText,
    fontWeight: "500",
  },

  nutritionPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  nutritionItem: {
    alignItems: "center",
    width: "48%",
    marginBottom: 12,
    padding: 12,
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  nutritionValue: {
    fontSize: 24,
    fontWeight: "300",
    color: VintageColors.primaryText,
    marginBottom: 4,
  },

  nutritionUnit: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    fontWeight: "400",
  },
  aiEstimationCardHorizontal: {
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

  aiHeaderHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  aiIconContainerHorizontal: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },

  aiTitleHorizontal: {
    fontSize: 16,
    color: VintageColors.primaryText,
    fontWeight: "500",
  },

  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },

  nutritionRowItem: {
    alignItems: "center",
    padding: 12,
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: VintageColors.border,
    minWidth: 70,
    marginHorizontal: 4,
    marginBottom: 8,
    flex: 1,
  },

  nutritionRowValue: {
    fontSize: 20,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 4,
  },

  nutritionRowUnit: {
    fontSize: 11,
    color: VintageColors.secondaryText,
    fontWeight: "400",
    textAlign: "center",
    letterSpacing: 0.3,
  },

  // For smaller screens or many items, use a scrollable row
  nutritionRowScroll: {
    flexDirection: "row",
    paddingVertical: 8,
  },

  nutritionScrollView: {
    marginTop: 8,
  },

  // Compact version for when there are many nutrients
  nutritionCompactItem: {
    alignItems: "center",
    padding: 10,
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
    marginRight: 8,
    minWidth: 65,
  },

  nutritionCompactValue: {
    fontSize: 18,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 2,
  },

  nutritionCompactUnit: {
    fontSize: 10,
    color: VintageColors.secondaryText,
    fontWeight: "400",
    textAlign: "center",
  },

  // Toggle
  toggleCard: {
    backgroundColor: VintageColors.cardBackground,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    flexDirection: "row",
    alignItems: "center",
  },

  toggleTitle: {
    fontSize: 16,
    color: VintageColors.primaryText,
    fontWeight: "500",
    marginLeft: 12,
  },

  toggleArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  // Meals List
  mealsCount: {
    backgroundColor: VintageColors.lightBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  mealsCountText: {
    fontSize: 12,
    color: VintageColors.primaryText,
    fontWeight: "600",
  },

  mealCard: {
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

  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  mealHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  mealTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  mealCardType: {
    fontSize: 16,
    color: VintageColors.primaryText,
    fontWeight: "500",
    marginBottom: 2,
  },

  mealTime: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    fontWeight: "300",
  },

  mealHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },

  mealCalories: {
    fontSize: 14,
    color: VintageColors.primaryText,
    fontWeight: "500",
    marginRight: 12,
  },

  actionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: VintageColors.lightBackground,
    borderWidth: 1,
    borderColor: VintageColors.border,
    marginLeft: 8,
  },

  mealDescription: {
    fontSize: 14,
    color: VintageColors.primaryText,
    lineHeight: 20,
    marginBottom: 12,
  },

  mealNutrition: {
    borderTopWidth: 1,
    borderTopColor: VintageColors.border,
    paddingTop: 12,
    marginBottom: 8,
  },

  nutritionDetail: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    fontWeight: "400",
  },

  // Total Stats
  totalNutritionCard: {
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
    fontWeight: "500",
    marginBottom: 16,
  },

  totalStats: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  totalStatItem: {
    marginRight: 16,
    marginBottom: 8,
  },

  totalStatValue: {
    fontSize: 14,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 2,
  },

  totalStatLabel: {
    fontSize: 11,
    color: VintageColors.secondaryText,
    fontWeight: "400",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Save Button
  saveButton: {
    backgroundColor: VintageColors.signOutButton,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
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
    backgroundColor: "#77b779ff",
    borderColor: "#77b779ff",
  },

  saveButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  saveButtonText: {
    color: VintageColors.signOutText,
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  // Cancel Button
  cancelButton: {
    backgroundColor: VintageColors.lightBackground,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  cancelButtonText: {
    color: VintageColors.primaryText,
    fontSize: 14,
    fontWeight: "500",
  },

  // Action Buttons Row
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },

  actionButtonCard: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: VintageColors.cardBackground,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  actionButtonIcon: {
    marginBottom: 8,
  },

  actionButtonLabel: {
    fontSize: 13,
    color: VintageColors.primaryText,
    fontWeight: "400",
    textAlign: "center",
  },
});
