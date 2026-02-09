// components/trends/TimeRangeSelector.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { VintageColors } from "../../themes/vintage/colors";
import { TimeRange } from "../../hooks/useTrendsData";

interface TimeRangeSelectorProps {
  currentRange: TimeRange;
  onSelectRange: (range: TimeRange) => void;
  onCustomRangePress?: () => void;
  isLoading?: boolean;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  currentRange,
  onSelectRange,
  onCustomRangePress,
  isLoading = false,
}) => {
  const ranges: { label: string; value: TimeRange; icon: string }[] = [
    { label: "3 Days", value: "3d", icon: "calendar" },
    { label: "1 Week", value: "1w", icon: "calendar" },
    { label: "2 Weeks", value: "2w", icon: "calendar" },
    { label: "1 Month", value: "1m", icon: "calendar" },
    { label: "3 Months", value: "3m", icon: "calendar" },
  ];

  const getButtonColor = (value: TimeRange) => {
    if (currentRange === value) {
      switch (value) {
        case "3d":
          return VintageColors.formAccent1;
        case "1w":
          return VintageColors.formAccent2;
        case "2w":
          return VintageColors.formAccent3;
        case "1m":
          return VintageColors.formAccent4;
        case "3m":
          return VintageColors.formAccent5;
        case "custom":
          return VintageColors.formAccent1;
        default:
          return VintageColors.formAccent3;
      }
    }
    return VintageColors.lightBackground;
  };

  const getTextColor = (value: TimeRange) => {
    return currentRange === value ? "#FFFFFF" : VintageColors.primaryText;
  };

  return (
    <View style={styles.container}>
      <View style={styles.rangeGrid}>
        {ranges.map((range) => (
          <TouchableOpacity
            key={range.value}
            onPress={() => onSelectRange(range.value)}
            disabled={isLoading}
            style={[
              styles.rangeButton,
              {
                backgroundColor: getButtonColor(range.value),
                borderColor:
                  currentRange === range.value
                    ? getButtonColor(range.value)
                    : VintageColors.border,
              },
              isLoading && styles.rangeButtonDisabled,
            ]}
            activeOpacity={0.7}
          >
            <Feather
              name={range.icon as any}
              size={14}
              color={getTextColor(range.value)}
            />
            <Text
              style={[
                styles.rangeButtonText,
                { color: getTextColor(range.value) },
                currentRange === range.value && styles.rangeButtonTextActive,
              ]}
            >
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={onCustomRangePress}
          disabled={isLoading}
          style={[
            styles.customButton,
            {
              backgroundColor:
                currentRange === "custom"
                  ? VintageColors.formAccent1
                  : VintageColors.lightBackground,
              borderColor:
                currentRange === "custom"
                  ? VintageColors.formAccent1
                  : VintageColors.border,
            },
            isLoading && styles.rangeButtonDisabled,
          ]}
          activeOpacity={0.7}
        >
          <Feather
            name="edit-3"
            size={14}
            color={
              currentRange === "custom" ? "#FFFFFF" : VintageColors.primaryText
            }
          />
          <Text
            style={[
              styles.customButtonText,
              {
                color:
                  currentRange === "custom"
                    ? "#FFFFFF"
                    : VintageColors.primaryText,
              },
              currentRange === "custom" && styles.customButtonTextActive,
            ]}
          >
            Custom
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Feather
            name="loader"
            size={14}
            color={VintageColors.primaryText}
            style={{ transform: [{ rotate: "0deg" }] }}
          />
          <Text style={styles.loadingText}>Fetching data...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rangeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  rangeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 100,
    flex: 1,
    maxWidth: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  rangeButtonDisabled: {
    opacity: 0.5,
  },
  rangeButtonText: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 8,
  },
  rangeButtonTextActive: {
    fontWeight: "600",
  },
  customButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 100,
    flex: 1,
    maxWidth: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  customButtonText: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 8,
  },
  customButtonTextActive: {
    fontWeight: "600",
  },
  loadingOverlay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(139, 115, 85, 0.1)",
    borderRadius: 10,
  },
  loadingText: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    marginLeft: 10,
    fontStyle: "italic",
  },
});
