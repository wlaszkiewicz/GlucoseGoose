import React, { useState } from "react";
import { View, Text } from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Svg, Circle, Path } from "react-native-svg";
import { VintageColors } from "../../../themes/vintage/colors";

interface GlucoseSummaryProps {
  glucoseEntries: any[];
  selectedDate: Date;
}

export const GlucoseSummary: React.FC<GlucoseSummaryProps> = ({
  glucoseEntries,
  selectedDate,
}) => {
  const [showTargetInfo, setShowTargetInfo] = useState(false);

  const isToday = () => {
    const today = new Date();
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  if (!isToday()) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Glucose Summary</Text>
          </View>
          <View style={styles.featherAccent}>
            <Ionicons
              name="pulse"
              size={20}
              color={VintageColors.primaryText}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={placeholderStyles.emptyState}>
            <Ionicons
              name="calendar-outline"
              size={28}
              color={VintageColors.secondaryText}
              style={placeholderStyles.emptyIcon}
            />
          </View>

          <Text style={placeholderStyles.emptyText}>
            Glucose summary for other days than today is not implemented yet
          </Text>

          <Text style={placeholderStyles.emptySubtext}>
            Coming in a future update!
          </Text>
        </View>
      </View>
    );
  }

  const calculateMetrics = () => {
    if (glucoseEntries.length === 0) {
      return {
        averageGlucose: 0,
        timeInRange: 0,
        highCount: 0,
        lowCount: 0,
        veryHighCount: 0,
        veryLowCount: 0,
        gmi: 0,
        totalReadings: 0,
        minGlucose: 0,
        maxGlucose: 0,
        cv: "0",
        stdDev: "0",
        timeInRangeRaw: 0,
        timeVeryLowRaw: 0,
        timeLowRaw: 0,
        timeHighRaw: 0,
        timeVeryHighRaw: 0,
      };
    }

    const validReadings = glucoseEntries.filter((entry) => entry.sgv);
    const glucoseValues = validReadings.map((entry) => entry.sgv);

    const averageGlucose = Math.round(
      glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length,
    );

    const veryLowCount = validReadings.filter((entry) => entry.sgv < 54).length;
    const lowCount = validReadings.filter(
      (entry) => entry.sgv >= 54 && entry.sgv < 70,
    ).length;
    const inRangeCount = validReadings.filter(
      (entry) => entry.sgv >= 70 && entry.sgv <= 180,
    ).length;
    const highCount = validReadings.filter(
      (entry) => entry.sgv > 180 && entry.sgv <= 250,
    ).length;
    const veryHighCount = validReadings.filter(
      (entry) => entry.sgv > 250,
    ).length;

    const timeInRangeRaw = (inRangeCount / validReadings.length) * 100;
    const timeVeryLowRaw = (veryLowCount / validReadings.length) * 100;
    const timeLowRaw = (lowCount / validReadings.length) * 100;
    const timeHighRaw = (highCount / validReadings.length) * 100;
    const timeVeryHighRaw = (veryHighCount / validReadings.length) * 100;

    const variance =
      glucoseValues.reduce(
        (sum, value) => sum + Math.pow(value - averageGlucose, 2),
        0,
      ) / glucoseValues.length;
    const stdDev = Math.sqrt(variance);
    const cv = (stdDev / averageGlucose) * 100;

    const gmi = 3.31 + 0.02392 * averageGlucose;

    const displayPercentages = distributeRoundingErrors([
      timeInRangeRaw,
      timeVeryLowRaw,
      timeLowRaw,
      timeHighRaw,
      timeVeryHighRaw,
    ]);

    return {
      averageGlucose,
      timeInRange: displayPercentages[0],
      timeVeryLow: displayPercentages[1],
      timeLow: displayPercentages[2],
      timeHigh: displayPercentages[3],
      timeVeryHigh: displayPercentages[4],
      timeInRangeRaw,
      timeVeryLowRaw,
      timeLowRaw,
      timeHighRaw,
      timeVeryHighRaw,
      veryLowCount,
      lowCount,
      highCount,
      veryHighCount,
      inRangeCount,
      cv: cv.toFixed(1),
      stdDev: stdDev.toFixed(1),
      gmi: gmi.toFixed(1),
      totalReadings: validReadings.length,
      minGlucose: Math.min(...glucoseValues),
      maxGlucose: Math.max(...glucoseValues),
    };
  };

  const distributeRoundingErrors = (percentages: number[]): number[] => {
    const rounded = percentages.map((p) => Math.round(p));
    const sum = rounded.reduce((a, b) => a + b, 0);

    if (sum === 100) return rounded;

    const errors = percentages.map((p, i) => ({
      index: i,
      error: Math.abs(p - rounded[i]),
      original: p,
      rounded: rounded[i],
    }));

    errors.sort((a, b) => b.error - a.error);

    const adjusted = [...rounded];
    const diff = 100 - sum;

    for (let i = 0; i < Math.abs(diff); i++) {
      const idx = errors[i % errors.length].index;
      if (diff > 0) {
        adjusted[idx] += 1;
      } else {
        adjusted[idx] -= 1;
      }
    }

    return adjusted;
  };

  const metrics = calculateMetrics();

  const TimeInRangeRing = () => {
    const size = 80;
    const strokeWidth = 8;
    const borderWidth = 2;
    const radius = (size - strokeWidth - borderWidth) / 2;
    const center = size / 2;

    const segments = [
      {
        value: metrics.timeVeryLow,
        count: metrics.veryLowCount,
        color: VintageColors.glucoseVeryLow,
        borderColor: VintageColors.glucoseBorderVeryLow,
        label: "<54",
        icon: "arrow-down",
        show: metrics.veryLowCount > 0,
      },
      {
        value: metrics.timeLow,
        count: metrics.lowCount,
        color: VintageColors.glucoseLow,
        borderColor: VintageColors.glucoseBorderLow,
        label: "54-69",
        icon: "arrow-down",
        show: metrics.lowCount > 0,
      },
      {
        value: metrics.timeInRange,
        count: metrics.inRangeCount,
        color: VintageColors.glucoseInRange,
        borderColor: VintageColors.glucoseBorderInRange,
        label: "70-180",
        icon: "checkmark-circle",
        show: true,
      },
      {
        value: metrics.timeHigh,
        count: metrics.highCount,
        color: VintageColors.glucoseHigh,
        borderColor: VintageColors.glucoseBorderHigh,
        label: "181-250",
        icon: "arrow-up",
        show: metrics.highCount > 0,
      },
      {
        value: metrics.timeVeryHigh,
        count: metrics.veryHighCount,
        color: VintageColors.glucoseVeryHigh,
        borderColor: VintageColors.glucoseBorderVeryHigh,
        label: ">250",
        icon: "arrow-up",
        show: metrics.veryHighCount > 0,
      },
    ];

    const validSegments = segments.filter((s) => s.show && s.value!! > 0);

    const rawSegments = [
      { value: metrics.timeVeryLowRaw || 0, show: metrics.veryLowCount > 0 },
      { value: metrics.timeLowRaw || 0, show: metrics.lowCount > 0 },
      { value: metrics.timeInRangeRaw || 0, show: true },
      { value: metrics.timeHighRaw || 0, show: metrics.highCount > 0 },
      { value: metrics.timeVeryHighRaw || 0, show: metrics.veryHighCount > 0 },
    ];

    const chartSegments = rawSegments.filter((s) => s.show);
    let currentAngle = 0;

    const segmentAngles = chartSegments.map((segment) => {
      const angle = (segment.value / 100) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      return { ...segment, startAngle, endAngle: currentAngle };
    });

    const finalSegments = segmentAngles.map((chartSegment, index) => {
      const segmentInfo = validSegments[index];
      return {
        ...chartSegment,
        ...segmentInfo,
      };
    });

    return (
      <View style={ringStyles.container}>
        <Svg width={size} height={size}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={VintageColors.lightBorder}
            strokeWidth={strokeWidth}
            fill="none"
          />

          {finalSegments.map((segment, index) => {
            return (
              <React.Fragment key={index}>
                <Path
                  d={`
                    M ${
                      center +
                      radius *
                        Math.cos(((segment.startAngle - 90) * Math.PI) / 180)
                    }
                    ${
                      center +
                      radius *
                        Math.sin(((segment.startAngle - 90) * Math.PI) / 180)
                    }
                    A ${radius} ${radius} 0 ${
                      segment.endAngle - segment.startAngle > 180 ? 1 : 0
                    } 1
                    ${
                      center +
                      radius *
                        Math.cos(((segment.endAngle - 90) * Math.PI) / 180)
                    }
                    ${
                      center +
                      radius *
                        Math.sin(((segment.endAngle - 90) * Math.PI) / 180)
                    }
                  `}
                  stroke={segment.borderColor}
                  strokeWidth={strokeWidth + borderWidth}
                  fill="none"
                  strokeLinecap="butt"
                />
                <Path
                  d={`
                    M ${
                      center +
                      radius *
                        Math.cos(((segment.startAngle - 90) * Math.PI) / 180)
                    }
                    ${
                      center +
                      radius *
                        Math.sin(((segment.startAngle - 90) * Math.PI) / 180)
                    }
                    A ${radius} ${radius} 0 ${
                      segment.endAngle - segment.startAngle > 180 ? 1 : 0
                    } 1
                    ${
                      center +
                      radius *
                        Math.cos(((segment.endAngle - 90) * Math.PI) / 180)
                    }
                    ${
                      center +
                      radius *
                        Math.sin(((segment.endAngle - 90) * Math.PI) / 180)
                    }
                  `}
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="butt"
                />
              </React.Fragment>
            );
          })}
        </Svg>

        <View style={ringStyles.center}>
          <Text style={ringStyles.percentage}>{metrics.timeInRange}%</Text>
          <Text style={ringStyles.label}>In Range</Text>
        </View>
      </View>
    );
  };

  const LegendItem = ({
    label,
    value,
    count,
    color,
    borderColor,
    icon,
  }: {
    label: string;
    value: number;
    count: number;
    color: string;
    borderColor: string;
    icon: string;
  }) => (
    <View style={legendStyles.item}>
      <View style={legendStyles.leftSection}>
        <View
          style={[
            legendStyles.dot,
            {
              backgroundColor: color,
              borderColor: borderColor,
            },
          ]}
        >
          <Ionicons
            name={icon as any}
            size={8}
            color={VintageColors.primaryText}
          />
        </View>
        <View style={legendStyles.labelContainer}>
          <Text style={legendStyles.label}>{label}</Text>
          <Text style={legendStyles.count}>
            {count} reading{count !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      <View style={legendStyles.rightSection}>
        <View style={legendStyles.valueBarContainer}>
          <Text style={legendStyles.value}>{value}%</Text>
          <View style={legendStyles.percentageBarBackground}>
            <View
              style={[
                legendStyles.percentageBarFill,
                {
                  width: `${Math.min(100, value)}%`,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Glucose Summary</Text>
        </View>
        <View style={styles.featherAccent}>
          <Ionicons name="pulse" size={20} color={VintageColors.primaryText} />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.chartSection}>
          <TimeInRangeRing />

          <View style={legendStyles.container}>
            {metrics.veryHighCount > 0 && (
              <LegendItem
                label=">250"
                value={metrics.timeVeryHigh!!}
                count={metrics.veryHighCount}
                color={VintageColors.glucoseVeryHigh}
                borderColor={VintageColors.glucoseBorderVeryHigh}
                icon="arrow-up"
              />
            )}

            {metrics.highCount > 0 && (
              <LegendItem
                label="181-250"
                value={metrics.timeHigh!!}
                count={metrics.highCount}
                color={VintageColors.glucoseHigh}
                borderColor={VintageColors.glucoseBorderHigh}
                icon="arrow-up"
              />
            )}

            <LegendItem
              label="70-180"
              value={metrics.timeInRange}
              count={metrics.inRangeCount!!}
              color={VintageColors.glucoseInRange}
              borderColor={VintageColors.glucoseBorderInRange}
              icon="checkmark-circle"
            />

            {metrics.lowCount > 0 && (
              <LegendItem
                label="54-69"
                value={metrics.timeLow!!}
                count={metrics.lowCount}
                color={VintageColors.glucoseLow}
                borderColor={VintageColors.glucoseBorderLow}
                icon="arrow-down"
              />
            )}

            {metrics.veryLowCount > 0 && (
              <LegendItem
                label="<54"
                value={metrics.timeVeryLow!!}
                count={metrics.veryLowCount}
                color={VintageColors.glucoseVeryLow}
                borderColor={VintageColors.glucoseBorderVeryLow}
                icon="arrow-down"
              />
            )}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLine} />
          <Text style={styles.sectionHeaderText}>Key Metrics</Text>
          <View style={styles.sectionHeaderLine} />
        </View>

        <View style={styles.additionalStats}>
          <View style={styles.additionalStatItem}>
            <Feather
              name="arrow-down"
              size={10}
              color={VintageColors.formAccent2}
            />
            <Text style={styles.additionalStatText}>
              {metrics.minGlucose} min
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.additionalStatItem}>
            <Feather
              name="arrow-up"
              size={10}
              color={VintageColors.formAccent1}
            />
            <Text style={styles.additionalStatText}>
              {metrics.maxGlucose} max
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.additionalStatItem}>
            <Ionicons
              name="stats-chart"
              size={10}
              color={VintageColors.formAccent3}
            />
            <Text style={styles.additionalStatText}>
              {metrics.averageGlucose} avg
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.additionalStatItem}>
            <MaterialCommunityIcons
              name="chart-line-variant"
              size={10}
              color={VintageColors.glucoseBorderLow}
            />
            <Text style={styles.additionalStatText}>
              {metrics.cv}% variability
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles: any = {
  container: {
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    color: VintageColors.primaryText,
    fontWeight: "500",
    letterSpacing: 0.3,
    marginRight: 8,
  },

  featherAccent: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  chartSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: VintageColors.border,
  },
  sectionHeaderText: {
    fontSize: 10,
    color: VintageColors.secondaryText,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 8,
    fontStyle: "italic",
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: VintageColors.border,
  },
  additionalStats: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  additionalStatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  additionalStatText: {
    fontSize: 11,
    color: VintageColors.primaryText,
    marginLeft: 4,
    fontStyle: "italic",
  },
};

