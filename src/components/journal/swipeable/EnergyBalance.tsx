import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { VintageColors } from "../../../themes/vintage/colors";
import { useAuth } from "../../../contexts/AuthContext";
import { Svg, Circle } from "react-native-svg";

const DEFAULT_GOALS = {
  dailyCalories: 2000,
  dailyActivity: 500,
  bmr: 1600,
};

interface EnergyBalanceProps {
  totalCaloriesConsumed: number;
  totalCaloriesBurned: number;
  mealsCount?: number;
  activitiesCount?: number;
  avgMealCalories?: number;
  avgActivityCalories?: number;
}

export const EnergyBalance: React.FC<EnergyBalanceProps> = ({
  totalCaloriesConsumed,
  totalCaloriesBurned,
  mealsCount = 0,
  activitiesCount = 0,
  avgMealCalories = 0,
  avgActivityCalories = 0,
}) => {
  const { userData } = useAuth();
  const [goals, setGoals] = useState(DEFAULT_GOALS);

  useEffect(() => {
    const newGoals = { ...DEFAULT_GOALS };

    if (userData?.dailyCalorieGoal) {
      newGoals.dailyCalories = userData.dailyCalorieGoal;
    }
    if (userData?.dailyActivityGoal) {
      newGoals.dailyActivity = userData.dailyActivityGoal;
    }
    if (userData?.bmr) {
      newGoals.bmr = userData.bmr;
    }

    setGoals(newGoals);
  }, [userData]);

  const trueTotalCaloriesBurned = goals.bmr + totalCaloriesBurned;
  const netCalories = totalCaloriesConsumed - trueTotalCaloriesBurned;

  const burnedPercentage = Math.min(
    (totalCaloriesBurned / goals.dailyActivity) * 100,
    100
  );

  const consumedPercentage = Math.min(
    (totalCaloriesConsumed / goals.dailyCalories) * 100,
    100
  );

  const getNetColor = () => {
    if (Math.abs(netCalories) <= 300) return VintageColors.formAccent2;
    return netCalories > 0
      ? VintageColors.formAccent1
      : VintageColors.formAccent3;
  };

  const ProgressCircle = ({
    percentage,
    color,
    label,
    value,
    icon,
    goal,
    showGoal = true,
  }: {
    percentage: number;
    color: string;
    label: string;
    value: number;
    icon: string;
    goal?: number;
    showGoal?: boolean;
  }) => {
    const size = 60;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={styles.circleContainer}>
        <View style={styles.circleWrapper}>
          <Svg width={size} height={size} style={styles.svg}>
            {/* Background circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color + "40"}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray="5, 5"
            />

            {percentage > 0 && (
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${size / 2}, ${size / 2}`}
              />
            )}
          </Svg>

          {/* Center content */}
          <View style={styles.circleCenter}>
            <Ionicons name={icon as any} size={18} color={color} />
            <Text style={styles.circleValue}>{value}</Text>
            <Text style={styles.circleLabelSmall}>kcal</Text>
          </View>
        </View>

        {showGoal && goal && <Text style={styles.goalText}>/{goal}</Text>}

        <Text style={styles.circleLabel}>{label}</Text>
        <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
      </View>
    );
  };

  const StatItem = ({ icon, value, label, color }: any) => (
    <View style={styles.statItem}>
      {icon && (
        <View style={[styles.statIcon]}>
          <Feather name={icon as any} size={12} color={color} />
        </View>
      )}
      <Text style={styles.statLabel}>
        {value} {label}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>Energy Balance</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.featherAccent}>
            <Feather
              name="activity"
              size={16}
              color={VintageColors.primaryText}
            />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.equationRow}>
          <ProgressCircle
            percentage={consumedPercentage}
            color={VintageColors.formAccent1}
            label="Cals In"
            value={totalCaloriesConsumed}
            icon="nutrition"
            goal={goals.dailyCalories}
            showGoal={true}
          />

          <View style={styles.symbolContainer}>
            <View
              style={[
                styles.minusLine,
                { backgroundColor: VintageColors.formAccent1 },
              ]}
            />
          </View>

          <ProgressCircle
            percentage={burnedPercentage}
            color={VintageColors.formAccent4}
            label="Activity"
            value={totalCaloriesBurned}
            icon="flame"
            goal={goals.dailyActivity}
            showGoal={true}
          />

          <View style={styles.symbolContainer}>
            <View
              style={[
                styles.plusLineVertical,
                { backgroundColor: VintageColors.formAccent3 },
              ]}
            />
            <View
              style={[
                styles.plusLineHorizontal,
                { backgroundColor: VintageColors.formAccent3 },
              ]}
            />
          </View>

          <View style={styles.bmrContainer}>
            <View style={styles.bmrIconContainer}>
              <Ionicons
                name="bed"
                size={14}
                color={VintageColors.formAccent7}
              />
            </View>
            <Text style={styles.bmrValue}>{goals.bmr}</Text>
            <Text style={styles.bmrLabel}>BMR</Text>
          </View>

          {/* Equals Sign */}
          <View style={styles.symbolContainer}>
            <View
              style={[
                styles.equalsLine,
                { backgroundColor: VintageColors.formAccent3 },
              ]}
            />
            <View
              style={[
                styles.equalsLine,
                { backgroundColor: VintageColors.formAccent3, marginTop: 3 },
              ]}
            />
          </View>

          <View style={styles.netContainer}>
            <Text style={[styles.netValue, { color: getNetColor() }]}>
              {netCalories > 0
                ? `+${Math.round(netCalories)}`
                : Math.round(netCalories)}
            </Text>
            <Text style={styles.netLabel}>Net value</Text>
            <Text style={[styles.netStatus, { color: getNetColor() }]}>
              {Math.abs(netCalories) <= 500
                ? "Balanced"
                : netCalories > 0
                ? "Surplus"
                : "Deficit"}
            </Text>
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLine} />
          <Text style={styles.sectionHeaderText}>Daily Stats</Text>
          <View style={styles.sectionHeaderLine} />
        </View>

        <View style={styles.statsRow}>
          <StatItem
            icon="coffee"
            value={mealsCount}
            label={`meal${mealsCount !== 1 ? "s" : ""}`}
            color={VintageColors.formAccent1}
          />

          <View style={styles.divider} />

          <StatItem
            icon="trending-up"
            value={avgMealCalories > 0 ? avgMealCalories.toFixed(0) : "–"}
            label="avg meal"
            color={VintageColors.formAccent2}
          />

          <View style={styles.divider} />

          <StatItem
            icon="trending-down"
            value={
              avgActivityCalories > 0 ? avgActivityCalories.toFixed(0) : "–"
            }
            label="avg burn"
            color={VintageColors.formAccent3}
          />
        </View>
      </View>
    </View>
  );
};

