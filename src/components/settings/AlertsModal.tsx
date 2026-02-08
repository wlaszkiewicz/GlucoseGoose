import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Switch,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";

import { VintageStyles } from "../../themes/vintage/styles_vintage";
import { VintageColors } from "../../themes/vintage/colors";

type Props = {
  visible: boolean;
  onClose: () => void;

  notificationsEnabled?: boolean;

  alertsEnabled: boolean;
  setAlertsEnabled: (v: boolean) => void;
  liveStatusEnabled: boolean;
  setLiveStatusEnabled: (v: boolean) => void;
  cooldownMinutes: string;
  setCooldownMinutes: (v: string) => void;
  staleMinutes: string;
  setStaleMinutes: (v: string) => void;

  lowThreshold: string;
  setLowThreshold: (v: string) => void;
  highThreshold: string;
  setHighThreshold: (v: string) => void;
  urgentLowThreshold: string;
  setUrgentLowThreshold: (v: string) => void;
  fastDropThreshold: string;
  setFastDropThreshold: (v: string) => void;

  trendAlertsEnabled: boolean;
  setTrendAlertsEnabled: (v: boolean) => void;

  backInRangeEnabled: boolean;
  setBackInRangeEnabled: (v: boolean) => void;

  worsenDelta: string;
  setWorsenDelta: (v: string) => void;

  soundMode: "normal" | "goose";
  setSoundMode: (v: "normal" | "goose") => void;

  onSave: () => Promise<void>;
};

