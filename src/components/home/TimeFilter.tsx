import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { VintageStylesHome } from "../../themes/vintage/styles_vintage_home";
import { VintageColors } from "../../themes/vintage/colors_vintage";

interface TimeFilterProps {
  timeFilter: "2h" | "12h" | "24h";
  onTimeFilterChange: (filter: "2h" | "12h" | "24h") => void;
  isRefreshing: boolean;
}

export const TimeFilter: React.FC<TimeFilterProps> = ({
  timeFilter,
  onTimeFilterChange,
  isRefreshing,
}) => {
  return (
    <View style={VintageStylesHome.timeFilterContainer}>
      <View style={VintageStylesHome.timeFilterLabelContainer}>
        <Text style={VintageStylesHome.timeFilterLabel}>Time range:</Text>
      </View>

      {/* Filter buttons */}
      {(["2h", "12h", "24h"] as const).map((filter) => (
        <TouchableOpacity
          key={filter}
          onPress={() => onTimeFilterChange(filter)}
          disabled={isRefreshing}
          style={[
            VintageStylesHome.timeFilterButton,
            timeFilter === filter && VintageStylesHome.timeFilterButtonSelected,
            isRefreshing && VintageStylesHome.timeFilterButtonDisabled,
          ]}
        >
          <Text
            style={[
              VintageStylesHome.timeFilterText,
              timeFilter === filter && VintageStylesHome.timeFilterTextSelected,
            ]}
          >
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
