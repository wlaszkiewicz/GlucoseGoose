import React, { useRef, useMemo, useEffect, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import Svg, { Line, Circle, Text as SvgText, Rect } from "react-native-svg";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { VintageStylesHome } from "../../themes/vintage/styles_vintage_home";
import { VintageColors } from "../../themes/vintage/colors_vintage";
import {
  getGlucoseColor,
  getEventColor,
  formatTimeShort,
  calculateGlucoseRange,
  getMealIcon,
  getActivityIcon,
  getInsulinIcon,
  getInsulinColor,
  isSpecialEvent,
  getSpecialEventIcon,
} from "../../utils/chartUtils";
import { ChartSettingsModal } from "./ChartSettingsModal";
import { useChartSettings } from "../../hooks/useChartSettings";
import { NightscoutEntry } from "../../types/nightscout";
import { InteractiveLegend } from "./InteractiveLegend";

interface GlucoseChartProps {
  entries: any[];
  events: any[];
  timeFilter: "2h" | "12h" | "24h";
  onEventPress: (event: any) => void;
}

const GLUCOSE_RANGES = {
  LOW: 80,
  HIGH: 180,
  NORMAL_LOW: 80,
  NORMAL_HIGH: 180,
  VERY_HIGH: 250,
  VERY_LOW: 50,
};

const MAX_IOS = 4096;

export const GlucoseChart: React.FC<GlucoseChartProps> = ({
  entries,
  events,
  timeFilter,
  onEventPress,
}) => {
  const chartScrollRef = useRef<ScrollView>(null);
  const { width: screenWidth } = Dimensions.get("window");
  const [showSettings, setShowSettings] = useState(false);

  const { settings, updateSettings, shouldShowEvent } = useChartSettings();

  const getSpacingForTimeFilter = () => {
    switch (timeFilter) {
      case "2h":
        return Platform.select({ ios: 25, default: 25 });
      case "12h":
        return Platform.select({ ios: 20, default: 20 });
      case "24h":
        return Platform.select({ ios: 15, default: 15 });
      default:
        return Platform.select({ ios: 20, default: 20 });
    }
  };

  const displayEntries = useMemo(() => {
    if (Platform.OS !== "ios") return entries;

    const spacing = getSpacingForTimeFilter();
    const maxPoints = Math.floor(MAX_IOS / spacing);

    if (entries.length > maxPoints) {
      const reductionFactor = Math.ceil(entries.length / maxPoints);
      const reduced: any[] = [];

      reduced.push(entries[0]);

      for (let i = reductionFactor; i < entries.length; i += reductionFactor) {
        if (i < entries.length - 1) {
          reduced.push(entries[i]);
        }
      }

      reduced.push(entries[entries.length - 1]);

      return reduced;
    }

    return entries;
  }, [entries, timeFilter]);

  const glucoseRange = useMemo(
    () => calculateGlucoseRange(displayEntries),
    [displayEntries]
  );

  const chartWidth = useMemo(() => {
    if (displayEntries.length === 0) return screenWidth * 1.5;

    const spacing = getSpacingForTimeFilter();
    const calculatedWidth = 30 + displayEntries.length * spacing + 40;
    const minWidth = screenWidth * 1.5;

    const maxSafeWidth = Platform.select({
      ios: 4096,
      default: 10000,
    });

    return Math.min(Math.max(minWidth, calculatedWidth), maxSafeWidth);
  }, [displayEntries, screenWidth, timeFilter]);

  const pointSpacing = useMemo(() => {
    if (displayEntries.length <= 1) return getSpacingForTimeFilter();
    return (chartWidth - 30 - 40) / displayEntries.length;
  }, [chartWidth, displayEntries.length, timeFilter]);

  const filteredEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    return events.filter((event) => shouldShowEvent(event));
  }, [events, settings]);

  const eventPositions = useMemo(() => {
    if (displayEntries.length === 0 || filteredEvents.length === 0) return [];

    const positions = [];

    for (const event of filteredEvents) {
      const eventTime = new Date(event.created_at).getTime();

      let closestIndex = 0;
      let minDiff = Math.abs(displayEntries[0].date - eventTime);

      for (let i = 1; i < displayEntries.length; i++) {
        const diff = Math.abs(displayEntries[i].date - eventTime);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = i;
        }
      }

      const svgX = 30 + closestIndex * pointSpacing;

      positions.push({
        ...event,
        svgX,
        chartIndex: closestIndex,
        displayTime: formatTimeShort(new Date(event.created_at)),
        iconX: svgX - 16,
      });
    }

    return positions;
  }, [displayEntries, filteredEvents, pointSpacing]);

  const yAxisLabels = useMemo(() => {
    const keyValues = [40, GLUCOSE_RANGES.LOW, 130, GLUCOSE_RANGES.HIGH, 250];

    const labels = new Set<number>();

    keyValues.forEach((value) => {
      const paddedMin = Math.min(glucoseRange.min, GLUCOSE_RANGES.LOW - 20);
      const paddedMax = Math.max(glucoseRange.max, GLUCOSE_RANGES.HIGH + 20);

      if (value >= paddedMin && value <= paddedMax) {
        labels.add(value);
      }
    });

    const range = glucoseRange.max - glucoseRange.min;
    if (labels.size < 3 && range > 0) {
      const step = Math.max(10, Math.round(range / 4));

      let start = Math.floor(glucoseRange.min / 10) * 10;
      start = Math.max(40, start);

      let current = start;
      while (current <= glucoseRange.max + step && labels.size < 5) {
        labels.add(current);
        current += step;
      }
    }

    return Array.from(labels)
      .sort((a, b) => a - b)
      .filter(
        (value, index, array) => index === 0 || value - array[index - 1] >= 15
      );
  }, [glucoseRange]);

  const referenceLines = useMemo(() => {
    if (!settings.showReferenceLines) return [];

    const lines = [];

    if (
      GLUCOSE_RANGES.VERY_LOW >= glucoseRange.min - 20 &&
      GLUCOSE_RANGES.VERY_LOW <= glucoseRange.max + 20
    ) {
      lines.push({
        value: GLUCOSE_RANGES.VERY_LOW,
        color: "#F46969FF",
        label: `Very Low`,
      });
    }

    if (
      GLUCOSE_RANGES.LOW >= glucoseRange.min - 20 &&
      GLUCOSE_RANGES.LOW <= glucoseRange.max + 20
    ) {
      lines.push({
        value: GLUCOSE_RANGES.LOW,
        color: "#D4995AFF",
        label: `Low`,
      });
    }

    if (
      GLUCOSE_RANGES.HIGH >= glucoseRange.min - 20 &&
      GLUCOSE_RANGES.HIGH <= glucoseRange.max + 20
    ) {
      lines.push({
        value: GLUCOSE_RANGES.HIGH,
        color: "#CD4E76FF",
        label: `High`,
      });
    }

    const targetValue = Math.round(
      (GLUCOSE_RANGES.NORMAL_LOW + GLUCOSE_RANGES.NORMAL_HIGH) / 2
    );
    if (
      targetValue >= glucoseRange.min - 20 &&
      targetValue <= glucoseRange.max + 20
    ) {
      lines.push({
        value: targetValue,
        color: "#81C784",
        label: `Target`,
      });
    }

    if (
      GLUCOSE_RANGES.VERY_HIGH >= glucoseRange.min - 20 &&
      GLUCOSE_RANGES.VERY_HIGH <= glucoseRange.max + 20
    ) {
      lines.push({
        value: GLUCOSE_RANGES.VERY_HIGH,
        color: "#CA2A5DFF",
        label: `Very High`,
      });
    }

    return lines;
  }, [glucoseRange, settings.showReferenceLines]);

  const calculateY = (glucose: number) => {
    const range = glucoseRange.max - glucoseRange.min;
    if (range === 0) return 160;

    const normalized = (glucose - glucoseRange.min) / range;
    return 40 + (1 - normalized) * 240;
  };

  const getEventIcon = (event: any) => {
    if (event.type === "meal") {
      return getMealIcon(event.eventType);
    } else if (event.type === "activity") {
      return getActivityIcon(event.eventType);
    }
    return "medical";
  };

  useEffect(() => {
    if (displayEntries.length > 0 && chartScrollRef.current) {
      setTimeout(() => {
        chartScrollRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [displayEntries.length, timeFilter]);

  if (displayEntries.length === 0) {
    return (
      <View style={VintageStylesHome.chartContainer}>
        <Text
          style={{ textAlign: "center", color: VintageColors.secondaryText }}
        >
          No glucose data available for the selected time range.
        </Text>
      </View>
    );
  }

  const regularEvents = useMemo(() => {
    return eventPositions.filter(
      (event: NightscoutEntry) =>
        (event.type === "meal" || event.type === "activity") &&
        event.eventType !== "Meal Bolus"
    );
  }, [eventPositions]);

  const insulinEvents = useMemo(() => {
    return eventPositions.filter(
      (event: NightscoutEntry) =>
        event.eventType?.includes("Bolus") || event.eventType === "Temp Basal"
    );
  }, [eventPositions]);

  const specialEvents = useMemo(() => {
    return eventPositions.filter(
      (event) =>
        isSpecialEvent(event) &&
        !event.eventType?.includes("Bolus") &&
        event.eventType !== "Temp Basal" &&
        event.type !== "meal" &&
        event.type !== "activity"
    );
  }, [eventPositions]);

  const insulinPositions = useMemo(() => {
    if (displayEntries.length === 0 || insulinEvents.length === 0) return [];

    const positions = [];

    for (const event of insulinEvents) {
      const eventTime = new Date(event.created_at).getTime();

      let closestIndex = 0;
      let minDiff = Math.abs(displayEntries[0].date - eventTime);

      for (let i = 1; i < displayEntries.length; i++) {
        const diff = Math.abs(displayEntries[i].date - eventTime);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = i;
        }
      }

      const svgX = 30 + closestIndex * pointSpacing;

      let yPosition = 80;

      const entryAtIndex = displayEntries[closestIndex];
      if (entryAtIndex) {
        const glucoseY = calculateY(entryAtIndex.sgv);
        yPosition = Math.max(60, Math.min(240, glucoseY - 20));
      }

      positions.push({
        ...event,
        svgX,
        chartIndex: closestIndex,
        displayTime: formatTimeShort(new Date(event.created_at)),
        iconX: svgX - 14,
        iconY: yPosition,
      });
    }

    return positions;
  }, [displayEntries, insulinEvents, pointSpacing]);

  const specialEventPositions = useMemo(() => {
    if (displayEntries.length === 0 || specialEvents.length === 0) return [];

    const positions = [];

    for (const event of specialEvents) {
      const eventTime = new Date(event.created_at).getTime();

      let closestIndex = 0;
      let minDiff = Math.abs(displayEntries[0].date - eventTime);

      for (let i = 1; i < displayEntries.length; i++) {
        const diff = Math.abs(displayEntries[i].date - eventTime);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = i;
        }
      }

      const svgX = 30 + closestIndex * pointSpacing;

      let yPosition = 35;
      const entryAtIndex = displayEntries[closestIndex];
      if (entryAtIndex) {
        const glucoseY = calculateY(entryAtIndex.sgv);
        yPosition = Math.max(60, Math.min(240, glucoseY - 20)) + 20;
      }

      positions.push({
        ...event,
        svgX,
        chartIndex: closestIndex,
        displayTime: formatTimeShort(new Date(event.created_at)),
        iconX: svgX - 12,
        iconY: yPosition,
      });
    }

    return positions;
  }, [displayEntries, specialEvents, pointSpacing]);

  const SettingsButton = () => (
    <TouchableOpacity
      onPress={() => setShowSettings(true)}
      style={styles.settingsButton}
    >
      <Feather name="sliders" size={20} color={VintageColors.primaryText} />
    </TouchableOpacity>
  );

  return (
    <>
      <View style={[VintageStylesHome.chartContainer, { marginTop: 8 }]}>
        <View style={styles.chartHeader}>
          <View style={VintageStylesHome.sectionTitle}>
            <Feather
              name="activity"
              size={22}
              color={VintageColors.primaryText}
              style={{ marginRight: 8 }}
            />
            <Text style={VintageStylesHome.chartTitle}>Glucose Chart</Text>
            {Platform.OS === "ios" &&
              displayEntries.length < entries.length && (
                <Text style={{ fontSize: 10, color: "#8B7355", marginLeft: 8 }}>
                  ({displayEntries.length} of {entries.length} points)
                </Text>
              )}
          </View>
          <SettingsButton />
        </View>

        {/* MAIN CHART CONTAINER */}
        <View
          style={[
            VintageStylesHome.chartSvgContainer,
            {
              height: 340,
              position: "relative",
              paddingLeft: 0,
              overflow: "hidden",
            },
          ]}
        >
          {/* Y-AXIS LABELS */}
          <View
            style={{
              position: "absolute",
              left: 10,
              top: 0,
              bottom: 0,
              width: 40,
              zIndex: 20,
              backgroundColor: "transparent",
            }}
          >
            {yAxisLabels.map((value) => {
              const y = calculateY(value);
              return (
                <View
                  key={`y-label-${value}`}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: y - 10,
                    width: 40,
                    alignItems: "flex-start",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#8B7355",
                      fontWeight: "600",
                      backgroundColor: VintageColors.cardBackground,
                      paddingHorizontal: 4,
                      paddingVertical: 2,
                      borderRadius: 3,
                    }}
                  >
                    {value}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Y-AXIS LINE */}
          <View
            style={{
              position: "absolute",
              left: 40,
              top: 40,
              bottom: 60,
              width: 1.5,
              backgroundColor: "#D2B48C",
              zIndex: 15,
            }}
          />

          {/* HORIZONTAL SCROLLVIEW */}
          <ScrollView
            horizontal
            ref={chartScrollRef}
            showsHorizontalScrollIndicator={true}
            style={{
              height: 340,
              marginLeft: 40,
            }}
            contentContainerStyle={{
              paddingRight: 40,
              width: chartWidth,
            }}
            scrollEventThrottle={16}
          >
            {/* SVG CHART */}
            <Svg width={chartWidth} height={320}>
              {/* BACKGROUND */}
              <Rect
                x="0"
                y="0"
                width={chartWidth}
                height="320"
                fill={VintageColors.cardBackground}
              />

              {/* X-AXIS LINE */}
              <Line
                x1="0"
                y1="280"
                x2={chartWidth - 30}
                y2="280"
                stroke="#D2B48C"
                strokeWidth="1.5"
              />

              {/* REFERENCE LINES */}
              {referenceLines.map((line, index) => {
                const y = calculateY(line.value);
                return (
                  <Line
                    key={`ref-line-${index}`}
                    x1="0"
                    y1={y}
                    x2={chartWidth - 30}
                    y2={y}
                    stroke={line.color}
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    opacity={0.5}
                  />
                );
              })}

              {/* GLUCOSE LINES */}
              {displayEntries.map((entry, index) => {
                if (index === 0) return null;
                const prevEntry = displayEntries[index - 1];

                const x1 = 30 + (index - 1) * pointSpacing;
                const x2 = 30 + index * pointSpacing;
                const y1 = calculateY(prevEntry.sgv);
                const y2 = calculateY(entry.sgv);

                if (isNaN(y1) || isNaN(y2)) return null;

                return (
                  <Line
                    key={`line-${entry.date}-${index}`}
                    x1={x1}
                    y1={Math.max(40, Math.min(280, y1))}
                    x2={x2}
                    y2={Math.max(40, Math.min(280, y2))}
                    stroke={getGlucoseColor(entry.sgv)}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                );
              })}

              {/* GLUCOSE POINTS */}
              {settings.showGlucosePoints &&
                displayEntries.map((entry, index) => {
                  const x = 30 + index * pointSpacing;
                  const y = calculateY(entry.sgv);

                  if (isNaN(y)) return null;

                  return (
                    <React.Fragment key={`point-${entry.date}-${index}`}>
                      <Circle
                        cx={x}
                        cy={Math.max(40, Math.min(280, y))}
                        r="4"
                        fill={getGlucoseColor(entry.sgv)}
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                    </React.Fragment>
                  );
                })}

              {/* TIME LABELS */}
              {settings.showTimeLabels &&
                displayEntries.map((entry, index) => {
                  const x = 30 + index * pointSpacing;

                  if (
                    index % 4 === 0 ||
                    (index === displayEntries.length - 1 && index > 0)
                  ) {
                    return (
                      <React.Fragment key={`time-label-${index}`}>
                        <SvgText
                          x={x}
                          y="300"
                          fontSize="11"
                          fill="#8B7355"
                          textAnchor="middle"
                          fontWeight="500"
                        >
                          {formatTimeShort(new Date(entry.date))}
                        </SvgText>
                        <Line
                          x1={x}
                          y1="280"
                          x2={x}
                          y2="285"
                          stroke="#E0D6C9"
                          strokeWidth="2"
                        />
                      </React.Fragment>
                    );
                  }
                  return null;
                })}

              {/* EVENT VERTICAL LINES */}
              {regularEvents.map((event) => {
                const eventColor = getEventColor(event.type, event.eventType);
                const adjustedX = 30 + event.chartIndex * pointSpacing;

                return (
                  <React.Fragment key={`event-line-${event._id}`}>
                    <Line
                      x1={adjustedX}
                      y1="40"
                      x2={adjustedX}
                      y2="280"
                      stroke={eventColor}
                      strokeWidth="2"
                      strokeDasharray="3,3"
                      opacity={0.6}
                    />
                    <SvgText
                      x={adjustedX}
                      y="315"
                      fontSize="9"
                      fill={eventColor}
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      {event.displayTime}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>

            {/* REGULAR EVENT ICONS */}
            {regularEvents.map((event) => {
              const eventColor = getEventColor(event.type, event.eventType);
              const iconName = getEventIcon(event);
              const adjustedX = 30 + event.chartIndex * pointSpacing - 16;

              return (
                <View
                  key={`event-icon-container-${event._id}`}
                  style={{
                    position: "absolute",
                    left: adjustedX,
                    top: 105,
                    width: 32,
                    height: 32,
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 100,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => onEventPress(event)}
                    style={{
                      width: "100%",
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: eventColor,
                      borderRadius: 16,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 3,
                      elevation: 5,
                      borderWidth: 2,
                      borderColor: "#FFFFFF",
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={iconName as any} size={18} color="white" />
                  </TouchableOpacity>
                </View>
              );
            })}

            {/* SPECIAL EVENT ICONS */}
            {specialEventPositions.map((event) => {
              const eventColor = getEventColor(event.eventType);
              const iconName = getSpecialEventIcon(event.eventType);

              return (
                <TouchableOpacity
                  key={`special-icon-${event._id}`}
                  onPress={() => onEventPress(event)}
                  style={{
                    position: "absolute",
                    left: 30 + event.chartIndex * pointSpacing - 12,
                    top: event.iconY - 12,
                    width: 24,
                    height: 24,
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 105,
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={{
                      width: "100%",
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: eventColor,
                      borderRadius: 12,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 3,
                      elevation: 5,
                      borderWidth: 1.5,
                      borderColor: "#FFFFFF",
                    }}
                  >
                    <MaterialCommunityIcons
                      name={iconName as any}
                      size={12}
                      color="white"
                    />
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* INSULIN EVENT ICONS */}
            {insulinPositions.map((event) => {
              const eventColor = getInsulinColor(
                event.eventType,
                event.percent,
                event.insulin
              );
              const iconName = getInsulinIcon(event.eventType, event.insulin);
              const adjustedX = 30 + event.chartIndex * pointSpacing - 14;

              return (
                <TouchableOpacity
                  key={`insulin-icon-${event._id}`}
                  onPress={() => onEventPress(event)}
                  style={{
                    position: "absolute",
                    left: adjustedX,
                    top: event.iconY - 14,
                    width: 24,
                    height: 24,
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 110,
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={{
                      width: "100%",
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: eventColor,
                      borderRadius: 14,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.4,
                      shadowRadius: 3,
                      elevation: 6,
                      borderWidth: 2,
                      borderColor: "#FFFFFF",
                    }}
                  >
                    <Ionicons name={iconName as any} size={14} color="white" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* LEGEND */}
        <View style={styles.legendContainer}>
          <InteractiveLegend
            visibleEventTypes={{
              meals: settings.showMeals,
              activities: settings.showActivities,
              insulin: settings.showInsulin,
              tempBasals: settings.showTempBasals,
              targets: settings.showTargets,
              deviceEvents: settings.showDeviceEvents,
            }}
            chartEvents={filteredEvents}
          />
        </View>

        {/* HINT */}
        {filteredEvents.length > 0 && (
          <View style={styles.hintContainer}>
            <Feather name="info" size={14} color="#8B7355" />
            <Text style={styles.hintText}>
              Click on event icons for details
            </Text>
          </View>
        )}

        {/* iOS INFO */}
        {Platform.OS === "ios" && displayEntries.length < entries.length && (
          <View style={styles.iosInfo}>
            <Text style={styles.iosText}>
              Showing {displayEntries.length} of {entries.length} points for
              better performance
            </Text>
          </View>
        )}
      </View>

      {/* SETTINGS MODAL */}
      <ChartSettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={updateSettings}
      />
    </>
  );
};

const styles = StyleSheet.create({
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 10,
    color: "#8B7355",
    fontWeight: "500",
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(139, 115, 85, 0.1)",
    borderRadius: 8,
  },
  hintText: {
    fontSize: 12,
    color: "#8B7355",
    marginLeft: 6,
    fontStyle: "italic",
  },
  iosInfo: {
    marginTop: 6,
    padding: 6,
    backgroundColor: "rgba(139, 115, 85, 0.05)",
    borderRadius: 4,
    alignItems: "center",
  },
  iosText: {
    fontSize: 9,
    color: "#8B7355",
    fontStyle: "italic",
  },
});
