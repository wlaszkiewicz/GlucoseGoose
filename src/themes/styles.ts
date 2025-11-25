import { Colors, Spacing, BorderRadius } from "./colors";
import {
  Platform,
  useWindowDimensions,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";

interface PlatformStyles {
  container: ViewStyle;
  scrollContent: ViewStyle;
  mainContainer: ViewStyle;
}

interface CommonStylesType {
  // Original styles
  header: ViewStyle;
  gooseIcon: ImageStyle;
  appTitle: TextStyle;
  subtitle: TextStyle;
  inputGroup: ViewStyle;
  inputLabel: TextStyle;
  input: TextStyle;
  helpText: TextStyle;
  primaryButton: ViewStyle;
  secondaryButton: ViewStyle;
  buttonText: TextStyle;
  secondaryButtonText: TextStyle;
  linkText: TextStyle;

  // New Journal styles
  journalContainer: ViewStyle;
  dateSelector: ViewStyle;
  dateText: TextStyle;
  categoryTabs: ViewStyle;
  categoryTab: ViewStyle;
  categoryTabSelected: ViewStyle;
  categoryTabText: TextStyle;
  categoryTabTextSelected: TextStyle;
  sectionLabel: TextStyle;
  mealTypeButton: ViewStyle;
  mealTypeButtonSelected: ViewStyle;
  mealTypeText: TextStyle;
  mealTypeTextSelected: TextStyle;
  textInputLarge: TextStyle;

  // Nutrition styles
  nutritionHeader: ViewStyle;
  toggleButton: ViewStyle;
  toggleButtonText: TextStyle;
  numberInput: TextStyle;
  nutritionLabel: TextStyle;
  inputRow: ViewStyle;

  // Calories and AI styles
  caloriesBadge: ViewStyle;
  caloriesText: TextStyle;
  caloriesCalculation: ViewStyle;
  caloriesCalculationText: TextStyle;
  aiEstimation: ViewStyle;
  aiHeader: ViewStyle;
  aiTitle: TextStyle;
  nutritionPreview: ViewStyle;
  nutritionItem: ViewStyle;
  nutritionValue: TextStyle;
  nutritionUnit: TextStyle;

  // Button and icon styles
  buttonRow: ViewStyle;
  iconButton: ViewStyle;
  iconButtonText: TextStyle;

  // Meals summary styles
  mealsSummary: ViewStyle;
  summaryTitle: TextStyle;
  mealItem: ViewStyle;
  mealHeader: ViewStyle;
  mealType: TextStyle;
  mealCalories: TextStyle;
  mealDescription: TextStyle;
  mealNutrition: ViewStyle;
  nutritionDetail: TextStyle;
  totalNutrition: ViewStyle;
  totalTitle: TextStyle;
  totalDetail: TextStyle;

  // Previous entry styles
  previousEntry: ViewStyle;
  previousEntryTitle: TextStyle;
  previousEntryText: TextStyle;

  // Save button styles
  saveButton: ViewStyle;
  saveButtonText: TextStyle;

  // Calendar styles
  calendarOverlay: ViewStyle;
  calendarContainer: ViewStyle;
  calendarHeader: ViewStyle;
  calendarNavButton: ViewStyle;
  calendarTitle: TextStyle;
  calendarGrid: ViewStyle;
  calendarDayHeader: TextStyle;
  calendarDay: ViewStyle;
  calendarDaySelected: ViewStyle;
  calendarDayToday: ViewStyle;
  calendarDayText: TextStyle;
  calendarDayTextSelected: TextStyle;
  calendarDayTextToday: TextStyle;
  calendarActions: ViewStyle;
  calendarCloseButton: ViewStyle;
  calendarCloseText: TextStyle;
}

export const getPlatformStyles = (): PlatformStyles => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isWeb = Platform.OS === "web";

  return {
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      alignItems: "center" as const,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.xxl,
      ...(isWeb &&
        !isMobile && {
          justifyContent: "center",
          minHeight: "100vh" as unknown as any,
        }),
    },
    mainContainer: {
      width: "100%",
      maxWidth: 400,
      ...(isWeb &&
        !isMobile && {
          maxWidth: 500,
          backgroundColor: Colors.cardBackground,
          borderRadius: BorderRadius.xl,
          paddingHorizontal: Spacing.xxl,
          paddingVertical: Spacing.xxl + Spacing.md,
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 5,
          borderWidth: 1,
          borderColor: Colors.border,
        }),
    },
  };
};

