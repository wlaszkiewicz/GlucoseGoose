import { ActivityMetrics, ActivityType, activityTypes } from "../types/events";
import { VintageColors } from "../themes/vintage/colors_vintage";

const extractMetricsFromActivity = (activity: any): ActivityMetrics => {
  return {
    duration: activity.duration || 0,
    intensity: (activity.intensity as "Low" | "Medium" | "High") || "Medium",
    caloriesBurned: activity.caloriesBurned || activity.calories,
    heartRate: activity.heartRate,
    distance: activity.distance,
    notes: activity.notes,
  };
};

const getTodayActivityStats = (activities: any[]) => {
  return activities.reduce(
    (total: any, activity: any) => {
      const metrics = extractMetricsFromActivity(activity);
      total.totalDuration += metrics.duration || 0;
      total.totalCalories += metrics.caloriesBurned || 0;
      total.totalDistance += metrics.distance || 0;
      total.activityCount += 1;
      return total;
    },
    {
      totalDuration: 0,
      totalCalories: 0,
      totalDistance: 0,
      activityCount: 0,
    }
  );
};

const getActivityTypeFromEvent = (eventType: string): ActivityType => {
  const type = eventType.replace(/^(Activity|Exercise):?\s*/i, "");
  return activityTypes.includes(type as ActivityType)
    ? (type as ActivityType)
    : "Other";
};

const getActivityIcon = (activityType: ActivityType) => {
  const icons: Record<ActivityType, string> = {
    Walking: "walk-outline",
    Running: "fitness-outline",
    Cycling: "bicycle-outline",
    Swimming: "water-outline",
    Yoga: "body-outline",
    "Weight Training": "barbell-outline",
    Hiking: "trail-sign-outline",
    Dancing: "musical-notes-outline",
    "Team Sports": "football-outline",
    Other: "ellipsis-horizontal-outline",
  };
  return icons[activityType];
};

const getActivityColor = (activityType: ActivityType): string => {
  const colors: Record<ActivityType, string> = {
    Walking: VintageColors.iconGreen,
    Running: VintageColors.iconPink,
    Cycling: VintageColors.iconBlue,
    Swimming: VintageColors.iconPurple,
    Yoga: VintageColors.iconYellow,
    "Weight Training": VintageColors.iconBlue,
    Hiking: VintageColors.iconGreen,
    Dancing: VintageColors.iconPink,
    "Team Sports": VintageColors.iconPurple,
    Other: VintageColors.iconYellow,
  };
  return colors[activityType];
};

export {
  extractMetricsFromActivity,
  getTodayActivityStats,
  getActivityTypeFromEvent,
  getActivityIcon,
  getActivityColor,
};
