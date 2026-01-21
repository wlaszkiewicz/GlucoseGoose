import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { VintageColors } from "../../../themes/vintage/colors";
import { calculateInsulinStats } from "../../../utils/journal/insulinCalculations";

interface CarbsInsulinBalanceProps {
  todayMeals: any[];
  insulinEvents: any[];
  selectedDate: Date;
}

export const CarbsInsulinBalance: React.FC<CarbsInsulinBalanceProps> = ({
  todayMeals,
  insulinEvents,
  selectedDate,
}) => {
  const totalCarbs = todayMeals.reduce(
    (sum, meal) => sum + (meal.carbs || 0),
    0,
  );

  const insulinAnalysis = calculateInsulinStats(insulinEvents);

  const separateInsulinByType = () => {
    const mealInsulinEvents = insulinEvents.filter(
      (event) =>
        event.eventType === "Meal Bolus" ||
        event.eventType === "Bolus Wizard" ||
        event.eventType === "Bolus",
    );

    const correctionInsulinEvents = insulinEvents.filter(
      (event) => event.eventType === "Correction Bolus",
    );

    return { mealInsulinEvents, correctionInsulinEvents };
  };

  const { mealInsulinEvents, correctionInsulinEvents } =
    separateInsulinByType();

  const getTimelineData = () => {
    const timelineHours = [0, 4, 8, 12, 16, 20];
    const hourLabels = ["00-04", "04-08", "08-12", "12-16", "16-20", "20-24"];

    return timelineHours.map((hour, index) => {
      const hourStart = hour;
      const hourEnd = hour + 4;

      const carbsInSlot = todayMeals.reduce((sum, meal) => {
        const mealHour = meal.created_at
          ? new Date(meal.created_at).getHours()
          : 12;
        return mealHour >= hourStart && mealHour < hourEnd
          ? sum + (meal.carbs || 0)
          : sum;
      }, 0);

      const mealInsulinInSlot = mealInsulinEvents.reduce((sum, event) => {
        const eventHour = event.created_at
          ? new Date(event.created_at).getHours()
          : 12;
        return eventHour >= hourStart && eventHour < hourEnd
          ? sum + (event.insulin || 0)
          : sum;
      }, 0);

      const correctionInsulinInSlot = correctionInsulinEvents.reduce(
        (sum, event) => {
          const eventHour = event.created_at
            ? new Date(event.created_at).getHours()
            : 12;
          return eventHour >= hourStart && eventHour < hourEnd
            ? sum + (event.insulin || 0)
            : sum;
        },
        0,
      );

      return {
        hourLabel: hourLabels[index],
        carbs: carbsInSlot,
        mealInsulin: mealInsulinInSlot,
        correctionInsulin: correctionInsulinInSlot,
        totalInsulin: mealInsulinInSlot + correctionInsulinInSlot,
        hasData:
          carbsInSlot > 0 ||
          mealInsulinInSlot > 0 ||
          correctionInsulinInSlot > 0,
      };
    });
  };

  const timelineData = getTimelineData();
  const hasData = timelineData.some((slot) => slot.hasData);

  const maxCarbs = Math.max(...timelineData.map((s) => s.carbs), 1);
  const maxMealInsulin = Math.max(...timelineData.map((s) => s.mealInsulin), 1);
  const maxCorrectionInsulin = Math.max(
    ...timelineData.map((s) => s.correctionInsulin),
    1,
  );

  const TimelineBarGroup = ({ data, isLast }: any) => {
    const carbsHeight = Math.min((data.carbs / maxCarbs) * 50, 50);
    const mealInsulinHeight = Math.min(
      (data.mealInsulin / maxMealInsulin) * 50,
      50,
    );
    const correctionInsulinHeight = Math.min(
      (data.correctionInsulin / maxCorrectionInsulin) * 50,
      50,
    );

    return (
      <View style={timelineStyles.barGroup}>
        <View style={timelineStyles.valueLabels}>
          <Text style={timelineStyles.carbsValueLabel}>
            {data.carbs > 0 ? data.carbs : ""}
          </Text>

          <Text style={timelineStyles.mealValueLabel}>
            {data.mealInsulin > 0 ? data.mealInsulin.toFixed(1) : ""}
          </Text>

          <Text style={timelineStyles.correctionValueLabel}>
            {data.correctionInsulin > 0
              ? data.correctionInsulin.toFixed(1)
              : ""}
          </Text>
        </View>

        {/* Main bars container */}
        <View style={timelineStyles.barsContainer}>
          {/* Carbs Bar (left) */}
          <View style={timelineStyles.barColumn}>
            <View
              style={[
                timelineStyles.carbsBar,
                { height: carbsHeight },
                data.carbs === 0 && timelineStyles.emptyBar,
              ]}
            />
          </View>

          {/* Meal Insulin Bar (middle) */}
          <View style={timelineStyles.barColumn}>
            <View
              style={[
                timelineStyles.mealInsulinBar,
                { height: mealInsulinHeight },
                data.mealInsulin === 0 && timelineStyles.emptyBar,
              ]}
            />
          </View>

          {/* Correction Bar (right) */}
          <View style={timelineStyles.barColumn}>
            <View
              style={[
                timelineStyles.correctionInsulinBar,
                { height: correctionInsulinHeight },
                data.correctionInsulin === 0 && timelineStyles.emptyBar,
              ]}
            />
          </View>
        </View>

        {/* Hour label at the bottom */}
        <View style={timelineStyles.timeLabelContainer}>
          <View style={timelineStyles.timeLabelBackground}>
            <Text style={timelineStyles.timeLabel}>{data.hourLabel}</Text>
          </View>
          {!isLast && <View style={timelineStyles.slotDivider} />}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with feather accent */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Carbs & Insulin</Text>
        <View style={styles.featherAccent}>
          <Feather name="clock" size={16} color={VintageColors.primaryText} />
        </View>
      </View>

      <View style={styles.card}>
        {/* Compact Summary Row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <View style={styles.summaryContent}>
              <Ionicons
                name="fast-food"
                size={14}
                color={VintageColors.formAccent2}
              />
              <Text style={styles.summaryLabel}>
                {totalCarbs.toFixed(0)}g carbs
              </Text>
            </View>
            <Text style={styles.summarySubtext}>
              {todayMeals.length} meal{todayMeals.length !== 1 ? "s" : ""}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryItem}>
            <View style={styles.summaryContent}>
              <Ionicons
                name="water"
                size={14}
                color={VintageColors.formAccent1}
              />
              <Text style={styles.summaryLabel}>
                {insulinAnalysis.mealInsulin.toFixed(1)}U meal insulin
              </Text>
            </View>
            <Text style={styles.summarySubtext}>
              {insulinAnalysis.mealEvents} bolus
              {insulinAnalysis.mealEvents !== 1 ? "es" : ""}
            </Text>
          </View>
        </View>

        {/* Timeline Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLine} />
          <Text style={styles.sectionHeaderText}>Daily timeline</Text>
          <View style={styles.sectionHeaderLine} />
        </View>

        {/* Timeline Visualization */}
        <View style={styles.timelineContainer}>
          {hasData ? (
            <>
              {/* Legend at the top */}
              <View style={timelineStyles.legend}>
                <View style={timelineStyles.legendItem}>
                  <View
                    style={[
                      timelineStyles.legendSquare,
                      { backgroundColor: VintageColors.formAccent2 },
                    ]}
                  />
                  <Text style={timelineStyles.legendText}>Carbs</Text>
                </View>
                <View style={timelineStyles.legendItem}>
                  <View
                    style={[
                      timelineStyles.legendSquare,
                      { backgroundColor: VintageColors.formAccent1 },
                    ]}
                  />
                  <Text style={timelineStyles.legendText}>Meal insulin</Text>
                </View>
                <View style={timelineStyles.legendItem}>
                  <View
                    style={[
                      timelineStyles.legendSquare,
                      { backgroundColor: VintageColors.formAccent3 },
                    ]}
                  />
                  <Text style={timelineStyles.legendText}>Correction</Text>
                </View>
              </View>

              {/* Timeline Bars Grid */}
              <View style={timelineStyles.timelineGrid}>
                {timelineData.map((slot, index) => (
                  <TimelineBarGroup
                    key={index}
                    data={slot}
                    isLast={index === timelineData.length - 1}
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="restaurant-outline"
                size={28}
                color={VintageColors.secondaryText}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>
                No carb or insulin data today
              </Text>
              <Text style={styles.emptySubtext}>
                Log meals and insulin to see timeline
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles: any = {
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: VintageColors.primaryText,
    fontStyle: "italic",
    marginLeft: 6,
  },
  summarySubtext: {
    fontSize: 11,
    color: VintageColors.secondaryText,
    fontStyle: "italic",
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: VintageColors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
  timelineContainer: {
    minHeight: 100,
    justifyContent: "center",
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

const timelineStyles: any = {
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 4,
  },
  legendSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: VintageColors.secondaryText,
    fontStyle: "italic",
  },
  timelineGrid: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 90,
    marginHorizontal: 2,
    position: "relative",
  },
  barGroup: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    position: "relative",
  },
  valueLabels: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    height: 16,
    alignItems: "flex-start",
  },
  carbsValueLabel: {
    fontSize: 9,
    color: VintageColors.formAccent2,
    fontWeight: "600",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 3,
    paddingHorizontal: 2,
    overflow: "hidden",
  },
  mealValueLabel: {
    fontSize: 9,
    color: VintageColors.formAccent1,
    fontWeight: "600",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 3,
    paddingHorizontal: 2,
    overflow: "hidden",
  },
  correctionValueLabel: {
    fontSize: 9,
    color: VintageColors.formAccent3,
    fontWeight: "600",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 3,
    paddingHorizontal: 2,
    overflow: "hidden",
  },
  barsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    height: 70,
    alignItems: "flex-end",
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
    marginHorizontal: 1,
  },
  carbsBar: {
    width: 12,
    backgroundColor: VintageColors.formAccent2,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  mealInsulinBar: {
    width: 12,
    backgroundColor: VintageColors.formAccent1,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  correctionInsulinBar: {
    width: 12,
    backgroundColor: VintageColors.formAccent3,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  emptyBar: {
    backgroundColor: VintageColors.lightBackground + "60",
  },
  barLabelContainer: {
    marginTop: 4,
  },
  barLabel: {
    fontSize: 9,
    color: VintageColors.secondaryText,
    fontWeight: "600",
  },
  timeLabelContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    height: 18,
    flexDirection: "row",
    justifyContent: "center",
  },
  timeLabelBackground: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 4,
    borderRadius: 2,
    zIndex: 2,
  },
  timeLabel: {
    fontSize: 9,
    color: VintageColors.secondaryText,
    fontStyle: "italic",
    fontWeight: "500",
  },
  slotDivider: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: VintageColors.border,
  },
  xAxisContainer: {
    marginTop: 8,
    alignItems: "center",
  },
  xAxisLabel: {
    fontSize: 9,
    color: VintageColors.secondaryText,
    fontWeight: "500",
    fontStyle: "italic",
  },
  xAxisScale: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 6,
  },
  scaleLabel: {
    fontSize: 8,
    color: VintageColors.secondaryText,
    fontStyle: "italic",
    width: 12,
    textAlign: "center",
  },
};