export const AlertsModal: React.FC<Props> = ({
  visible,
  onClose,
  notificationsEnabled,

  alertsEnabled,
  setAlertsEnabled,
  liveStatusEnabled,
  setLiveStatusEnabled,
  cooldownMinutes,
  setCooldownMinutes,
  staleMinutes,
  setStaleMinutes,

  lowThreshold,
  setLowThreshold,
  highThreshold,
  setHighThreshold,
  urgentLowThreshold,
  setUrgentLowThreshold,
  fastDropThreshold,
  setFastDropThreshold,

  trendAlertsEnabled,
  setTrendAlertsEnabled,

  backInRangeEnabled,
  setBackInRangeEnabled,

  worsenDelta,
  setWorsenDelta,

  soundMode,
  setSoundMode,

  onSave,
}) => {
  const { height: windowHeight } = Dimensions.get("window");
  const maxModalHeight = windowHeight * 0.8;

  // Added state for dropdown open
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    await onSave();
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        {/* Background overlay */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        {/* Centered modal */}
        <KeyboardAvoidingView
          style={styles.modalWrapper}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View
            style={[
              VintageStyles.modalContentCenter,
              styles.modalContainer,
              { maxHeight: maxModalHeight },
            ]}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={VintageStyles.modalIconCircle}>
                <View style={VintageStyles.modalIconContainer}>
                  <Feather
                    name="bell"
                    size={40}
                    color={VintageColors.primaryText}
                  />
                </View>
              </View>
              <Text style={VintageStyles.modalProfileTitle}>
                Reminders & Alerts
              </Text>
              <Text style={styles.subtitle}>
                Configure your glucose monitoring preferences
              </Text>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={true}
            >
              {/* Master Toggles */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Master Controls</Text>

                <View style={styles.toggleItem}>
                  <View style={styles.toggleLabel}>
                    <Feather
                      name="alert-triangle"
                      size={18}
                      color={VintageColors.formAccent1}
                      style={styles.toggleIcon}
                    />
                    <Text style={styles.toggleText}>All Alerts</Text>
                  </View>
                  <Switch
                    value={alertsEnabled}
                    onValueChange={setAlertsEnabled}
                    trackColor={{
                      false: VintageColors.border,
                      true: VintageColors.formAccent1,
                    }}
                    thumbColor={VintageColors.primaryText}
                  />
                </View>

                <View style={styles.toggleItem}>
                  <View style={styles.toggleLabel}>
                    <Feather
                      name="activity"
                      size={18}
                      color={VintageColors.formAccent2}
                      style={styles.toggleIcon}
                    />
                    <Text style={styles.toggleText}>Live Status</Text>
                  </View>
                  <Switch
                    value={liveStatusEnabled}
                    onValueChange={setLiveStatusEnabled}
                    trackColor={{
                      false: VintageColors.border,
                      true: VintageColors.formAccent2,
                    }}
                    thumbColor={VintageColors.primaryText}
                  />
                </View>
              </View>

              {/* Timing */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Timing</Text>

                <View style={VintageStyles.formGroup}>
                  <View style={VintageStyles.labelContainer}>
                    <Feather
                      name="clock"
                      size={16}
                      color={VintageColors.primaryText}
                      style={VintageStyles.labelIcon}
                    />
                    <Text style={VintageStyles.label}>Cooldown (minutes)</Text>
                  </View>
                  <TextInput
                    style={VintageStyles.input}
                    placeholder="20"
                    placeholderTextColor={VintageColors.secondaryText}
                    value={cooldownMinutes}
                    onChangeText={setCooldownMinutes}
                    keyboardType="numeric"
                    editable={alertsEnabled}
                  />
                </View>

                <View style={VintageStyles.formGroup}>
                  <View style={VintageStyles.labelContainer}>
                    <Feather
                      name="wifi-off"
                      size={16}
                      color={VintageColors.primaryText}
                      style={VintageStyles.labelIcon}
                    />
                    <Text style={VintageStyles.label}>
                      Stale alert (minutes)
                    </Text>
                  </View>
                  <TextInput
                    style={VintageStyles.input}
                    placeholder="15"
                    placeholderTextColor={VintageColors.secondaryText}
                    value={staleMinutes}
                    onChangeText={setStaleMinutes}
                    keyboardType="numeric"
                    editable={alertsEnabled}
                  />
                </View>
              </View>

              {/* Thresholds */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thresholds (mg/dL)</Text>

                <View style={VintageStyles.formGroup}>
                  <View style={VintageStyles.labelContainer}>
                    <Feather
                      name="arrow-down"
                      size={16}
                      color={VintageColors.formAccent2}
                      style={VintageStyles.labelIcon}
                    />
                    <Text style={VintageStyles.label}>Low</Text>
                  </View>
                  <TextInput
                    style={VintageStyles.input}
                    placeholder="70"
                    placeholderTextColor={VintageColors.secondaryText}
                    value={lowThreshold}
                    onChangeText={setLowThreshold}
                    keyboardType="numeric"
                    editable={alertsEnabled}
                  />
                </View>

                <View style={VintageStyles.formGroup}>
                  <View style={VintageStyles.labelContainer}>
                    <Feather
                      name="arrow-up"
                      size={16}
                      color={VintageColors.formAccent5}
                      style={VintageStyles.labelIcon}
                    />
                    <Text style={VintageStyles.label}>High</Text>
                  </View>
                  <TextInput
                    style={VintageStyles.input}
                    placeholder="180"
                    placeholderTextColor={VintageColors.secondaryText}
                    value={highThreshold}
                    onChangeText={setHighThreshold}
                    keyboardType="numeric"
                    editable={alertsEnabled}
                  />
                </View>

                <View style={VintageStyles.formGroup}>
                  <View style={VintageStyles.labelContainer}>
                    <Feather
                      name="alert-octagon"
                      size={16}
                      color={VintageColors.formAccent3}
                      style={VintageStyles.labelIcon}
                    />
                    <Text style={VintageStyles.label}>Urgent Low</Text>
                  </View>
                  <TextInput
                    style={VintageStyles.input}
                    placeholder="55"
                    placeholderTextColor={VintageColors.secondaryText}
                    value={urgentLowThreshold}
                    onChangeText={setUrgentLowThreshold}
                    keyboardType="numeric"
                    editable={alertsEnabled}
                  />
                </View>

                <View style={VintageStyles.formGroup}>
                  <View style={VintageStyles.labelContainer}>
                    <Feather
                      name="trending-down"
                      size={16}
                      color={VintageColors.formAccent4}
                      style={VintageStyles.labelIcon}
                    />
                    <Text style={VintageStyles.label}>
                      Fast Drop (per minute)
                    </Text>
                  </View>
                  <TextInput
                    style={VintageStyles.input}
                    placeholder="-2"
                    placeholderTextColor={VintageColors.secondaryText}
                    value={fastDropThreshold}
                    onChangeText={setFastDropThreshold}
                    keyboardType="numeric"
                    editable={alertsEnabled}
                  />
                </View>

                <View style={VintageStyles.formGroup}>
                  <View style={VintageStyles.labelContainer}>
                    <Feather
                      name="trending-up"
                      size={16}
                      color={VintageColors.formAccent4}
                      style={VintageStyles.labelIcon}
                    />
                    <Text style={VintageStyles.label}>Worsen Delta</Text>
                  </View>
                  <TextInput
                    style={VintageStyles.input}
                    placeholder="20"
                    placeholderTextColor={VintageColors.secondaryText}
                    value={worsenDelta}
                    onChangeText={setWorsenDelta}
                    keyboardType="numeric"
                    editable={alertsEnabled}
                  />
                </View>
              </View>

              {/* Additional Features */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Additional Features</Text>

                <View style={styles.toggleItem}>
                  <View style={styles.toggleLabel}>
                    <Feather
                      name="trending-up"
                      size={18}
                      color={VintageColors.formAccent1}
                      style={styles.toggleIcon}
                    />
                    <Text style={styles.toggleText}>Trend Alerts</Text>
                  </View>
                  <Switch
                    value={trendAlertsEnabled}
                    onValueChange={setTrendAlertsEnabled}
                    disabled={!alertsEnabled}
                    trackColor={{
                      false: VintageColors.border,
                      true: VintageColors.formAccent1,
                    }}
                    thumbColor={
                      alertsEnabled
                        ? VintageColors.primaryText
                        : VintageColors.border
                    }
                  />
                </View>

                <View style={styles.toggleItem}>
                  <View style={styles.toggleLabel}>
                    <Feather
                      name="check-circle"
                      size={18}
                      color={VintageColors.formAccent7}
                      style={styles.toggleIcon}
                    />
                    <Text style={styles.toggleText}>Back in Range</Text>
                  </View>
                  <Switch
                    value={backInRangeEnabled}
                    onValueChange={setBackInRangeEnabled}
                    disabled={!alertsEnabled}
                    trackColor={{
                      false: VintageColors.border,
                      true: VintageColors.formAccent7,
                    }}
                    thumbColor={
                      alertsEnabled
                        ? VintageColors.primaryText
                        : VintageColors.border
                    }
                  />
                </View>
              </View>

              {/* Sound */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sound</Text>

                <View style={VintageStyles.formGroup}>
                  <View style={VintageStyles.labelContainer}>
                    <Feather
                      name="volume-2"
                      size={16}
                      color={VintageColors.primaryText}
                      style={VintageStyles.labelIcon}
                    />
                    <Text style={VintageStyles.label}>Alert Sound</Text>
                  </View>

                  <DropDownPicker
                    open={open}
                    value={soundMode}
                    setOpen={setOpen}
                    setValue={(val: any) => setSoundMode(val)}
                    items={[
                      { label: "Normal", value: "normal" },
                      { label: "Goose 🪿", value: "goose" },
                    ]}
                    disabled={!alertsEnabled}
                    containerStyle={{ height: 48, marginTop: 8 }}
                    style={{
                      backgroundColor: VintageColors.cardBackground,
                      borderColor: VintageColors.border,
                      borderRadius: 8,
                    }}
                    dropDownContainerStyle={{
                      backgroundColor: VintageColors.cardBackground,
                      borderColor: VintageColors.border,
                    }}
                    textStyle={{ color: VintageColors.primaryText }}
                    listMode="SCROLLVIEW"
                    modalProps={{
                      animationType: "slide",
                    }}
                  />
                </View>
              </View>

              {/* Info Panel */}
              <View style={styles.infoPanel}>
                <Feather
                  name="info"
                  size={16}
                  color={VintageColors.iconBlue}
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>
                  Notifications are{" "}
                  {notificationsEnabled ? "ENABLED" : "DISABLED"} system-wide
                </Text>
              </View>
            </ScrollView>

            {/* Fixed Footer */}
            <View style={styles.footer}>
              <View style={VintageStyles.buttonContainer}>
                <TouchableOpacity
                  style={[VintageStyles.button, VintageStyles.cancelButton]}
                  onPress={onClose}
                >
                  <Text style={VintageStyles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[VintageStyles.button, VintageStyles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={VintageStyles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    width: "100%",
    height: "100%",
  },
  modalContainer: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: VintageColors.cardBackground,
    width: "100%",
  },
  modalHeader: {
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: VintageColors.border,
    backgroundColor: VintageColors.cardBackground,
  },
  subtitle: {
    color: VintageColors.secondaryText,
    fontSize: 14,
    marginTop: 8,
    fontFamily: "System",
    textAlign: "center",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "System",
    fontWeight: "600",
    color: VintageColors.primaryText,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: VintageColors.border,
  },
  toggleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: VintageColors.cardBackground,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
    marginBottom: 8,
  },
  toggleLabel: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  toggleIcon: {
    marginRight: 12,
  },
  toggleText: {
    fontSize: 16,
    fontFamily: "System",
    color: VintageColors.primaryText,
    flex: 1,
  },
  infoPanel: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: VintageColors.cardBackground,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: VintageColors.formAccent2 + "40",
    marginTop: 20,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "System",
    color: VintageColors.secondaryText,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: VintageColors.border,
    paddingTop: 20,
    backgroundColor: VintageColors.cardBackground,
  },
});
