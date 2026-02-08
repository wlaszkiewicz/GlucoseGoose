import React from "react";
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
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { VintageStyles } from "../../themes/vintage/styles_vintage";
import { VintageColors } from "../../themes/vintage/colors";

type Props = {
  visible: boolean;
  onClose: () => void;

  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;

  cooldownMinutes: string;
  setCooldownMinutes: (v: string) => void;

  lowThreshold: string;
  setLowThreshold: (v: string) => void;

  highThreshold: string;
  setHighThreshold: (v: string) => void;

  urgentLowThreshold: string;
  setUrgentLowThreshold: (v: string) => void;

  staleMinutes: string;
  setStaleMinutes: (v: string) => void;

  trendAlertsEnabled: boolean;
  setTrendAlertsEnabled: (v: boolean) => void;

  fastDropThreshold: string;
  setFastDropThreshold: (v: string) => void;

  onSave: () => Promise<void>;
};

export const AlertsModal: React.FC<Props> = ({
  visible,
  onClose,

  notificationsEnabled,
  setNotificationsEnabled,

  cooldownMinutes,
  setCooldownMinutes,

  lowThreshold,
  setLowThreshold,

  highThreshold,
  setHighThreshold,

  urgentLowThreshold,
  setUrgentLowThreshold,

  staleMinutes,
  setStaleMinutes,

  trendAlertsEnabled,
  setTrendAlertsEnabled,

  fastDropThreshold,
  setFastDropThreshold,

  onSave,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={VintageStyles.modalOverlay}
        >
          <View style={VintageStyles.modalContentCenter}>
            <View style={VintageStyles.modalProfileSection}>
              <View style={VintageStyles.modalIconCircle}>
                <View style={VintageStyles.modalIconContainer}>
                  <Feather
                    name="bell"
                    size={50}
                    color={VintageColors.primaryText}
                  />
                </View>
              </View>
              <Text style={VintageStyles.modalProfileTitle}>
                Reminders & Alerts
              </Text>
            </View>

            <ScrollView
              style={VintageStyles.formScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Enable */}
              <View style={VintageStyles.formGroup}>
                <View
                  style={[
                    VintageStyles.labelContainer,
                    { justifyContent: "space-between" },
                  ]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Feather
                      name="toggle-left"
                      size={16}
                      color={VintageColors.primaryText}
                      style={VintageStyles.labelIcon}
                    />
                    <Text style={VintageStyles.label}>Notifications</Text>
                  </View>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{
                      false: VintageColors.border,
                      true: VintageColors.iconGreen,
                    }}
                    thumbColor={VintageColors.primaryText}
                  />
                </View>
              </View>

              {/* Cooldown */}
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
                  placeholder="e.g. 20"
                  placeholderTextColor={VintageColors.secondaryText}
                  value={cooldownMinutes}
                  onChangeText={setCooldownMinutes}
                  keyboardType="numeric"
                />
              </View>

              {/* Thresholds */}
              <View style={VintageStyles.formGroup}>
                <View style={VintageStyles.labelContainer}>
                  <Feather
                    name="alert-triangle"
                    size={16}
                    color={VintageColors.primaryText}
                    style={VintageStyles.labelIcon}
                  />
                  <Text style={VintageStyles.label}>Low threshold (mg/dL)</Text>
                </View>
                <TextInput
                  style={VintageStyles.input}
                  placeholder="e.g. 70"
                  placeholderTextColor={VintageColors.secondaryText}
                  value={lowThreshold}
                  onChangeText={setLowThreshold}
                  keyboardType="numeric"
                />
              </View>

              <View style={VintageStyles.formGroup}>
                <View style={VintageStyles.labelContainer}>
                  <Feather
                    name="trending-up"
                    size={16}
                    color={VintageColors.primaryText}
                    style={VintageStyles.labelIcon}
                  />
                  <Text style={VintageStyles.label}>
                    High threshold (mg/dL)
                  </Text>
                </View>
                <TextInput
                  style={VintageStyles.input}
                  placeholder="e.g. 180"
                  placeholderTextColor={VintageColors.secondaryText}
                  value={highThreshold}
                  onChangeText={setHighThreshold}
                  keyboardType="numeric"
                />
              </View>

              <View style={VintageStyles.formGroup}>
                <View style={VintageStyles.labelContainer}>
                  <Feather
                    name="zap"
                    size={16}
                    color={VintageColors.primaryText}
                    style={VintageStyles.labelIcon}
                  />
                  <Text style={VintageStyles.label}>Urgent low (mg/dL)</Text>
                </View>
                <TextInput
                  style={VintageStyles.input}
                  placeholder="e.g. 55"
                  placeholderTextColor={VintageColors.secondaryText}
                  value={urgentLowThreshold}
                  onChangeText={setUrgentLowThreshold}
                  keyboardType="numeric"
                />
              </View>

              {/* Stale */}
              <View style={VintageStyles.formGroup}>
                <View style={VintageStyles.labelContainer}>
                  <Feather
                    name="wifi-off"
                    size={16}
                    color={VintageColors.primaryText}
                    style={VintageStyles.labelIcon}
                  />
                  <Text style={VintageStyles.label}>
                    Stale data alert (minutes)
                  </Text>
                </View>
                <TextInput
                  style={VintageStyles.input}
                  placeholder="e.g. 15"
                  placeholderTextColor={VintageColors.secondaryText}
                  value={staleMinutes}
                  onChangeText={setStaleMinutes}
                  keyboardType="numeric"
                />
              </View>

              {/* Trend */}
              <View style={VintageStyles.formGroup}>
                <View
                  style={[
                    VintageStyles.labelContainer,
                    { justifyContent: "space-between" },
                  ]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Feather
                      name="activity"
                      size={16}
                      color={VintageColors.primaryText}
                      style={VintageStyles.labelIcon}
                    />
                    <Text style={VintageStyles.label}>Trend alerts</Text>
                  </View>
                  <Switch
                    value={trendAlertsEnabled}
                    onValueChange={setTrendAlertsEnabled}
                    trackColor={{
                      false: VintageColors.border,
                      true: VintageColors.iconBlue,
                    }}
                    thumbColor={VintageColors.primaryText}
                  />
                </View>
              </View>

              <View style={VintageStyles.formGroup}>
                <View style={VintageStyles.labelContainer}>
                  <Feather
                    name="trending-down"
                    size={16}
                    color={VintageColors.primaryText}
                    style={VintageStyles.labelIcon}
                  />
                  <Text style={VintageStyles.label}>
                    Fast drop threshold (mg/dL/min)
                  </Text>
                </View>
                <TextInput
                  style={VintageStyles.input}
                  placeholder="e.g. -2"
                  placeholderTextColor={VintageColors.secondaryText}
                  value={fastDropThreshold}
                  onChangeText={setFastDropThreshold}
                  keyboardType="numeric"
                />
              </View>

              <View style={VintageStyles.buttonContainer}>
                <TouchableOpacity
                  style={[VintageStyles.button, VintageStyles.cancelButton]}
                  onPress={onClose}
                >
                  <Text style={VintageStyles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[VintageStyles.button, VintageStyles.saveButton]}
                  onPress={onSave}
                >
                  <Text style={VintageStyles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
