import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CommonStyles } from "../../themes/styles";
import { Ionicons } from "@expo/vector-icons";

interface SimpleCalendarProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

const SimpleCalendar: React.FC<SimpleCalendarProps> = ({
  visible,
  onClose,
  onDateSelect,
  selectedDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i)
      );
    }

    return days;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

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

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateMonth = (direction: number) => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + direction,
        1
      )
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={CommonStyles.calendarOverlay}>
        <View style={CommonStyles.calendarContainer}>
          <View style={CommonStyles.calendarHeader}>
            <TouchableOpacity
              onPress={() => navigateMonth(-1)}
              style={CommonStyles.calendarNavButton}
            >
              <Ionicons name="chevron-back" size={24} color="#007AFF" />
            </TouchableOpacity>

            <Text style={CommonStyles.calendarTitle}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>

            <TouchableOpacity
              onPress={() => navigateMonth(1)}
              style={CommonStyles.calendarNavButton}
            >
              <Ionicons name="chevron-forward" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <View style={CommonStyles.calendarGrid}>
            {dayNames.map((day) => (
              <Text key={day} style={CommonStyles.calendarDayHeader}>
                {day}
              </Text>
            ))}

            {generateCalendarDays().map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  CommonStyles.calendarDay,
                  date &&
                    isSameDay(date, selectedDate) &&
                    CommonStyles.calendarDaySelected,
                  date && isToday(date) && CommonStyles.calendarDayToday,
                ]}
                onPress={() => date && onDateSelect(date)}
                disabled={!date}
              >
                <Text
                  style={[
                    CommonStyles.calendarDayText,
                    date &&
                      isSameDay(date, selectedDate) &&
                      CommonStyles.calendarDayTextSelected,
                    date && isToday(date) && CommonStyles.calendarDayTextToday,
                  ]}
                >
                  {date ? date.getDate() : ""}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={CommonStyles.calendarActions}>
            <TouchableOpacity
              onPress={onClose}
              style={CommonStyles.calendarCloseButton}
            >
              <Text style={CommonStyles.calendarCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Empty - using CommonStyles only
});

export default SimpleCalendar;
