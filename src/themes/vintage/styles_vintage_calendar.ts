import { StyleSheet, Dimensions } from "react-native";
import { VintageColors } from "./colors";

const { width } = Dimensions.get("window");

export const VintageStylesCalendar = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  container: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: "65%",
  },

  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: VintageColors.border,
    backgroundColor: VintageColors.lightBackground,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: VintageColors.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  title: {
    fontSize: 18,
    color: VintageColors.primaryText,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  navButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: VintageColors.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
    marginHorizontal: 4,
  },

  navButtonDisabled: {
    opacity: 0.3,
  },

  weekDaysContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: VintageColors.lightBackground,
  },

  weekDay: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    color: VintageColors.secondaryText,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  calendarGrid: {
    padding: 16,
  },

  daysRow: {
    flexDirection: "row",
    marginBottom: 8,
  },

  dayContainer: {
    flex: 1,
    aspectRatio: 1,
    padding: 4,
  },

  dayButton: {
    flex: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },

  dayButtonSelected: {
    backgroundColor: VintageColors.signOutButton,
    borderColor: VintageColors.signOutBorder,
    transform: [{ scale: 1.1 }],
  },

  dayButtonToday: {
    borderColor: VintageColors.primaryText,
    backgroundColor: VintageColors.lightBackground,
  },

  dayText: {
    fontSize: 14,
    color: VintageColors.primaryText,
    fontWeight: "400",
  },

  dayTextSelected: {
    color: VintageColors.signOutText,
    fontWeight: "600",
  },

  dayTextToday: {
    color: VintageColors.primaryText,
    fontWeight: "600",
  },

  dayTextDisabled: {
    color: VintageColors.lightBorder,
  },

  emptyDay: {
    flex: 1,
    aspectRatio: 1,
    padding: 4,
  },

  actions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: VintageColors.border,
    backgroundColor: VintageColors.lightBackground,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
  },

  actionButton: {
    flex: 1,
    maxWidth: 150,
    paddingVertical: 14,
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: VintageColors.border,
    alignItems: "center",
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  actionButtonPrimary: {
    backgroundColor: VintageColors.signOutButton,
    borderColor: VintageColors.signOutBorder,
    shadowColor: VintageColors.signOutButton,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  actionButtonText: {
    fontSize: 15,
    color: VintageColors.primaryText,
    fontWeight: "500",
  },

  actionButtonTextPrimary: {
    color: VintageColors.signOutText,
  },

  dateIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: VintageColors.lightBackground,
    borderBottomWidth: 1,
    borderBottomColor: VintageColors.border,
  },

  dateIndicatorText: {
    fontSize: 14,
    color: VintageColors.secondaryText,
    marginLeft: 8,
  },

  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
    marginLeft: 12,
  },

  todayButtonText: {
    fontSize: 12,
    color: VintageColors.primaryText,
    fontWeight: "500",
  },
});
