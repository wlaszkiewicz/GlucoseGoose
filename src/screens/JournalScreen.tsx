import React from "react";
import { View, ScrollView } from "react-native";

import { JournalHeader } from "../components/journal/JournalHeader";
import { DateSelector } from "../components/journal/DateSelector";
import { CategoryCards } from "../components/journal/CategoryCards";
import Calendar from "../components/common/Calendar";

import { useJournalData } from "../hooks/journal/useJournalData";
import { useJournalNavigation } from "../hooks/journal/useJournalNavigation";

import { VintageStyles } from "../themes/vintage/styles_vintage";
import { SwipeableStats } from "../components/journal/SwipeableStats";

const JournalScreen = () => {
  const {
    selectedDate,
    showCalendar,
    todayMeals,
    todayEntries,
    insulinEvents,
    totalCaloriesConsumed,
    totalBasalAdjustment,
    totalCaloriesBurned,
    handleDateSelect,
    setShowCalendar,
    handlePreviousDay,
    handleNextDay,
    handleToday,
  } = useJournalData();

  const { navigateToCategory } = useJournalNavigation();

  return (
    <View style={VintageStyles.container}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={VintageStyles.scrollContent}
      >
        <JournalHeader />

        <DateSelector
          selectedDate={selectedDate}
          onPress={() => setShowCalendar(true)}
          onPreviousDay={handlePreviousDay}
          onNextDay={handleNextDay}
          onToday={handleToday}
        />

        <CategoryCards
          onCategoryPress={(category) =>
            navigateToCategory(category, selectedDate)
          }
          selectedDate={selectedDate}
        />

        <SwipeableStats
          todayMeals={todayMeals}
          insulinEvents={insulinEvents}
          glucoseEntries={todayEntries}
          totalBasalAdjustment={totalBasalAdjustment}
          caloriesConsumed={totalCaloriesConsumed}
          caloriesBurned={totalCaloriesBurned}
          selectedDate={selectedDate}
        />
        <View style={{ height: 40 }} />
      </ScrollView>

      <Calendar
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
      />
    </View>
  );
};

export default JournalScreen;
