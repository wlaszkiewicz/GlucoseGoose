import React from "react";
import { View, Text } from "react-native";
import {
  Ionicons,
  Feather,
  MaterialIcons,
  FontAwesome,
} from "@expo/vector-icons";
import { VintageStylesHome } from "../../themes/vintage/styles_vintage_home";
import {
  getGlucoseColor,
  getGlucoseStatus,
  formatTime,
} from "../../utils/chartUtils/chartUtils";
import { NightscoutEntry } from "../../types/nightscout";
import { VintageColors } from "../../themes/vintage/colors";

interface CurrentGlucoseCardProps {
  entries: NightscoutEntry[];
}

export const CurrentGlucoseCard: React.FC<CurrentGlucoseCardProps> = ({
  entries,
}) => {
  const latestEntry = entries[entries.length - 1];
  const glucoseColor = getGlucoseColor(latestEntry.sgv);
  const glucoseStatus = getGlucoseStatus(latestEntry.sgv);

  const now = Date.now();
  const entryDate = latestEntry.date;
  const minutesAgo = Math.floor((now - entryDate) / (1000 * 60));

  let timeColor = VintageColors.primaryText;
  if (minutesAgo > 30) {
    timeColor = VintageColors.error || "#FF6B6B";
  } else if (minutesAgo > 15) {
    timeColor = VintageColors.warning || "#FFA726";
  }

  const minutesAgoText = minutesAgo <= 0 ? "Just now" : `${minutesAgo} min ago`;

  const getDirectionIcon = () => {
    const direction = latestEntry.direction?.toLowerCase() || "";
    const delta = latestEntry.delta || 0;

    switch (direction.toLocaleLowerCase()) {
      case "fortyfiveup":
        return "trending-up";
      case "fortyfivedown":
        return "trending-down";
      case "singleup":
        return "arrow-up";
      case "singledown":
        return "arrow-down";
      default:
        return "wifi-off";
    }
  };

  const getDeltaText = () => {
    const delta = latestEntry.delta;
    if (delta === undefined || delta === null) return "N/A";

    const sign = delta >= 0 ? "+" : "";
    return `${sign}${delta.toFixed(1)}`;
  };

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
        <Text style={VintageStylesHome.currentGlucoseTitle}>Current Value</Text>
      </View>

      <View style={VintageStylesHome.currentGlucoseContent}>
        {/* Left Column: Glucose Value  */}
        <View style={VintageStylesHome.glucoseValueContainer}>
          <Text style={VintageStylesHome.glucoseValueLabel}>GLUCOSE</Text>
          <View style={VintageStylesHome.glucoseRow}>
            <Text
              style={[VintageStylesHome.glucoseValue, { color: glucoseColor }]}
            >
              {latestEntry.sgv}
            </Text>
          </View>
          <Text
            style={[VintageStylesHome.glucoseStatus, { color: glucoseColor }]}
          >
            {glucoseStatus}
          </Text>
        </View>

        {/* Middle Column: Delta Value */}
        <View style={VintageStylesHome.glucoseDeltaContainer}>
          <Text style={VintageStylesHome.glucoseValueLabel}>TREND</Text>
          {latestEntry.direction &&
            latestEntry.direction.toLocaleLowerCase() !== "doubleup" &&
            latestEntry.direction.toLocaleLowerCase() !== "doubledown" && (
              <View style={VintageStylesHome.arrowContainer}>
                {latestEntry.direction.toLocaleLowerCase() !== "flat" && (
                  <Feather
                    name={getDirectionIcon()}
                    size={40}
                    color={glucoseColor}
                  />
                )}
                {latestEntry.direction.toLocaleLowerCase() === "flat" && (
                  <MaterialIcons
                    name="trending-flat"
                    size={40}
                    color={glucoseColor}
                  />
                )}
              </View>
            )}
          {latestEntry.direction &&
            latestEntry.direction.toLocaleLowerCase() == "doubleup" && (
              <View style={{ flexDirection: "row" }}>
                <View style={VintageStylesHome.arrowContainer}>
                  <FontAwesome
                    name="long-arrow-up"
                    size={40}
                    color={glucoseColor}
                  />
                </View>
                <View style={VintageStylesHome.arrowContainer}>
                  <FontAwesome
                    name="long-arrow-up"
                    size={40}
                    color={glucoseColor}
                  />
                </View>
              </View>
            )}

          {latestEntry.direction &&
            latestEntry.direction.toLocaleLowerCase() === "doubledown" && (
              <View style={{ flexDirection: "row" }}>
                <View style={VintageStylesHome.arrowContainer}>
                  <FontAwesome
                    name="long-arrow-down"
                    size={40}
                    color={glucoseColor}
                  />
                </View>
                <View style={VintageStylesHome.arrowContainer}>
                  <FontAwesome
                    name="long-arrow-down"
                    size={40}
                    color={glucoseColor}
                  />
                </View>
              </View>
            )}

          <Text style={VintageStylesHome.glucoseDeltaLabel}>
            {getDeltaText()} mg/dL
          </Text>
        </View>

        {/* Right Column: Time */}
        <View style={VintageStylesHome.glucoseTimeContainer}>
          <Text style={VintageStylesHome.glucoseTimeLabel}>TIME</Text>
          <Text style={[VintageStylesHome.glucoseTime, { color: timeColor }]}>
            {formatTime(new Date(latestEntry.date))}
          </Text>
          <Text
            style={[VintageStylesHome.glucoseMinutes, { color: timeColor }]}
          >
            {minutesAgoText}
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
