import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { CommonStyles } from "../../themes/styles";
import { useNightscout } from "../../context/NightscoutContext";

interface JournalScreenProps {
  selectedDate: Date;
}

const JournalScreen: React.FC<JournalScreenProps> = ({ selectedDate }) => {
  const [dayEntries, setDayEntries] = useState<any[]>([]);

  const { meals, activities, fetchUpdates, isLoading, reset, error } =
    useNightscout();

  const currentDayEntry = dayEntries.find(
    (entry) => entry.date === selectedDate.toISOString().split("T")[0]
  );

  const renderActivityContent = () => {
    if (error) return <Text style={styles.errorText}>{error}</Text>;
    if (isLoading)
      return <Text style={styles.contentText}>Loading activities...</Text>;
    if (activities.length === 0 && !currentDayEntry)
      return <Text style={styles.contentText}>No activities yet...</Text>;

    return (
      <ScrollView style={styles.activitiesList}>
        {activities.map((activity) => (
          <View
            key={activity._id || activity.created_at}
            style={styles.activityItem}
          >
            <Text style={styles.activityType}>{activity.eventType}</Text>
            {activity.duration !== undefined && (
              <Text style={styles.activityDetails}>
                Duration: {activity.duration} min
              </Text>
            )}
            {activity.notes && (
              <Text style={styles.activityDetails}>
                Notes: {activity.notes}
              </Text>
            )}
            <Text style={styles.activityTime}>
              {new Date(activity.created_at).toLocaleString()}
            </Text>
            {activity.carbs !== undefined && (
              <Text style={styles.activityDetails}>
                Carbs: {activity.carbs}g
              </Text>
            )}
            {activity.insulin !== undefined && (
              <Text style={styles.activityDetails}>
                Insulin: {activity.insulin}U
              </Text>
            )}
          </View>
        ))}

        {currentDayEntry?.sports && (
          <View style={CommonStyles.previousEntry}>
            <Text style={CommonStyles.previousEntryTitle}>
              Today's Activity:
            </Text>
            <Text style={CommonStyles.previousEntryText}>
              {currentDayEntry.sports}
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>{renderActivityContent()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flex: 1, padding: 10 },
  contentText: { fontSize: 18, textAlign: "center", marginTop: 20 },
  errorText: { fontSize: 16, color: "red", textAlign: "center", marginTop: 20 },
  activitiesList: { flex: 1 },
  activityItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  activityType: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  activityDetails: { fontSize: 14, color: "#666", marginBottom: 3 },
  activityTime: { fontSize: 12, color: "#999", marginTop: 5 },
});

export default JournalScreen;
