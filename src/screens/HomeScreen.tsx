import React, { useState, useMemo, useEffect } from "react";
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

  // Filter entries based on time filter - REMOVED SAMPLING
  const filteredEntries = useMemo(() => {
    if (!dataLoaded || entries.length === 0) return [];

    const now = Date.now();
    const hours = timeFilter === "2h" ? 2 : timeFilter === "12h" ? 12 : 24;
    const cutoff = now - hours * 60 * 60 * 1000;

    console.log(`Filtering ${entries.length} total entries for ${hours}h view`);
    console.log(`Cutoff time: ${new Date(cutoff).toLocaleString()}`);

    // Filter entries by time
    const filtered = entries
      .filter(
        (entry) =>
          entry.date >= cutoff &&
          typeof entry.sgv === "number" &&
          !isNaN(entry.sgv)
      )
      .sort((a, b) => a.date - b.date); // Oldest to newest

    console.log(`Found ${filtered.length} entries in time range`);

    if (filtered.length > 0) {
      console.log(
        `Time range: ${new Date(
          filtered[0].date
        ).toLocaleString()} to ${new Date(
          filtered[filtered.length - 1].date
        ).toLocaleString()}`
      );
    }

    // REMOVED SAMPLING - Show ALL points
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

  // Calculate chart width - scale based on number of entries
  const chartWidth = useMemo(() => {
    if (filteredEntries.length === 0)
      return Dimensions.get("window").width * 1.5;

    // 15 pixels per entry minimum
    const minSpacing = 15;
    const widthFromEntries = filteredEntries.length * minSpacing + 100;
    const minWidth = Dimensions.get("window").width * 1.5;

    return Math.max(minWidth, widthFromEntries);
  }, [filteredEntries]);

  const handleTimeFilterChange = (filter: "2h" | "12h" | "24h") => {
    console.log(`Changing time filter to: ${filter}`);
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

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      reset();
    } else {
      console.error("Logout failed:", result.error);
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

  // Get glucose color based on value
  const getGlucoseColor = (value: number) => {
    if (value < 70) return "#FF6B6B"; // Low - red
    if (value > 180) return "#4ECDC4"; // High - teal
    return VintageColors.primaryText; // Normal
  };

  // Get glucose status text
  const getGlucoseStatus = (value: number) => {
    if (value < 70) return "Low";
    if (value > 180) return "High";
    return "Normal";
  };

  return (
    <SafeAreaView style={[VintageStyles.container]}>
      <ScrollView
        style={platformStyles.container}
        contentContainerStyle={[
          platformStyles.scrollContent,
          { paddingBottom: 40 },
        ]}
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
        <Text style={VintageStyles.headerTitle}>Glucose Overview</Text>

        {/* Time Filter Buttons */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginVertical: 20,
          }}
        >
          {(["2h", "12h", "24h"] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => handleTimeFilterChange(filter)}
              disabled={isRefreshing}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                marginHorizontal: 5,
                backgroundColor:
                  timeFilter === filter
                    ? VintageColors.primaryText
                    : VintageColors.cardBackground,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: VintageColors.border,
                opacity: isRefreshing ? 0.5 : 1,
              }}
            >
              <Text
                style={{
                  color:
                    timeFilter === filter ? "white" : VintageColors.primaryText,
                  fontWeight: "600",
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
              padding: 10,
              borderRadius: 8,
              marginBottom: 10,
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
            <ActivityIndicator size="large" color={VintageColors.primaryText} />
            <Text style={{ marginTop: 10, color: VintageColors.primaryText }}>
              Loading data...
            </Text>
          </View>
        ) : filteredEntries.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Text
              style={{
                color: VintageColors.secondaryText,
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              {entries.length === 0
                ? "No glucose data available."
                : `No data in the last ${timeFilter}. Try 24h view.`}
            </Text>
            <TouchableOpacity
              onPress={handleRefresh}
              style={{
                backgroundColor: VintageColors.primaryText,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                Refresh Data
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Current Glucose Info */}
            <View
              style={{
                backgroundColor: VintageColors.cardBackground,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: VintageColors.border,
                padding: 15,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: VintageColors.primaryText,
                  marginBottom: 10,
                }}
              >
                Current Glucose
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text
                    style={{ color: VintageColors.secondaryText, fontSize: 12 }}
                  >
                    Value
                  </Text>
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "bold",
                      color: getGlucoseColor(
                        filteredEntries[filteredEntries.length - 1].sgv
                      ),
                    }}
                  >
                    {filteredEntries[filteredEntries.length - 1].sgv}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
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
                    style={{ color: VintageColors.secondaryText, fontSize: 12 }}
                  >
                    Time
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      color: VintageColors.primaryText,
                    }}
                  >
                    {formatTime(
                      new Date(filteredEntries[filteredEntries.length - 1].date)
                    )}
                  </Text>
                </View>
              </View>
            </View>

            {/* Data Summary */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                marginBottom: 20,
                backgroundColor: VintageColors.cardBackground,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: VintageColors.border,
                padding: 15,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{ color: VintageColors.secondaryText, fontSize: 12 }}
                >
                  Readings
                </Text>
                <Text
                  style={{
                    color: VintageColors.primaryText,
                    fontSize: 18,
                    fontWeight: "600",
                  }}
                >
                  {filteredEntries.length}
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{ color: VintageColors.secondaryText, fontSize: 12 }}
                >
                  Events
                </Text>
                <Text
                  style={{
                    color: VintageColors.primaryText,
                    fontSize: 18,
                    fontWeight: "600",
                  }}
                >
                  {filteredEvents.length}
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{ color: VintageColors.secondaryText, fontSize: 12 }}
                >
                  Time Range
                </Text>
                <Text
                  style={{
                    color: VintageColors.primaryText,
                    fontSize: 18,
                    fontWeight: "600",
                  }}
                >
                  {timeFilter}
                </Text>
              </View>
            </View>

            {/* Glucose Chart */}
            <View style={{ marginVertical: 20 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: VintageColors.primaryText,
                  marginBottom: 10,
                  textAlign: "center",
                }}
              >
                Glucose Chart
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={{ paddingRight: 20 }}
              >
                <View style={{ padding: 10 }}>
                  <Svg
                    width={chartWidth}
                    height={280}
                    style={{
                      backgroundColor: VintageColors.cardBackground,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: VintageColors.border,
                    }}
                  >
                    {/* Y-axis */}
                    <Line
                      x1="50"
                      y1="20"
                      x2="50"
                      y2="240"
                      stroke={VintageColors.border}
                      strokeWidth="1"
                    />

                    {/* X-axis */}
                    <Line
                      x1="50"
                      y1="240"
                      x2={chartWidth - 30}
                      y2="240"
                      stroke={VintageColors.border}
                      strokeWidth="1"
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
                          240 - ((value - glucoseRange.min) / range) * 200;
                        return (
                          <React.Fragment key={value}>
                            <SvgText
                              x="40"
                              y={y + 4}
                              fontSize="12"
                              fill={VintageColors.secondaryText}
                              textAnchor="end"
                            >
                              {value}
                            </SvgText>
                            <Line
                              x1="48"
                              y1={y}
                              x2="50"
                              y2={y}
                              stroke={VintageColors.border}
                              strokeWidth="1"
                            />
                          </React.Fragment>
                        );
                      });
                    })()}

                    {/* Target range lines */}
                    <Line
                      x1="50"
                      y1={
                        240 -
                        ((70 - glucoseRange.min) /
                          (glucoseRange.max - glucoseRange.min)) *
                          200
                      }
                      x2={chartWidth - 30}
                      y2={
                        240 -
                        ((70 - glucoseRange.min) /
                          (glucoseRange.max - glucoseRange.min)) *
                          200
                      }
                      stroke="#FF6B6B"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                      opacity={0.6}
                    />
                    <Line
                      x1="50"
                      y1={
                        240 -
                        ((180 - glucoseRange.min) /
                          (glucoseRange.max - glucoseRange.min)) *
                          200
                      }
                      x2={chartWidth - 30}
                      y2={
                        240 -
                        ((180 - glucoseRange.min) /
                          (glucoseRange.max - glucoseRange.min)) *
                          200
                      }
                      stroke="#4ECDC4"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                      opacity={0.6}
                    />

                    {/* Draw glucose line */}
                    {filteredEntries.map((entry, index) => {
                      if (index === 0) return null;
                      const prevEntry = filteredEntries[index - 1];

                      // Dynamic spacing based on chart width
                      const spacing = 15; // Minimum spacing
                      const x1 = 50 + (index - 1) * spacing;
                      const x2 = 50 + index * spacing;

                      const y1 =
                        240 -
                        ((prevEntry.sgv - glucoseRange.min) /
                          (glucoseRange.max - glucoseRange.min)) *
                          200;
                      const y2 =
                        240 -
                        ((entry.sgv - glucoseRange.min) /
                          (glucoseRange.max - glucoseRange.min)) *
                          200;

                      return (
                        <Line
                          key={`line-${entry.date}`}
                          x1={x1}
                          y1={Math.max(20, Math.min(240, y1))}
                          x2={x2}
                          y2={Math.max(20, Math.min(240, y2))}
                          stroke={getGlucoseColor(entry.sgv)}
                          strokeWidth="2"
                        />
                      );
                    })}

                    {/* Draw data points - show fewer points if too many */}
                    {filteredEntries.map((entry, index) => {
                      // Only show every 5th point if we have more than 100 points
                      if (filteredEntries.length > 100 && index % 5 !== 0)
                        return null;

                      const spacing = 15;
                      const x = 50 + index * spacing;
                      const y =
                        240 -
                        ((entry.sgv - glucoseRange.min) /
                          (glucoseRange.max - glucoseRange.min)) *
                          200;

                      return (
                        <Circle
                          key={`point-${entry.date}`}
                          cx={x}
                          cy={Math.max(20, Math.min(240, y))}
                          r="2"
                          fill={getGlucoseColor(entry.sgv)}
                        />
                      );
                    })}

                    {/* Time labels - show fewer if too many */}
                    {filteredEntries.length > 0 &&
                      (() => {
                        const maxLabels = 8;
                        const step = Math.max(
                          1,
                          Math.floor(filteredEntries.length / maxLabels)
                        );
                        const spacing = 15;

                        return filteredEntries
                          .filter((_, index) => index % step === 0)
                          .map((entry, labelIndex) => {
                            const x = 50 + labelIndex * step * spacing;
                            return (
                              <React.Fragment key={`time-${entry.date}`}>
                                <SvgText
                                  x={x}
                                  y="260"
                                  fontSize="10"
                                  fill={VintageColors.secondaryText}
                                  textAnchor="middle"
                                >
                                  {formatTime(new Date(entry.date))}
                                </SvgText>
                                <Line
                                  x1={x}
                                  y1="240"
                                  x2={x}
                                  y2="245"
                                  stroke={VintageColors.border}
                                  strokeWidth="1"
                                />
                              </React.Fragment>
                            );
                          });
                      })()}
                  </Svg>
                </View>
              </ScrollView>
            </View>

            {/* Events List */}
            {filteredEvents.length > 0 && (
              <View style={{ marginBottom: 40 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: VintageColors.primaryText,
                    marginBottom: 10,
                  }}
                >
                  Events
                </Text>
                {filteredEvents.map((event) => (
                  <View
                    key={event._id}
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      padding: 12,
                      marginBottom: 8,
                      backgroundColor: VintageColors.cardBackground,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: VintageColors.border,
                    }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor:
                          event.type === "meal"
                            ? Colors.journal.food
                            : event.type === "activity"
                            ? Colors.journal.sports
                            : Colors.journal.other,
                        marginRight: 12,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 12 }}>
                        {event.type === "meal"
                          ? "🍽️"
                          : event.type === "activity"
                          ? "🏃"
                          : "💊"}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontWeight: "600",
                          color: VintageColors.primaryText,
                          fontSize: 14,
                        }}
                      >
                        {event.eventType || event.type}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: VintageColors.secondaryText,
                          marginTop: 2,
                        }}
                      >
                        {formatTime(new Date(event.created_at))}
                      </Text>

                      {event.carbs && (
                        <Text
                          style={{
                            fontSize: 12,
                            color: VintageColors.secondaryText,
                            marginTop: 4,
                          }}
                        >
                          Carbs: {event.carbs}g
                        </Text>
                      )}
                      {event.duration && (
                        <Text
                          style={{
                            fontSize: 12,
                            color: VintageColors.secondaryText,
                            marginTop: 4,
                          }}
                        >
                          Duration: {event.duration} mins
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Logout Button */}
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                backgroundColor: "#FF6B6B",
                padding: 12,
                borderRadius: 8,
                marginTop: 20,
              }}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                Logout
              </Text>
            </TouchableOpacity>
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
