import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { VintageStylesCalendar } from "../../themes/vintage/styles_vintage_calendar";
import { VintageColors } from "../../themes/vintage/colors";
import { useEffect } from "react";

interface TimePickerProps {
  visible: boolean;
  onClose: () => void;
  onTimeSelect: (time: string) => void;
  selectedTime: string;
  selectedDate: Date;
}

const TimePicker: React.FC<TimePickerProps> = ({
  visible,
  onClose,
  onTimeSelect,
  selectedTime,
  selectedDate,
}) => {
  const [tempSelectedHour, setTempSelectedHour] = useState<number>(() => {
    const [hours] = selectedTime.split(":").map(Number);
    return hours || 0;
  });

  const [tempSelectedMinute, setTempSelectedMinute] = useState<number>(() => {
    const [, minutes] = selectedTime.split(":").map(Number);
    return minutes || 0;
  });

  const handleHourSelect = (hour: number) => {
    setTempSelectedHour(hour);
  };

  const handleMinuteSelect = (minute: number) => {
    setTempSelectedMinute(minute);
  };

  useEffect(() => {
    if (!visible) {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      setTempSelectedHour(hours || 0);
      setTempSelectedMinute(minutes || 0);
    }
  }, [visible, selectedTime]);

  const handleSelectNow = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    setTempSelectedHour(hours);
    setTempSelectedMinute(minutes);

    const timeString = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
    onTimeSelect(timeString);
    onClose();
  };

  const handleConfirm = () => {
    const timeString = `${tempSelectedHour
      .toString()
      .padStart(2, "0")}:${tempSelectedMinute.toString().padStart(2, "0")}`;
    onTimeSelect(timeString);
    onClose();
  };

  const getFormattedTime = () => {
    const hour = tempSelectedHour.toString().padStart(2, "0");
    const minute = tempSelectedMinute.toString().padStart(2, "0");
    return `${hour}:${minute}`;
  };

  const getFormattedDate = (date: Date) => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const day = dayNames[date.getDay()];
    const month = monthNames[date.getMonth()];
    const dateNum = date.getDate();
    const year = date.getFullYear();
    return `${day}, ${month} ${dateNum}, ${year}`;
  };

  if (!visible) return null;

  const hours = Array.from({ length: 24 }, (_, i) => i); // 0-23
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={VintageStylesCalendar.overlay}>
        <View style={VintageStylesCalendar.container}>
          {/* Header */}
          <View style={VintageStylesCalendar.header}>
            <View style={VintageStylesCalendar.headerContent}>
              <View style={VintageStylesCalendar.headerIcon}>
                <Feather
                  name="clock"
                  size={18}
                  color={VintageColors.primaryText}
                />
              </View>
              <Text style={VintageStylesCalendar.title}>Select Time</Text>
            </View>
          </View>

          {/* Selected Date Indicator */}
          <View style={VintageStylesCalendar.dateIndicator}>
            <Feather
              name="calendar"
              size={14}
              color={VintageColors.secondaryText}
            />
            <Text style={VintageStylesCalendar.dateIndicatorText}>
              {getFormattedDate(selectedDate)}
            </Text>
            <TouchableOpacity
              style={VintageStylesCalendar.todayButton}
              onPress={handleSelectNow}
            >
              <Text style={VintageStylesCalendar.todayButtonText}>Now</Text>
            </TouchableOpacity>
          </View>

          {/* Time Display */}
          <View style={styles.timeDisplayContainer}>
            <Text style={styles.timeDisplayText}>{getFormattedTime()}</Text>
            <View style={styles.timeDisplaySubtext}>
              <Feather
                name="info"
                size={14}
                color={VintageColors.secondaryText}
              />
              <Text style={styles.timeDisplaySubtextText}>24-hour format</Text>
            </View>
          </View>

          {/* Time Selector */}
          <View style={styles.timeSelectorContainer}>
            {/* Hours */}
            <View style={styles.timeSection}>
              <Text style={styles.timeSectionLabel}>Hour</Text>
              <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {hours.map((hour) => (
                  <TouchableOpacity
                    key={`hour-${hour}`}
                    style={[
                      styles.timeItem,
                      tempSelectedHour === hour && styles.timeItemSelected,
                    ]}
                    onPress={() => handleHourSelect(hour)}
                  >
                    <Text
                      style={[
                        styles.timeItemText,
                        tempSelectedHour === hour &&
                          styles.timeItemTextSelected,
                      ]}
                    >
                      {hour.toString().padStart(2, "0")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Minutes */}
            <View style={styles.timeSection}>
              <Text style={styles.timeSectionLabel}>Minute</Text>
              <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {minutes.map((minute) => (
                  <TouchableOpacity
                    key={`minute-${minute}`}
                    style={[
                      styles.timeItem,
                      tempSelectedMinute === minute && styles.timeItemSelected,
                    ]}
                    onPress={() => handleMinuteSelect(minute)}
                  >
                    <Text
                      style={[
                        styles.timeItemText,
                        tempSelectedMinute === minute &&
                          styles.timeItemTextSelected,
                      ]}
                    >
                      {minute.toString().padStart(2, "0")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Quick Minutes */}
            <View style={styles.timeSection}>
              <Text style={styles.timeSectionLabel}>Quick</Text>
              <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <TouchableOpacity
                  style={[
                    styles.quickButton,
                    tempSelectedMinute === 0 && styles.quickButtonSelected,
                  ]}
                  onPress={() => setTempSelectedMinute(0)}
                >
                  <Feather
                    name="watch"
                    size={14}
                    color={
                      tempSelectedMinute === 0
                        ? VintageColors.signOutText
                        : VintageColors.primaryText
                    }
                  />
                  <Text
                    style={[
                      styles.quickButtonText,
                      tempSelectedMinute === 0 &&
                        styles.quickButtonTextSelected,
                    ]}
                  >
                    On the hour
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.quickButton,
                    tempSelectedMinute === 15 && styles.quickButtonSelected,
                  ]}
                  onPress={() => setTempSelectedMinute(15)}
                >
                  <Feather
                    name="watch"
                    size={14}
                    color={
                      tempSelectedMinute === 15
                        ? VintageColors.signOutText
                        : VintageColors.primaryText
                    }
                  />
                  <Text
                    style={[
                      styles.quickButtonText,
                      tempSelectedMinute === 15 &&
                        styles.quickButtonTextSelected,
                    ]}
                  >
                    15 past
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.quickButton,
                    tempSelectedMinute === 30 && styles.quickButtonSelected,
                  ]}
                  onPress={() => setTempSelectedMinute(30)}
                >
                  <Feather
                    name="watch"
                    size={14}
                    color={
                      tempSelectedMinute === 30
                        ? VintageColors.signOutText
                        : VintageColors.primaryText
                    }
                  />
                  <Text
                    style={[
                      styles.quickButtonText,
                      tempSelectedMinute === 30 &&
                        styles.quickButtonTextSelected,
                    ]}
                  >
                    30 past
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.quickButton,
                    tempSelectedMinute === 45 && styles.quickButtonSelected,
                  ]}
                  onPress={() => setTempSelectedMinute(45)}
                >
                  <Feather
                    name="watch"
                    size={14}
                    color={
                      tempSelectedMinute === 45
                        ? VintageColors.signOutText
                        : VintageColors.primaryText
                    }
                  />
                  <Text
                    style={[
                      styles.quickButtonText,
                      tempSelectedMinute === 45 &&
                        styles.quickButtonTextSelected,
                    ]}
                  >
                    45 past
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>

          {/* Actions */}
          <View style={VintageStylesCalendar.actions}>
            <TouchableOpacity
              onPress={onClose}
              style={VintageStylesCalendar.actionButton}
            >
              <Text style={VintageStylesCalendar.actionButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              style={[
                VintageStylesCalendar.actionButton,
                VintageStylesCalendar.actionButtonPrimary,
                { marginLeft: 12 },
              ]}
            >
              <Text
                style={[
                  VintageStylesCalendar.actionButtonText,
                  VintageStylesCalendar.actionButtonTextPrimary,
                ]}
              >
                Select Time
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  timeDisplayContainer: {
    paddingVertical: 24,
    backgroundColor: VintageColors.lightBackground,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: VintageColors.border,
    maxHeight: 120,
  },

  timeDisplayText: {
    fontSize: 36,
    fontWeight: "600",
    color: VintageColors.primaryText,
    letterSpacing: 1,
  },

  timeDisplaySubtext: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  timeDisplaySubtextText: {
    fontSize: 11,
    color: VintageColors.secondaryText,
    fontWeight: "500",
    marginLeft: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  timeSelectorContainer: {
    flexDirection: "row",
    padding: 16,
    minHeight: 200,
    backgroundColor: VintageColors.cardBackground,
  },

  timeSection: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },

  timeSectionLabel: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  scrollContainer: {
    flex: 1,
    width: "100%",
    maxHeight: 200,
  },

  scrollContent: {
    paddingVertical: 8,
  },

  timeItem: {
    width: "100%",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: VintageColors.lightBackground,
  },

  timeItemSelected: {
    backgroundColor: VintageColors.signOutButton,
    borderColor: VintageColors.signOutBorder,
    transform: [{ scale: 1.1 }],
  },

  timeItemText: {
    fontSize: 16,
    color: VintageColors.primaryText,
    fontWeight: "400",
  },

  timeItemTextSelected: {
    color: VintageColors.signOutText,
    fontWeight: "600",
  },

  quickButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: VintageColors.border,
    backgroundColor: VintageColors.lightBackground,
  },

  quickButtonSelected: {
    backgroundColor: VintageColors.signOutButton,
    borderColor: VintageColors.signOutBorder,
  },

  quickButtonText: {
    fontSize: 13,
    color: VintageColors.primaryText,
    fontWeight: "400",
    marginLeft: 8,
    flex: 1,
  },

  quickButtonTextSelected: {
    color: VintageColors.signOutText,
    fontWeight: "600",
  },
});

export default TimePicker;
