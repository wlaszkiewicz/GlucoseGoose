import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VintageStylesHome } from "../../themes/vintage/styles_vintage_home";
import {
  getGlucoseColor,
  getGlucoseStatus,
  formatTime,
} from "../../utils/chartUtils";

interface CurrentGlucoseCardProps {
  entries: any[];
}

export const CurrentGlucoseCard: React.FC<CurrentGlucoseCardProps> = ({
  entries,
}) => {
  const latestEntry = entries[entries.length - 1];
  const glucoseColor = getGlucoseColor(latestEntry.sgv);
  const glucoseStatus = getGlucoseStatus(latestEntry.sgv);

  return (
    <View style={VintageStylesHome.currentGlucoseCard}>
      <View style={VintageStylesHome.currentGlucoseHeader}>
        <View
          style={[
            VintageStylesHome.glucoseStatusIcon,
            { backgroundColor: glucoseColor },
          ]}
        >
          <Ionicons name="pulse" size={16} color="white" />
        </View>
        <Text style={VintageStylesHome.currentGlucoseTitle}>
          Current Glucose
        </Text>
      </View>
      <View style={VintageStylesHome.currentGlucoseContent}>
        <View style={VintageStylesHome.glucoseValueContainer}>
          <Text style={VintageStylesHome.glucoseValueLabel}>VALUE</Text>
          <Text
            style={[VintageStylesHome.glucoseValue, { color: glucoseColor }]}
          >
            {latestEntry.sgv}
          </Text>
          <Text
            style={[VintageStylesHome.glucoseStatus, { color: glucoseColor }]}
          >
            {glucoseStatus}
          </Text>
        </View>
        <View style={VintageStylesHome.glucoseTimeContainer}>
          <Text style={VintageStylesHome.glucoseTimeLabel}>TIME</Text>
          <Text style={VintageStylesHome.glucoseTime}>
            {formatTime(new Date(latestEntry.date))}
          </Text>
          <Text style={VintageStylesHome.glucoseDate}>
            {new Date(latestEntry.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>
      </View>
    </View>
  );
};
