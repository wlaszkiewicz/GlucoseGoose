import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { updateUserProfile } from "../services/userProfileService";
import { getAvatarUrl } from "../services/avatarservice";

export const useProfileSettings = () => {
  const { userData, firebaseUser, updateUserData, isDoctor } = useAuth();

  // modal
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  // profile fields
  const [username, setUsername] = useState(userData?.username || "");
  const [weight, setWeight] = useState<number>(userData?.weight || 70);
  const [height, setHeight] = useState<number>(userData?.height || 170);
  const [age, setAge] = useState(userData?.age?.toString() || "");
  const [gender, setGender] = useState(userData?.gender || "");

  // doctor-only
  const [licenseNumber, setLicenseNumber] = useState(
    userData?.licenseNumber || "",
  );
  const [specialization, setSpecialization] = useState(
    userData?.specialization || "",
  );

  // pickers
  const [isWeightPickerVisible, setIsWeightPickerVisible] = useState(false);
  const [isHeightPickerVisible, setIsHeightPickerVisible] = useState(false);

  // avatar
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(
    userData?.avatar || "goose1",
  );
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    userData?.avatarUrl,
  );

  useEffect(() => {
    const loadCurrentAvatar = async () => {
      if (!selectedAvatarId) return;
      try {
        const url = await getAvatarUrl(selectedAvatarId as any);
        setAvatarUrl(url);
      } catch (error) {
        console.error("Error loading avatar URL:", error);
      }
    };
    loadCurrentAvatar();
  }, [selectedAvatarId]);

  const openProfileModal = () => setIsProfileModalVisible(true);

  const closeProfileModal = () => {
    setIsProfileModalVisible(false);
    // reset values like original
    setUsername(userData?.username || "");
    setWeight(userData?.weight || 70);
    setHeight(userData?.height || 170);
    setAge(userData?.age?.toString() || "");
    setGender(userData?.gender || "");

    if (isDoctor()) {
      setLicenseNumber(userData?.licenseNumber || "");
      setSpecialization(userData?.specialization || "");
    }
  };

  const handleWeightSelect = (selectedWeight: number) =>
    setWeight(selectedWeight);
  const handleHeightSelect = (selectedHeight: number) =>
    setHeight(selectedHeight);

  const saveAvatarSelection = async (avatarId: string) => {
    if (!firebaseUser?.uid) {
      console.error("No user ID available");
      return;
    }

    try {
      const result = await updateUserProfile(firebaseUser.uid, {
        avatar: avatarId,
        updatedAt: Date.now(),
      });

      if (result.success) {
        if (updateUserData) updateUserData({ avatar: avatarId });
      } else {
        console.error("Failed to save avatar:", result.error);
      }
    } catch (error) {
      console.error("Error saving avatar:", error);
    }
  };

  const handleSaveProfile = async () => {
    if (!firebaseUser?.uid) {
      console.error("No user ID available");
      return;
    }

    const profileData: any = {
      username,
      weight,
      height,
      age: age ? parseInt(age) : undefined,
      gender,
      updatedAt: Date.now(),
      avatar: selectedAvatarId,
    };

    if (isDoctor()) {
      profileData.licenseNumber = licenseNumber;
      profileData.specialization = specialization;
    }

    try {
      const result = await updateUserProfile(firebaseUser.uid, profileData);
      if (result.success) {
        if (updateUserData) updateUserData(profileData);
      } else {
        console.error("Failed to save profile:", result.error);
      }
      setIsProfileModalVisible(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  return {
    // modal
    isProfileModalVisible,
    openProfileModal,
    closeProfileModal,

    // avatar
    selectedAvatarId,
    setSelectedAvatarId,
    avatarUrl,
    saveAvatarSelection,

    // fields
    username,
    setUsername,
    weight,
    setWeight,
    height,
    setHeight,
    age,
    setAge,
    gender,
    setGender,

    // doctor fields
    licenseNumber,
    setLicenseNumber,
    specialization,
    setSpecialization,

    // pickers
    isWeightPickerVisible,
    setIsWeightPickerVisible,
    isHeightPickerVisible,
    setIsHeightPickerVisible,
    handleWeightSelect,
    handleHeightSelect,

    // actions
    handleSaveProfile,
  };
};
