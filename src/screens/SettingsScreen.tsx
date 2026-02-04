import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { VintageStyles } from "../themes/vintage/styles_vintage";
import { VintageColors } from "../themes/vintage/colors";

import { logoutUser } from "../services/authService";
import { useNightscout } from "../contexts/NightscoutContext";
import { useAuth } from "../contexts/AuthContext";

import GooseAvatarPicker from "../components/settings/GooseAvatarPicker";

import { ProfileHeaderCard } from "../components//settings/ProfileHeaderCard";
import { SettingsList } from "../components//settings/SettingsList";
import { ProfileModal } from "../components//settings/ProfileModal";
import { useProfileSettings } from "../hooks/useProfileSettings";

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { reset } = useNightscout();
  const { userData, isDoctor } = useAuth();

  const [isAvatarPickerVisible, setIsAvatarPickerVisible] = useState(false);

  const {
    // modal
    isProfileModalVisible,
    openProfileModal,
    closeProfileModal,

    // avatar
    selectedAvatarId,
    avatarUrl,
    setSelectedAvatarId,
    saveAvatarSelection,

    // profile fields + pickers + save
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
    handleWeightSelect,
    handleHeightSelect,

    handleSaveProfile,
  } = useProfileSettings();

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      reset();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" as never }],
      });
    } else {
      console.error("Logout failed:", result.error);
    }
  };

  return (
    <View style={VintageStyles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={VintageStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* header */}
        <View style={[VintageStyles.headerSection]}>
          <View style={VintageStyles.headerDecoration}>
            <View style={VintageStyles.headerLine} />
            <Text style={VintageStyles.headerTitle}>
              {isDoctor() ? "Doctor Profile" : "My Profile"}
            </Text>
            <View style={VintageStyles.headerLine} />
          </View>
        </View>

        {/* profile header card */}
        <ProfileHeaderCard
          username={username || (isDoctor() ? "Doctor Goose" : "Goose")}
          specialization={isDoctor() ? userData?.specialization : undefined}
          selectedAvatarId={selectedAvatarId}
          onPressAvatar={() => setIsAvatarPickerVisible(true)}
        />

        {/* settings list */}
        <SettingsList isDoctor={isDoctor()} onAccountPress={openProfileModal} />

        {/* sign out */}
        <TouchableOpacity
          style={VintageStyles.signOutButton}
          onPress={handleLogout}
        >
          <View style={VintageStyles.signOutIconContainer}>
            <Feather
              name="log-out"
              size={18}
              color={VintageColors.signOutText}
            />
          </View>
          <Text style={VintageStyles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={VintageStyles.spacing60} />
      </ScrollView>

      {/* profile modal */}
      <ProfileModal
        visible={isProfileModalVisible}
        onClose={closeProfileModal}
        isDoctor={isDoctor()}
        // fields
        username={username}
        setUsername={setUsername}
        weight={weight}
        height={height}
        age={age}
        setAge={setAge}
        gender={gender}
        setGender={setGender}
        licenseNumber={licenseNumber}
        setLicenseNumber={setLicenseNumber}
        specialization={specialization}
        setSpecialization={setSpecialization}
        // pickers
        isWeightPickerVisible={isWeightPickerVisible}
        setIsWeightPickerVisible={setIsWeightPickerVisible}
        isHeightPickerVisible={isHeightPickerVisible}
        setIsHeightPickerVisible={setIsHeightPickerVisible}
        onWeightSelect={handleWeightSelect}
        onHeightSelect={handleHeightSelect}
        // save
        onSave={handleSaveProfile}
      />

      {/* avatar picker */}
      <GooseAvatarPicker
        visible={isAvatarPickerVisible}
        onClose={() => setIsAvatarPickerVisible(false)}
        onAvatarSelect={async (avatarId) => {
          setSelectedAvatarId(avatarId);
          await saveAvatarSelection(avatarId);
          setIsAvatarPickerVisible(false);
        }}
        currentAvatar={selectedAvatarId}
      />
    </View>
  );
};

export default SettingsScreen;
