import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HomeScreenProps } from "../types/navigation";
import { useNightscout } from "../context/NightscoutContext";
import { useAuth } from "../context/AuthContext";
import Svg, { Line, Circle, Text as SvgText } from "react-native-svg";
import { Ionicons, Feather } from "@expo/vector-icons";
import { VintageColors } from "../themes/vintage/colors_vintage";
import { VintageStylesHome } from "../themes/vintage/styles_vintage_home";

// Extend VintageColors with event colors
const ExtendedVintageColors = {
  ...VintageColors,
  lowGlucose: "#8B4513",
  highGlucose: "#A0522D",
  normalGlucose: "#774622ff",
};

// Meal icons from Journal
const getMealIcon = (mealType: string) => {
  // Extract meal type from eventType (e.g., "Meal: Dinner" -> "Dinner")
  const type = mealType?.replace("Meal: ", "") || mealType || "";

  switch (type) {
    case "Breakfast":
      return "cafe"; // Ionicons name
    case "Morning Snack":
      return "nutrition"; // Ionicons name
    case "Lunch":
      return "fast-food"; // Ionicons name
    case "Afternoon Snack":
      return "ice-cream"; // Ionicons name
    case "Dinner":
      return "restaurant"; // Ionicons name
    case "Evening Snack":
      return "moon"; // Ionicons name
    default:
      return "nutrition"; // Default icon
  }
};

// Activity icons from Journal
const getActivityIcon = (activityType: string) => {
  // Extract activity type from eventType (e.g., "Activity: Running" -> "Running")
  const type =
    activityType?.replace(/^(Activity|Exercise):?\s*/i, "") ||
    activityType ||
    "";

  switch (type) {
    case "Walking":
      return "walk-outline"; // Ionicons name
    case "Running":
      return "fitness-outline"; // Ionicons name
    case "Cycling":
      return "bicycle-outline"; // Ionicons name
    case "Swimming":
      return "water-outline"; // Ionicons name
    case "Yoga":
      return "body-outline"; // Ionicons name
    case "Weight Training":
      return "barbell-outline"; // Ionicons name
    case "Hiking":
      return "trail-sign-outline"; // Ionicons name
    case "Dancing":
      return "musical-notes-outline"; // Ionicons name
    case "Team Sports":
      return "football-outline"; // Ionicons name
    case "Other":
      return "ellipsis-horizontal-outline"; // Ionicons name
    default:
      return "fitness-outline"; // Default icon
  }
};

