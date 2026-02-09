// components/trends/HourlyTrendsChart.tsx
import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import Svg, { Line, Circle, Text as SvgText, Rect } from "react-native-svg";
import { Feather } from "@expo/vector-icons";
import { VintageColors } from "../../themes/vintage/colors";

interface HourlyTrendsChartProps {
  hourlyAverages: Record<number, number>;
  timeRange: string;
}

export const HourlyTrendsChart: React.FC<HourlyTrendsChartProps> = ({
  hourlyAverages,
  timeRange,
}) => {
  if (Object.keys(hourlyAverages).length === 0) {
    return null;
  }

  const { width } = Dimensions.get("window");
  const chartWidth = width - 64;
  const chartHeight = 180;
  const padding = 20;
  const pointSpacing = (chartWidth - 40) / 23;

  // Convert hourly averages to array
  const dataPoints = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    value: hourlyAverages[hour] || null,
  })).filter((point) => point.value !== null);

  if (dataPoints.length < 2) return null;

  // Calculate Y scale
  const values = dataPoints.map((p) => p.value!);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 100;

  const scaleY = (value: number) => {
    return chartHeight - ((value - minValue) / range) * (chartHeight - 40);
  };

  // Format hour labels
  const formatHour = (hour: number) => {
    if (hour === 0) return "12AM";
    if (hour === 12) return "12PM";
    if (hour < 12) return `${hour}AM`;
    return `${hour - 12}PM`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="clock" size={18} color={VintageColors.primaryText} />
        <Text style={styles.title}>Hourly Patterns ({timeRange})</Text>
      </View>

      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight + 40}>
          {/* Target range background */}
          <Rect
            x="0"
            y={scaleY(180)}
            width={chartWidth}
            height={scaleY(70) - scaleY(180)}
            fill="rgba(76, 175, 80, 0.1)"
          />

          {/* Grid lines */}
          {[0, 6, 12, 18, 23].map((hour) => (
            <Line
              key={`grid-${hour}`}
              x1={padding + hour * pointSpacing}
              y1="0"
              x2={padding + hour * pointSpacing}
              y2={chartHeight}
              stroke={VintageColors.border}
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          ))}

          {/* Glucose line */}
          {dataPoints.map((point, index) => {
            if (index === 0) return null;
            const prevPoint = dataPoints[index - 1];

            const x1 = padding + prevPoint.hour * pointSpacing;
            const x2 = padding + point.hour * pointSpacing;
            const y1 = scaleY(prevPoint.value!);
            const y2 = scaleY(point.value!);

            return (
              <Line
                key={`line-${prevPoint.hour}-${point.hour}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={VintageColors.formAccent3}
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}

          {/* Data points */}
          {dataPoints.map((point) => {
            const x = padding + point.hour * pointSpacing;
            const y = scaleY(point.value!);

            return (
              <React.Fragment key={`point-${point.hour}`}>
                <Circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#FFFFFF"
                  stroke={VintageColors.formAccent3}
                  strokeWidth="2"
                />
                <Circle cx={x} cy={y} r="2" fill={VintageColors.formAccent3} />
              </React.Fragment>
            );
          })}

          {/* Hour labels */}
          {[0, 6, 12, 18, 23].map((hour) => {
            const x = padding + hour * pointSpacing;

            return (
              <React.Fragment key={`label-${hour}`}>
                <Line
                  x1={x}
                  y1={chartHeight}
                  x2={x}
                  y2={chartHeight + 4}
                  stroke={VintageColors.secondaryText}
                  strokeWidth="1"
                />
                <SvgText
                  x={x}
                  y={chartHeight + 16}
                  fontSize="10"
                  fill={VintageColors.secondaryText}
                  textAnchor="middle"
                >
                  {formatHour(hour)}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Value labels for min/max */}
          {dataPoints.map((point) => {
            if (point.value === maxValue || point.value === minValue) {
              const x = padding + point.hour * pointSpacing;
              const y = scaleY(point.value!);

              return (
                <SvgText
                  key={`value-${point.hour}`}
                  x={x}
                  y={y - 8}
                  fontSize="10"
                  fill={VintageColors.primaryText}
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {point.value}
                </SvgText>
              );
            }
            return null;
          })}
        </Svg>

        {/* Period labels */}
        <View style={styles.periodLabels}>
          <Text style={styles.periodLabel}>Night</Text>
          <Text style={styles.periodLabel}>Morning</Text>
          <Text style={styles.periodLabel}>Afternoon</Text>
          <Text style={styles.periodLabel}>Evening</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginLeft: 8,
  },
  chartContainer: {
    position: "relative",
  },
  periodLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 10,
  },
  periodLabel: {
    fontSize: 10,
    color: VintageColors.secondaryText,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
