import React from "react";
import { View, Text } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ColorExplanation } from "../../../../types/chart";
import { styles } from "../../../../themes/vintage/home/chart/legend";

interface ColorGuideProps {
  colorExplanation: ColorExplanation;
}

export const ColorGuide: React.FC<ColorGuideProps> = ({ colorExplanation }) => {
  const renderIcon = (iconName?: string) => {
    if (!iconName) return null;

    const isMaterialIcon = [
      "target",
      "bullhorn",
      "run",
      "exclamation",
      "food-variant",
      "trending-down",
      "trending-up",
      "arrow-right",
    ].includes(iconName);

    if (isMaterialIcon) {
      return (
        <MaterialCommunityIcons
          name={iconName as any}
          size={12}
          color="white"
        />
      );
    } else {
      return <Ionicons name={iconName as any} size={12} color="white" />;
    }
  };

  return (
    <View style={styles.colorInfo}>
      <Text style={styles.colorInfoTitle}>Color & Icon Guide:</Text>
      <View style={styles.colorGrid}>
        {colorExplanation.colors.map((color, index) => (
          <View key={index} style={styles.colorExample}>
            <View style={styles.colorExampleIconContainer}>
              <View style={[styles.colorDot, { backgroundColor: color }]} />
              {colorExplanation.icons?.[index] && (
                <View style={styles.colorIconContainer}>
                  {renderIcon(colorExplanation.icons[index])}
                </View>
              )}
            </View>
            <Text style={styles.colorLabel}>
              {colorExplanation.labels[index]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
