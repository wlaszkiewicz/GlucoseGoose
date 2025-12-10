import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LegendItem as LegendItemType } from "../../../../types/chart";
import { styles } from "../../../../themes/vintage/home/chart/legend";

interface LegendItemProps {
  item: LegendItemType;
  onPress: () => void;
}

export const LegendItem: React.FC<LegendItemProps> = ({ item, onPress }) => {
  const renderIcon = () => {
    const iconProps = { size: 14, color: "white" as const };

    const isMaterialIcon = [
      "target",
      "bullhorn",
      "run",
      "exclamation",
      "food-variant",
      "trending-down",
      "trending-up",
      "arrow-right",
    ].includes(item.icon);

    if (isMaterialIcon) {
      return <MaterialCommunityIcons name={item.icon as any} {...iconProps} />;
    } else {
      return <Ionicons name={item.icon as any} {...iconProps} />;
    }
  };

  return (
    <TouchableOpacity
      style={styles.legendItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[styles.legendIconContainer, { backgroundColor: item.color }]}
      >
        {renderIcon()}
      </View>
      <Text style={styles.legendItemText} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};
