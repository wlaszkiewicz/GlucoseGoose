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

  // Alerts settings
  const [alertsEnabled, setAlertsEnabled] = useState(
    userData?.alertsEnabled ?? true,
  );
  const [liveStatusEnabled, setLiveStatusEnabled] = useState(
    userData?.liveStatusEnabled ?? true,
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
  const [backInRangeEnabled, setBackInRangeEnabled] = useState(
    userData?.backInRangeEnabled ?? true,
  );
  const [worsenDelta, setWorsenDelta] = useState(
    String(userData?.worsenDelta ?? 20),
  );
  const [soundMode, setSoundMode] = useState(userData?.soundMode ?? "normal");

  const notificationsEnabled = alertsEnabled || liveStatusEnabled;

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
      alertsEnabled,
      liveStatusEnabled,
      notificationsEnabled: alertsEnabled || liveStatusEnabled,

      cooldownMinutes: parseInt(cooldownMinutes) || 20,
      staleMinutes: parseInt(staleMinutes) || 15,

      lowThreshold: parseInt(lowThreshold) || 70,
      highThreshold: parseInt(highThreshold) || 180,
      urgentLowThreshold: parseInt(urgentLowThreshold) || 55,
      fastDropThreshold: parseFloat(fastDropThreshold) || -2,
      worsenDelta: parseInt(worsenDelta) || 20,

      trendAlertsEnabled,
      backInRangeEnabled,

      soundMode,

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
  const openHealthData = () => {
    // Navigate to HealthConnect screen as a modal or stack screen
    navigation.navigate('HealthConnect' as never);
  };

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
          onHealthDataPress={openHealthData}
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
        // Master controls
        alertsEnabled={alertsEnabled}
        setAlertsEnabled={setAlertsEnabled}
        liveStatusEnabled={liveStatusEnabled}
        setLiveStatusEnabled={setLiveStatusEnabled}
        // Timing
        cooldownMinutes={cooldownMinutes}
        setCooldownMinutes={setCooldownMinutes}
        staleMinutes={staleMinutes}
        setStaleMinutes={setStaleMinutes}
        // Thresholds
        lowThreshold={lowThreshold}
        setLowThreshold={setLowThreshold}
        highThreshold={highThreshold}
        setHighThreshold={setHighThreshold}
        urgentLowThreshold={urgentLowThreshold}
        setUrgentLowThreshold={setUrgentLowThreshold}
        fastDropThreshold={fastDropThreshold}
        setFastDropThreshold={setFastDropThreshold}
        worsenDelta={worsenDelta}
        setWorsenDelta={setWorsenDelta}
        // Additional features
        trendAlertsEnabled={trendAlertsEnabled}
        setTrendAlertsEnabled={setTrendAlertsEnabled}
        backInRangeEnabled={backInRangeEnabled}
        setBackInRangeEnabled={setBackInRangeEnabled}
        // Sound
        soundMode={soundMode}
        setSoundMode={setSoundMode}
        // Save callback
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
