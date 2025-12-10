import { StyleSheet } from "react-native";
import { VintageColors } from "./colors";

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

  // Photo Upload Styles
  photoCard: {
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

  photoImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },

  photoActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  photoActionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  photoActionText: {
    fontSize: 12,
    color: "#FF6B6B",
    marginLeft: 6,
    fontWeight: "500",
  },

  analyzingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  analyzingText: {
    fontSize: 12,
    color: VintageColors.primaryText,
    marginLeft: 6,
    fontWeight: "500",
  },

  uploadCard: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    alignItems: "center",
  },

  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  uploadTitle: {
    fontSize: 16,
    color: VintageColors.primaryText,
    fontWeight: "600",
    marginBottom: 4,
  },

  uploadSubtitle: {
    fontSize: 14,
    color: VintageColors.secondaryText,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },

  uploadButtons: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },

  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: VintageColors.border,
    flex: 1,
    justifyContent: "center",
  },

  uploadButtonText: {
    fontSize: 14,
    color: VintageColors.primaryText,
    fontWeight: "500",
    marginLeft: 8,
  },

  // AI Analysis Styles
  aiAnalysisCard: {
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

  aiAnalysisHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  aiAnalysisIcon: {
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

  aiAnalysisTitle: {
    fontSize: 16,
    color: VintageColors.primaryText,
    fontWeight: "600",
  },

  aiAnalysisConfidence: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    marginTop: 2,
  },

  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  detectedFoods: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: VintageColors.border,
  },

  detectedFoodsTitle: {
    fontSize: 14,
    color: VintageColors.primaryText,
    fontWeight: "600",
    marginBottom: 8,
  },

  foodItem: {
    backgroundColor: VintageColors.lightBackground,
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  foodItemName: {
    fontSize: 13,
    color: VintageColors.primaryText,
    fontWeight: "500",
    marginBottom: 2,
  },

  foodItemDetails: {
    fontSize: 11,
    color: VintageColors.secondaryText,
  },

  aiTotals: {},

  aiTotalsTitle: {
    fontSize: 14,
    color: VintageColors.primaryText,
    fontWeight: "600",
    marginBottom: 12,
  },

  aiTotalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
  },

  aiTotalItem: {
    alignItems: "center",
    marginBottom: 16,
    padding: 7,
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: VintageColors.border,
    width: "30%",
  },

  aiTotalIconContainer: {
    width: 25,
    height: 25,
    borderRadius: 14,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  aiTotalValue: {
    fontSize: 16,
    color: VintageColors.primaryText,
    fontWeight: "600",
    marginBottom: 4,
  },

  aiTotalLabel: {
    fontSize: 11,
    color: VintageColors.secondaryText,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  aiDisclaimer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: VintageColors.lightBackground,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
    marginTop: 16,
    marginBottom: 12,
  },

  aiDisclaimerText: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    marginLeft: 8,
    flex: 1,
    fontStyle: "italic",
    lineHeight: 16,
  },

  editAiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: VintageColors.border,
    marginTop: 16,
  },

  editAiButtonText: {
    fontSize: 14,
    color: VintageColors.primaryText,
    fontWeight: "500",
    marginLeft: 8,
  },

  backToAIButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
    marginBottom: 16,
  },

  backToAIText: {
    fontSize: 14,
    color: VintageColors.primaryText,
    fontWeight: "500",
    marginLeft: 8,
  },

  // Toggle Card
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
  totalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  totalIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  totalStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    flexWrap: "wrap",
    minHeight: 80,
  },

  totalStatItem: {
    alignItems: "center",
    paddingHorizontal: 8,
    minWidth: 70,
    maxWidth: 100,
    flex: 1,
    paddingVertical: 10,
  },

  totalStatContent: {
    alignItems: "center",
  },

  totalStatValue: {
    fontSize: 20,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 6,
    textAlign: "center",
  },

  totalStatLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  totalStatIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  totalStatLabel: {
    fontSize: 11,
    color: VintageColors.secondaryText,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    textAlign: "center",
  },

  totalStatDivider: {
    width: 1,
    height: 50,
    backgroundColor: VintageColors.border,
    marginHorizontal: 12,
  },

  noDataContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },

  noDataText: {
    fontSize: 14,
    color: VintageColors.secondaryText,
    marginTop: 8,
    fontStyle: "italic",
    textAlign: "center",
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

  // Analyzing Card
  analyzingCard: {
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
    flexDirection: "row",
    alignItems: "center",
  },

  analyzingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  analyzingTitle: {
    fontSize: 16,
    color: VintageColors.primaryText,
    fontWeight: "600",
    marginBottom: 4,
  },

  analyzingSubtitle: {
    fontSize: 14,
    color: VintageColors.secondaryText,
    marginBottom: 8,
  },

  analyzingHint: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    fontStyle: "italic",
    lineHeight: 16,
  },
});
