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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HomeScreenProps } from "../types/navigation";
import { getPlatformStyles } from "../themes/styles";
import { useNightscout } from "../context/NightscoutContext";
import { logoutUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { VintageColors } from "../themes/vintage/colors_vintage";
import { VintageStyles } from "../themes/vintage/styles_vintage";
import { Colors } from "../themes/colors";
import Svg, { Line, Circle, Text as SvgText } from "react-native-svg";
import { Ionicons, Feather } from "@expo/vector-icons";

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { userData } = useAuth();
  const nightscoutUrl = userData?.nightscoutUrl;
  const {
    entries,
    meals,
    activities,
    loadFullDay,
    fetchIncremental,
    startPolling,
    stopPolling,
    isLoading,
    reset,
    error,
    otherEntries,
  } = useNightscout();

  const [timeFilter, setTimeFilter] = useState<"2h" | "12h" | "24h">("24h");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const chartScrollRef = useRef<ScrollView>(null);

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

    // Filter entries by time
    const filtered = entries
      .filter(
        (entry) =>
          entry.date >= cutoff &&
          typeof entry.sgv === "number" &&
          !isNaN(entry.sgv)
      )
      .sort((a, b) => a.date - b.date); // Oldest to newest

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

    // Always include target range (70-180) in the view
    const displayMin = Math.min(40, min, 70);
    const displayMax = Math.max(250, max, 180);

    // Round to nice numbers
    const roundedMin = Math.floor(displayMin / 10) * 10;
    const roundedMax = Math.ceil(displayMax / 10) * 10;

    return { min: roundedMin, max: roundedMax };
  }, [filteredEntries]);

  // Calculate chart width - INCREASED spacing to 35px per entry
  const chartWidth = useMemo(() => {
    if (filteredEntries.length === 0)
      return Dimensions.get("window").width * 1.5;

    // 35 pixels per entry for better spacing with times
    const spacing = 35;
    const widthFromEntries = filteredEntries.length * spacing + 100;
    const minWidth = Dimensions.get("window").width * 1.5;

    return Math.max(minWidth, widthFromEntries);
  }, [filteredEntries]);

  // Map events to chart positions
  const eventPositions = useMemo(() => {
    if (filteredEntries.length === 0 || filteredEvents.length === 0) return [];

    const positions = [];
    const spacing = 35; // Must match chart spacing

    for (const event of filteredEvents) {
      const eventTime = new Date(event.created_at).getTime();

      // Find the closest entry index to this event time
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
      const yPosition = 90; // Middle of chart for event markers

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

  const platformStyles = getPlatformStyles();

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Format time for X-axis (shorter but readable)
  const formatTimeShort = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Get glucose color based on value
  const getGlucoseColor = (value: number) => {
    if (value < 70) return "#FF6B6B"; // Low - red
    if (value > 180) return "#4ECDC4"; // High - teal
    return "#774622ff"; // Normal - matching journal theme
  };

  // Get glucose status text
  const getGlucoseStatus = (value: number) => {
    if (value < 70) return "Low";
    if (value > 180) return "High";
    return "Normal";
  };

  // Get event icon
  const getEventIcon = (type: string) => {
    switch (type) {
      case "meal":
        return "🍽️";
      case "activity":
        return "🏃";
      default:
        return "💊";
    }
  };

  // Get event color - matching journal theme
  const getEventColor = (type: string) => {
    switch (type) {
      case "meal":
        return "#774622ff"; // Brown from journal
      case "activity":
        return "#8B4513"; // Saddle Brown for activities
      default:
        return "#A0522D"; // Other - sienna brown
    }
  };

  // Get detailed event information for meals
  const getMealDetails = (event: any) => {
    const details = [];
    const nutrition = [];

    if (event.carbs && event.carbs > 0) nutrition.push(`${event.carbs}g carbs`);
    if (event.protein && event.protein > 0)
      nutrition.push(`${event.protein}g protein`);
    if (event.fat && event.fat > 0) nutrition.push(`${event.fat}g fat`);
    if (event.fiber && event.fiber > 0) nutrition.push(`${event.fiber}g fiber`);

    if (nutrition.length > 0) {
      details.push(`Nutrition: ${nutrition.join(", ")}`);
    }

    if (event.calories && event.calories > 0) {
      details.push(`${event.calories} calories`);
    }

    if (event.notes && event.notes.trim() !== "") {
      // Truncate long notes
      const shortNotes =
        event.notes.length > 50
          ? event.notes.substring(0, 50) + "..."
          : event.notes;
      details.push(`"${shortNotes}"`);
    }

    return details.length > 0 ? details.join(" • ") : "No details available";
  };

  // Get detailed event information for activities
  const getActivityDetails = (event: any) => {
    const details = [];

    if (event.duration && event.duration > 0) {
      details.push(`${event.duration} minutes`);
    }

    if (event.notes && event.notes.trim() !== "") {
      const shortNotes =
        event.notes.length > 50
          ? event.notes.substring(0, 50) + "..."
          : event.notes;
      details.push(`"${shortNotes}"`);
    }

    return details.length > 0 ? details.join(" • ") : "No details available";
  };

  // Get detailed event information for other entries
  const getOtherDetails = (event: any) => {
    const details = [];

    if (event.insulin && event.insulin > 0) {
      details.push(`${event.insulin} units insulin`);
    }

    if (event.notes && event.notes.trim() !== "") {
      const shortNotes =
        event.notes.length > 50
          ? event.notes.substring(0, 50) + "..."
          : event.notes;
      details.push(`"${shortNotes}"`);
    }

    return details.length > 0
      ? details.join(" • ")
      : event.eventType || "Event";
  };

  // Get event details based on type
  const getEventDetails = (event: any) => {
    switch (event.type) {
      case "meal":
        return getMealDetails(event);
      case "activity":
        return getActivityDetails(event);
      case "other":
        return getOtherDetails(event);
      default:
        return event.notes || event.eventType || "Event";
    }
  };

  // Scroll to right when data changes
  useEffect(() => {
    if (filteredEntries.length > 0 && chartScrollRef.current) {
      // Small delay to ensure SVG is rendered
      setTimeout(() => {
        chartScrollRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [filteredEntries.length, timeFilter]);

  return (
    <SafeAreaView
      style={[VintageStyles.container, { backgroundColor: "#F8F4F0" }]}
    >
      <ScrollView
        style={platformStyles.container}
        contentContainerStyle={[{ paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#774622ff"]}
            tintColor="#774622ff"
          />
        }
      >
        {/* Header Section - Properly centered */}
        <View
          style={{
            paddingTop: 10,
            paddingBottom: 15,
            backgroundColor: "#F8F4F0",
            width: "100%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              paddingHorizontal: 20,
            }}
          >
            <View
              style={{
                height: 1,
                backgroundColor: "#D2B48C",
                flex: 1,
                maxWidth: 60,
              }}
            />
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: "#774622ff",
                marginHorizontal: 15,
                textAlign: "center",
              }}
            >
              Glucose Overview
            </Text>
            <View
              style={{
                height: 1,
                backgroundColor: "#D2B48C",
                flex: 1,
                maxWidth: 60,
              }}
            />
          </View>
        </View>

        {/* Current Glucose Info */}
        {filteredEntries.length > 0 && (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E0D6C9",
              padding: 20,
              marginHorizontal: 20,
              marginBottom: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: getGlucoseColor(
                    filteredEntries[filteredEntries.length - 1].sgv
                  ),
                  marginRight: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: getGlucoseColor(
                    filteredEntries[filteredEntries.length - 1].sgv
                  ),
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 3,
                }}
              >
                <Ionicons name="pulse" size={16} color="white" />
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#774622ff",
                }}
              >
                Current Glucose
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <Text
                  style={{ color: "#8B7355", fontSize: 12, marginBottom: 4 }}
                >
                  VALUE
                </Text>
                <Text
                  style={{
                    fontSize: 42,
                    fontWeight: "bold",
                    color: getGlucoseColor(
                      filteredEntries[filteredEntries.length - 1].sgv
                    ),
                    letterSpacing: -0.5,
                  }}
                >
                  {filteredEntries[filteredEntries.length - 1].sgv}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: getGlucoseColor(
                      filteredEntries[filteredEntries.length - 1].sgv
                    ),
                    fontWeight: "600",
                    marginTop: 2,
                  }}
                >
                  {getGlucoseStatus(
                    filteredEntries[filteredEntries.length - 1].sgv
                  )}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{ color: "#8B7355", fontSize: 12, marginBottom: 4 }}
                >
                  TIME
                </Text>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "600",
                    color: "#774622ff",
                  }}
                >
                  {formatTime(
                    new Date(filteredEntries[filteredEntries.length - 1].date)
                  )}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: "#8B7355",
                    marginTop: 4,
                  }}
                >
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
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginVertical: 10,
            marginHorizontal: 20,
          }}
        >
          {(["2h", "12h", "24h"] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => handleTimeFilterChange(filter)}
              disabled={isRefreshing}
              style={{
                paddingHorizontal: 22,
                paddingVertical: 12,
                marginHorizontal: 6,
                backgroundColor:
                  timeFilter === filter ? "#774622ff" : "#FFFFFF",
                borderRadius: 25,
                borderWidth: 1,
                borderColor: timeFilter === filter ? "#774622ff" : "#D2B48C",
                opacity: isRefreshing ? 0.5 : 1,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
                minWidth: 80,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: timeFilter === filter ? "white" : "#774622ff",
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error && (
          <View
            style={{
              backgroundColor: "#FFEBEE",
              padding: 12,
              borderRadius: 8,
              marginHorizontal: 20,
              marginBottom: 15,
              borderWidth: 1,
              borderColor: "#FFCDD2",
            }}
          >
            <Text style={{ color: "#D32F2F", textAlign: "center" }}>
              {error}
            </Text>
          </View>
        )}

        {isLoading && !dataLoaded ? (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <ActivityIndicator size="large" color="#774622ff" />
            <Text style={{ marginTop: 10, color: "#774622ff" }}>
              Loading data...
            </Text>
          </View>
        ) : filteredEntries.length === 0 ? (
          <View
            style={{
              alignItems: "center",
              marginTop: 40,
              paddingHorizontal: 20,
            }}
          >
            <Text
              style={{
                color: "#8B7355",
                marginBottom: 20,
                textAlign: "center",
                fontSize: 16,
              }}
            >
              {entries.length === 0
                ? "No glucose data available."
                : `No data in the last ${timeFilter}. Try 24h view.`}
            </Text>
            <TouchableOpacity
              onPress={handleRefresh}
              style={{
                backgroundColor: "#774622ff",
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
              }}
            >
              <Feather
                name="refresh-cw"
                size={18}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: "white", fontWeight: "600", fontSize: 15 }}>
                Refresh Data
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Glucose Chart */}
            <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 15,
                }}
              >
                <Feather
                  name="activity"
                  size={22}
                  color="#774622ff"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: "#774622ff",
                    textAlign: "center",
                  }}
                >
                  Glucose Chart
                </Text>
              </View>

              <ScrollView
                horizontal
                ref={chartScrollRef}
                showsHorizontalScrollIndicator={true}
                style={{ height: 250 }}
                contentContainerStyle={{ paddingRight: 20 }}
              >
                <View>
                  <Svg
                    width={chartWidth}
                    height={200}
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#E0D6C9",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    {/* Y-axis */}
                    <Line
                      x1="60"
                      y1="20"
                      x2="60"
                      y2="160"
                      stroke="#D2B48C"
                      strokeWidth="1.5"
                    />

                    {/* X-axis */}
                    <Line
                      x1="60"
                      y1="160"
                      x2={chartWidth - 40}
                      y2="160"
                      stroke="#D2B48C"
                      strokeWidth="1.5"
                    />

                    {/* Y-axis labels */}
                    {(() => {
                      const range = glucoseRange.max - glucoseRange.min;
                      const step = Math.max(20, Math.round(range / 5));
                      const labels = [];
                      for (
                        let val = glucoseRange.min;
                        val <= glucoseRange.max;
                        val += step
                      ) {
                        labels.push(Math.round(val));
                      }
                      return labels.map((value) => {
                        const y =
                          160 - ((value - glucoseRange.min) / range) * 120;
                        return (
                          <React.Fragment key={value}>
                            <SvgText
                              x="50"
                              y={y + 4}
                              fontSize="11"
                              fill="#8B7355"
                              textAnchor="end"
                              fontWeight="500"
                            >
                              {value}
                            </SvgText>
                            <Line
                              x1="58"
                              y1={y}
                              x2="60"
                              y2={y}
                              stroke="#E0D6C9"
                              strokeWidth="1"
                            />
                          </React.Fragment>
                        );
                      });
                    })()}

                    {/* Target range lines */}
                    <Line
                      x1="60"
                      y1={
                        160 -
                        ((70 - glucoseRange.min) /
                          (glucoseRange.max - glucoseRange.min)) *
                          120
                      }
                      x2={chartWidth - 40}
                      y2={
                        160 -
                        ((70 - glucoseRange.min) /
                          (glucoseRange.max - glucoseRange.min)) *
                          120
                      }
                      stroke="#FF6B6B"
                      strokeWidth="1.5"
                      strokeDasharray="4,4"
                      opacity={0.7}
                    />
                    <Line
                      x1="60"
                      y1={
                        160 -
                        ((180 - glucoseRange.min) /
                          (glucoseRange.max - glucoseRange.min)) *
                          120
                      }
                      x2={chartWidth - 40}
                      y2={
                        160 -
                        ((180 - glucoseRange.min) /
                          (glucoseRange.max - glucoseRange.min)) *
                          120
                      }
                      stroke="#4ECDC4"
                      strokeWidth="1.5"
                      strokeDasharray="4,4"
                      opacity={0.7}
                    />

                    {/* Draw glucose line */}
                    {filteredEntries.map((entry, index) => {
                      if (index === 0) return null;
                      const prevEntry = filteredEntries[index - 1];

                      const spacing = 35;
                      const x1 = 60 + (index - 1) * spacing;
                      const x2 = 60 + index * spacing;

                      const y1 =
                        160 -
                        ((prevEntry.sgv - glucoseRange.min) /
                          (glucoseRange.max - glucoseRange.min)) *
                          120;
                      const y2 =
                        160 -
                        ((entry.sgv - glucoseRange.min) /
                          (glucoseRange.max - glucoseRange.min)) *
                          120;

                      return (
                        <Line
                          key={`line-${entry.date}`}
                          x1={x1}
                          y1={Math.max(20, Math.min(160, y1))}
                          x2={x2}
                          y2={Math.max(20, Math.min(160, y2))}
                          stroke={getGlucoseColor(entry.sgv)}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      );
                    })}

                    {/* Draw ALL data points with times */}
                    {filteredEntries.map((entry, index) => {
                      const spacing = 35;
                      const x = 60 + index * spacing;
                      const y =
                        160 -
                        ((entry.sgv - glucoseRange.min) /
                          (glucoseRange.max - glucoseRange.min)) *
                          120;

                      return (
                        <React.Fragment key={`point-${entry.date}`}>
                          <Circle
                            cx={x}
                            cy={Math.max(20, Math.min(160, y))}
                            r="3.5"
                            fill={getGlucoseColor(entry.sgv)}
                            stroke="#FFFFFF"
                            strokeWidth="1"
                          />
                          {/* Time label for EVERY point - show only every 3rd to avoid crowding */}
                          {index % 3 === 0 && (
                            <>
                              <SvgText
                                x={x}
                                y="180"
                                fontSize="9"
                                fill="#8B7355"
                                textAnchor="middle"
                                fontWeight="500"
                              >
                                {formatTimeShort(new Date(entry.date))}
                              </SvgText>
                              {/* Vertical line for time marker */}
                              <Line
                                x1={x}
                                y1="160"
                                x2={x}
                                y2="165"
                                stroke="#E0D6C9"
                                strokeWidth="1"
                              />
                            </>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {/* Event markers on the graph */}
                    {eventPositions.map((event) => (
                      <React.Fragment key={`event-marker-${event._id}`}>
                        {/* Event marker line */}
                        <Line
                          x1={event.x}
                          y1="20"
                          x2={event.x}
                          y2="160"
                          stroke={getEventColor(event.type)}
                          strokeWidth="1"
                          strokeDasharray="3,3"
                          opacity={0.6}
                        />
                        {/* Event icon */}
                        <SvgText
                          x={event.x}
                          y={90}
                          fontSize="16"
                          fill={getEventColor(event.type)}
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          {getEventIcon(event.type)}
                        </SvgText>
                        {/* Event time - show below */}
                        {eventPositions.length <= 10 && (
                          <SvgText
                            x={event.x}
                            y="175"
                            fontSize="8"
                            fill={getEventColor(event.type)}
                            textAnchor="middle"
                            fontWeight="600"
                          >
                            {formatTimeShort(new Date(event.created_at))}
                          </SvgText>
                        )}
                      </React.Fragment>
                    ))}
                  </Svg>
                </View>
              </ScrollView>
            </View>

            {/* Events List Below Chart */}
            {filteredEvents.length > 0 && (
              <View
                style={{
                  marginTop: 20,
                  paddingHorizontal: 20,
                  paddingBottom: 30,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 15,
                  }}
                >
                  <Feather
                    name="list"
                    size={22}
                    color="#774622ff"
                    style={{ marginRight: 10 }}
                  />
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: "#774622ff",
                    }}
                  >
                    Recent Events ({filteredEvents.length})
                  </Text>
                </View>

                {filteredEvents.map((event) => (
                  <TouchableOpacity
                    key={event._id}
                    style={{
                      padding: 16,
                      marginBottom: 12,
                      backgroundColor: "#FFFFFF",
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#E0D6C9",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 3,
                      elevation: 1,
                    }}
                    onPress={() => {
                      console.log("Event pressed:", event);
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "flex-start" }}
                    >
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: getEventColor(event.type),
                          marginRight: 12,
                          justifyContent: "center",
                          alignItems: "center",
                          shadowColor: getEventColor(event.type),
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 3,
                        }}
                      >
                        <Text style={{ color: "white", fontSize: 18 }}>
                          {getEventIcon(event.type)}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: 6,
                          }}
                        >
                          <Text
                            style={{
                              fontWeight: "700",
                              color: "#774622ff",
                              fontSize: 16,
                              flex: 1,
                            }}
                          >
                            {event.eventType ||
                              (event.type === "meal"
                                ? "Meal"
                                : event.type === "activity"
                                ? "Activity"
                                : "Event")}
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#8B7355",
                              marginLeft: 8,
                              fontWeight: "600",
                            }}
                          >
                            {formatTime(new Date(event.created_at))}
                          </Text>
                        </View>

                        {/* Event Type Badge */}
                        <View
                          style={{
                            backgroundColor: getEventColor(event.type) + "20",
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 4,
                            alignSelf: "flex-start",
                            marginBottom: 8,
                          }}
                        >
                          <Text
                            style={{
                              color: getEventColor(event.type),
                              fontSize: 10,
                              fontWeight: "600",
                            }}
                          >
                            {event.type.toUpperCase()}
                          </Text>
                        </View>

                        {/* Detailed Event Information */}
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#5D4037",
                            marginTop: 4,
                            lineHeight: 18,
                          }}
                        >
                          {getEventDetails(event)}
                        </Text>

                        {/* Special nutrition badges for meals */}
                        {event.type === "meal" && (
                          <View
                            style={{
                              marginTop: 10,
                              flexDirection: "row",
                              flexWrap: "wrap",
                            }}
                          >
                            {event.carbs && event.carbs > 0 && (
                              <View
                                style={{
                                  backgroundColor: "#774622ff",
                                  paddingHorizontal: 10,
                                  paddingVertical: 4,
                                  borderRadius: 6,
                                  marginRight: 8,
                                  marginBottom: 6,
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <Ionicons
                                  name="nutrition"
                                  size={12}
                                  color="white"
                                  style={{ marginRight: 4 }}
                                />
                                <Text
                                  style={{
                                    color: "white",
                                    fontSize: 11,
                                    fontWeight: "600",
                                  }}
                                >
                                  {event.carbs}g carbs
                                </Text>
                              </View>
                            )}
                            {event.calories && event.calories > 0 && (
                              <View
                                style={{
                                  backgroundColor: "#D2B48C",
                                  paddingHorizontal: 10,
                                  paddingVertical: 4,
                                  borderRadius: 6,
                                  marginRight: 8,
                                  marginBottom: 6,
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <Ionicons
                                  name="flame"
                                  size={12}
                                  color="#774622ff"
                                  style={{ marginRight: 4 }}
                                />
                                <Text
                                  style={{
                                    color: "#774622ff",
                                    fontSize: 11,
                                    fontWeight: "600",
                                  }}
                                >
                                  {event.calories} cal
                                </Text>
                              </View>
                            )}
                            {event.protein && event.protein > 0 && (
                              <View
                                style={{
                                  backgroundColor: "#8B4513",
                                  paddingHorizontal: 10,
                                  paddingVertical: 4,
                                  borderRadius: 6,
                                  marginRight: 8,
                                  marginBottom: 6,
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <Ionicons
                                  name="barbell"
                                  size={12}
                                  color="white"
                                  style={{ marginRight: 4 }}
                                />
                                <Text
                                  style={{
                                    color: "white",
                                    fontSize: 11,
                                    fontWeight: "600",
                                  }}
                                >
                                  {event.protein}g protein
                                </Text>
                              </View>
                            )}
                          </View>
                        )}

                        {/* Duration badge for activities */}
                        {event.type === "activity" &&
                          event.duration &&
                          event.duration > 0 && (
                            <View style={{ marginTop: 10 }}>
                              <View
                                style={{
                                  backgroundColor: "#8B4513",
                                  paddingHorizontal: 10,
                                  paddingVertical: 4,
                                  borderRadius: 6,
                                  alignSelf: "flex-start",
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <Ionicons
                                  name="time"
                                  size={12}
                                  color="white"
                                  style={{ marginRight: 4 }}
                                />
                                <Text
                                  style={{
                                    color: "white",
                                    fontSize: 11,
                                    fontWeight: "600",
                                  }}
                                >
                                  {event.duration} minutes
                                </Text>
                              </View>
                            </View>
                          )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gooseIcon: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginTop: 50,
  },
});

export default HomeScreen;
