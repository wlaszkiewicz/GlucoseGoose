import React from "react";
import { Text, Image, StyleSheet, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HomeScreenProps } from "../types/navigation";
import { getPlatformStyles, CommonStyles } from "../themes/styles";
import { useNightscout } from "../context/NightscoutContext";
import { useEffect } from "react";
import { logoutUser } from "../services/authService";

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { entries, loadInitial, startPolling, stopPolling, isLoading } =
    useNightscout();

  useEffect(() => {
    loadInitial(); //  once per login
    startPolling();

    return () => stopPolling();
  }, []);

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      //TODO: THERES A BUG HERE WHERE THE CONTEXT KEEPS THE OLD DATA AFTER LOGOUT/LOGIN!! so a new user sees the previous user's data .......
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
