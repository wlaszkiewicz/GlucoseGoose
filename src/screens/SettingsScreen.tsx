import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useEffect } from "react";

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

import { AlertsModal } from "../components/settings/AlertsModal";
import { NightscoutModal } from "../components/settings/NightscoutModal";
import { updateUserProfile } from "../services/userProfileService";
import {
  getNightscoutSecret,
  getNightscoutUrlForUser,
  setNightscoutSecret,
  setNightscoutUrlForUser,
} from "../services/nightscoutLocalService";

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { reset } = useNightscout();
  const { userData, firebaseUser, isDoctor } = useAuth();

  const [isAlertsModalVisible, setIsAlertsModalVisible] = useState(false);
  const [isNightscoutModalVisible, setIsNightscoutModalVisible] =
    useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    !!userData?.notificationsEnabled,
  );
  const [cooldownMinutes, setCooldownMinutes] = useState(
    String(userData?.cooldownMinutes ?? 20),
  );
  const [lowThreshold, setLowThreshold] = useState(
    String(userData?.lowThreshold ?? 70),
  );
  const [highThreshold, setHighThreshold] = useState(
    String(userData?.highThreshold ?? 180),
  );
  const [urgentLowThreshold, setUrgentLowThreshold] = useState(
    String(userData?.urgentLowThreshold ?? 55),
  );
  const [staleMinutes, setStaleMinutes] = useState(
    String(userData?.staleMinutes ?? 15),
  );
  const [trendAlertsEnabled, setTrendAlertsEnabled] = useState(
    userData?.trendAlertsEnabled ?? true,
  );
  const [fastDropThreshold, setFastDropThreshold] = useState(
    String(userData?.fastDropThreshold ?? -2),
  );

  // Nightscout settings
  const storeLocally = !!userData?.storeLocally;
  const [nightscoutUrl, setNightscoutUrl] = useState("");
  const [nightscoutSecret, setNightscoutSecretState] = useState("");

  useEffect(() => {
    const loadNightscoutSettings = async () => {
      if (!firebaseUser?.uid) return;
      const url = await getNightscoutUrlForUser(firebaseUser.uid);
      const secret = await getNightscoutSecret();
      setNightscoutUrl(url);
      setNightscoutSecretState(secret);
    };
    loadNightscoutSettings();
  }, [firebaseUser?.uid]);

  const [isAvatarPickerVisible, setIsAvatarPickerVisible] = useState(false);

  const saveAlerts = async () => {
    if (!firebaseUser?.uid) return;

    const payload = {
      notificationsEnabled,
      cooldownMinutes: parseInt(cooldownMinutes) || 20,
      lowThreshold: parseInt(lowThreshold) || 70,
      highThreshold: parseInt(highThreshold) || 180,
      urgentLowThreshold: parseInt(urgentLowThreshold) || 55,
      staleMinutes: parseInt(staleMinutes) || 15,
      trendAlertsEnabled,
      fastDropThreshold: parseFloat(fastDropThreshold) || -2,
      updatedAt: Date.now(),
    };

    const res = await updateUserProfile(firebaseUser.uid, payload as any);
    if (!res.success) console.error("Failed to save alerts:", res.error);
    setIsAlertsModalVisible(false);
  };

  const saveNightscout = async () => {
    if (!firebaseUser?.uid) return;

    await setNightscoutUrlForUser(firebaseUser.uid, nightscoutUrl.trim());
    await setNightscoutSecret(nightscoutSecret.trim());
    setIsNightscoutModalVisible(false);
  };

  const openAlertsModal = () => setIsAlertsModalVisible(true);
  const openNightscoutModal = () => setIsNightscoutModalVisible(true);

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
        <SettingsList
          isDoctor={isDoctor()}
          onAccountPress={openProfileModal}
          onAlertsPress={openAlertsModal}
          onNightscoutPress={openNightscoutModal}
        />

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

      <AlertsModal
        visible={isAlertsModalVisible}
        onClose={() => setIsAlertsModalVisible(false)}
        notificationsEnabled={notificationsEnabled}
        setNotificationsEnabled={setNotificationsEnabled}
        cooldownMinutes={cooldownMinutes}
        setCooldownMinutes={setCooldownMinutes}
        lowThreshold={lowThreshold}
        setLowThreshold={setLowThreshold}
        highThreshold={highThreshold}
        setHighThreshold={setHighThreshold}
        urgentLowThreshold={urgentLowThreshold}
        setUrgentLowThreshold={setUrgentLowThreshold}
        staleMinutes={staleMinutes}
        setStaleMinutes={setStaleMinutes}
        trendAlertsEnabled={trendAlertsEnabled}
        setTrendAlertsEnabled={setTrendAlertsEnabled}
        fastDropThreshold={fastDropThreshold}
        setFastDropThreshold={setFastDropThreshold}
        onSave={saveAlerts}
      />

      <NightscoutModal
        visible={isNightscoutModalVisible}
        onClose={() => setIsNightscoutModalVisible(false)}
        nightscoutUrl={nightscoutUrl}
        setNightscoutUrl={setNightscoutUrl}
        nightscoutSecret={nightscoutSecret}
        setNightscoutSecret={setNightscoutSecretState}
        storeLocally={storeLocally}
        onSave={saveNightscout}
      />
    </View>
  );
};

export default SettingsScreen;
