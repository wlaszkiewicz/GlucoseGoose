import React, { useRef, useMemo, useEffect } from "react";
import {
  View,
  Text,
  Dimensions,
  Animated,
  TouchableOpacity,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Svg, { Line, Circle, Text as SvgText } from "react-native-svg";
import { VintageStylesHome } from "../../themes/vintage/styles_vintage_home";
import { VintageColors } from "../../themes/vintage/colors_vintage";
import { Ionicons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { Platform } from "react-native";
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

export const GlucoseChart: React.FC<GlucoseChartProps> = ({
  entries,
  events,
  timeFilter,
  onEventPress,
}) => {
  const chartScrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { width: screenWidth } = Dimensions.get("window");

  // Calculate chart dimensions and data
  const glucoseRange = useMemo(() => calculateGlucoseRange(entries), [entries]);

  const chartWidth = useMemo(() => {
    if (entries.length === 0) return screenWidth * 1.5;

    const spacing = 35;
    const widthFromEntries = entries.length * spacing + 100;
    const minWidth = screenWidth * 1.5;

    return Math.max(minWidth, widthFromEntries);
  }, [entries, screenWidth]);

  const eventPositions = useMemo(() => {
    if (entries.length === 0 || events.length === 0) return [];

    const positions = [];
    const spacing = 35;

    for (const event of events) {
      const eventTime = new Date(event.created_at).getTime();

      let closestIndex = 0;
      let minDiff = Math.abs(entries[0].date - eventTime);

      for (let i = 1; i < entries.length; i++) {
        const diff = Math.abs(entries[i].date - eventTime);
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
  }, [entries, events]);

  const yAxisLabels = useMemo(() => {
    const range = glucoseRange.max - glucoseRange.min;
    const step = Math.max(20, Math.round(range / 5));
    const labels = [];

    for (let val = glucoseRange.min; val <= glucoseRange.max; val += step) {
      labels.push(Math.round(val));
    }

    return labels;
  }, [glucoseRange]);

  // Scroll to end when data changes
  useEffect(() => {
    if (entries.length > 0 && chartScrollRef.current) {
      setTimeout(() => {
        chartScrollRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [entries.length, timeFilter]);

  const renderEventIcon = (event: any, adjustedX: number) => {
    const iconName =
      event.type === "meal"
        ? getMealIcon(event.eventType)
        : event.type === "activity"
        ? getActivityIcon(event.eventType)
        : "medical";

    return (
      <Animated.View
        key={`event-button-${event._id}`}
        style={{
          position: "absolute",
          left: adjustedX + 50,
          top: 75,
          width: 32,
          height: 32,
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          backgroundColor: getEventColor(event.type, event.eventType),
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
          overflow: "visible",
        }}
      >
        <TouchableOpacity
          onPress={() => onEventPress(event)}
          style={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
          activeOpacity={0.7}
        >
          <Ionicons name={iconName as any} size={18} color="white" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={VintageStylesHome.chartContainer}>
      <View style={VintageStylesHome.sectionTitle}>
        {
          <Feather
            name="activity"
            size={22}
            color={VintageColors.primaryText}
            style={{ marginRight: 8 }}
          />
        }
        <Text style={VintageStylesHome.chartTitle}>Glucose Chart</Text>
      </View>

      <View style={{ height: 300, position: "relative" }}>
        {/* Y-axis labels */}
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 40,
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
                  top: y - 10,
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
          style={{
            height: 280,
            marginLeft: 50,
          }}
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
            viewBox={`0 0 ${chartWidth} 260`}
          >
            {/* Y-axis line */}
            <Line
              x1="10"
              y1="20"
              x2="10"
              y2="220"
              stroke="#D2B48C"
              strokeWidth="1.5"
            />

            {/* X-axis line */}
            <Line
              x1="10"
              y1="220"
              x2={chartWidth - 40}
              y2="220"
              stroke="#D2B48C"
              strokeWidth="1.5"
            />

            {/* Glucose range lines */}
            <Line
              x1="10"
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
              x1="10"
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
            {entries.map((entry, index) => {
              if (index === 0) return null;
              const prevEntry = entries[index - 1];

              const spacing = 35;
              const x1 = 10 + (index - 1) * spacing;
              const x2 = 10 + index * spacing;

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
            {entries.map((entry, index) => {
              const spacing = 35;
              const x = 10 + index * spacing;
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

            {/* Event vertical lines */}
            {eventPositions.map((event) => {
              const eventColor = getEventColor(event.type, event.eventType);
              const adjustedX = event.x - 50;

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

        {/* Event icons */}
        {eventPositions.map((event) => {
          const adjustedX = event.x - 50 - 16;
          return renderEventIcon(event, adjustedX);
        })}
      </View>

      {/* Chart hint for events */}
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
          <Ionicons
            name="information-circle-outline"
            size={14}
            color="#8B7355"
          />
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
  );
};
