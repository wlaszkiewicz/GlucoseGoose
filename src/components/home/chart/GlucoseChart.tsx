import React, { useRef, useEffect, useState } from "react";
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
import { VintageStylesHome } from "../../../themes/vintage/styles_vintage_home";
import { VintageColors } from "../../../themes/vintage/colors";
import {
  getGlucoseColor,
  getEventColor,
  formatTimeShort,
  getEventIcon,
  getSpecialEventIcon,
  getInsulinIcon,
  getInsulinColor,
} from "../../../utils/chartUtils/chartUtils";
import { useChartSettings } from "../../../hooks/useChart/useChartSettings";
import { useChartData } from "../../../hooks/useChart/useChartData";
import { ChartSettingsModal } from "./ChartSettingsModal";
import { InteractiveLegend } from "./legend/InteractiveLegend";

interface GlucoseChartProps {
  entries: any[];
  events: any[];
  timeFilter: "2h" | "12h" | "24h";
  onEventPress: (event: any) => void;
}

export const GlucoseChart: React.FC<GlucoseChartProps> = ({
  entries,
  events,
  timeFilter,
  onEventPress,
}) => {
  const chartScrollRef = useRef<ScrollView>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { settings, updateSettings, shouldShowEvent } = useChartSettings();

  const {
    displayEntries,
    glucoseRange,
    chartWidth,
    pointSpacing,
    yAxisLabels,
    referenceLines,
    categorizedEvents,
    calculateY,
  } = useChartData({
    entries,
    events,
    timeFilter,
    shouldShowEvent,
    settings,
  });

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
        <View style={styles.mainChartContainer}>
          {/* Y-AXIS LABELS */}
          <View style={styles.yAxisLabelsContainer}>
            {yAxisLabels.map((value) => {
              const y = calculateY(value);
              return (
                <View
                  key={`y-label-${value}`}
                  style={[styles.yAxisLabel, { top: y - 10 }]}
                >
                  <Text style={styles.yAxisLabelText}>{value}</Text>
                </View>
              );
            })}
          </View>

          {/* Y-AXIS LINE */}
          <View style={styles.yAxisLine} />

          {/* HORIZONTAL SCROLLVIEW */}
          <ScrollView
            horizontal
            ref={chartScrollRef}
            showsHorizontalScrollIndicator={true}
            style={styles.chartScrollView}
            contentContainerStyle={{ paddingRight: 40, width: chartWidth }}
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
                    <Circle
                      key={`point-${entry.date}-${index}`}
                      cx={x}
                      cy={Math.max(40, Math.min(280, y))}
                      r="4"
                      fill={getGlucoseColor(entry.sgv)}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
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
              {categorizedEvents.regularEvents.map((event) => {
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
                      opacity={1}
                    />
                    <SvgText
                      x={adjustedX}
                      y="315"
                      fontSize="11"
                      fill={eventColor}
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      {event.displayTime}
                    </SvgText>
                  </React.Fragment>
                );
              })}
              {/* EVENT VERTICAL LINES */}
              {categorizedEvents.specialEvents.map((event) => {
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
                      opacity={1}
                    />
                  </React.Fragment>
                );
              })}
            </Svg>

            {/* REGULAR EVENT ICONS */}
            {categorizedEvents.regularEvents.map((event) => {
              const eventColor = getEventColor(event.type, event.eventType);
              const iconName = getEventIcon(event);
              const adjustedX = 30 + event.chartIndex * pointSpacing - 16;

              return (
                <View
                  key={`event-icon-container-${event._id}`}
                  style={[styles.eventIconContainer, { left: adjustedX }]}
                >
                  <TouchableOpacity
                    onPress={() => onEventPress(event)}
                    style={[
                      styles.eventIconButton,
                      { backgroundColor: eventColor },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={iconName as any} size={18} color="white" />
                  </TouchableOpacity>
                </View>
              );
            })}

            {/* SPECIAL EVENT ICONS */}
            {categorizedEvents.specialEvents.map((event) => {
              const eventColor = getEventColor(event.type, event.eventType);
              const iconName = getSpecialEventIcon(event.eventType ?? "");

              return (
                <TouchableOpacity
                  key={`special-icon-${event._id}`}
                  onPress={() => onEventPress(event)}
                  style={[
                    styles.specialEventIcon,
                    {
                      left: 30 + event.chartIndex * pointSpacing - 12,
                      top: (event.iconY ?? 0) - 12,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.specialEventIconButton,
                      { backgroundColor: eventColor },
                    ]}
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
            {categorizedEvents.insulinEvents.map((event) => {
              const eventColor = getInsulinColor(
                event.eventType ?? "",
                event.percent,
                event.insulin
              );
              const iconName = getInsulinIcon(
                event.eventType ?? "",
                event.insulin
              );
              const adjustedX = 30 + event.chartIndex * pointSpacing - 14;

              return (
                <TouchableOpacity
                  key={`insulin-icon-${event._id}`}
                  onPress={() => onEventPress(event)}
                  style={[
                    styles.insulinEventIcon,
                    { left: adjustedX, top: (event.iconY ?? 0) - 14 },
                  ]}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.insulinEventIconButton,
                      { backgroundColor: eventColor },
                    ]}
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
              notes: settings.showNotes,
              otherEvents: settings.showOtherEvents,
            }}
            chartEvents={events.filter(shouldShowEvent)}
          />
        </View>

        {/* HINT */}
        {events.filter(shouldShowEvent).length > 0 && (
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
  mainChartContainer: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 12,
    position: "relative",
    paddingLeft: 0,
    overflow: "hidden",
  },
  yAxisLabelsContainer: {
    position: "absolute",
    left: 10,
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: 20,
    backgroundColor: "transparent",
  },
  yAxisLabel: {
    position: "absolute",
    left: 0,
    width: 40,
    alignItems: "flex-start",
  },
  yAxisLabelText: {
    fontSize: 11,
    color: "#8B7355",
    fontWeight: "600",
    backgroundColor: VintageColors.cardBackground,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  yAxisLine: {
    position: "absolute",
    left: 40,
    top: 40,
    bottom: 60,
    width: 1.5,
    backgroundColor: "#D2B48C",
    zIndex: 15,
  },
  chartScrollView: {
    height: 340,
    marginLeft: 40,
  },
  eventIconContainer: {
    position: "absolute",
    top: 105,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  eventIconButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  specialEventIcon: {
    position: "absolute",
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 105,
  },
  specialEventIconButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  insulinEventIcon: {
    position: "absolute",
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 110,
  },
  insulinEventIconButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  legendContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 16,
    gap: 6,
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
