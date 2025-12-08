import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { VintageColors } from "../../../themes/vintage/colors_vintage";
import { PASTEL_COLORS } from "../../../utils/chartUtils";
import {
  getEventCategory,
  getCategoryDisplayName,
  getEventColor,
  getInsulinColor,
  getTargetColor,
  getMealIcon,
  getActivityIcon,
  getInsulinIcon,
  getTargetIcon,
} from "../../../utils/chartUtils";
import { StyleSheet } from "react-native";

interface LegendItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  category: string;
  isVisible: boolean;
  showColorExplanation?: boolean;
  colorExplanation?: {
    colors: string[];
    labels: string[];
  };
}

interface InteractiveLegendProps {
  visibleEventTypes: {
    meals: boolean;
    activities: boolean;
    insulin: boolean;
    tempBasals: boolean;
    targets: boolean;
    deviceEvents: boolean;
    notes: boolean;
    otherEvents: boolean;
  };
  chartEvents: any[];
}

export const InteractiveLegend: React.FC<InteractiveLegendProps> = ({
  visibleEventTypes,
  chartEvents,
}) => {
  const [showInfoModal, setShowInfoModal] = useState<string | null>(null);

  const getColorExplanation = (category: string) => {
    switch (category) {
      case "insulin":
        return {
          colors: [
            PASTEL_COLORS.bolusSmall,
            PASTEL_COLORS.bolusMedium,
            PASTEL_COLORS.bolusLarge,
          ],
          labels: ["Small dose", "Medium dose", "Large dose"],
        };
      case "basal":
        return {
          colors: [
            "#8CB3E3", // Strong reduction
            PASTEL_COLORS.basalReduced,
            PASTEL_COLORS.basalNormal,
            PASTEL_COLORS.basalIncreased,
            "#FFB347", // Strong increase
          ],
          labels: [
            "Strong reduction",
            "Reduction",
            "No change",
            "Increase",
            "Strong increase",
          ],
        };
      case "target":
        return {
          colors: [
            PASTEL_COLORS.targetMeal,
            PASTEL_COLORS.targetActivity,
            PASTEL_COLORS.targetHypo,
            PASTEL_COLORS.targetCustom,
          ],
          labels: [
            "Meal target",
            "Activity target",
            "Hypo target",
            "Custom target",
          ],
        };
      case "meal":
        return {
          colors: [
            PASTEL_COLORS.mealBreakfast,
            PASTEL_COLORS.mealLunch,
            PASTEL_COLORS.mealDinner,
            PASTEL_COLORS.mealSnack,
          ],
          labels: ["Breakfast", "Lunch", "Dinner", "Snack"],
        };
      case "activity":
        return {
          colors: [
            PASTEL_COLORS.activityWalking,
            PASTEL_COLORS.activityRunning,
            PASTEL_COLORS.activityTraining,
            PASTEL_COLORS.activitySports,
          ],
          labels: ["Walking", "Running", "Training", "Sports"],
        };
      default:
        return undefined;
    }
  };

  const getPresentMealTypes = (): string[] => {
    const mealTypes = new Set<string>();
    chartEvents.forEach((event) => {
      const category = getEventCategory(event);
      if (
        category === "meal" &&
        event.eventType &&
        event.eventType !== "Meal Bolus"
      ) {
        const mealType = event.eventType.replace("Meal: ", "");
        mealTypes.add(mealType);
      }
    });
    return Array.from(mealTypes);
  };

  const hasEventsInCategory = (
    category: string,
    specificType?: string
  ): boolean => {
    if (specificType) {
      return chartEvents.some((event) => {
        const eventCategory = getEventCategory(event);
        if (eventCategory !== category) return false;

        if (category === "meal" && event.eventType === "Meal Bolus") {
          return false;
        }

        if (category === "meal" && event.eventType) {
          return event.eventType.includes(specificType);
        }
        if (category === "activity" && event.eventType) {
          return event.eventType
            .toLowerCase()
            .includes(specificType.toLowerCase());
        }
        return true;
      });
    }

    return chartEvents.some((event) => {
      const eventCategory = getEventCategory(event);

      if (category === "other") {
        return (
          eventCategory === "note" ||
          eventCategory === "other" ||
          eventCategory === "unknown"
        );
      }

      if (category === "meal" && event.eventType === "Meal Bolus") {
        return false;
      }

      return eventCategory === category;
    });
  };

  const getPresentActivityTypes = (): string[] => {
    const activityTypes = new Set<string>();
    chartEvents.forEach((event) => {
      if (getEventCategory(event) === "activity" && event.eventType) {
        const activityType = event.eventType.replace(
          /^(Activity|Exercise):?\s*/i,
          ""
        );
        activityTypes.add(activityType);
      }
    });
    return Array.from(activityTypes);
  };

  const presentMealTypes = getPresentMealTypes();
  const presentActivityTypes = getPresentActivityTypes();

  const legendItems: LegendItem[] = [
    ...(hasEventsInCategory("meal") && visibleEventTypes.meals
      ? [
          {
            id: "meal-breakfast",
            name: "Breakfast",
            icon: getMealIcon("Breakfast"),
            color: PASTEL_COLORS.mealBreakfast,
            description: "Food intake - breakfast or morning meal",
            category: "meal",
            isVisible:
              presentMealTypes.includes("Breakfast") ||
              presentMealTypes.length > 0,
            showColorExplanation: true,
            colorExplanation: getColorExplanation("meal"),
          },
          {
            id: "meal-lunch",
            name: "Lunch",
            icon: getMealIcon("Lunch"),
            color: PASTEL_COLORS.mealLunch,
            description: "Food intake - lunch or midday meal",
            category: "meal",
            isVisible: presentMealTypes.includes("Lunch"),
            showColorExplanation: false,
          },
          {
            id: "meal-dinner",
            name: "Dinner",
            icon: getMealIcon("Dinner"),
            color: PASTEL_COLORS.mealDinner,
            description: "Food intake - dinner or evening meal",
            category: "meal",
            isVisible: presentMealTypes.includes("Dinner"),
            showColorExplanation: false,
          },
          {
            id: "meal-snack",
            name: "Snack",
            icon: getMealIcon("Other"),
            color: PASTEL_COLORS.mealSnack,
            description: "Food intake - snack or small meal",
            category: "meal",
            isVisible: presentMealTypes.some((type) =>
              [
                "Morning Snack",
                "Afternoon Snack",
                "Evening Snack",
                "Other",
              ].includes(type)
            ),
            showColorExplanation: false,
          },
        ]
      : []),

    ...(hasEventsInCategory("activity") && visibleEventTypes.activities
      ? [
          {
            id: "activity-walking",
            name: "Walking/Hiking",
            icon: getActivityIcon("Walking"),
            color: PASTEL_COLORS.activityWalking,
            description: "Walking, hiking, or light cardio activity",
            category: "activity",
            isVisible: presentActivityTypes.some(
              (type) =>
                type.toLowerCase().includes("walk") ||
                type.toLowerCase().includes("hike")
            ),
            showColorExplanation: true,
            colorExplanation: getColorExplanation("activity"),
          },
          {
            id: "activity-running",
            name: "Running/Dancing",
            icon: getActivityIcon("Running"),
            color: PASTEL_COLORS.activityRunning,
            description: "Running, dancing, or intense cardio activity",
            category: "activity",
            isVisible: presentActivityTypes.some(
              (type) =>
                type.toLowerCase().includes("run") ||
                type.toLowerCase().includes("dance")
            ),
            showColorExplanation: false,
          },
          {
            id: "activity-training",
            name: "Weight Training",
            icon: getActivityIcon("Weight Training"),
            color: PASTEL_COLORS.activityTraining,
            description: "Strength training or weight lifting",
            category: "activity",
            isVisible: presentActivityTypes.some(
              (type) =>
                type.toLowerCase().includes("weight") ||
                type.toLowerCase().includes("train")
            ),
            showColorExplanation: false,
          },
        ]
      : []),

    // Insulin Events
    {
      id: "correction-bolus",
      name: "Correction Bolus",
      icon: getInsulinIcon("Correction Bolus"),
      color: PASTEL_COLORS.bolusMedium, // Use from palette
      description:
        "Insulin taken to correct high glucose levels. Color indicates dose size.",
      category: "insulin",
      isVisible: hasEventsInCategory("insulin") && visibleEventTypes.insulin,
      showColorExplanation: true,
      colorExplanation: getColorExplanation("insulin"),
    },
    {
      id: "meal-bolus",
      name: "Meal Bolus",
      icon: getInsulinIcon("Meal Bolus"),
      color: PASTEL_COLORS.bolusMedium,
      description: "Insulin taken with a meal. Color indicates dose size.",
      category: "insulin",
      isVisible: hasEventsInCategory("insulin") && visibleEventTypes.insulin,
      showColorExplanation: false, // Already explained in correction bolus
    },
    {
      id: "temp-basal",
      name: "Temp Basal",
      icon: getInsulinIcon("Temp Basal"),
      color: PASTEL_COLORS.basalNormal,
      description:
        "Temporary basal rate change. Color indicates direction and intensity.",
      category: "basal",
      isVisible: hasEventsInCategory("basal") && visibleEventTypes.tempBasals,
      showColorExplanation: true,
      colorExplanation: getColorExplanation("basal"),
    },

    // Target Events
    {
      id: "target",
      name: "Temporary Target",
      icon: getTargetIcon("Custom"),
      color: PASTEL_COLORS.targetCustom,
      description: "Custom temporary glucose target",
      category: "target",
      isVisible: hasEventsInCategory("target") && visibleEventTypes.targets,
      showColorExplanation: true,
      colorExplanation: getColorExplanation("target"),
    },

    // Device Events
    {
      id: "site-change",
      name: "Site Change",
      icon: "bandage",
      color: PASTEL_COLORS.deviceSite,
      description: "Insulin pump infusion site changed",
      category: "device",
      isVisible:
        hasEventsInCategory("device", "site") && visibleEventTypes.deviceEvents,
      showColorExplanation: false,
    },
    {
      id: "sensor-change",
      name: "Sensor Change",
      icon: "signal-cellular-2",
      color: PASTEL_COLORS.deviceSensor,
      description: "CGM sensor changed/inserted",
      category: "device",
      isVisible:
        hasEventsInCategory("device", "sensor") &&
        visibleEventTypes.deviceEvents,
      showColorExplanation: false,
    },
    ...(hasEventsInCategory("note") || hasEventsInCategory("other")
      ? [
          {
            id: "note",
            name: "Notes",
            icon: "document-text",
            color: PASTEL_COLORS.note,
            description: "Notes, comments, or general annotations",
            category: "note",
            isVisible:
              (hasEventsInCategory("note") || hasEventsInCategory("other")) &&
              true,
            showColorExplanation: false,
          },
          {
            id: "announcement",
            name: "Announcements",
            icon: "bullhorn",
            color: PASTEL_COLORS.announcement,
            description: "Important announcements or notifications",
            category: "other",
            isVisible: hasEventsInCategory("other"),
            showColorExplanation: false,
          },
        ]
      : []),
  ];

  const visibleItems = legendItems.filter((item) => item.isVisible);

  const groupedItems = visibleItems.reduce((groups, item) => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
    return groups;
  }, {} as Record<string, LegendItem[]>);

  if (visibleItems.length === 0) {
    return null;
  }

  const LegendItemComponent = ({ item }: { item: LegendItem }) => (
    <TouchableOpacity
      style={styles.legendItem}
      onPress={() => setShowInfoModal(item.id)}
      activeOpacity={0.7}
    >
      <View
        style={[styles.legendIconContainer, { backgroundColor: item.color }]}
      >
        {item.icon !== "target" && item.icon !== "bullhorn" && (
          <Ionicons name={item.icon as any} size={14} color="white" />
        )}
        {(item.icon === "target" || item.icon === "bullhorn") && (
          <MaterialCommunityIcons name={item.icon} size={14} color="white" />
        )}
      </View>
      <Text style={styles.legendItemText} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const InfoModal = () => {
    if (!showInfoModal) return null;

    const item = legendItems.find((i) => i.id === showInfoModal);
    if (!item) return null;

    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInfoModal(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowInfoModal(null)}
        >
          <TouchableOpacity
            style={styles.infoModalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.infoHeader}>
              <View style={[styles.infoIcon, { backgroundColor: item.color }]}>
                {item.icon !== "target" && item.icon !== "bullhorn" && (
                  <Ionicons name={item.icon as any} size={24} color="white" />
                )}
                {(item.icon === "target" || item.icon === "bullhorn") && (
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={24}
                    color="white"
                  />
                )}
              </View>
              <View style={styles.infoTitleContainer}>
                <Text style={styles.infoTitle}>{item.name}</Text>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: getCategoryColor(item.category) },
                  ]}
                >
                  <Text style={styles.categoryText}>
                    {getCategoryDisplayName(item.category)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowInfoModal(null)}
                style={styles.closeInfoButton}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={VintageColors.primaryText}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.infoBody}>
              <Text style={styles.infoDescription}>{item.description}</Text>

              {item.showColorExplanation && item.colorExplanation && (
                <View style={styles.colorInfo}>
                  <Text style={styles.colorInfoTitle}>Color Meaning:</Text>
                  <View style={styles.colorGrid}>
                    {item.colorExplanation.colors.map((color, index) => (
                      <View key={index} style={styles.colorExample}>
                        <View
                          style={[styles.colorDot, { backgroundColor: color }]}
                        />
                        <Text style={styles.colorLabel}>
                          {item.colorExplanation!.labels[index]}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  const categoryOrder = [
    "meal",
    "activity",
    "insulin",
    "basal",
    "target",
    "device",
    "other",
  ];

  return (
    <>
      <View style={styles.legendContainer}>
        <View style={styles.legendHeader}>
          <Feather name="info" size={14} color={VintageColors.primaryText} />
          <Text style={styles.legendTitle}>Chart Legend</Text>
          <Text style={styles.legendHint}>(Tap for details)</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.legendScrollContent}
        >
          {categoryOrder.map((category) => {
            const items = groupedItems[category];
            if (!items || items.length === 0) return null;

            return (
              <View key={category} style={styles.categoryGroup}>
                {items.map((item) => (
                  <LegendItemComponent key={item.id} item={item} />
                ))}
              </View>
            );
          })}
        </ScrollView>
      </View>

      <InfoModal />
    </>
  );
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case "meal":
      return "rgba(255, 214, 231, 0.2)";
    case "activity":
      return "rgba(181, 234, 215, 0.2)";
    case "insulin":
      return "rgba(255, 183, 178, 0.2)";
    case "basal":
      return "rgba(175, 203, 255, 0.2)";
    case "target":
      return "rgba(226, 240, 203, 0.2)";
    case "device":
      return "rgba(199, 206, 234, 0.2)";
    default:
      return "rgba(226, 240, 203, 0.2)";
  }
};

const styles: StyleSheet.NamedStyles<any> = StyleSheet.create({
  legendContainer: {
    marginTop: 8,
    marginBottom: 4,
    maxHeight: 60,
    width: "100%",
  },
  legendHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
    paddingHorizontal: 4,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: VintageColors.primaryText,
    flexShrink: 1,
  },
  legendHint: {
    fontSize: 10,
    color: VintageColors.secondaryText,
    fontStyle: "italic",
    marginLeft: "auto",
    flexShrink: 0,
  },
  legendScrollContent: {
    gap: 8,
    paddingRight: 20,
    flexDirection: "row",
  },
  categoryGroup: {
    flexDirection: "row",
    gap: 8,
    marginRight: 8,
    flexShrink: 0,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
    minWidth: 120,
    maxWidth: 140,
    maxHeight: 36,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    flexShrink: 1,
  },
  legendIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    flexShrink: 0,
  },
  legendItemText: {
    fontSize: 11,
    color: VintageColors.primaryText,
    fontWeight: "500",
    flex: 1,
    flexShrink: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  infoModalContent: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 16,
    width: "100%",
    maxWidth: 350,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: VintageColors.border,
    gap: 12,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    flexShrink: 0,
  },
  infoTitleContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 10,
    color: VintageColors.primaryText,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  closeInfoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: VintageColors.lightBackground,
    borderWidth: 1,
    borderColor: VintageColors.border,
    flexShrink: 0,
  },
  infoBody: {
    padding: 16,
  },
  infoDescription: {
    fontSize: 14,
    color: VintageColors.primaryText,
    lineHeight: 20,
    marginBottom: 16,
  },
  colorInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: VintageColors.border,
  },
  colorInfoTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 12,
  },
  colorGrid: {
    gap: 8,
  },
  colorExample: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  colorLabel: {
    fontSize: 13,
    color: VintageColors.primaryText,
    flex: 1,
  },
});
