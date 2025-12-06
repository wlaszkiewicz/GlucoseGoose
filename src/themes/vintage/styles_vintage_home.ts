import { StyleSheet } from "react-native";
import { VintageColors } from "./colors_vintage";

export const VintageStylesHome = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: VintageColors.lightBackground,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  headerSection: {
    marginBottom: 24,
    paddingTop: 20,
  },

  headerDecoration: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 20,
  },

  headerLine: {
    height: 1,
    backgroundColor: VintageColors.headerLine,
    flex: 1,
    maxWidth: 60,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "300", // Changed to 300 to match original
    color: VintageColors.headerTitle,
    marginHorizontal: 15,
    textAlign: "center",
    letterSpacing: 2,
  },

  // Current Glucose Card
  currentGlucoseCard: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  currentGlucoseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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

  currentGlucoseContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  glucoseValueContainer: {
    flex: 1,
  },

  glucoseValueLabel: {
    fontSize: 11,
    color: VintageColors.secondaryText,
    marginBottom: 2,
    textTransform: "uppercase",
    fontWeight: "300",
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

  glucoseTimeContainer: {
    alignItems: "flex-end",
  },

  glucoseTimeLabel: {
    fontSize: 11,
    color: VintageColors.secondaryText,
    marginBottom: 2,
    textTransform: "uppercase",
    fontWeight: "300",
  },

  glucoseTime: {
    fontSize: 20,
    fontWeight: "600",
    color: VintageColors.primaryText,
  },

  glucoseDate: {
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 8,
  },

  timeFilterButton: {
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
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

  // Added event count badge
  eventCountBadge: {
    position: "absolute",
    right: 0,
    backgroundColor: "rgba(119, 70, 34, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  eventCountText: {
    fontSize: 11,
    color: VintageColors.primaryText,
    fontWeight: "600",
  },

  chartScrollContainer: {
    height: 280,
  },

  chartContent: {
    paddingRight: 20,
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

  // Events Section
  eventsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  eventsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  eventsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: VintageColors.primaryText,
  },

  eventCard: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  eventContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  eventIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  eventInfo: {
    flex: 1,
  },

  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },

  eventName: {
    fontWeight: "500",
    color: VintageColors.primaryText,
    fontSize: 16,
    flex: 1,
  },

  eventTime: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    marginLeft: 8,
    fontWeight: "300",
  },

  eventTypeBadge: {
    backgroundColor: "rgba(139, 115, 85, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 6,
  },

  eventTypeText: {
    fontSize: 10,
    fontWeight: "600",
  },

  eventDetails: {
    fontSize: 14,
    color: VintageColors.primaryText,
    marginTop: 2,
    lineHeight: 20,
    fontWeight: "400",
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
