// components/trends/TrendsInfoModal.tsx
import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { VintageColors } from "../../themes/vintage/colors";

interface TrendsInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TrendsInfoModal: React.FC<TrendsInfoModalProps> = ({
  visible,
  onClose,
}) => {
  const InfoItem = ({
    icon,
    title,
    description,
  }: {
    icon: string;
    title: string;
    description: string;
  }) => (
    <View style={styles.infoItem}>
      <View style={styles.infoIcon}>
        <Feather
          name={icon as any}
          size={16}
          color={VintageColors.formAccent3}
        />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoDescription}>{description}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Feather
                name="info"
                size={20}
                color={VintageColors.primaryText}
              />
              <Text style={styles.title}>How Trends Work</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={20} color={VintageColors.primaryText} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <InfoItem
                icon="download-cloud"
                title="Smart Data Fetching"
                description="Data is only fetched when you change the time range. Large ranges (1 month+) may take longer to load initially."
              />
              <InfoItem
                icon="database"
                title="Local Caching"
                description="All analysis is cached for 1 hour to avoid repeated server requests. Use 'Data Management' to clear cache."
              />
              <InfoItem
                icon="cpu"
                title="Local Analysis"
                description="All calculations run on your device - no data is sent to external servers for analysis."
              />
              <InfoItem
                icon="bar-chart-2"
                title="Time in Range (TIR)"
                description="Percentage of time spent in target range (70-180 mg/dL). Aim for >70% TIR for optimal control."
              />
              <InfoItem
                icon="activity"
                title="Glucose Variability"
                description="Coefficient of Variation (CV) shows how stable your glucose levels are. Aim for <36% CV."
              />
              <InfoItem
                icon="target"
                title="GMI (Glucose Management Indicator)"
                description="Estimated A1c based on average glucose. Calculated as: 3.31 + (0.02392 × average glucose)."
              />
              <InfoItem
                icon="bar-chart"
                title="Data Quality & Completeness"
                description="Measures how complete your glucose data is. Based on expected readings (288/day for 5-min intervals). 100% = perfect coverage. Low percentages indicate missing data."
              />

              <View style={styles.tipContainer}>
                <FontAwesome
                  name="lightbulb-o"
                  size={16}
                  color={VintageColors.iconYellow}
                />
                <Text style={styles.tipText}>
                  <Text style={{ fontWeight: "600" }}>Tip: </Text>
                  Use the Custom range to analyze specific periods like
                  vacations or medication changes.
                </Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity onPress={onClose} style={styles.closeButtonBottom}>
            <Text style={styles.closeButtonText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: VintageColors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(139, 115, 85, 0.1)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginLeft: 12,
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  content: {
    paddingBottom: 20,
  },
  infoItem: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "flex-start",
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(139, 115, 85, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 13,
    color: VintageColors.secondaryText,
    lineHeight: 18,
  },
  tipContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(139, 115, 85, 0.05)",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    alignItems: "flex-start",
  },
  tipText: {
    fontSize: 13,
    color: VintageColors.secondaryText,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  closeButtonBottom: {
    backgroundColor: VintageColors.formAccent3,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: VintageColors.formAccent3,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});