const styles: any = {
  container: {
    marginBottom: 24,
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },

  sectionTitle: {
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
  equationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 0,
  },
  circleContainer: {
    alignItems: "center",
    width: 60,
  },
  circleWrapper: {
    position: "relative",
    width: 60,
    height: 60,
    marginBottom: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  circleCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  circleValue: {
    fontSize: 13,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginTop: 2,
  },
  circleLabelSmall: {
    fontSize: 8,
    color: VintageColors.secondaryText,
    fontStyle: "italic",
  },
  circleLabel: {
    fontSize: 10,
    color: VintageColors.primaryText,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
    marginTop: 2,
  },
  percentageText: {
    fontSize: 9,
    color: VintageColors.secondaryText,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 1,
  },
  goalText: {
    fontSize: 8,
    marginBottom: 2,
    color: VintageColors.secondaryText,
    fontStyle: "italic",
  },
  symbolContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    paddingHorizontal: 4,
  },
  minusLine: {
    width: 14,
    height: 2,
    borderRadius: 1,
    opacity: 0.8,
  },
  plusLineVertical: {
    width: 2,
    height: 10,
    borderRadius: 1,
    opacity: 0.8,
    position: "absolute",
  },
  plusLineHorizontal: {
    width: 10,
    height: 2,
    borderRadius: 1,
    opacity: 0.8,
    position: "absolute",
  },
  equalsLine: {
    width: 14,
    height: 2,
    borderRadius: 1,
    opacity: 0.8,
  },
  bmrContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 45,
  },
  bmrIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.formAccent7 + "40",
    marginBottom: 2,
  },
  bmrValue: {
    fontSize: 11,
    fontWeight: "600",
    color: VintageColors.formAccent7,
  },
  bmrLabel: {
    fontSize: 8,
    color: VintageColors.primaryText,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  netContainer: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "column",
    justifyContent: "center",
    width: 60,
  },
  netValue: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  netLabel: {
    fontSize: 9,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
    color: VintageColors.secondaryText,
    marginBottom: 2,
  },
  netStatus: {
    fontSize: 9,
    fontWeight: "600",
    fontStyle: "italic",
  },
  netNote: {
    fontSize: 7,
    color: VintageColors.secondaryText + "80",
    fontStyle: "italic",
    marginTop: 1,
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
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
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
};
