import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { VintageColors } from "../../themes/vintage/colors";
import {
  getDataQualityInterpretation,
  TrendMetrics,
} from "../../utils/trendCalculations";

interface TrendsMetricsProps {
  metrics: TrendMetrics;
}

export const TrendsMetrics: React.FC<TrendsMetricsProps> = ({ metrics }) => {
  const MetricCard = ({
    title,
    value,
    unit,
    icon,
    color,
    description,
  }: {
    title: string;
    value: string | number;
    unit?: string;
    icon: React.ReactNode;
    color: string;
    description?: string;
  }) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        {icon}
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <View style={styles.metricValueContainer}>
        <Text style={styles.metricValue}>{value}</Text>
        {unit && <Text style={styles.metricUnit}>{unit}</Text>}
      </View>
      {description && (
        <Text style={styles.metricDescription}>{description}</Text>
      )}
    </View>
  );
  const dataQualityInterpretation = getDataQualityInterpretation(
    metrics.dataQuality.completeness,
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="activity" size={18} color={VintageColors.primaryText} />
        <Text style={styles.title}>Summary Metrics</Text>
      </View>

      <View style={styles.metricsGrid}>
        <MetricCard
          title="Average Glucose"
          value={metrics.dailyAverage}
          unit="mg/dL"
          icon={
            <Feather
              name="target"
              size={14}
              color={VintageColors.formAccent3}
            />
          }
          color={VintageColors.formAccent3}
          description={`GMI: ${metrics.gmi}%`}
        />
        <MetricCard
          title="Variability"
          value={metrics.dailyCV}
          unit="%"
          icon={
            <MaterialCommunityIcons
              name="chart-bell-curve"
              size={14}
              color={VintageColors.formAccent1}
            />
          }
          color={VintageColors.formAccent1}
          description={`SD: ${metrics.dailyStdDev}`}
        />
        <MetricCard
          title="Time in Range"
          value={metrics.timeInRanges.target}
          unit="%"
          icon={
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={VintageColors.glucoseBorderInRange}
            />
          }
          color={VintageColors.glucoseBorderInRange}
        />

        <MetricCard
          title="Data Quality"
          value={metrics.dataQuality.completeness}
          unit="%"
          icon={
            <Feather
              name="database"
              size={14}
              color={dataQualityInterpretation.color}
            />
          }
          color={dataQualityInterpretation.color}
          description={`${dataQualityInterpretation.description}`}
        />
      </View>

      {/* Period Averages */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Period Averages</Text>
        <View style={styles.periodGrid}>
          <View style={styles.periodItem}>
            <View style={styles.periodIconContainer}>
              <Feather
                name="sunrise"
                size={12}
                color={VintageColors.formAccent3}
              />
            </View>
            <Text style={styles.periodLabel}>Morning</Text>
            <Text style={styles.periodValue}>
              {metrics.trendsByPeriod.morning || "-"}
            </Text>
          </View>
          <View style={styles.periodItem}>
            <View style={styles.periodIconContainer}>
              <Feather name="sun" size={12} color={VintageColors.formAccent1} />
            </View>
            <Text style={styles.periodLabel}>Afternoon</Text>
            <Text style={styles.periodValue}>
              {metrics.trendsByPeriod.afternoon || "-"}
            </Text>
          </View>
          <View style={styles.periodItem}>
            <View style={styles.periodIconContainer}>
              <Feather
                name="moon"
                size={12}
                color={VintageColors.formAccent5}
              />
            </View>
            <Text style={styles.periodLabel}>Evening</Text>
            <Text style={styles.periodValue}>
              {metrics.trendsByPeriod.evening || "-"}
            </Text>
          </View>
          <View style={styles.periodItem}>
            <View style={styles.periodIconContainer}>
              <Feather
                name="star"
                size={12}
                color={VintageColors.formAccent8}
              />
            </View>
            <Text style={styles.periodLabel}>Night</Text>
            <Text style={styles.periodValue}>
              {metrics.trendsByPeriod.night || "-"}
            </Text>
          </View>
        </View>
      </View>

      {/* Time in Ranges Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Time in Ranges</Text>
        <View style={styles.rangesGrid}>
          <View style={styles.rangeItem}>
            <View
              style={[
                styles.rangeDot,
                { backgroundColor: VintageColors.glucoseBorderVeryLow },
              ]}
            />
            <Text style={styles.rangeLabel}>Very Low</Text>
            <Text style={styles.rangeValue}>
              {metrics.timeInRanges.veryLow}%
            </Text>
          </View>
          <View style={styles.rangeItem}>
            <View
              style={[
                styles.rangeDot,
                { backgroundColor: VintageColors.glucoseBorderLow },
              ]}
            />
            <Text style={styles.rangeLabel}>Low</Text>
            <Text style={styles.rangeValue}>{metrics.timeInRanges.low}%</Text>
          </View>
          <View style={styles.rangeItem}>
            <View
              style={[
                styles.rangeDot,
                { backgroundColor: VintageColors.glucoseBorderInRange },
              ]}
            />
            <Text style={styles.rangeLabel}>In Range</Text>
            <Text style={styles.rangeValue}>
              {metrics.timeInRanges.target}%
            </Text>
          </View>
          <View style={styles.rangeItem}>
            <View
              style={[
                styles.rangeDot,
                { backgroundColor: VintageColors.glucoseBorderHigh },
              ]}
            />
            <Text style={styles.rangeLabel}>High</Text>
            <Text style={styles.rangeValue}>{metrics.timeInRanges.high}%</Text>
          </View>
          <View style={styles.rangeItem}>
            <View
              style={[
                styles.rangeDot,
                { backgroundColor: VintageColors.glucoseBorderVeryHigh },
              ]}
            />
            <Text style={styles.rangeLabel}>Very High</Text>
            <Text style={styles.rangeValue}>
              {metrics.timeInRanges.veryHigh}%
            </Text>
          </View>
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
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: "48%",
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: VintageColors.formAccent3,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 11,
    fontWeight: "500",
    color: VintageColors.primaryText,
    marginLeft: 6,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  metricValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "700",
    color: VintageColors.primaryText,
  },
  metricUnit: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    marginLeft: 4,
    fontWeight: "500",
  },
  metricDescription: {
    fontSize: 10,
    color: VintageColors.secondaryText,
    fontStyle: "italic",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  periodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  periodItem: {
    flex: 1,
    minWidth: "48%",
    backgroundColor: "rgba(139, 115, 85, 0.05)",
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
  },
  periodIconContainer: {
    marginBottom: 4,
  },
  periodLabel: {
    fontSize: 11,
    color: VintageColors.secondaryText,
    marginBottom: 4,
  },
  periodValue: {
    fontSize: 16,
    fontWeight: "600",
    color: VintageColors.primaryText,
  },
  rangesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  rangeItem: {
    flex: 1,
    minWidth: "30%",
    alignItems: "center",
    padding: 6,
  },
  rangeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  rangeLabel: {
    fontSize: 10,
    color: VintageColors.secondaryText,
    marginBottom: 2,
    textAlign: "center",
  },
  rangeValue: {
    fontSize: 12,
    fontWeight: "600",
    color: VintageColors.primaryText,
  },
});
