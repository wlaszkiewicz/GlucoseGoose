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
import NumberPicker from "../../components/common/NumberPicker";

type Props = {
  visible: boolean;
  onClose: () => void;
  isDoctor: boolean;

  username: string;
  setUsername: (v: string) => void;

  weight: number;
  height: number;

  age: string;
  setAge: (v: string) => void;

  gender: string;
  setGender: (v: string) => void;

  licenseNumber: string;
  setLicenseNumber: (v: string) => void;

  specialization: string;
  setSpecialization: (v: string) => void;

  isWeightPickerVisible: boolean;
  setIsWeightPickerVisible: (v: boolean) => void;

  isHeightPickerVisible: boolean;
  setIsHeightPickerVisible: (v: boolean) => void;

  onWeightSelect: (v: number) => void;
  onHeightSelect: (v: number) => void;

  onSave: () => Promise<void>;
};

export const ProfileModal: React.FC<Props> = ({
  visible,
  onClose,
  isDoctor,
  username,
  setUsername,
  weight,
  height,
  age,
  setAge,
  gender,
  setGender,
  licenseNumber,
  setLicenseNumber,
  specialization,
  setSpecialization,
  isWeightPickerVisible,
  setIsWeightPickerVisible,
  isHeightPickerVisible,
  setIsHeightPickerVisible,
  onWeightSelect,
  onHeightSelect,
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
                    name="settings"
                    size={50}
                    color={VintageColors.primaryText}
                  />
                </View>
              </View>
              <Text style={VintageStyles.modalProfileTitle}>
                {isDoctor ? "Doctor Settings" : "Account Settings"}
              </Text>
            </View>

            {/* Number Pickers */}
            <NumberPicker
              visible={isWeightPickerVisible}
              onClose={() => setIsWeightPickerVisible(false)}
              onValueSelect={onWeightSelect}
              selectedValue={Number(weight)}
              title="Select Weight"
              unit="kg"
              min={30}
              max={200}
              step={1}
            />

            <NumberPicker
              visible={isHeightPickerVisible}
              onClose={() => setIsHeightPickerVisible(false)}
              onValueSelect={onHeightSelect}
              selectedValue={Number(height)}
              title="Select Height"
              unit="cm"
              min={100}
              max={250}
              step={1}
            />

            <ScrollView
              style={VintageStyles.formScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View style={VintageStyles.formGroup}>
                <View style={VintageStyles.labelContainer}>
                  <Feather
                    name="user"
                    size={16}
                    color={VintageColors.primaryText}
                    style={VintageStyles.labelIcon}
                  />
                  <Text style={VintageStyles.label}>Username</Text>
                </View>
                <TextInput
                  style={VintageStyles.input}
                  placeholder="Enter username"
                  placeholderTextColor={VintageColors.secondaryText}
                  value={username}
                  onChangeText={setUsername}
                />
              </View>

              <View style={VintageStyles.rowContainer}>
                {/* Weight Picker */}
                <View style={VintageStyles.halfFormGroup}>
                  <View style={VintageStyles.labelContainer}>
                    <Feather
                      name="target"
                      size={16}
                      color={VintageColors.primaryText}
                      style={VintageStyles.labelIcon}
                    />
                    <Text style={VintageStyles.label}>Weight (kg)</Text>
                  </View>
                  <TouchableOpacity
                    style={VintageStyles.pickerButton}
                    onPress={() => setIsWeightPickerVisible(true)}
                  >
                    <Feather
                      name="chevron-down"
                      size={18}
                      color={VintageColors.primaryText}
                      style={VintageStyles.pickerIcon}
                    />
                    <Text style={VintageStyles.pickerButtonText}>
                      {weight} kg
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Height Picker */}
                <View style={VintageStyles.halfFormGroup}>
                  <View style={VintageStyles.labelContainer}>
                    <Feather
                      name="maximize-2"
                      size={16}
                      color={VintageColors.primaryText}
                      style={VintageStyles.labelIcon}
                    />
                    <Text style={VintageStyles.label}>Height (cm)</Text>
                  </View>
                  <TouchableOpacity
                    style={VintageStyles.pickerButton}
                    onPress={() => setIsHeightPickerVisible(true)}
                  >
                    <Feather
                      name="chevron-down"
                      size={18}
                      color={VintageColors.primaryText}
                      style={VintageStyles.pickerIcon}
                    />
                    <Text style={VintageStyles.pickerButtonText}>
                      {height} cm
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={VintageStyles.formGroup}>
                <View style={VintageStyles.labelContainer}>
                  <Feather
                    name="calendar"
                    size={16}
                    color={VintageColors.primaryText}
                    style={VintageStyles.labelIcon}
                  />
                  <Text style={VintageStyles.label}>Age</Text>
                </View>
                <TextInput
                  style={VintageStyles.input}
                  placeholder="Enter age"
                  placeholderTextColor={VintageColors.secondaryText}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                />
              </View>

              <View style={VintageStyles.formGroup}>
                <View style={VintageStyles.labelContainer}>
                  <Feather
                    name="users"
                    size={16}
                    color={VintageColors.primaryText}
                    style={VintageStyles.labelIcon}
                  />
                  <Text style={VintageStyles.label}>Gender</Text>
                </View>

                <View style={VintageStyles.genderContainer}>
                  <TouchableOpacity
                    style={[
                      VintageStyles.genderButton,
                      gender === "woman" && [
                        VintageStyles.genderButtonSelected,
                        {
                          backgroundColor: VintageColors.iconPink,
                          borderColor: VintageColors.primaryText,
                        },
                      ],
                    ]}
                    onPress={() => setGender("woman")}
                  >
                    <Feather
                      name="user"
                      size={18}
                      color={
                        gender === "woman"
                          ? VintageColors.primaryText
                          : VintageColors.secondaryText
                      }
                    />
                    <Text
                      style={[
                        VintageStyles.genderButtonText,
                        gender === "woman" && [
                          VintageStyles.genderButtonTextSelected,
                          { color: VintageColors.primaryText },
                        ],
                      ]}
                    >
                      Woman
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      VintageStyles.genderButton,
                      gender === "man" && [
                        VintageStyles.genderButtonSelected,
                        {
                          backgroundColor: VintageColors.iconBlue,
                          borderColor: VintageColors.primaryText,
                        },
                      ],
                    ]}
                    onPress={() => setGender("man")}
                  >
                    <Feather
                      name="user"
                      size={18}
                      color={
                        gender === "man"
                          ? VintageColors.primaryText
                          : VintageColors.secondaryText
                      }
                    />
                    <Text
                      style={[
                        VintageStyles.genderButtonText,
                        gender === "man" && [
                          VintageStyles.genderButtonTextSelected,
                          { color: VintageColors.primaryText },
                        ],
                      ]}
                    >
                      Man
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      VintageStyles.genderButton,
                      gender === "other" && [
                        VintageStyles.genderButtonSelected,
                        {
                          backgroundColor: VintageColors.iconGreen,
                          borderColor: VintageColors.primaryText,
                        },
                      ],
                    ]}
                    onPress={() => setGender("other")}
                  >
                    <Feather
                      name="users"
                      size={18}
                      color={
                        gender === "other"
                          ? VintageColors.primaryText
                          : VintageColors.secondaryText
                      }
                    />
                    <Text
                      style={[
                        VintageStyles.genderButtonText,
                        gender === "other" && [
                          VintageStyles.genderButtonTextSelected,
                          { color: VintageColors.primaryText },
                        ],
                      ]}
                    >
                      Other
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {isDoctor && (
                <>
                  <View style={VintageStyles.formGroup}>
                    <View style={VintageStyles.labelContainer}>
                      <Feather
                        name="shield"
                        size={16}
                        color={VintageColors.primaryText}
                        style={VintageStyles.labelIcon}
                      />
                      <Text style={VintageStyles.label}>License Number</Text>
                    </View>
                    <TextInput
                      style={VintageStyles.input}
                      placeholder="Enter medical license number"
                      placeholderTextColor={VintageColors.secondaryText}
                      value={licenseNumber}
                      onChangeText={setLicenseNumber}
                    />
                  </View>

                  <View style={VintageStyles.formGroup}>
                    <View style={VintageStyles.labelContainer}>
                      <Feather
                        name="briefcase"
                        size={16}
                        color={VintageColors.primaryText}
                        style={VintageStyles.labelIcon}
                      />
                      <Text style={VintageStyles.label}>Specialization</Text>
                    </View>
                    <TextInput
                      style={VintageStyles.input}
                      placeholder="e.g., Endocrinology, Diabetology"
                      placeholderTextColor={VintageColors.secondaryText}
                      value={specialization}
                      onChangeText={setSpecialization}
                    />
                  </View>
                </>
              )}

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
