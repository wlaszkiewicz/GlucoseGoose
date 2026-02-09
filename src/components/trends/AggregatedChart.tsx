import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import Svg, { Rect, Line, Text as SvgText, G } from "react-native-svg";
import { Feather } from "@expo/vector-icons";
import { VintageColors } from "../../themes/vintage/colors";
import { AggregatedData } from "../../utils/trendCalculations";

interface AggregatedChartProps {
  data: AggregatedData[];
  timeRange: string;
}

export const AggregatedChart: React.FC<AggregatedChartProps> = ({
  data,
  timeRange,
}) => {
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Feather
            name="database"
            size={24}
            color={VintageColors.secondaryText}
          />
          <Text style={styles.emptyText}>
            No data available for this period
          </Text>
        </View>
      </View>
    );
  }

  const { width } = Dimensions.get("window");
  const chartWidth = width - 64;
  const barWidth = Math.min(24, (chartWidth - 40) / data.length);
  const padding = 20;

  const maxGlucose = Math.max(...data.map((d) => d.max));
  const minGlucose = Math.min(...data.map((d) => d.min));
  const chartHeight = 200;

  const scaleY = (value: number) => {
    const range = maxGlucose - minGlucose || 100;
    return chartHeight - ((value - minGlucose) / range) * (chartHeight - 40);
  };

  const formatDateLabel = (dateInput: Date | string) => {
    try {
      // Handle both Date objects and serialized date strings
      const date =
        typeof dateInput === "string" ? new Date(dateInput) : dateInput;

      if (!date || isNaN(date.getTime())) {
        return "Invalid";
      }

      const month = date.toLocaleString("default", { month: "short" });
      const day = date.getDate();
      return `${month} ${day}`;
    } catch (error) {
      console.error("Error formatting date:", error, dateInput);
      return "??";
    }
  };

  // Get a safe date object from the data
  const getSafeDate = (day: AggregatedData): Date => {
    if (day.dateObj instanceof Date) {
      return day.dateObj;
    }
    // If it's a string (from cache), try to parse it
    if (typeof day.dateObj === "string") {
      return new Date(day.dateObj);
    }
    // Fallback to using the date string
    return new Date(day.date);
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        {/* Y-Axis labels */}
        <View style={styles.yAxis}>
          <Text style={styles.yAxisLabel}>
            {Math.round(maxGlucose / 10) * 10}
          </Text>
          <Text style={styles.yAxisLabel}>
            {Math.round((maxGlucose + minGlucose) / 2 / 10) * 10}
          </Text>
          <Text style={styles.yAxisLabel}>
            {Math.round(minGlucose / 10) * 10}
          </Text>
        </View>

        {/* Chart */}
        <Svg width={chartWidth} height={chartHeight + 40}>
          {/* Grid lines */}
          <Line
            x1="0"
            y1={scaleY(maxGlucose)}
            x2={chartWidth}
            y2={scaleY(maxGlucose)}
            stroke={VintageColors.border}
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
          <Line
            x1="0"
            y1={scaleY((maxGlucose + minGlucose) / 2)}
            x2={chartWidth}
            y2={scaleY((maxGlucose + minGlucose) / 2)}
            stroke={VintageColors.border}
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
          <Line
            x1="0"
            y1={scaleY(minGlucose)}
            x2={chartWidth}
            y2={scaleY(minGlucose)}
            stroke={VintageColors.border}
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />

          {/* Target range background */}
          <Rect
            x="0"
            y={scaleY(180)}
            width={chartWidth}
            height={scaleY(70) - scaleY(180)}
            fill="rgba(139, 115, 85, 0.08)"
          />

          {/* Data bars */}
          {data.map((day, index) => {
            const x = padding + index * (barWidth + 8);
            const avgY = scaleY(day.average);
            const minY = scaleY(day.min);
            const maxY = scaleY(day.max);
            const barColor = getBarColor(day.average);

            return (
              <G key={`${day.date}-${index}`}>
                {/* Min-Max line */}
                <Line
                  x1={x + barWidth / 2}
                  y1={minY}
                  x2={x + barWidth / 2}
                  y2={maxY}
                  stroke={barColor}
                  strokeWidth="1"
                  opacity={0.8}
                />

                {/* Average circle */}
                <Rect
                  x={x}
                  y={avgY - 4}
                  width={barWidth}
                  height="8"
                  rx="4"
                  fill={barColor}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />

                {/* Date label */}
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight + 20}
                  fontSize="10"
                  fill={VintageColors.secondaryText}
                  textAnchor="middle"
                  fontWeight="500"
                >
                  {formatDateLabel(day.dateObj || day.date)}
                </SvgText>

                {/* Time in range indicator */}
                {day.timeInRange > 0 && (
                  <Rect
                    x={x + barWidth + 2}
                    y={chartHeight + 5}
                    width="4"
                    height={(-day.timeInRange / 100) * 30}
                    fill={getTIRColor(day.timeInRange)}
                    rx="2"
                  />
                )}
              </G>
            );
          })}
        </Svg>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: VintageColors.formAccent3 },
              ]}
            />
            <Text style={styles.legendText}>Average</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendLine,
                { backgroundColor: VintageColors.formAccent1 },
              ]}
            />
            <Text style={styles.legendText}>Min-Max Range</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.tirIndicator} />
            <Text style={styles.legendText}>Time in Range</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

function getBarColor(glucose: number): string {
  if (glucose < 70) return VintageColors.glucoseVeryLow;
  if (glucose < 180) return VintageColors.formAccent3;
  if (glucose < 250) return VintageColors.glucoseHigh;
  return VintageColors.glucoseVeryHigh;
}

function getTIRColor(percentage: number): string {
  if (percentage >= 70) return VintageColors.glucoseInRange;
  if (percentage >= 50) return VintageColors.formAccent1;
  return VintageColors.formAccent5;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartContainer: {
    flexDirection: "row",
  },
  yAxis: {
    width: 30,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingVertical: 10,
  },
  yAxisLabel: {
    fontSize: 10,
    color: VintageColors.secondaryText,
    fontWeight: "600",
    fontStyle: "italic",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 13,
    color: VintageColors.secondaryText,
    textAlign: "center",
    marginTop: 12,
    fontStyle: "italic",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    flexWrap: "wrap",
    gap: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(139, 115, 85, 0.1)",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  legendLine: {
    width: 20,
    height: 2,
    marginRight: 8,
    borderRadius: 1,
  },
  tirIndicator: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: VintageColors.glucoseInRange,
    marginRight: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  legendText: {
    fontSize: 11,
    color: VintageColors.secondaryText,
    fontStyle: "italic",
  },
});
