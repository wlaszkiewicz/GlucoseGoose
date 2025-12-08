import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
} from "react-native";
import {
  Ionicons,
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { VintageColors } from "../../themes/vintage/colors_vintage";

interface ChartSettings {
  showMeals: boolean;
  showActivities: boolean;
  showInsulin: boolean;
  showTempBasals: boolean;
  showTargets: boolean;
  showDeviceEvents: boolean;
  showNotes: boolean;
  showReferenceLines: boolean;
  showTimeLabels: boolean;
  showGlucosePoints: boolean;
}

interface ChartSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  settings: ChartSettings;
  onSettingsChange: (settings: ChartSettings) => void;
}

export const ChartSettingsModal: React.FC<ChartSettingsModalProps> = ({
  visible,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const [currentSettings, setCurrentSettings] = useState(settings);

  const handleSettingChange = (key: keyof ChartSettings, value: boolean) => {
    const updated = { ...currentSettings, [key]: value };
    setCurrentSettings(updated);
    onSettingsChange(updated);
  };

  const resetToDefaults = () => {
    const defaults: ChartSettings = {
      showMeals: true,
      showActivities: true,
      showInsulin: true,
      showTempBasals: true,
      showTargets: true,
      showDeviceEvents: true,
      showNotes: true,
      showReferenceLines: true,
      showTimeLabels: true,
      showGlucosePoints: true,
    };
    setCurrentSettings(defaults);
    onSettingsChange(defaults);
  };

  const SettingItem = ({
    icon,
    iconColor,
    title,
    subtitle,
    settingKey,
    value,
  }: {
    icon: string;
    iconColor: string;
    title: string;
    subtitle: string;
    settingKey: keyof ChartSettings;
    value: boolean;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: iconColor }]}>
          {icon !== "target" && (
            <Ionicons name={icon as any} size={18} color="#FFFFFF" />
          )}
          {icon === "target" && (
            <MaterialCommunityIcons name="target" size={16} color="#FFFFFF" />
          )}
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => handleSettingChange(settingKey, newValue)}
        trackColor={{ false: "#E0D6C9", true: VintageColors.formAccent1 }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Feather name="settings" size={18} color={VintageColors.primaryText} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerDecoration}>
              <View style={styles.headerLine} />
              <View style={styles.headerTitleContainer}>
                <Text style={styles.modalTitle}>Chart Settings</Text>
                <View style={styles.headerFeather}>
                  <FontAwesome5
                    name="feather-alt"
                    size={14}
                    color={VintageColors.primaryText}
                  />
                </View>
              </View>
              <View style={styles.headerLine} />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={24}
                color={VintageColors.primaryText}
              />
            </TouchableOpacity>
          </View>

          {/* Settings Content */}
          <ScrollView style={styles.scrollContent}>
            <Section title="Event Display">
              <SettingItem
                icon="fast-food"
                iconColor="#F48FB1"
                title="Meals"
                subtitle="Show meal events"
                settingKey="showMeals"
                value={currentSettings.showMeals}
              />
              <SettingItem
                icon="bicycle"
                iconColor="#64B5F6"
                title="Activities"
                subtitle="Show exercise events"
                settingKey="showActivities"
                value={currentSettings.showActivities}
              />
              <SettingItem
                icon="water"
                iconColor="#E9C683"
                title="Insulin"
                subtitle="Show bolus events"
                settingKey="showInsulin"
                value={currentSettings.showInsulin}
              />
              <SettingItem
                icon="timer"
                iconColor="#79BFEE"
                title="Temp Basals"
                subtitle="Show temporary basal events"
                settingKey="showTempBasals"
                value={currentSettings.showTempBasals}
              />
              <SettingItem
                icon="target"
                iconColor="#A4D9AB"
                title="Targets"
                subtitle="Show temporary targets"
                settingKey="showTargets"
                value={currentSettings.showTargets}
              />
              <SettingItem
                icon="bandage"
                iconColor="#BA68C8"
                title="Device Events"
                subtitle="Show site/sensor changes"
                settingKey="showDeviceEvents"
                value={currentSettings.showDeviceEvents}
              />
              <SettingItem
                icon="document-text"
                iconColor="#D1C7B7"
                title="Notes"
                subtitle="Show notes and comments"
                settingKey="showNotes"
                value={currentSettings.showNotes}
              />
            </Section>

            <Section title="Chart Display">
              <SettingItem
                icon="trending-up"
                iconColor="#FF8A65"
                title="Reference Lines"
                subtitle="Show low/high/target lines"
                settingKey="showReferenceLines"
                value={currentSettings.showReferenceLines}
              />
              <SettingItem
                icon="time"
                iconColor="#FFB74D"
                title="Time Labels"
                subtitle="Show time labels on X-axis"
                settingKey="showTimeLabels"
                value={currentSettings.showTimeLabels}
              />
              <SettingItem
                icon="radio-button-on"
                iconColor="#8FBF8F"
                title="Glucose Points"
                subtitle="Show individual glucose points"
                settingKey="showGlucosePoints"
                value={currentSettings.showGlucosePoints}
              />
            </Section>

            {/* Reset Button */}
            <TouchableOpacity
              onPress={resetToDefaults}
              style={styles.resetButton}
            >
              <Feather name="refresh-cw" size={18} color="#FFFFFF" />
              <Text style={styles.resetButtonText}>Reset to Defaults</Text>
            </TouchableOpacity>

            <View style={styles.spacer} />
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <View style={styles.footerLine} />
            <Text style={styles.footerText}>Customize your chart view</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles: StyleSheet.NamedStyles<any> = {
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(139, 115, 85, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 20,
    width: "100%",
    maxWidth: 420,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  modalHeader: {
    padding: 24,
    paddingBottom: 16,
    backgroundColor: VintageColors.lightBackground,
    borderBottomWidth: 1,
    borderBottomColor: VintageColors.border,
    position: "relative",
  },
  headerDecoration: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: VintageColors.lightBorder,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
  },
  headerFeather: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: VintageColors.iconYellow,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "300",
    color: VintageColors.primaryText,
    letterSpacing: 1,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContent: {
    maxHeight: 400,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: VintageColors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: VintageColors.primaryText,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(139, 115, 85, 0.1)",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  settingTextContainer: {},
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: VintageColors.primaryText,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    fontStyle: "italic",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: VintageColors.formAccent1,
    padding: 16,
    borderRadius: 12,
    margin: 20,
    marginTop: 30,
    gap: 10,
    borderWidth: 1,
    borderColor: VintageColors.accentDark,
    shadowColor: VintageColors.formAccent1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  spacer: {
    height: 20,
  },
  modalFooter: {
    padding: 20,
    backgroundColor: VintageColors.lightBackground,
    borderTopWidth: 1,
    borderTopColor: VintageColors.border,
    alignItems: "center",
  },
  footerLine: {
    width: 60,
    height: 1,
    backgroundColor: VintageColors.lightBorder,
    marginBottom: 12,
  },
  footerText: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    fontWeight: "300",
    letterSpacing: 1,
    fontStyle: "italic",
  },
};
