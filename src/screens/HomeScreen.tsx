import React from "react";
import { Text, Image, StyleSheet, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HomeScreenProps } from "../types/navigation";
import { getPlatformStyles, CommonStyles } from "../themes/styles";
import { useNightscout } from "../context/NightscoutContext";
import { useEffect } from "react";
import { logoutUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { userData } = useAuth();
  const nightscoutUrl = userData?.nightscoutUrl;
  const {
    entries,
    meals,
    activities,
    loadFullDay,
    startPolling,
    stopPolling,
    isLoading,
    reset,
    error,
  } = useNightscout();

  useEffect(() => {
    if (!nightscoutUrl) return;

    (async () => {
      await loadFullDay();
      startPolling();
    })();

    return () => stopPolling();
  }, [nightscoutUrl]);

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      reset();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" as any }],
      });
    } else {
      console.error("Logout failed:", result.error);
    }
  };

  const platformStyles = getPlatformStyles();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView
        style={platformStyles.container}
        contentContainerStyle={platformStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={CommonStyles.appTitle}>MY GOOSNES IT WORKS?</Text>

        {error && <Text style={{ color: "red" }}>{error}</Text>}

        <Text
          onPress={handleLogout}
          style={{ color: "blue", marginBottom: 20 }}
        >
          Logout
        </Text>

        {isLoading && <Text>Loading data...</Text>}
        {entries.length === 0 && !isLoading ? (
          <Text>No data yet...</Text>
        ) : (
          entries.map((entry) => (
            <View
              key={entry.date}
              style={{
                padding: 8,
                marginBottom: 4,
                borderWidth: 1,
                borderRadius: 6,
                borderColor: "#ccc",
              }}
            >
              <Text>Time: {new Date(entry.date).toLocaleTimeString()}</Text>
              <Text>BG: {entry.sgv}</Text>
            </View>
          ))
        )}

        {meals.length > 0 && (
          <>
            <Text style={{ fontSize: 18, marginTop: 20, marginBottom: 10 }}>
              Meals:
            </Text>
            {meals.map((meal) => (
              <View
                key={meal._id}
                style={{
                  padding: 8,
                  marginBottom: 4,
                  borderWidth: 1,
                  borderRadius: 6,
                  borderColor: "#ccc",
                }}
              >
                <Text>Type: {meal.eventType}</Text>
                <Text>Carbs: {meal.carbs || "N/A"}</Text>
                <Text>Time: {new Date(meal.created_at).toLocaleString()}</Text>
              </View>
            ))}
          </>
        )}

        {activities.length > 0 && (
          <>
            <Text style={{ fontSize: 18, marginTop: 20, marginBottom: 10 }}>
              Activities:
            </Text>
            {activities.map((activity) => (
              <View
                key={activity._id}
                style={{
                  padding: 8,
                  marginBottom: 4,
                  borderWidth: 1,
                  borderRadius: 6,
                  borderColor: "#ccc",
                }}
              >
                <Text>Type: {activity.eventType}</Text>
                <Text>
                  Duration:{" "}
                  {activity.duration ? `${activity.duration} mins` : "N/A"}
                </Text>
                <Text>
                  Time: {new Date(activity.created_at).toLocaleString()}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gooseIcon: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginTop: 50,
  },
});

export default HomeScreen;
