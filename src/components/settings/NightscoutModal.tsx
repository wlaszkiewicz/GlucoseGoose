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
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { VintageStyles } from "../../themes/vintage/styles_vintage";
import { VintageColors } from "../../themes/vintage/colors";

type Props = {
  visible: boolean;
  onClose: () => void;

  nightscoutUrl: string;
  setNightscoutUrl: (v: string) => void;

  nightscoutSecret: string;
  setNightscoutSecret: (v: string) => void;

  storeLocally: boolean;

  onSave: () => Promise<void>;
};

export const NightscoutModal: React.FC<Props> = ({
  visible,
  onClose,
  nightscoutUrl,
  setNightscoutUrl,
  nightscoutSecret,
  setNightscoutSecret,
  storeLocally,
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
                    name="link"
                    size={50}
                    color={VintageColors.primaryText}
                  />
                </View>
              </View>
              <Text style={VintageStyles.modalProfileTitle}>
                Nightscout Settings
              </Text>
              <Text
                style={{
                  color: VintageColors.secondaryText,
                  marginTop: 6,
                  textAlign: "center",
                }}
              >
                {storeLocally
                  ? "URL stored locally • Secret stored locally"
                  : "URL stored in account • Secret stored locally"}
              </Text>
            </View>

            <ScrollView
              style={VintageStyles.formScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View style={VintageStyles.formGroup}>
                <View style={VintageStyles.labelContainer}>
                  <Feather
                    name="globe"
                    size={16}
                    color={VintageColors.primaryText}
                    style={VintageStyles.labelIcon}
                  />
                  <Text style={VintageStyles.label}>Nightscout URL</Text>
                </View>
                <TextInput
                  style={VintageStyles.input}
                  placeholder="https://your-nightscout.herokuapp.com"
                  placeholderTextColor={VintageColors.secondaryText}
                  value={nightscoutUrl}
                  onChangeText={setNightscoutUrl}
                  autoCapitalize="none"
                />
              </View>

              <View style={VintageStyles.formGroup}>
                <View style={VintageStyles.labelContainer}>
                  <Feather
                    name="lock"
                    size={16}
                    color={VintageColors.primaryText}
                    style={VintageStyles.labelIcon}
                  />
                  <Text style={VintageStyles.label}>
                    Secret / Token (stored locally)
                  </Text>
                </View>
                <TextInput
                  style={VintageStyles.input}
                  placeholder="••••••••"
                  placeholderTextColor={VintageColors.secondaryText}
                  value={nightscoutSecret}
                  onChangeText={setNightscoutSecret}
                  autoCapitalize="none"
                  secureTextEntry
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
