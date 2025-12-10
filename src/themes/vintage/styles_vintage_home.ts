import { StyleSheet } from "react-native";
import { VintageColors } from "./colors";

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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(139, 115, 85, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  modalContentCompact: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 16,
    width: "100%",
    maxWidth: 360,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  modalHeaderCompact: {
    padding: 16,
    paddingBottom: 12,
    backgroundColor: VintageColors.lightBackground,
    borderBottomWidth: 1,
    borderBottomColor: VintageColors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  modalHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  modalEventIconContainerCompact: {
    marginRight: 12,
  },

  modalIconCircleCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2,
    borderColor: VintageColors.cardBackground,
  },

  modalHeaderInfo: {
    flex: 1,
  },

  modalTitleCompact: {
    fontSize: 18,
    fontWeight: "600",
    color: VintageColors.primaryText,
    letterSpacing: 0.3,
  },

  closeButtonCompact: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  modalTimeInfo: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },

  modalTimeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
    gap: 6,
    minWidth: 100,
  },

  modalTimeText: {
    fontSize: 13,
    color: VintageColors.primaryText,
    fontWeight: "500",
    letterSpacing: 0.3,
  },

  modalDivider: {
    height: 1,
    backgroundColor: VintageColors.border,
    marginHorizontal: 16,
  },

  modalBodyCompact: {
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    maxHeight: 400,
  },

  modalSectionCompact: {
    marginBottom: 16,
  },

  modalSectionHeaderCompact: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },

  modalSectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  modalSectionTitleCompact: {
    fontSize: 15,
    fontWeight: "600",
    color: VintageColors.primaryText,
    letterSpacing: 0.2,
  },

  // Target Grid
  modalTargetGrid: {
    gap: 10,
  },

  modalTargetItem: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  modalTargetValue: {
    fontSize: 18,
    fontWeight: "700",
    color: VintageColors.primaryText,
    marginBottom: 2,
  },

  modalTargetLabel: {
    fontSize: 11,
    color: VintageColors.secondaryText,
    fontWeight: "500",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },

  modalTargetReason: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 10,
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
    gap: 8,
    marginTop: 4,
  },

  modalTargetReasonText: {
    flex: 1,
    fontSize: 13,
    color: VintageColors.secondaryText,
    fontStyle: "italic",
    lineHeight: 18,
  },

  // Data Items (reusable)
  modalDataItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: VintageColors.border,
    gap: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  modalDataItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  modalDataItemContent: {
    flex: 1,
  },

  modalDataItemValue: {
    fontSize: 16,
    fontWeight: "700",
    color: VintageColors.primaryText,
    marginBottom: 2,
  },

  modalDataItemLabel: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    fontWeight: "500",
    letterSpacing: 0.3,
  },

  // Insulin Grid
  modalInsulinGridCompact: {
    gap: 8,
  },

  // Nutrition Grid
  modalNutritionGridCompact: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  modalNutritionItemCompact: {
    flex: 1,
    minWidth: 70,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  modalNutritionValueCompact: {
    fontSize: 16,
    fontWeight: "700",
    color: VintageColors.primaryText,
    marginBottom: 2,
  },

  modalNutritionLabelCompact: {
    fontSize: 11,
    color: VintageColors.secondaryText,
    fontWeight: "500",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },

  // Activity Grid
  modalActivityGridCompact: {
    gap: 8,
  },

  // Notes
  modalNotesBoxCompact: {
    padding: 12,
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  modalNotesTextCompact: {
    fontSize: 13,
    color: VintageColors.primaryText,
    lineHeight: 18,
    fontWeight: "400",
    fontStyle: "italic",
    letterSpacing: 0.2,
  },

  // Event Type Badge
  modalEventTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  modalEventTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: VintageColors.lightBackground,
  },

  modalEventTypeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Footer
  modalFooterCompact: {
    padding: 12,
    backgroundColor: VintageColors.lightBackground,
    borderTopWidth: 1,
    borderTopColor: VintageColors.border,
    alignItems: "center",
  },

  modalFooterLine: {
    width: 40,
    height: 1,
    backgroundColor: VintageColors.lightBorder,
    marginBottom: 8,
  },

  modalFooterText: {
    fontSize: 11,
    color: VintageColors.secondaryText,
    fontWeight: "300",
    letterSpacing: 1,
    fontStyle: "italic",
  },

  modalContent: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 20,
    width: "100%",
    maxWidth: 420,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  modalHeader: {
    padding: 24,
    paddingBottom: 16,
    backgroundColor: VintageColors.lightBackground,
    borderBottomWidth: 1,
    borderBottomColor: VintageColors.border,
  },

  modalHeaderDecoration: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  modalHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: VintageColors.lightBorder,
  },

  modalHeaderTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
  },

  modalHeaderFeather: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: VintageColors.iconYellow,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "300",
    color: VintageColors.primaryText,
    letterSpacing: 1,
    fontFamily: "System",
  },

  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  modalBody: {
    padding: 24,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },

  modalEventIconContainer: {
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },

  modalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 3,
    borderColor: VintageColors.cardBackground,
  },

  modalIconFeather: {
    position: "absolute",
    bottom: -8,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: VintageColors.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: VintageColors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  modalEventMetadata: {
    marginBottom: 24,
  },

  modalMetadataRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },

  modalMetadataBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    gap: 8,
    minWidth: 120,
  },

  modalMetadataText: {
    fontSize: 14,
    color: VintageColors.primaryText,
    fontWeight: "500",
    letterSpacing: 0.3,
  },

  modalSection: {
    marginBottom: 24,
  },

  modalSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },

  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: VintageColors.primaryText,
    letterSpacing: 0.5,
  },

  // Nutrition Grid
  modalNutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  modalNutritionItem: {
    flex: 1,
    minWidth: 80,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  modalNutritionValue: {
    fontSize: 20,
    fontWeight: "700",
    color: VintageColors.primaryText,
    marginBottom: 4,
  },

  modalNutritionLabel: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    fontWeight: "500",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },

  // Insulin Grid
  modalInsulinGrid: {
    gap: 12,
  },

  modalInsulinItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  modalInsulinValueContainer: {
    flex: 1,
  },

  modalInsulinValue: {
    fontSize: 22,
    fontWeight: "700",
    color: VintageColors.primaryText,
    marginBottom: 2,
  },

  modalInsulinLabel: {
    fontSize: 13,
    color: VintageColors.secondaryText,
    fontWeight: "500",
    letterSpacing: 0.3,
  },

  modalInsulinBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: VintageColors.border,
    gap: 10,
    alignSelf: "flex-start",
    marginTop: 12,
  },

  modalInsulinBadgeText: {
    fontSize: 14,
    color: VintageColors.primaryText,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // Activity Grid
  modalActivityGrid: {
    gap: 12,
  },

  modalActivityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  modalActivityValueContainer: {
    flex: 1,
  },

  modalActivityValue: {
    fontSize: 18,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 2,
  },

  modalActivityLabel: {
    fontSize: 13,
    color: VintageColors.secondaryText,
    fontWeight: "500",
    letterSpacing: 0.3,
  },

  // Notes
  modalNotesBox: {
    padding: 20,
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  modalNotesText: {
    fontSize: 15,
    color: VintageColors.primaryText,
    lineHeight: 22,
    fontWeight: "400",
    fontStyle: "italic",
    letterSpacing: 0.2,
  },

  // Footer
  modalFooter: {
    padding: 20,
    backgroundColor: VintageColors.lightBackground,
    borderTopWidth: 1,
    borderTopColor: VintageColors.border,
    alignItems: "center",
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

  // Section Title with Icon
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  // Add these to your VintageStylesHome
  modalInsulinContainer: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: VintageColors.border,
  },

  modalInsulinTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 10,
  },
});
