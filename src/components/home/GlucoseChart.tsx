import React, { useRef, useMemo, useEffect } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import Svg, { Line, Circle, Text as SvgText, Rect } from "react-native-svg";
import { Feather, Ionicons } from "@expo/vector-icons";
import { VintageStylesHome } from "../../themes/vintage/styles_vintage_home";
import { VintageColors } from "../../themes/vintage/colors_vintage";
import {
  getGlucoseColor,
  getEventColor,
  formatTimeShort,
  calculateGlucoseRange,
  getMealIcon,
  getActivityIcon,
} from "../../utils/chartUtils";

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
};

export const GlucoseChart: React.FC<GlucoseChartProps> = ({
  entries,
  events,
  timeFilter,
  onEventPress,
}) => {
  const chartScrollRef = useRef<ScrollView>(null);
  const { width: screenWidth } = Dimensions.get("window");

  const getSpacingForTimeFilter = () => {
    switch (timeFilter) {
      case "2h":
        return Platform.select({ ios: 25, default: 35 });
      case "12h":
        return Platform.select({ ios: 20, default: 30 });
      case "24h":
        return Platform.select({ ios: 15, default: 25 });
      default:
        return Platform.select({ ios: 20, default: 35 });
    }
  };

  const displayEntries = useMemo(() => {
    if (Platform.OS !== "ios") return entries;

    const spacing = getSpacingForTimeFilter();
    const maxPoints = Math.floor(4096 / spacing);

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

  const eventPositions = useMemo(() => {
    if (displayEntries.length === 0 || events.length === 0) return [];

    const positions = [];

    for (const event of events) {
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
  }, [displayEntries, events, pointSpacing]);

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
    const lines = [];

    if (
      GLUCOSE_RANGES.LOW >= glucoseRange.min - 20 &&
      GLUCOSE_RANGES.LOW <= glucoseRange.max + 20
    ) {
      lines.push({
        value: GLUCOSE_RANGES.LOW,
        color: "#FF6B6B",
        label: `Low`,
      });
    }

    if (
      GLUCOSE_RANGES.HIGH >= glucoseRange.min - 20 &&
      GLUCOSE_RANGES.HIGH <= glucoseRange.max + 20
    ) {
      lines.push({
        value: GLUCOSE_RANGES.HIGH,
        color: "#4ECDC4",
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

    return lines;
  }, [glucoseRange]);

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

  // Scroll to end
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

  return (
    <View style={[VintageStylesHome.chartContainer, { marginTop: 8 }]}>
      <View style={VintageStylesHome.sectionTitle}>
        <Feather
          name="activity"
          size={22}
          color={VintageColors.primaryText}
          style={{ marginRight: 8 }}
        />
        <Text style={VintageStylesHome.chartTitle}>Glucose Chart</Text>
        {Platform.OS === "ios" && displayEntries.length < entries.length && (
          <Text style={{ fontSize: 10, color: "#8B7355", marginLeft: 8 }}>
            ({displayEntries.length} of {entries.length} points)
          </Text>
        )}
      </View>

      {/* MAIN CHART CONTAINER WITH CARD BACKGROUND */}
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
        {/* STATIC Y-AXIS LABELS*/}
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

        {/* STATIC Y-AXIS VERTICAL LINE */}
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

        {/* HORIZONTAL SCROLLVIEW FOR CHART */}
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
            {/* CARD BACKGROUND EXTENSION */}
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
            {displayEntries.map((entry, index) => {
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

                  {/* TIME LABELS */}
                  {index % 4 === 0 ||
                  (index === displayEntries.length - 1 && index > 0) ? (
                    <>
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
                    </>
                  ) : null}
                </React.Fragment>
              );
            })}

            {/* EVENT VERTICAL LINES */}
            {eventPositions.map((event) => {
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

          {/* EVENT ICONS */}
          {eventPositions.map((event) => {
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
                    ...Platform.select({
                      ios: {
                        shadowOpacity: 0.4,
                        shadowRadius: 4,
                      },
                    }),
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name={iconName as any} size={18} color="white" />
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 8,
          paddingHorizontal: 16,
          flexWrap: "wrap",
        }}
      >
        {referenceLines.map((line, index) => (
          <View
            key={`ref-legend-${index}`}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 12,
              marginBottom: 4,
            }}
          >
            <View
              style={{
                width: 12,
                height: 3,
                backgroundColor: line.color,
                marginRight: 4,
                borderRadius: 1.5,
              }}
            />
            <Text style={{ fontSize: 10, color: "#8B7355", fontWeight: "500" }}>
              {line.label}
            </Text>
          </View>
        ))}
      </View>

      {/* CHART HINT */}
      {events.length > 0 && (
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

      {/* iOS OPTIMIZATION INFO */}
      {Platform.OS === "ios" && displayEntries.length < entries.length && (
        <View
          style={{
            marginTop: 6,
            padding: 6,
            backgroundColor: "rgba(139, 115, 85, 0.05)",
            borderRadius: 4,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 9, color: "#8B7355", fontStyle: "italic" }}>
            Showing {displayEntries.length} of {entries.length} points for
            better performance
          </Text>
        </View>
      )}
    </View>
  );
};
