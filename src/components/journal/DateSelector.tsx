import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { VintageColors } from "../../themes/vintage/colors";

interface DateSelectorProps {
  selectedDate: Date;
  onPress: () => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onPress,
  onPreviousDay,
  onNextDay,
  onToday,
}) => {
  const getRelativeDateText = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const getDayOfMonth = (date: Date): string => {
    return date.getDate().toString();
  };

  const getMonthAbbr = (date: Date): string => {
    return date.toLocaleDateString("en-US", { month: "short" });
  };

  const getMonthColor = (date: Date): string => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return VintageColors.iconPink; // Today gets special color
    }
    if (date.getDay() === 0 || date.getDay() === 6) {
      return VintageColors.iconPurple; // Weekend
    }
    return VintageColors.iconBlue; // Weekday
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <View style={styles.container}>
      <View style={styles.dateCard}>
        {/* Left Arrow */}
        <TouchableOpacity
          style={[styles.arrowButton, styles.leftArrow]}
          onPress={onPreviousDay}
          activeOpacity={0.7}
        >
          <Feather
            name="chevron-left"
            size={20}
            color={VintageColors.primaryText}
          />
        </TouchableOpacity>

        {/* Calendar Icon with Date Inside */}
        <TouchableOpacity
          style={styles.calendarContainer}
          onPress={onPress}
          activeOpacity={0.7}
        >
          {/* Visual calendar */}
          <View
            style={[
              styles.calendarIcon,
              ,
              { borderColor: getMonthColor(selectedDate) },
            ]}
          >
            {/* Calendar "header" */}
            <View
              style={[
                styles.calendarHeader,
                { backgroundColor: getMonthColor(selectedDate) },
              ]}
            >
              <Text style={styles.calendarMonth}>
                {getMonthAbbr(selectedDate)}
              </Text>
            </View>

            {/* Calendar "body" with date */}
            <View style={styles.calendarBody}>
              <Text style={styles.calendarDate}>
                {getDayOfMonth(selectedDate)}
              </Text>
            </View>
          </View>

          {/* Date Text */}
          <View style={styles.dateTextContainer}>
            <Text style={styles.relativeDate}>
              {getRelativeDateText(selectedDate)}
            </Text>
            <View style={styles.dateRow}>
              <Text style={styles.fullDate}>
                {selectedDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {!isToday && (
          <TouchableOpacity
            style={styles.floatingTodayButton}
            onPress={onToday}
            activeOpacity={0.7}
          >
            <Feather name="sun" size={14} color={VintageColors.formAccent1} />
            <Text style={styles.floatingTodayText}>Jump to Today</Text>
          </TouchableOpacity>
        )}

        {/* Right Arrow */}
        <TouchableOpacity
          style={[styles.arrowButton, styles.rightArrow]}
          onPress={onNextDay}
          activeOpacity={0.7}
        >
          <Feather
            name="chevron-right"
            size={20}
            color={VintageColors.primaryText}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles: any = {
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    color: VintageColors.primaryText,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  featherAccent: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  dateCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: VintageColors.border,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    paddingHorizontal: 16,
    paddingVertical: 20,
    position: "relative",
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
    zIndex: 2,
  },
  leftArrow: {
    marginRight: 16,
  },
  rightArrow: {
    marginLeft: 16,
  },
  calendarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  calendarIcon: {
    width: 50,
    height: 55,
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 10,
    borderWidth: 2,
    overflow: "hidden",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    position: "relative",
  },
  calendarIconToday: {
    borderWidth: 3,
    shadowColor: VintageColors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  calendarHeader: {
    paddingVertical: 4,
    alignItems: "center",
  },
  calendarMonth: {
    fontSize: 9,
    color: VintageColors.primaryText,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  calendarBody: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarDate: {
    fontSize: 18,
    color: VintageColors.primaryText,
    fontWeight: "700",
  },

  dateTextContainer: {
    flex: 1,
  },
  relativeDate: {
    fontSize: 18,
    color: VintageColors.primaryText,
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  todayBadge: {
    fontSize: 14,
    color: VintageColors.accent,
    fontWeight: "500",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  fullDate: {
    fontSize: 13,
    color: VintageColors.secondaryText,
    marginRight: 6,
    fontStyle: "italic",
    flex: 1,
  },

  floatingTodayButton: {
    position: "absolute",
    top: -11,
    right: 2,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: VintageColors.lightBackground,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: VintageColors.formAccent1,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  floatingTodayText: {
    fontSize: 12,
    color: VintageColors.formAccent5,
    fontWeight: "600",
    marginLeft: 6,
    letterSpacing: 0.3,
  },
};
