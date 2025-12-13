import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { VintageStylesCalendar } from "../../themes/vintage/styles_vintage_calendar";
import { VintageColors } from "../../themes/vintage/colors";

interface CalendarProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

const Calendar: React.FC<CalendarProps> = ({
  visible,
  onClose,
  onDateSelect,
  selectedDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const [calendarWidth, setCalendarWidth] = useState(
    Dimensions.get("window").width * 0.9
  );

  useEffect(() => {
    if (visible) {
      setCurrentMonth(selectedDate);
    }
  }, [visible, selectedDate]);

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

    const totalCells = 42;
    while (days.length < totalCells) {
      days.push(null);
    }

    return days;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  const isPastDay = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
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

  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
  const fullDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateMonth = (direction: number) => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + direction,
        1
      )
    );
  };

  const handleSelectToday = () => {
    const today = new Date();
    onDateSelect(today);
    onClose();
  };

  const handleDaySelect = (date: Date) => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(12, 0, 0, 0);
    onDateSelect(normalizedDate);
  };

  const getFormattedDate = (date: Date) => {
    const day = fullDayNames[date.getDay()];
    const month = monthNames[date.getMonth()];
    const dateNum = date.getDate();
    const year = date.getFullYear();
    return `${day}, ${month} ${dateNum}, ${year}`;
  };

  if (!visible) return null;

  const calendarDays = generateCalendarDays();
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

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
                  name="calendar"
                  size={18}
                  color={VintageColors.primaryText}
                />
              </View>
              <Text style={VintageStylesCalendar.title}>
                {monthNames[currentMonth.getMonth()]}{" "}
                {currentMonth.getFullYear()}
              </Text>
            </View>

            <View style={VintageStylesCalendar.navButtonsContainer}>
              <TouchableOpacity
                onPress={() => navigateMonth(-1)}
                style={VintageStylesCalendar.navButton}
              >
                <Feather
                  name="chevron-left"
                  size={20}
                  color={VintageColors.primaryText}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigateMonth(1)}
                style={VintageStylesCalendar.navButton}
              >
                <Feather
                  name="chevron-right"
                  size={20}
                  color={VintageColors.primaryText}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Selected Date Indicator */}
          <View style={VintageStylesCalendar.dateIndicator}>
            <Feather
              name="check"
              size={14}
              color={VintageColors.secondaryText}
            />
            <Text style={VintageStylesCalendar.dateIndicatorText}>
              {getFormattedDate(selectedDate)}
            </Text>
            <TouchableOpacity
              style={VintageStylesCalendar.todayButton}
              onPress={handleSelectToday}
            >
              <Text style={VintageStylesCalendar.todayButtonText}>Today</Text>
            </TouchableOpacity>
          </View>

          {/* Week Days */}
          <View style={VintageStylesCalendar.weekDaysContainer}>
            {dayNames.map((day, index) => (
              <Text key={index} style={VintageStylesCalendar.weekDay}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <ScrollView
            style={VintageStylesCalendar.calendarGrid}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={VintageStylesCalendar.daysRow}>
                {week.map((date, dayIndex) => {
                  if (!date) {
                    return (
                      <View
                        key={`empty-${weekIndex}-${dayIndex}`}
                        style={VintageStylesCalendar.emptyDay}
                      />
                    );
                  }

                  const isSelected = isSameDay(date, selectedDate);
                  const isTodayDate = isToday(date);
                  const isPast = isPastDay(date);

                  return (
                    <View
                      key={date.toISOString()}
                      style={VintageStylesCalendar.dayContainer}
                    >
                      <TouchableOpacity
                        style={[
                          VintageStylesCalendar.dayButton,
                          isSelected && VintageStylesCalendar.dayButtonSelected,
                          isTodayDate &&
                            !isSelected &&
                            VintageStylesCalendar.dayButtonToday,
                          isPast &&
                            !isSelected &&
                            !isTodayDate && { opacity: 0.6 },
                        ]}
                        onPress={() => handleDaySelect(date)}
                      >
                        <Text
                          style={[
                            VintageStylesCalendar.dayText,
                            isSelected && VintageStylesCalendar.dayTextSelected,
                            isTodayDate &&
                              !isSelected &&
                              VintageStylesCalendar.dayTextToday,
                            isPast &&
                              !isSelected &&
                              !isTodayDate &&
                              VintageStylesCalendar.dayTextDisabled,
                          ]}
                        >
                          {date.getDate()}
                        </Text>
                        {isTodayDate && !isSelected && (
                          <View
                            style={{
                              position: "absolute",
                              bottom: 2,
                              width: 4,
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: VintageColors.primaryText,
                            }}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>

          {/* Actions */}
          <View style={VintageStylesCalendar.actions}>
            <TouchableOpacity
              onPress={onClose}
              style={VintageStylesCalendar.actionButton}
            >
              <Text style={VintageStylesCalendar.actionButtonText}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onDateSelect(selectedDate);
                onClose();
              }}
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
                Select Date
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default Calendar;