export const CommonStyles = StyleSheet.create<CommonStylesType>({
  // Original styles
  header: {
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },
  gooseIcon: {
    width: 100,
    height: 100,
    marginBottom: Spacing.lg,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.secondary,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.primary,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 22,
  },
  inputGroup: {
    width: "100%",
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: 15,
    color: Colors.primary,
    marginBottom: Spacing.xs,
    fontWeight: "600",
  },
  input: {
    height: 52,
    borderColor: Colors.border,
    borderWidth: 1.5,
    width: "100%",
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.inputBackground,
    fontSize: 16,
    borderRadius: BorderRadius.md,
    color: Colors.text.primary,
  },
  helpText: {
    fontSize: 13,
    color: Colors.text.light,
    marginTop: Spacing.xs,
    lineHeight: 18,
    fontStyle: "italic",
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    width: "100%",
    alignItems: "center",
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  linkText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },

  // New Journal styles
  journalContainer: {
    marginBottom: Spacing.lg,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    flex: 1,
    marginRight: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dateText: {
    marginLeft: Spacing.sm,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    flex: 1,
  },
  categoryTabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginHorizontal: 4,
  },
  categoryTabSelected: {
    backgroundColor: Colors.primary,
  },
  categoryTabText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  categoryTabTextSelected: {
    color: "white",
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  mealTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xxl,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.cardBackground,
    marginRight: Spacing.sm,
    minWidth: 140,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mealTypeButtonSelected: {
    backgroundColor: Colors.primary,
  },
  mealTypeText: {
    color: Colors.primary,
    fontWeight: "600",
    marginLeft: Spacing.xs,
    fontSize: 14,
  },
  mealTypeTextSelected: {
    color: "white",
  },
  textInputLarge: {
    minHeight: 120,
    textAlignVertical: "top",
    padding: Spacing.md,
    fontSize: 16,
    lineHeight: 20,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.cardBackground,
  },

  // Nutrition styles
  nutritionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  toggleButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: "#E3F2FD",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.ai.analyzing,
  },
  toggleButtonText: {
    color: Colors.ai.analyzing,
    fontSize: 14,
    fontWeight: "600",
  },
  numberInput: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    width: 90,
    textAlign: "center",
    backgroundColor: Colors.cardBackground,
    fontSize: 16,
    fontWeight: "500",
  },
  nutritionLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text.primary,
    flex: 1,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },

  // Calories and AI styles
  caloriesBadge: {
    backgroundColor: Colors.journal.calorie,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  caloriesText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  caloriesCalculation: {
    backgroundColor: "#E3F2FD",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.ai.analyzing,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  caloriesCalculationText: {
    fontSize: 16,
    color: Colors.ai.analyzing,
    marginLeft: Spacing.sm,
    fontWeight: "500",
  },
  aiEstimation: {
    backgroundColor: "#E8F5E8",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.ai.estimated,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    justifyContent: "center",
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.ai.estimated,
    marginLeft: Spacing.sm,
  },
  nutritionPreview: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  nutritionItem: {
    alignItems: "center",
    minWidth: 70,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  nutritionUnit: {
    fontSize: 14,
    color: Colors.text.light,
    marginTop: 4,
  },

  // Button and icon styles
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: Spacing.lg,
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    minWidth: 140,
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconButtonText: {
    color: Colors.primary,
    marginLeft: Spacing.sm,
    fontWeight: "600",
    fontSize: 16,
  },

  // Meals summary styles
  mealsSummary: {
    backgroundColor: Colors.helpCard,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: Spacing.md,
    color: Colors.text.primary,
    textAlign: "center",
  },
  mealItem: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  mealType: {
    fontWeight: "600",
    marginLeft: Spacing.xs,
    marginRight: "auto",
    color: Colors.text.primary,
    fontSize: 16,
  },
  mealCalories: {
    fontWeight: "bold",
    color: Colors.journal.calorie,
    fontSize: 14,
  },
  mealDescription: {
    color: Colors.text.light,
    fontSize: 16,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  mealNutrition: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nutritionDetail: {
    fontSize: 14,
    color: Colors.text.light,
    fontStyle: "italic",
  },
  totalNutrition: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 2,
    borderTopColor: Colors.border,
  },
  totalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  totalDetail: {
    fontSize: 16,
    color: Colors.text.light,
    fontWeight: "500",
    textAlign: "center",
  },

  // Previous entry styles
  previousEntry: {
    backgroundColor: "#FFF3CD",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.journal.warning,
  },
  previousEntryTitle: {
    fontWeight: "bold",
    color: "#856404",
    marginBottom: Spacing.xs,
    fontSize: 16,
  },
  previousEntryText: {
    color: "#856404",
    lineHeight: 20,
    fontSize: 16,
  },

  // Save button styles
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  // Calendar styles
  calendarOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  calendarContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    width: "100%",
    maxWidth: 400,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  calendarNavButton: {
    padding: Spacing.xs,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: Spacing.lg,
  },
  calendarDayHeader: {
    width: "14.28%",
    textAlign: "center",
    paddingVertical: Spacing.xs,
    fontWeight: "600",
    color: Colors.text.light,
    fontSize: 14,
  },
  calendarDay: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    marginVertical: 2,
  },
  calendarDaySelected: {
    backgroundColor: Colors.calendar.selected,
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: Colors.calendar.today,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text.primary,
  },
  calendarDayTextSelected: {
    color: "white",
    fontWeight: "bold",
  },
  calendarDayTextToday: {
    color: Colors.calendar.today,
    fontWeight: "bold",
  },
  calendarActions: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  calendarCloseButton: {
    backgroundColor: Colors.text.light,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  calendarCloseText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
