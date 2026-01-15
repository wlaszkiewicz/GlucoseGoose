import React from "react";
import { View, Text } from "react-native";
import {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Svg, Circle, Path } from "react-native-svg";
import { VintageColors } from "../../../themes/vintage/colors";
import { useAuth } from "../../../contexts/AuthContext";
import {
  calculateInsulinStats,
  analyzeBasalEvents,
} from "../../../utils/journal/insulinCalculations";

interface InsulinBreakdownProps {
  insulinEvents: any[];
}

export const InsulinBreakdown: React.FC<InsulinBreakdownProps> = ({
  insulinEvents,
}) => {
  const insulinAnalysis = calculateInsulinStats(insulinEvents);
  const basalAnalysis = analyzeBasalEvents(insulinEvents);

  const positiveBasalAdjustment = Math.max(0, insulinAnalysis.basalAdjustment);
  const totalForPercentages =
    insulinAnalysis.totalBolusInsulin + positiveBasalAdjustment;
  const totalInsulin = insulinAnalysis.totalInsulinDelivered;

  const getPercentage = (value: number) => {
    return totalForPercentages > 0 ? (value / totalForPercentages) * 100 : 0;
  };

  const mealPercentage = getPercentage(insulinAnalysis.mealInsulin);
  const correctionPercentage = getPercentage(insulinAnalysis.correctionInsulin);
  const basalPercentage = getPercentage(positiveBasalAdjustment);

  const avgMealBolus =
    insulinAnalysis.mealEvents > 0
      ? insulinAnalysis.mealInsulin / insulinAnalysis.mealEvents
      : 0;

  const avgCorrectionBolus =
    insulinAnalysis.correctionEvents > 0
      ? insulinAnalysis.correctionInsulin / insulinAnalysis.correctionEvents
      : 0;

  const totalBolus =
    insulinAnalysis.mealInsulin + insulinAnalysis.correctionInsulin;

  const DonutChart = () => {
    const size = 80;
    const strokeWidth = 8;
    const borderWidth = 2;
    const radius = (size - strokeWidth - borderWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    const createArc = (
      startAngle: number,
      endAngle: number,
      color: string,
      borderColor: string,
      isDashed = false
    ) => {
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);

      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

      const d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

      return { d, color, borderColor, isDashed, startAngle, endAngle };
    };

    const totalAngle = 360;
    const mealAngle = (mealPercentage / 100) * totalAngle;
    const correctionAngle = (correctionPercentage / 100) * totalAngle;
    const basalAngle = (basalPercentage / 100) * totalAngle;

    const arcs = [];
    let currentAngle = 0;

    if (mealPercentage > 0) {
      arcs.push(
        createArc(
          currentAngle,
          currentAngle + mealAngle,
          VintageColors.iconGreen,
          VintageColors.formAccent2,
          false
        )
      );
      currentAngle += mealAngle;
    }

    if (correctionPercentage > 0) {
      arcs.push(
        createArc(
          currentAngle,
          currentAngle + correctionAngle,
          VintageColors.iconPink,
          VintageColors.formAccent1,
          false
        )
      );
      currentAngle += correctionAngle;
    }

    if (basalPercentage > 0) {
      arcs.push(
        createArc(
          currentAngle,
          currentAngle + basalAngle,
          VintageColors.iconBlue,
          VintageColors.formAccent3,
          true
        )
      );
    }

    return (
      <View style={donutStyles.container}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={
              insulinEvents.length > 0
                ? VintageColors.cardBackground
                : VintageColors.lightBorder
            }
            strokeWidth={strokeWidth}
            fill="none"
          />

          {arcs.map((arc, index) => {
            const arcLength =
              (circumference * (arc.endAngle - arc.startAngle)) / 360;
            let strokeDasharray = undefined;

            if (arc.isDashed) {
              const dashCount = Math.max(3, Math.floor(arcLength / 10));
              const dashLength = arcLength / dashCount;
              strokeDasharray = `${dashLength / 2},${dashLength / 2}`;
            }

            return (
              <React.Fragment key={index}>
                {/* Border */}
                <Path
                  d={arc.d}
                  stroke={arc.borderColor}
                  strokeWidth={strokeWidth + borderWidth}
                  fill="none"
                  strokeLinecap="butt"
                  strokeDasharray={strokeDasharray}
                />
                {/* Main arc */}
                <Path
                  d={arc.d}
                  stroke={arc.color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="butt"
                  strokeDasharray={strokeDasharray}
                />
              </React.Fragment>
            );
          })}
        </Svg>

        {/* Center text */}
        <View style={donutStyles.center}>
          <Text style={donutStyles.totalValue}>{totalInsulin.toFixed(1)}</Text>
          <Text style={donutStyles.totalLabel}>U total</Text>
        </View>
      </View>
    );
  };

  const LegendItem = ({
    label,
    value,
    percentage,
    count,
    color,
    borderColor,
    isDashed = false,
    isBasal = false,
    additionalInfo,
  }: {
    label: string;
    value: number;
    percentage: number;
    count?: number;
    color: string;
    borderColor: string;
    isDashed?: boolean;
    isBasal?: boolean;
    additionalInfo?: string;
  }) => {
    return (
      <View style={legendStyles.item}>
        {/* Dot and label */}
        <View style={legendStyles.leftSection}>
          <View
            style={[
              legendStyles.dot,
              {
                backgroundColor: color,
                borderColor: borderColor,
                borderStyle: isDashed ? "dashed" : "solid",
              },
            ]}
          />
          <View style={legendStyles.labelContainer}>
            <Text style={legendStyles.label}>{label}</Text>
            {count !== undefined && (
              <Text style={legendStyles.count}>
                {count} {isBasal ? "adj" : "bolus"}
                {count !== 1 && isBasal ? "s" : ""}
                {count !== 1 && !isBasal ? "es" : ""}
                {additionalInfo && ` • ${additionalInfo}`}
              </Text>
            )}
          </View>
        </View>

        {/* Value and percentage bar */}
        <View style={legendStyles.rightSection}>
          <View style={legendStyles.valueBarContainer}>
            <Text style={legendStyles.value}>
              {isBasal ? (insulinAnalysis.basalAdjustment > 0 ? "+" : "−") : ""}
              {value.toFixed(1)}U
            </Text>

            {/* Percentage bar */}
            <View style={legendStyles.percentageBarBackground}>
              <View
                style={[
                  legendStyles.percentageBarFill,
                  {
                    width: `${Math.min(100, percentage)}%`,
                    backgroundColor: color,
                  },
                ]}
              />
            </View>
          </View>

          <Text style={legendStyles.percentage}>{Math.round(percentage)}%</Text>
        </View>
      </View>
    );
  };

  if (totalInsulin < 0.1) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Insulin Breakdown</Text>
          <View style={styles.featherAccent}>
            <Ionicons
              name="water"
              size={20}
              color={VintageColors.primaryText}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.emptyState}>
            <Ionicons
              name="water-outline"
              size={40}
              color={VintageColors.secondaryText}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>
              No insulin data for this period
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const getBasalLegendInfo = () => {
    if (!insulinAnalysis.basalEvents) return "";

    const parts = [];
    if (basalAnalysis.increaseEvents > 0) {
      parts.push(`${basalAnalysis.increaseEvents}↑`);
    }
    if (basalAnalysis.decreaseEvents > 0) {
      parts.push(`${basalAnalysis.decreaseEvents}↓`);
    }
    return parts.join(" • ");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Insulin Breakdown</Text>
        <View style={styles.featherAccent}>
          <Ionicons name="water" size={20} color={VintageColors.primaryText} />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.chartSection}>
          <DonutChart />

          <View style={legendStyles.container}>
            {/* Meal Bolus */}
            <LegendItem
              label="Meal"
              value={insulinAnalysis.mealInsulin}
              percentage={mealPercentage}
              count={insulinAnalysis.mealEvents}
              color={VintageColors.iconGreen}
              borderColor={VintageColors.formAccent2}
            />

            {/* Correction */}
            <LegendItem
              label="Correction"
              value={insulinAnalysis.correctionInsulin}
              percentage={correctionPercentage}
              count={insulinAnalysis.correctionEvents}
              color={VintageColors.iconPink}
              borderColor={VintageColors.formAccent1}
            />

            {/* Basal Adjust */}
            {Math.abs(insulinAnalysis.basalAdjustment) > 0.1 && (
              <LegendItem
                label={`Basal ${
                  insulinAnalysis.basalAdjustment > 0 ? "+" : "−"
                }`}
                value={Math.abs(insulinAnalysis.basalAdjustment)}
                percentage={basalPercentage}
                count={insulinAnalysis.basalEvents}
                color={VintageColors.iconBlue}
                borderColor={VintageColors.formAccent3}
                isDashed={true}
                isBasal={true}
                additionalInfo={getBasalLegendInfo()}
              />
            )}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLine} />
          <Text style={styles.sectionHeaderText}>Bolus Details</Text>
          <View style={styles.sectionHeaderLine} />
        </View>

        {/* Bolus Stats Section */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MaterialIcons
              name="emoji-food-beverage"
              size={14}
              color={VintageColors.formAccent2}
            />
            <Text style={styles.statLabel}>
              {avgMealBolus.toFixed(1)}U meal avg
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <MaterialIcons
              name="tune"
              size={14}
              color={VintageColors.formAccent1}
            />
            <Text style={styles.statLabel}>
              {avgCorrectionBolus.toFixed(1)}U corr avg
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="sigma"
              size={14}
              color={VintageColors.secondaryText}
            />
            <Text style={styles.statLabel}>{totalBolus.toFixed(1)}U total</Text>
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
  title: {
    fontSize: 18,
    color: VintageColors.primaryText,
    fontWeight: "500",
    letterSpacing: 0.3,
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
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
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
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },

  statItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  statLabel: {
    fontSize: 11,
    color: VintageColors.primaryText,
    marginHorizontal: 4,
    fontStyle: "italic",
  },

  divider: {
    width: 1,
    height: 16,
    backgroundColor: VintageColors.border,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyIcon: {
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 14,
    color: VintageColors.secondaryText,
    textAlign: "center",
    fontStyle: "italic",
  },
};

const legendStyles: any = {
  container: {
    flex: 1,
    marginLeft: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingVertical: 2,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    marginRight: 8,
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
  percentage: {
    fontSize: 10,
    color: VintageColors.primaryText,
    fontWeight: "600",
    width: 24,
    textAlign: "right",
  },
};

const donutStyles: any = {
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
  totalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: VintageColors.primaryText,
  },
  totalLabel: {
    fontSize: 10,
    color: VintageColors.secondaryText,
    fontStyle: "italic",
    marginTop: -2,
  },
};