const placeholderStyles: any = {
  container: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyIcon: {
    marginBottom: 8,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 13,
    color: VintageColors.secondaryText,
    textAlign: "center",
    fontStyle: "italic",
  },
  emptySubtext: {
    fontSize: 11,
    color: VintageColors.secondaryText,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 2,
  },
};

const legendStyles: any = {
  container: {
    flex: 1,
    marginLeft: 16,
    minHeight: 120,
    justifyContent: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingVertical: 2,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  labelContainer: {
    flexDirection: "column",
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: VintageColors.primaryText,
    fontWeight: "500",
  },
  count: {
    fontSize: 9,
    color: VintageColors.secondaryText,
    fontStyle: "italic",
    marginTop: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: 70,
  },
  valueBarContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
    marginRight: 6,
    minWidth: 40,
  },
  value: {
    fontSize: 11,
    color: VintageColors.secondaryText,
    fontStyle: "italic",
    marginBottom: 2,
  },
  percentageBarBackground: {
    width: 40,
    height: 4,
    backgroundColor: VintageColors.lightBorder,
    borderRadius: 2,
    overflow: "hidden",
  },
  percentageBarFill: {
    height: "100%",
    borderRadius: 2,
  },
};

const ringStyles: any = {
  container: {
    position: "relative",
    width: 80,
    height: 80,
  },
  center: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  percentage: {
    fontSize: 16,
    fontWeight: "600",
    color: VintageColors.primaryText,
  },
  label: {
    fontSize: 9,
    color: VintageColors.secondaryText,
    fontStyle: "italic",
    marginTop: -2,
  },
  subLabel: {
    fontSize: 7,
    color: VintageColors.secondaryText + "80",
    fontStyle: "italic",
    marginTop: 1,
  },
};
