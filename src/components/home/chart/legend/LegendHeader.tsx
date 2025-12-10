import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { VintageColors } from "../../../../themes/vintage/colors";
import { styles } from "../../../../themes/vintage/home/chart/legend";

export const LegendHeader: React.FC = () => {
  return (
    <View style={styles.legendHeader}>
      <Feather name="info" size={14} color={VintageColors.primaryText} />
      <Text style={styles.legendTitle}>Chart Legend</Text>
      <Text style={styles.legendHint}>(Tap for details)</Text>
    </View>
  );
};
