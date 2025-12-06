import { StyleSheet } from "react-native";
import { VintageColors } from "./colors_vintage";

export const VintageStylesHome = StyleSheet.create({
  currentGlucoseCard: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    padding: 16,
    marginBottom: 10,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  currentGlucoseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  glucoseStatusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },

  currentGlucoseTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: VintageColors.primaryText,
  },

  // New layout with three columns
  currentGlucoseContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  // Glucose Column
  glucoseValueContainer: {
    flex: 1,
    alignItems: "flex-start",
  },

  glucoseRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },

  arrowContainer: {
    marginTop: 4,
  },

  glucoseValueLabel: {
    fontSize: 10,
    color: VintageColors.secondaryText,
    marginBottom: 4,
    textTransform: "uppercase",
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  glucoseValue: {
    fontSize: 36,
    fontWeight: "bold",
    letterSpacing: -0.5,
  },

  glucoseStatus: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },

  // Delta Column
  glucoseDeltaContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  glucoseDelta: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 2,
  },

  glucoseDeltaLabel: {
    fontSize: 12,
    color: VintageColors.primaryText,
    fontWeight: "500",
  },

  // Time Column
  glucoseTimeContainer: {
    flex: 1,
    alignItems: "flex-end",
  },

  glucoseTimeLabel: {
    fontSize: 10,
    color: VintageColors.secondaryText,
    marginBottom: 4,
    textTransform: "uppercase",
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  glucoseTime: {
    fontSize: 24,
    fontWeight: "600",
  },

  glucoseMinutes: {
    // borderColor: VintageColors.accent,
    // borderWidth: 1,
    // borderRadius: 4,
    // paddingHorizontal: 6,
    // paddingVertical: 2,
    fontSize: 10,
    fontWeight: "500",
    marginTop: 4,
  },

  glucoseDate: {
    fontSize: 10,
    color: VintageColors.secondaryText,
    fontWeight: "500",
    marginTop: 4,
  },

  glucoseValueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  glucoseTrendContainer: {
    marginLeft: 12,
    alignItems: "center",
  },

  glucoseDeltaText: {
    fontSize: 11,
    fontWeight: "700",
    color: VintageColors.primaryText,
    marginTop: 2,
  },

  glucoseTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  glucoseTimeValue: {
    fontSize: 20,
    fontWeight: "600",
    marginRight: 8,
  },

  glucoseTimeAgoBadge: {
    backgroundColor: VintageColors.lightBackground,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  glucoseTimeAgoText: {
    fontSize: 9,
    fontWeight: "600",
  },

  glucoseDateText: {
    fontSize: 10,
    color: VintageColors.secondaryText,
    marginTop: 4,
    fontWeight: "300",
  },

  timeFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginVertical: 8,
    marginHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 8,
  },

  timeFilterButton: {
    paddingVertical: 10,
    marginHorizontal: 5,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D2B48C",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minWidth: 70,
    alignItems: "center",
  },

  timeFilterButtonSelected: {
    backgroundColor: VintageColors.accent,
    borderColor: VintageColors.accentDark,
  },

  timeFilterButtonDisabled: {
    opacity: 0.5,
  },

  timeFilterText: {
    fontWeight: "600",
    fontSize: 14,
    color: VintageColors.primaryText,
  },

  timeFilterTextSelected: {
    color: "white",
  },

  timeFilterLabelContainer: {
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
  },

  timeFilterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: VintageColors.primaryText,
    letterSpacing: 0.5,
  },

  // Chart Section
  chartContainer: {
    marginTop: 15,
    marginBottom: 24,
  },

  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    position: "relative",
  },

  chartTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: VintageColors.primaryText,
    textAlign: "center",
  },

  chartSvgContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0D6C9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // Error Display
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },

  errorText: {
    color: "#D32F2F",
    textAlign: "center",
  },

  // Loading/Empty States
  loadingContainer: {
    alignItems: "center",
    marginTop: 40,
  },

  loadingText: {
    marginTop: 10,
    color: VintageColors.primaryText,
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },

  emptyText: {
    color: VintageColors.secondaryText,
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
    fontStyle: "italic",
    fontWeight: "300",
  },

  refreshButton: {
    backgroundColor: VintageColors.primaryText,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  refreshButtonText: {
    color: VintageColors.cardBackground,
    fontWeight: "600",
    fontSize: 15,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContent: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: VintageColors.border,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: VintageColors.primaryText,
    flex: 1,
  },

  closeButton: {
    padding: 4,
  },

  modalBody: {
    padding: 20,
  },

  modalEventIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  modalEventIcon: {
    fontSize: 28,
  },

  modalEventInfo: {
    gap: 12,
  },

  modalInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  modalInfoText: {
    fontSize: 14,
    color: VintageColors.primaryText,
    flex: 1,
    fontWeight: "400",
  },

  modalEventTypeBadge: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: VintageColors.lightBackground,
    overflow: "hidden",
  },

  modalDetailsContainer: {
    marginTop: 5,
  },

  modalDetailsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 6,
  },

  modalDetailsText: {
    fontSize: 14,
    color: VintageColors.primaryText,
    lineHeight: 20,
    fontWeight: "400",
  },

  modalNutritionContainer: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: VintageColors.border,
  },

  modalNutritionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 10,
  },

  modalNutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  modalNutritionItem: {
    backgroundColor: VintageColors.lightBackground,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 80,
  },

  modalNutritionValue: {
    fontSize: 16,
    fontWeight: "700",
    color: VintageColors.primaryText,
    marginBottom: 2,
  },

  modalNutritionLabel: {
    fontSize: 11,
    color: VintageColors.secondaryText,
    fontWeight: "500",
  },

  modalActivityContainer: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: VintageColors.border,
  },

  modalActivityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 8,
  },

  modalDurationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: VintageColors.lightBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
    gap: 6,
    marginBottom: 8,
  },

  modalDurationText: {
    fontSize: 14,
    color: VintageColors.primaryText,
    fontWeight: "600",
  },

  modalNotesContainer: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: VintageColors.border,
  },

  modalNotesLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 6,
  },

  modalNotesText: {
    fontSize: 14,
    color: VintageColors.primaryText,
    lineHeight: 20,
    fontStyle: "italic",
    fontWeight: "400",
  },

  // Section Title with Icon
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  sectionIcon: {
    marginRight: 8,
  },

  // Divider/spacing styles from Journal
  sectionDivider: {
    height: 1,
    backgroundColor: VintageColors.border,
    marginVertical: 16,
  },
});