// Get event color based on type (matching Journal colors) - Lighter versions
const getEventColor = (type: string, eventType: string = "") => {
  switch (type) {
    case "meal":
      // Get specific color for each meal type (matching Journal) - Lighter
      const mealType = eventType?.replace("Meal: ", "") || "";
      switch (mealType) {
        case "Breakfast":
        case "Evening Snack":
          return "#F48FB1"; // Lighter pink
        case "Morning Snack":
        case "Other":
          return "#FFB74D"; // Lighter orange/yellow
        case "Lunch":
        case "Team Sports":
          return "#64B5F6"; // Lighter blue
        case "Afternoon Snack":
        case "Dancing":
          return "#BA68C8"; // Lighter purple
        case "Dinner":
        case "Weight Training":
          return "#81C784"; // Lighter green
        default:
          return VintageColors.primaryText;
      }
    case "activity":
      // Get specific color for each activity type (matching Journal) - Lighter
      const activityType =
        eventType?.replace(/^(Activity|Exercise):?\s*/i, "") || "";
      switch (activityType) {
        case "Walking":
        case "Hiking":
          return "#81C784"; // Lighter green
        case "Running":
        case "Dancing":
          return "#F48FB1"; // Lighter pink
        case "Cycling":
        case "Weight Training":
          return "#64B5F6"; // Lighter blue
        case "Swimming":
        case "Team Sports":
          return "#BA68C8"; // Lighter purple
        case "Yoga":
        case "Other":
          return "#FFB74D"; // Lighter orange/yellow
        default:
          return VintageColors.secondaryText;
      }
    case "other":
      return "#FF8A65"; // Lighter orange/red for insulin/other events
    default:
      return VintageColors.primaryText;
  }
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { userData } = useAuth();
  const nightscoutUrl = userData?.nightscoutUrl;
  const {
    entries,
    meals,
    activities,
    loadFullDay,
    startPolling,
    stopPolling,
    isLoading,
    error,
    otherEntries,
  } = useNightscout();

  const [timeFilter, setTimeFilter] = useState<"2h" | "12h" | "24h">("24h");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const chartScrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Load initial data
  useEffect(() => {
    if (!nightscoutUrl) {
      console.log("No Nightscout URL configured");
      return;
    }

    const loadData = async () => {
      setIsRefreshing(true);
      try {
        await loadFullDay();
        setDataLoaded(true);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setIsRefreshing(false);
      }
    };

    loadData();
    startPolling();

    return () => stopPolling();
  }, [nightscoutUrl]);

  // Filter entries based on time filter
  const filteredEntries = useMemo(() => {
    if (!dataLoaded || entries.length === 0) return [];

    const now = Date.now();
    const hours = timeFilter === "2h" ? 2 : timeFilter === "12h" ? 12 : 24;
    const cutoff = now - hours * 60 * 60 * 1000;

    const filtered = entries
      .filter(
        (entry) =>
          entry.date >= cutoff &&
          typeof entry.sgv === "number" &&
          !isNaN(entry.sgv)
      )
      .sort((a, b) => a.date - b.date);

    return filtered;
  }, [entries, timeFilter, dataLoaded]);

  // Filter events based on time filter
  const filteredEvents = useMemo(() => {
    if (!dataLoaded) return [];

    const now = Date.now();
    const hours = timeFilter === "2h" ? 2 : timeFilter === "12h" ? 12 : 24;
    const cutoff = now - hours * 60 * 60 * 1000;

    const allEvents = [
      ...(meals || []).map((m) => ({ ...m, type: "meal" as const })),
      ...(activities || []).map((a) => ({ ...a, type: "activity" as const })),
      ...(otherEntries || []).map((o) => ({ ...o, type: "other" as const })),
    ];

    return allEvents
      .filter((event) => new Date(event.created_at).getTime() >= cutoff)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
  }, [meals, activities, otherEntries, timeFilter, dataLoaded]);

  // Calculate dynamic glucose range
  const glucoseRange = useMemo(() => {
    if (filteredEntries.length === 0) return { min: 70, max: 180 };

    const values = filteredEntries.map((entry) => entry.sgv);
    const min = Math.min(...values);
    const max = Math.max(...values);

    const displayMin = Math.min(40, min, 70);
    const displayMax = Math.max(250, max, 180);

    const roundedMin = Math.floor(displayMin / 10) * 10;
    const roundedMax = Math.ceil(displayMax / 10) * 10;

    return { min: roundedMin, max: roundedMax };
  }, [filteredEntries]);

  // Calculate chart width
  const chartWidth = useMemo(() => {
    if (filteredEntries.length === 0)
      return Dimensions.get("window").width * 1.5;

    const spacing = 35;
    const widthFromEntries = filteredEntries.length * spacing + 100;
    const minWidth = Dimensions.get("window").width * 1.5;

    return Math.max(minWidth, widthFromEntries);
  }, [filteredEntries]);

  // Map events to chart positions
  const eventPositions = useMemo(() => {
    if (filteredEntries.length === 0 || filteredEvents.length === 0) return [];

    const positions = [];
    const spacing = 35;

    for (const event of filteredEvents) {
      const eventTime = new Date(event.created_at).getTime();

      let closestIndex = 0;
      let minDiff = Math.abs(filteredEntries[0].date - eventTime);

      for (let i = 1; i < filteredEntries.length; i++) {
        const diff = Math.abs(filteredEntries[i].date - eventTime);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = i;
        }
      }

      const xPosition = 60 + closestIndex * spacing;
      const yPosition = 90;

      positions.push({
        ...event,
        x: xPosition,
        y: yPosition,
        chartIndex: closestIndex,
      });
    }

    return positions;
  }, [filteredEntries, filteredEvents]);

  const handleTimeFilterChange = (filter: "2h" | "12h" | "24h") => {
    setTimeFilter(filter);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadFullDay();
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatTimeShort = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Get glucose color based on value
  const getGlucoseColor = (value: number) => {
    if (value < 70) return ExtendedVintageColors.lowGlucose;
    if (value > 180) return ExtendedVintageColors.highGlucose;
    return ExtendedVintageColors.normalGlucose;
  };

  // Get glucose status text
  const getGlucoseStatus = (value: number) => {
    if (value < 70) return "Low";
    if (value > 180) return "High";
    return "Normal";
  };

  // Get event display name
  const getEventDisplayName = (event: any) => {
    if (event.eventType) {
      return event.eventType
        .replace("Meal: ", "")
        .replace("Activity: ", "")
        .replace("Exercise: ", "");
    }
    switch (event.type) {
      case "meal":
        return "Meal";
      case "activity":
        return "Activity";
      case "other":
        return event.eventType || "Other";
      default:
        return "Event";
    }
  };

  // Get detailed event information
  const getEventDetails = (event: any) => {
    const details = [];

    switch (event.type) {
      case "meal":
        const nutrition = [];
        if (event.carbs && event.carbs > 0)
          nutrition.push(`${event.carbs}g carbs`);
        if (event.protein && event.protein > 0)
          nutrition.push(`${event.protein}g protein`);
        if (event.fat && event.fat > 0) nutrition.push(`${event.fat}g fat`);
        if (event.fiber && event.fiber > 0)
          nutrition.push(`${event.fiber}g fiber`);
        if (nutrition.length > 0)
          details.push(`Nutrition: ${nutrition.join(", ")}`);
        if (event.calories && event.calories > 0)
          details.push(`${event.calories} calories`);
        if (event.notes) {
          const shortNotes =
            event.notes.length > 50
              ? event.notes.substring(0, 50) + "..."
              : event.notes;
          details.push(`"${shortNotes}"`);
        }
        break;
      case "activity":
        if (event.duration && event.duration > 0)
          details.push(`${event.duration} minutes`);
        if (event.intensity) details.push(`${event.intensity} intensity`);
        if (event.caloriesBurned)
          details.push(`${event.caloriesBurned} calories burned`);
        if (event.distance) details.push(`${event.distance} km`);
        if (event.notes) {
          const shortNotes =
            event.notes.length > 50
              ? event.notes.substring(0, 50) + "..."
              : event.notes;
          details.push(`"${shortNotes}"`);
        }
        break;
      case "other":
        if (event.insulin && event.insulin > 0)
          details.push(`${event.insulin} units insulin`);
        if (event.notes) {
          const shortNotes =
            event.notes.length > 50
              ? event.notes.substring(0, 50) + "..."
              : event.notes;
          details.push(`"${shortNotes}"`);
        }
        break;
    }

    return details.length > 0
      ? details.join(" • ")
      : event.notes || "No details available";
  };

  // Handle event marker press
  const handleEventPress = (event: any) => {
    console.log("Event pressed:", event);
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Scroll to right when data changes
  useEffect(() => {
    if (filteredEntries.length > 0 && chartScrollRef.current) {
      setTimeout(() => {
        chartScrollRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [filteredEntries.length, timeFilter]);

  // Event Details Modal
  const EventModal = () => {
    if (!selectedEvent) return null;

    const eventColor = getEventColor(
      selectedEvent.type,
      selectedEvent.eventType
    );

    return (
      <Modal
        visible={showEventModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEventModal(false)}
      >
        <View style={VintageStylesHome.modalOverlay}>
          <View style={VintageStylesHome.modalContent}>
            <View style={VintageStylesHome.modalHeader}>
              <Text style={VintageStylesHome.modalTitle}>
                {getEventDisplayName(selectedEvent)}
              </Text>
              <TouchableOpacity
                onPress={() => setShowEventModal(false)}
                style={VintageStylesHome.closeButton}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={VintageColors.primaryText}
                />
              </TouchableOpacity>
            </View>

            <View style={VintageStylesHome.modalBody}>
              <View
                style={[
                  VintageStylesHome.modalEventIconContainer,
                  { backgroundColor: eventColor },
                ]}
              >
                {selectedEvent.type === "meal" ? (
                  <Ionicons
                    name={getMealIcon(selectedEvent.eventType) as any}
                    size={28}
                    color="white"
                  />
                ) : selectedEvent.type === "activity" ? (
                  <Ionicons
                    name={getActivityIcon(selectedEvent.eventType) as any}
                    size={28}
                    color="white"
                  />
                ) : (
                  <Ionicons name="medical" size={28} color="white" />
                )}
              </View>

              <View style={VintageStylesHome.modalEventInfo}>
                <View style={VintageStylesHome.modalInfoRow}>
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={VintageColors.secondaryText}
                  />
                  <Text style={VintageStylesHome.modalInfoText}>
                    {selectedEvent &&
                      formatTime(new Date(selectedEvent.created_at))}
                  </Text>
                </View>

                <View style={VintageStylesHome.modalInfoRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={VintageColors.secondaryText}
                  />
                  <Text style={VintageStylesHome.modalInfoText}>
                    {selectedEvent &&
                      new Date(selectedEvent.created_at).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                  </Text>
                </View>

                <View style={VintageStylesHome.modalInfoRow}>
                  <Ionicons
                    name="pricetag-outline"
                    size={18}
                    color={VintageColors.secondaryText}
                  />
                  <Text
                    style={[
                      VintageStylesHome.modalEventTypeBadge,
                      { color: eventColor },
                    ]}
                  >
                    {selectedEvent.type?.toUpperCase()}
                  </Text>
                </View>

                <View style={VintageStylesHome.modalDetailsContainer}>
                  <Text style={VintageStylesHome.modalDetailsLabel}>
                    Details:
                  </Text>
                  <Text style={VintageStylesHome.modalDetailsText}>
                    {selectedEvent ? getEventDetails(selectedEvent) : ""}
                  </Text>
                </View>

                {selectedEvent.type === "meal" && (
                  <View style={VintageStylesHome.modalNutritionContainer}>
                    <Text style={VintageStylesHome.modalNutritionTitle}>
                      Nutrition:
                    </Text>
                    <View style={VintageStylesHome.modalNutritionGrid}>
                      {selectedEvent.carbs && selectedEvent.carbs > 0 && (
                        <View style={VintageStylesHome.modalNutritionItem}>
                          <Text style={VintageStylesHome.modalNutritionValue}>
                            {selectedEvent.carbs}g
                          </Text>
                          <Text style={VintageStylesHome.modalNutritionLabel}>
                            Carbs
                          </Text>
                        </View>
                      )}
                      {selectedEvent.protein && selectedEvent.protein > 0 && (
                        <View style={VintageStylesHome.modalNutritionItem}>
                          <Text style={VintageStylesHome.modalNutritionValue}>
                            {selectedEvent.protein}g
                          </Text>
                          <Text style={VintageStylesHome.modalNutritionLabel}>
                            Protein
                          </Text>
                        </View>
                      )}
                      {selectedEvent.fat && selectedEvent.fat > 0 && (
                        <View style={VintageStylesHome.modalNutritionItem}>
                          <Text style={VintageStylesHome.modalNutritionValue}>
                            {selectedEvent.fat}g
                          </Text>
                          <Text style={VintageStylesHome.modalNutritionLabel}>
                            Fat
                          </Text>
                        </View>
                      )}
                      {selectedEvent.calories && selectedEvent.calories > 0 && (
                        <View style={VintageStylesHome.modalNutritionItem}>
                          <Text style={VintageStylesHome.modalNutritionValue}>
                            {selectedEvent.calories}
                          </Text>
                          <Text style={VintageStylesHome.modalNutritionLabel}>
                            Calories
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {selectedEvent.type === "activity" &&
                  selectedEvent.duration &&
                  selectedEvent.duration > 0 && (
                    <View style={VintageStylesHome.modalActivityContainer}>
                      <Text style={VintageStylesHome.modalActivityTitle}>
                        Activity Details:
                      </Text>
                      <View style={VintageStylesHome.modalDurationBadge}>
                        <Ionicons name="time" size={16} color={eventColor} />
                        <Text style={VintageStylesHome.modalDurationText}>
                          {selectedEvent.duration} minutes
                        </Text>
                      </View>
                      {selectedEvent.intensity && (
                        <View style={VintageStylesHome.modalDurationBadge}>
                          <Ionicons
                            name="speedometer"
                            size={16}
                            color={eventColor}
                          />
                          <Text style={VintageStylesHome.modalDurationText}>
                            {selectedEvent.intensity} intensity
                          </Text>
                        </View>
                      )}
                      {selectedEvent.caloriesBurned && (
                        <View style={VintageStylesHome.modalDurationBadge}>
                          <Ionicons name="flame" size={16} color={eventColor} />
                          <Text style={VintageStylesHome.modalDurationText}>
                            {selectedEvent.caloriesBurned} calories burned
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                {selectedEvent.notes && selectedEvent.notes.trim() !== "" && (
                  <View style={VintageStylesHome.modalNotesContainer}>
                    <Text style={VintageStylesHome.modalNotesLabel}>
                      Notes:
                    </Text>
                    <Text style={VintageStylesHome.modalNotesText}>
                      {selectedEvent.notes}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Calculate y-axis labels
  const yAxisLabels = useMemo(() => {
    const range = glucoseRange.max - glucoseRange.min;
    const step = Math.max(20, Math.round(range / 5));
    const labels = [];

    for (let val = glucoseRange.min; val <= glucoseRange.max; val += step) {
      labels.push(Math.round(val));
    }

    return labels;
  }, [glucoseRange]);

  return (
    <SafeAreaView
      style={VintageStylesHome.container}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={VintageStylesHome.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[VintageColors.primaryText]}
            tintColor={VintageColors.primaryText}
          />
        }
      >
        {/* Header Section */}
        <View style={VintageStylesHome.headerSection}>
          <View style={VintageStylesHome.headerDecoration}>
            <View style={VintageStylesHome.headerLine} />
            <Text style={VintageStylesHome.headerTitle}>Glucose Overview</Text>
            <View style={VintageStylesHome.headerLine} />
          </View>
        </View>

        {/* Current Glucose Info */}
        {filteredEntries.length > 0 && (
          <View style={VintageStylesHome.currentGlucoseCard}>
            <View style={VintageStylesHome.currentGlucoseHeader}>
              <View
                style={[
                  VintageStylesHome.glucoseStatusIcon,
                  {
                    backgroundColor: getGlucoseColor(
                      filteredEntries[filteredEntries.length - 1].sgv
                    ),
                  },
                ]}
              >
                <Ionicons name="pulse" size={16} color="white" />
              </View>
              <Text style={VintageStylesHome.currentGlucoseTitle}>
                Current Glucose
              </Text>
            </View>
            <View style={VintageStylesHome.currentGlucoseContent}>
              <View style={VintageStylesHome.glucoseValueContainer}>
                <Text style={VintageStylesHome.glucoseValueLabel}>VALUE</Text>
                <Text
                  style={[
                    VintageStylesHome.glucoseValue,
                    {
                      color: getGlucoseColor(
                        filteredEntries[filteredEntries.length - 1].sgv
                      ),
                    },
                  ]}
                >
                  {filteredEntries[filteredEntries.length - 1].sgv}
                </Text>
                <Text
                  style={[
                    VintageStylesHome.glucoseStatus,
                    {
                      color: getGlucoseColor(
                        filteredEntries[filteredEntries.length - 1].sgv
                      ),
                    },
                  ]}
                >
                  {getGlucoseStatus(
                    filteredEntries[filteredEntries.length - 1].sgv
                  )}
                </Text>
              </View>
              <View style={VintageStylesHome.glucoseTimeContainer}>
                <Text style={VintageStylesHome.glucoseTimeLabel}>TIME</Text>
                <Text style={VintageStylesHome.glucoseTime}>
                  {formatTime(
                    new Date(filteredEntries[filteredEntries.length - 1].date)
                  )}
                </Text>
                <Text style={VintageStylesHome.glucoseDate}>
                  {new Date(
                    filteredEntries[filteredEntries.length - 1].date
                  ).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Time Filter Buttons */}
        <View style={VintageStylesHome.timeFilterContainer}>
          {(["2h", "12h", "24h"] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => handleTimeFilterChange(filter)}
              disabled={isRefreshing}
              style={[
                VintageStylesHome.timeFilterButton,
                timeFilter === filter &&
                  VintageStylesHome.timeFilterButtonSelected,
                isRefreshing && VintageStylesHome.timeFilterButtonDisabled,
              ]}
            >
              <Text
                style={[
                  VintageStylesHome.timeFilterText,
                  timeFilter === filter &&
                    VintageStylesHome.timeFilterTextSelected,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error && (
          <View style={VintageStylesHome.errorContainer}>
            <Text style={VintageStylesHome.errorText}>{error}</Text>
          </View>
        )}

        {isLoading && !dataLoaded ? (
          <View style={VintageStylesHome.loadingContainer}>
            <ActivityIndicator size="large" color={VintageColors.primaryText} />
            <Text style={VintageStylesHome.loadingText}>Loading data...</Text>
          </View>
        ) : filteredEntries.length === 0 ? (
          <View style={VintageStylesHome.emptyContainer}>
            <Text style={VintageStylesHome.emptyText}>
              {entries.length === 0
                ? "No glucose data available."
                : `No data in the last ${timeFilter}. Try 24h view.`}
            </Text>
            <TouchableOpacity
              onPress={handleRefresh}
              style={VintageStylesHome.refreshButton}
            >
              <Feather
                name="refresh-cw"
                size={18}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text style={VintageStylesHome.refreshButtonText}>
                Refresh Data
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Glucose Chart */}
            <View style={VintageStylesHome.chartContainer}>
              <View style={VintageStylesHome.sectionTitle}>
                <Feather
                  name="activity"
                  size={22}
                  color={VintageColors.primaryText}
                  style={{ marginRight: 8 }}
                />
                <Text style={VintageStylesHome.chartTitle}>Glucose Chart</Text>
              </View>

              <View style={{ height: 300, position: "relative" }}>
                {/* Y-axis labels - fixed on left side */}
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 40, // Leave space for x-axis
                    width: 50,
                    zIndex: 50,
                    backgroundColor: "transparent",
                  }}
                >
                  {yAxisLabels.map((value) => {
                    const y =
                      220 -
                      ((value - glucoseRange.min) /
                        (glucoseRange.max - glucoseRange.min)) *
                        180;
                    return (
                      <View
                        key={`y-label-${value}`}
                        style={{
                          position: "absolute",
                          left: 0,
                          top: y - 10, // Adjust to center text
                          width: 50,
                          alignItems: "flex-end",
                          paddingRight: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#8B7355",
                            fontWeight: "500",
                          }}
                        >
                          {value}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* Horizontal ScrollView for the chart */}
                <Animated.ScrollView
                  horizontal
                  ref={chartScrollRef}
                  showsHorizontalScrollIndicator={true}
                  style={{ height: 280, marginLeft: 50 }} // Add margin for y-axis labels
                  contentContainerStyle={{ paddingRight: 20 }}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: true }
                  )}
                  scrollEventThrottle={16}
                >
                  <Svg
                    width={chartWidth}
                    height={260}
                    style={VintageStylesHome.chartSvgContainer}
                  >
                    {/* Y-axis line - moved right by 50px to account for labels */}
                    <Line
                      x1="10" // Adjusted from 60 to 10 (60 - 50)
                      y1="20"
                      x2="10" // Adjusted from 60 to 10
                      y2="220"
                      stroke="#D2B48C"
                      strokeWidth="1.5"
                    />

                    {/* X-axis line */}
                    <Line
                      x1="10" // Adjusted from 60 to 10
                      y1="220"
                      x2={chartWidth - 40}
                      y2="220"
                      stroke="#D2B48C"
                      strokeWidth="1.5"
                    />

                    {/* Horizontal grid lines and glucose range lines */}
                    <Line
                      x1="10" // Adjusted from 60 to 10
                      y1={
                        220 -
                        ((70 - glucoseRange.min) /
                          (glucoseRange.max - glucoseRange.min)) *
                          180
                      }
                      x2={chartWidth - 40}
                      y2={
                        220 -
                        ((70 - glucoseRange.min) /
                          (glucoseRange.max - glucoseRange.min)) *
                          180
                      }
                      stroke="#FF6B6B"
                      strokeWidth="1.5"
                      strokeDasharray="4,4"
                      opacity={0.7}
                    />
                    <Line
                      x1="10" // Adjusted from 60 to 10
                      y1={
                        220 -
                        ((180 - glucoseRange.min) /
                          (glucoseRange.max - glucoseRange.min)) *
                          180
                      }
                      x2={chartWidth - 40}
                      y2={
                        220 -
                        ((180 - glucoseRange.min) /
                          (glucoseRange.max - glucoseRange.min)) *
                          180
                      }
                      stroke="#4ECDC4"
                      strokeWidth="1.5"
                      strokeDasharray="4,4"
                      opacity={0.7}
                    />

                    {/* Glucose lines */}
                    {filteredEntries.map((entry, index) => {
                      if (index === 0) return null;
                      const prevEntry = filteredEntries[index - 1];

                      const spacing = 35;
                      const x1 = 10 + (index - 1) * spacing; // Adjusted from 60 to 10
                      const x2 = 10 + index * spacing; // Adjusted from 60 to 10

                      const y1 =
                        220 -
                        ((prevEntry.sgv - glucoseRange.min) /
                          (glucoseRange.max - glucoseRange.min)) *
                          180;
                      const y2 =
                        220 -
                        ((entry.sgv - glucoseRange.min) /
                          (glucoseRange.max - glucoseRange.min)) *
                          180;

                      return (
                        <Line
                          key={`line-${entry.date}`}
                          x1={x1}
                          y1={Math.max(20, Math.min(220, y1))}
                          x2={x2}
                          y2={Math.max(20, Math.min(220, y2))}
                          stroke={getGlucoseColor(entry.sgv)}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      );
                    })}

                    {/* Glucose points and time labels */}
                    {filteredEntries.map((entry, index) => {
                      const spacing = 35;
                      const x = 10 + index * spacing; // Adjusted from 60 to 10
                      const y =
                        220 -
                        ((entry.sgv - glucoseRange.min) /
                          (glucoseRange.max - glucoseRange.min)) *
                          180;

                      return (
                        <React.Fragment key={`point-${entry.date}`}>
                          <Circle
                            cx={x}
                            cy={Math.max(20, Math.min(220, y))}
                            r="3.5"
                            fill={getGlucoseColor(entry.sgv)}
                            stroke="#FFFFFF"
                            strokeWidth="1"
                          />
                          {index % 3 === 0 && (
                            <>
                              <SvgText
                                x={x}
                                y="240"
                                fontSize="9"
                                fill="#8B7355"
                                textAnchor="middle"
                                fontWeight="500"
                              >
                                {formatTimeShort(new Date(entry.date))}
                              </SvgText>
                              <Line
                                x1={x}
                                y1="220"
                                x2={x}
                                y2="225"
                                stroke="#E0D6C9"
                                strokeWidth="1"
                              />
                            </>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {/* Event vertical lines in SVG */}
                    {eventPositions.map((event) => {
                      const eventColor = getEventColor(
                        event.type,
                        event.eventType
                      );

                      // Adjust x position for the new chart offset
                      const adjustedX = event.x - 50; // Since we moved from 60 to 10 (60-50=10)

                      return (
                        <React.Fragment key={`event-line-${event._id}`}>
                          <Line
                            x1={adjustedX}
                            y1="20"
                            x2={adjustedX}
                            y2="220"
                            stroke={eventColor}
                            strokeWidth="1"
                            strokeDasharray="3,3"
                            opacity={0.6}
                          />
                          {/* Event time label in SVG */}
                          <SvgText
                            x={adjustedX}
                            y="250"
                            fontSize="8"
                            fill={eventColor}
                            textAnchor="middle"
                            fontWeight="600"
                          >
                            {formatTimeShort(new Date(event.created_at))}
                          </SvgText>
                        </React.Fragment>
                      );
                    })}
                  </Svg>
                </Animated.ScrollView>

                {/* Event icons rendered as separate components outside the ScrollView */}
                {eventPositions.map((event) => {
                  const eventColor = getEventColor(event.type, event.eventType);

                  // Adjust x position for the new chart offset and center the icon
                  const adjustedX = event.x - 50 - 16; // -50 for chart offset, -16 to center icon

                  return (
                    <Animated.View
                      key={`event-button-${event._id}`}
                      style={{
                        position: "absolute",
                        left: adjustedX + 50, // Add back 50 for the margin we added to ScrollView
                        top: 75,
                        width: 32,
                        height: 32,
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 100,
                        backgroundColor: eventColor,
                        borderRadius: 16,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 3,
                        elevation: 5,
                        borderWidth: 2,
                        borderColor: "#FFFFFF",
                        transform: [
                          {
                            translateX: scrollX.interpolate({
                              inputRange: [0, chartWidth],
                              outputRange: [0, -chartWidth],
                              extrapolate: "clamp",
                            }),
                          },
                        ],
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => handleEventPress(event)}
                        style={{
                          width: "100%",
                          height: "100%",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        activeOpacity={0.7}
                      >
                        {event.type === "meal" ? (
                          <Ionicons
                            name={getMealIcon(event.eventType) as any}
                            size={18}
                            color="white"
                          />
                        ) : event.type === "activity" ? (
                          <Ionicons
                            name={getActivityIcon(event.eventType) as any}
                            size={18}
                            color="white"
                          />
                        ) : (
                          <Ionicons name="medical" size={18} color="white" />
                        )}
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>

              {/* Chart hint for events */}
              {filteredEvents.length > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    backgroundColor: "rgba(139, 115, 85, 0.1)",
                    borderRadius: 8,
                  }}
                >
                  <Feather name="info" size={14} color="#8B7355" />
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#8B7355",
                      marginLeft: 6,
                      fontStyle: "italic",
                    }}
                  >
                    Click on event icons for details
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
      <EventModal />
    </SafeAreaView>
  );
};

export default HomeScreen;
