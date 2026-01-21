import { useState, useEffect, useMemo } from "react";
import { useNightscout } from "../../contexts/NightscoutContext";

const getDayRange = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const useJournalData = (initialDate?: Date) => {
  const [selectedDate, setSelectedDate] = useState<Date>(
    initialDate || new Date(),
  );

  const [showCalendar, setShowCalendar] = useState(false);

  const { fetchTreatments, meals, activities, otherEntries, entries } =
    useNightscout();

  useEffect(() => {
    fetchTreatments(selectedDate);
  }, [selectedDate, fetchTreatments]);

  useEffect(() => {
    fetchTreatments(selectedDate);
  }, [selectedDate, fetchTreatments]);

  const {
    todayMeals,
    todayActivities,
    todayNotes,
    todayEntries,
    insulinEvents,
    totalBasalAdjustment,
    totalCaloriesConsumed,
    totalCaloriesBurned,
  } = useMemo(() => {
    const { start, end } = getDayRange(selectedDate);

    const filteredMeals = meals.filter((m) => {
      const d = new Date(m.created_at);
      return d >= start && d <= end;
    });

    const filteredActivities = activities.filter((m) => {
      const d = new Date(m.created_at);
      return d >= start && d <= end;
    });

    const filteredNotes = otherEntries?.filter((m) => {
      const d = new Date(m.created_at);
      return d >= start && d <= end && m.eventType === "Note";
    });

    const filteredEntries = entries.filter((e) => {
      const d = new Date(e.date);
      return d >= start && d <= end;
    });

    const caloriesConsumed = filteredMeals.reduce(
      (sum, meal) => sum + (meal.calories || 0),
      0,
    );
    const caloriesBurned = filteredActivities.reduce(
      (sum, activity) =>
        sum + (activity.caloriesBurned || activity.calories || 0),
      0,
    );

    const insulinEvents =
      otherEntries?.filter((entry) => {
        const d = new Date(entry.created_at);
        return (
          d >= start &&
          d <= end &&
          (entry.eventType?.includes("Bolus") ||
            entry.eventType?.includes("Temp Basal"))
        );
      }) || [];

    // const totalBolus = insulinEvents.reduce((sum, event) => {
    //   if (event.eventType?.includes("Bolus") && event.insulin) {
    //     return sum + event.insulin;
    //   }
    //   return sum;
    // }, 0);

    const totalBasalAdjustment = insulinEvents.reduce((sum, event) => {
      if (
        event.eventType?.includes("Temp Basal") &&
        event.rate &&
        event.duration
      ) {
        const hours = event.duration / 60;
        const adjustment = (event.percent || 0) / 100; // -40% = -0.4
        return sum + event.rate * hours * adjustment;
      }
      return sum;
    }, 0);

    // const totalCarbs = filteredMeals.reduce(
    //   (sum, meal) => sum + (meal.carbs || 0),
    //   0
    // );
    return {
      todayMeals: filteredMeals,
      todayActivities: filteredActivities,
      todayNotes: filteredNotes,
      todayEntries: filteredEntries,
      insulinEvents,
      totalBasalAdjustment,
      totalCaloriesConsumed: caloriesConsumed,
      totalCaloriesBurned: caloriesBurned,
    };
  }, [meals, activities, otherEntries, selectedDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  return {
    selectedDate,
    showCalendar,
    todayMeals,
    todayActivities,
    todayNotes,
    todayEntries,
    insulinEvents,
    totalBasalAdjustment,
    totalCaloriesConsumed,
    totalCaloriesBurned,
    handleDateSelect,
    setShowCalendar,
    handlePreviousDay,
    handleNextDay,
    handleToday,
  };
};
