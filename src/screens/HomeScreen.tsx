import React from "react";
import { Text, Image, StyleSheet, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HomeScreenProps } from "../types/navigation";
import { getPlatformStyles, CommonStyles } from "../themes/styles";
import { useNightscout } from "../context/NightscoutContext";
import { useEffect } from "react";

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { entries, loadInitial, startPolling, stopPolling } = useNightscout();

  useEffect(() => {
    loadInitial(); //  once per login
    startPolling();

    return () => stopPolling();
  }, []);

  const platformStyles = getPlatformStyles();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView
        style={platformStyles.container}
        contentContainerStyle={platformStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={CommonStyles.appTitle}>MY GOOSNES IT WORKS?</Text>

        {entries.length === 0 ? (
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
