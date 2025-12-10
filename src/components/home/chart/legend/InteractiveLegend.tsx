import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { VintageColors } from "../../../../themes/vintage/colors";
import { CHART_COLORS } from "../../../../utils/chartUtils/chartUtils";
import {
  getEventCategory,
  getCategoryDisplayName,
  getCategoryColor,
  getEventColor,
  getInsulinColor,
  getTargetColor,
  getMealIcon,
  getActivityIcon,
  getInsulinIcon,
  getTargetIcon,
  getColorExplanation,
} from "../../../../utils/chartUtils/chartUtils";
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
    icons?: string[];
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

  const hasMeals = (): boolean => {
    return chartEvents.some((event) => {
      const category = getEventCategory(event);
      if (category !== "meal") return false;
      if (event.eventType === "Meal Bolus") return false;

      const mealType = event.eventType?.replace("Meal: ", "") || "";
      return ["Breakfast", "Lunch", "Dinner"].includes(mealType);
    });
  };

  const hasSnacks = (): boolean => {
    return chartEvents.some((event) => {
      const category = getEventCategory(event);
      if (category !== "meal") return false;
      if (event.eventType === "Meal Bolus") return false;

      const mealType = event.eventType?.replace("Meal: ", "") || "";
      return [
        "Morning Snack",
        "Afternoon Snack",
        "Evening Snack",
        "Other",
      ].includes(mealType);
    });
  };

  const hasActivities = (): boolean => {
    return chartEvents.some((event) => {
      return getEventCategory(event) === "activity";
    });
  };

  const hasInsulinBolus = (): boolean => {
    return chartEvents.some((event) => {
      const category = getEventCategory(event);
      return category === "insulin";
    });
  };

  const hasTempBasals = (): boolean => {
    return chartEvents.some((event) => {
      const category = getEventCategory(event);
      return category === "basal";
    });
  };

  const hasTargets = (): boolean => {
    return chartEvents.some((event) => {
      return getEventCategory(event) === "target";
    });
  };

  const hasDeviceEvents = (): boolean => {
    return chartEvents.some((event) => {
      const category = getEventCategory(event);
      return category === "device";
    });
  };

  const hasNotes = (): boolean => {
    return chartEvents.some((event) => {
      const category = getEventCategory(event);
      return category === "note";
    });
  };

  const hasAnnouncements = (): boolean => {
    return chartEvents.some((event) => {
      const category = getEventCategory(event);
      if (category !== "other") return false;
      const eventType = event.eventType?.toLowerCase() || "";
      return (
        eventType.includes("announcement") || eventType.includes("announce")
      );
    });
  };

  const hasOtherEvents = (): boolean => {
    return chartEvents.some((event) => {
      const category = getEventCategory(event);
      if (category !== "other") return false;
      const eventType = event.eventType?.toLowerCase() || "";
      return (
        !eventType.includes("announcement") && !eventType.includes("announce")
      );
    });
  };

  const legendItems: LegendItem[] = [
    {
      id: "meal",
      name: "Meals",
      icon: "restaurant",
      color: CHART_COLORS.mealBreakfast,
      description: "Food intake events including breakfast, lunch, and dinner",
      category: "meal",
      isVisible: hasMeals() && visibleEventTypes.meals,
      showColorExplanation: true,
      colorExplanation: getColorExplanation("meal"),
    },

    {
      id: "snack",
      name: "Snacks",
      icon: "nutrition",
      color: CHART_COLORS.mornigSnack,
      description:
        "Snack events including morning, afternoon, and evening snacks",
      category: "snack",
      isVisible: hasSnacks() && visibleEventTypes.meals,
      showColorExplanation: true,
      colorExplanation: getColorExplanation("snack"),
    },

    {
      id: "activity",
      name: "Activities",
      icon: "bicycle",
      color: CHART_COLORS.activityWalking,
      description:
        "Physical activities including walking, running, cycling, and more",
      category: "activity",
      isVisible: hasActivities() && visibleEventTypes.activities,
      showColorExplanation: true,
      colorExplanation: getColorExplanation("activity"),
    },

    {
      id: "insulin",
      name: "Insulin Bolus",
      icon: getInsulinIcon("Correction Bolus"),
      color: CHART_COLORS.bolusMedium,
      description: "Insulin bolus events for corrections or meals",
      category: "insulin",
      isVisible: hasInsulinBolus() && visibleEventTypes.insulin,
      showColorExplanation: true,
      colorExplanation: getColorExplanation("insulin"),
    },

    {
      id: "temp-basal",
      name: "Temp Basals",
      icon: getInsulinIcon("Temp Basal"),
      color: CHART_COLORS.basalNormal,
      description: "Temporary basal rate adjustments",
      category: "basal",
      isVisible: hasTempBasals() && visibleEventTypes.tempBasals,
      showColorExplanation: true,
      colorExplanation: getColorExplanation("basal"),
    },

    {
      id: "target",
      name: "Targets",
      icon: getTargetIcon("Custom"),
      color: CHART_COLORS.targetCustom,
      description: "Temporary glucose targets for different situations",
      category: "target",
      isVisible: hasTargets() && visibleEventTypes.targets,
      showColorExplanation: true,
      colorExplanation: getColorExplanation("target"),
    },

    {
      id: "device",
      name: "Device Events",
      icon: "bandage",
      color: CHART_COLORS.deviceSite,
      description: "Device maintenance events like site and sensor changes",
      category: "device",
      isVisible: hasDeviceEvents() && visibleEventTypes.deviceEvents,
      showColorExplanation: true,
      colorExplanation: getColorExplanation("device"),
    },

    {
      id: "note",
      name: "Notes",
      icon: "document-text",
      color: CHART_COLORS.note,
      description: "Notes, comments, and observations",
      category: "note",
      isVisible: hasNotes() && visibleEventTypes.notes,
      showColorExplanation: false,
    },

    {
      id: "announcement",
      name: "Announcements",
      icon: "bullhorn",
      color: CHART_COLORS.announcement,
      description: "Important announcements, alerts, and notifications",
      category: "announcement",
      isVisible: hasAnnouncements() && visibleEventTypes.otherEvents,
      showColorExplanation: false,
    },

    {
      id: "other",
      name: "Other Events",
      icon: "help-circle",
      color: CHART_COLORS.other,
      description: "Miscellaneous events not in other categories",
      category: "other",
      isVisible: hasOtherEvents() && visibleEventTypes.otherEvents,
      showColorExplanation: false,
    },
  ];

  const visibleItems = legendItems.filter((item) => item.isVisible);

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
        {item.icon !== "target" &&
        item.icon !== "bullhorn" &&
        item.icon !== "run" &&
        item.icon !== "exclamation" &&
        item.icon !== "food-variant" &&
        item.icon !== "trending-down" &&
        item.icon !== "trending-up" &&
        item.icon !== "arrow-right" ? (
          <Ionicons name={item.icon as any} size={14} color="white" />
        ) : (
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
                {item.icon !== "target" &&
                item.icon !== "bullhorn" &&
                item.icon !== "run" &&
                item.icon !== "exclamation" &&
                item.icon !== "food-variant" &&
                item.icon !== "trending-down" &&
                item.icon !== "trending-up" &&
                item.icon !== "arrow-right" ? (
                  <Ionicons name={item.icon as any} size={24} color="white" />
                ) : (
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
                    { backgroundColor: getCategoryColor(item.category as any) },
                  ]}
                >
                  <Text style={styles.categoryText}>
                    {getCategoryDisplayName(item.category as any)}
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
                  <Text style={styles.colorInfoTitle}>Color & Icon Guide:</Text>
                  <View style={styles.colorGrid}>
                    {item.colorExplanation.colors.map((color, index) => (
                      <View key={index} style={styles.colorExample}>
                        <View style={styles.colorExampleIconContainer}>
                          <View
                            style={[
                              styles.colorDot,
                              { backgroundColor: color },
                            ]}
                          />
                          {item.colorExplanation?.icons?.[index] && (
                            <View style={styles.colorIconContainer}>
                              {item.colorExplanation.icons[index] !==
                                "target" &&
                              item.colorExplanation.icons[index] !==
                                "bullhorn" &&
                              item.colorExplanation.icons[index] !== "run" &&
                              item.colorExplanation.icons[index] !==
                                "exclamation" &&
                              item.colorExplanation.icons[index] !==
                                "food-variant" &&
                              item.colorExplanation.icons[index] !==
                                "trending-down" &&
                              item.colorExplanation.icons[index] !==
                                "trending-up" &&
                              item.colorExplanation.icons[index] !==
                                "arrow-right" ? (
                                <Ionicons
                                  name={
                                    item.colorExplanation.icons[index] as any
                                  }
                                  size={12}
                                  color="white"
                                />
                              ) : (
                                <MaterialCommunityIcons
                                  name={item.colorExplanation.icons[index]}
                                  size={12}
                                  color="white"
                                />
                              )}
                            </View>
                          )}
                        </View>
                        <Text style={styles.colorLabel}>
                          {item.colorExplanation?.labels[index]}
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
          {visibleItems.map((item) => (
            <LegendItemComponent key={item.id} item={item} />
          ))}
        </ScrollView>
      </View>

      <InfoModal />
    </>
  );
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
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "white",
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
    gap: 10,
  },
  colorExample: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colorExampleIconContainer: {
    position: "relative",
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  colorIconContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  colorLabel: {
    fontSize: 13,
    color: VintageColors.primaryText,
    flex: 1,
  },
});
