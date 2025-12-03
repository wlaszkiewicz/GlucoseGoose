// styles_vintage_other.ts
import { StyleSheet } from "react-native";
import { VintageColors } from "./colors_vintage";

export const VintageStylesOther = StyleSheet.create({
  container: {
    flex: 1,
  },

  sectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },

  // Notes Card
  notesCard: {
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
    marginBottom: 20,
  },

  notesInput: {
    fontSize: 14,
    color: VintageColors.primaryText,
    lineHeight: 20,
    minHeight: 120,
    textAlignVertical: "top",
  },

  // Saved Notes Card
  savedNotesCard: {
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
    marginBottom: 20,
  },

  savedNotesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  savedNotesIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  savedNotesTitle: {
    fontSize: 16,
    color: VintageColors.primaryText,
    fontWeight: "500",
  },

  savedNotesText: {
    fontSize: 14,
    color: VintageColors.primaryText,
    lineHeight: 20,
    padding: 12,
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
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

  // No Notes State
  noNotesCard: {
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
    marginBottom: 20,
  },

  noNotesIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  noNotesTitle: {
    fontSize: 16,
    color: VintageColors.primaryText,
    fontWeight: "500",
    marginBottom: 8,
  },

  noNotesText: {
    fontSize: 14,
    color: VintageColors.secondaryText,
    textAlign: "center",
    lineHeight: 20,
  },

  // Action Buttons Row
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  actionButtonCard: {
    flex: 1,
    marginHorizontal: 6,
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

  actionButtonIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  actionButtonLabel: {
    fontSize: 13,
    color: VintageColors.primaryText,
    fontWeight: "400",
    textAlign: "center",
  },
  // Add these to your existing VintageStylesOther stylesheet:

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
    backgroundColor: VintageColors.lightBackground,
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
});
