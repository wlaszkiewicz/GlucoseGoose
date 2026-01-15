import React, { useRef, useState } from "react";
import {
  View,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
  Text,
} from "react-native";
import { CarbsInsulinBalance } from "./swipeable/CarbsManagement";
import { GlucoseSummary } from "./swipeable/GlucoseSummary";
import { EnergyBalance } from "./swipeable/EnergyBalance";
import { VintageColors } from "../../themes/vintage/colors";
import { InsulinBreakdown } from "./swipeable/InsulinBreakdown";
import { BasalAnalysis } from "./swipeable/BasalAnalysis";

interface SwipeableStatsProps {
  todayMeals: any[];
  insulinEvents: any[];
  totalBasalAdjustment: number;
  glucoseEntries: any[];
  caloriesConsumed: number;
  caloriesBurned: number;
  selectedDate: Date;
}

const { width } = Dimensions.get("window");

export const SwipeableStats: React.FC<SwipeableStatsProps> = ({
  todayMeals,
  insulinEvents,
  glucoseEntries,
  caloriesConsumed,
  caloriesBurned,
  selectedDate,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const CARD_WIDTH = width - 32;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / CARD_WIDTH);
    setActiveIndex(index);
  };

  const scrollToIndex = (index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * CARD_WIDTH,
        animated: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Cards */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        <View style={styles.cardContainer}>
          <CarbsInsulinBalance
            todayMeals={todayMeals}
            glucoseEntries={glucoseEntries}
            insulinEvents={insulinEvents}
            selectedDate={selectedDate}
          />
        </View>

        <View style={styles.cardContainer}>
          <InsulinBreakdown insulinEvents={insulinEvents} />
        </View>

        <View style={styles.cardContainer}>
          <BasalAnalysis
            insulinEvents={insulinEvents}
            glucoseEntries={glucoseEntries}
            selectedDate={selectedDate}
          />
        </View>

        <View style={styles.cardContainer}>
          <GlucoseSummary glucoseEntries={glucoseEntries} />
        </View>

        <View style={styles.cardContainer}>
          <EnergyBalance
            totalCaloriesConsumed={caloriesConsumed}
            totalCaloriesBurned={caloriesBurned}
            mealsCount={todayMeals.length}
            avgMealCalories={caloriesConsumed / (todayMeals.length || 1)}
            avgActivityCalories={caloriesBurned / (insulinEvents.length || 1)}
          />
        </View>
      </ScrollView>

      {/* Dots Indicator */}
      <View style={styles.dotsContainer}>
        {["Carbs", "Insulin", "Basal", "Glucose", "Energy"].map(
          (label, index) => (
            <View key={label} style={styles.dotWrapper}>
              <TouchableOpacity
                onPress={() => scrollToIndex(index)}
                activeOpacity={0.7}
                style={styles.dotTouchable}
              >
                <View
                  style={[
                    styles.dot,
                    activeIndex === index && styles.dotActive,
                    {
                      backgroundColor:
                        activeIndex === index
                          ? getDotColor(index)
                          : VintageColors.lightBorder,
                    },
                  ]}
                />
              </TouchableOpacity>
              <Text
                style={[
                  styles.dotLabel,
                  activeIndex === index && styles.dotLabelActive,
                  {
                    color:
                      activeIndex === index
                        ? getDotColor(index)
                        : VintageColors.secondaryText,
                  },
                ]}
              >
                {label}
              </Text>
            </View>
          )
        )}
      </View>
    </View>
  );
};

const getDotColor = (index: number): string => {
  switch (index) {
    case 0:
      return VintageColors.formAccent3;
    case 1:
      return VintageColors.formAccent1;
    case 2:
      return VintageColors.formAccent7;
    case 3:
      return VintageColors.formAccent8;
    case 4:
      return VintageColors.formAccent10;
    default:
      return VintageColors.secondaryText;
  }
};

const styles: any = {
  container: {},
  scrollView: {
    flexGrow: 0,
  },
  cardContainer: {
    width: width - 40,
    marginHorizontal: 4,
    alignSelf: "stretch",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dotWrapper: {
    alignItems: "center",
    marginHorizontal: 12,
    marginTop: -2,
  },
  dotTouchable: {
    padding: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  dotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    transform: [{ scale: 1.2 }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dotLabel: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dotLabelActive: {
    fontWeight: "600",
  },
};
