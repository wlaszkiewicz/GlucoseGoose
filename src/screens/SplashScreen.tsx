import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Image } from "react-native";
import { VintageColors } from "../themes/vintage/colors";

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/goose1-nobg.png")}
        style={{ width: 100, height: 100, marginBottom: 20 }}
      />
      <Text style={styles.title}>GlucoseGoose</Text>
      <ActivityIndicator size="large" color={VintageColors.primaryText} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: VintageColors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: VintageColors.primaryText,
  },
});

export default SplashScreen;
