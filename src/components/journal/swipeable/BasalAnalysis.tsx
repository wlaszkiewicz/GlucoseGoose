import React, { useState, useEffect } from "react";
import { View, Text, Dimensions } from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Svg, Line, Rect, Text as SvgText, G } from "react-native-svg";
import { VintageColors } from "../../../themes/vintage/colors";

interface BasalAnalysisProps {
  insulinEvents: any[];
  glucoseEntries: any[];
  selectedDate: Date;
}

const { width } = Dimensions.get("window");
const CHART_WIDTH = width - 80;
const CHART_HEIGHT = 80;
const PADDING = 20;

export const BasalAnalysis: React.FC<BasalAnalysisProps> = ({
  insulinEvents,
  glucoseEntries,
  selectedDate,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Basal Analysis</Text>
        </View>
        <View style={styles.featherAccent}>
          <Ionicons name="pulse" size={20} color={VintageColors.primaryText} />
        </View>
      </View>

      <View style={styles.card}>
        <View style={placeholderStyles.emptyState}>
          <Ionicons
            name="calendar-outline"
            size={28}
            color={VintageColors.secondaryText}
            style={placeholderStyles.emptyIcon}
          />
        </View>

        <Text style={placeholderStyles.emptyText}>
          Basal analysis is not yet available.
        </Text>

        <Text style={placeholderStyles.emptySubtext}>
          Coming in a future update!
        </Text>
      </View>
    </View>
  );
};

const styles: any = {
  container: {
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    color: VintageColors.primaryText,
    fontWeight: "500",
    letterSpacing: 0.3,
    marginRight: 8,
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
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  chartSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: VintageColors.border,
  },
  sectionHeaderText: {
    fontSize: 10,
    color: VintageColors.secondaryText,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 8,
    fontStyle: "italic",
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: VintageColors.border,
  },
  additionalStats: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  additionalStatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  additionalStatText: {
    fontSize: 11,
    color: VintageColors.primaryText,
    marginLeft: 4,
    fontStyle: "italic",
  },

  // Target Info Bubble
  targetInfoBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  targetInfoContent: {
    flexDirection: "column",
  },
  targetInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  targetInfoTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginLeft: 6,
    letterSpacing: 0.3,
  },
  targetInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  targetInfoDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  targetInfoText: {
    fontSize: 11,
    color: VintageColors.primaryText,
    fontStyle: "italic",
  },
  targetInfoValue: {
    fontWeight: "600",
    color: VintageColors.formAccent2,
  },
};

const placeholderStyles: any = {
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 23,
    minHeight: 110,
  },
  emptyIcon: {
    marginBottom: 8,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 13,
    color: VintageColors.secondaryText,
    textAlign: "center",
    fontStyle: "italic",
  },
  emptySubtext: {
    fontSize: 11,
    color: VintageColors.secondaryText,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 2,
    marginBottom: 30,
  },
};
