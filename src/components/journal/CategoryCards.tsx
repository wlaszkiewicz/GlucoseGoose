import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { VintageColors } from "../../themes/vintage/colors";

interface CategoryCardsProps {
  onCategoryPress: (category: string) => void;
}

export const CategoryCards: React.FC<CategoryCardsProps> = ({
  onCategoryPress,
}) => {
  const categories = [
    {
      id: "food",
      title: "Food",
      subtitle: "Track meals",
      icon: "restaurant",
      iconType: "ionicons",
      color: VintageColors.iconPink,
      accentColor: VintageColors.formAccent1,
    },
    {
      id: "sports",
      title: "Activity",
      subtitle: "Log workouts",
      icon: "fitness",
      iconType: "ionicons",
      color: VintageColors.iconBlue,
      accentColor: VintageColors.formAccent3,
    },
    {
      id: "other",
      title: "Notes",
      subtitle: "Journal",
      icon: "document-text",
      iconType: "ionicons",
      color: VintageColors.iconPurple,
      accentColor: VintageColors.formAccent6,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Journal Categories</Text>
        <View style={styles.featherAccent}>
          <Feather
            name="book-open"
            size={16}
            color={VintageColors.primaryText}
          />
        </View>
      </View>

      <View style={styles.cardsGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.card}
            onPress={() => onCategoryPress(category.id)}
            activeOpacity={0.8}
          >
            {/* Icon Container */}
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: category.color },
              ]}
            >
              <Ionicons
                name={category.icon as any}
                size={24}
                color={VintageColors.primaryText}
              />
            </View>

            {/* Category Info */}
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{category.title}</Text>
              <Text style={styles.cardSubtitle}>{category.subtitle}</Text>
            </View>

            {/* Arrow Indicator */}
            <View style={styles.arrowContainer}>
              <Feather
                name="arrow-right"
                size={16}
                color={category.accentColor}
              />
            </View>

            {/* Vintage corner accent */}
            <View
              style={[
                styles.vintageCorner,
                {
                  borderRightColor: category.accentColor,
                  borderBottomColor: category.accentColor,
                },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles: any = {
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: VintageColors.primaryText,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  featherAccent: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  cardsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: VintageColors.border,
    marginHorizontal: 4,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(139, 115, 85, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardContent: {
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    color: VintageColors.primaryText,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    textAlign: "center",
    lineHeight: 16,
    fontStyle: "italic",
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  vintageCorner: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderRightStyle: "solid",
    borderBottomStyle: "solid",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
};
