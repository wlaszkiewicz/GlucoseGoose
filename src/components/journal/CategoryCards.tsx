import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { VintageColors } from "../../themes/vintage/colors";

interface CategoryCardsProps {
  onCategoryPress: (category: string, selectedDate: Date) => void;
  selectedDate: Date;
}

export const CategoryCards: React.FC<CategoryCardsProps> = ({
  onCategoryPress,
  selectedDate,
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
            onPress={() => onCategoryPress(category.id, selectedDate)}
            activeOpacity={0.8}
          >
            {/* <View
              style={[
                styles.vintageCorner,
                {
                  borderRightColor: category.accentColor,
                  borderBottomColor: category.accentColor,
                },
              ]}
            /> */}

            {/* Icon Container */}
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: category.color },
              ]}
            >
              <Ionicons
                name={category.icon as any}
                size={22}
                color={VintageColors.primaryText}
              />
            </View>

            {/* Category Info */}
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{category.title}</Text>
              <Text style={styles.cardSubtitle}>{category.subtitle}</Text>
            </View>

            {/* Subtle directional hint at bottom */}
            <View style={styles.directionHint}>
              <View
                style={[
                  styles.directionLine,
                  { backgroundColor: category.accentColor },
                ]}
              />
              <Feather
                name="chevron-right"
                size={12}
                color={category.accentColor}
                style={styles.directionIcon}
              />
            </View>
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
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: VintageColors.border,
    marginHorizontal: 4,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
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
    flex: 1,
    justifyContent: "center",
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
  directionHint: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: VintageColors.border + "30",
    width: "80%",
    justifyContent: "center",
  },
  directionLine: {
    height: 1,
    flex: 1,
    marginRight: 4,
    borderRadius: 1,
  },
  directionIcon: {
    opacity: 0.7,
  },
};
