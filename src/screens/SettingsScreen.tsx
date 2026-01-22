import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Modal, 
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput
} from "react-native";
import {
  Feather,
  MaterialIcons,
  Ionicons,
  FontAwesome5,
} from "@expo/vector-icons";
import { VintageStyles } from "../themes/vintage/styles_vintage";
import { VintageColors } from "../themes/vintage/colors";
import { useNavigation } from "@react-navigation/native";
import { logoutUser } from "../services/authService";
import { useNightscout } from "../contexts/NightscoutContext";
import { useAuth } from "../contexts/AuthContext";
import NumberPicker from "../components/common/NumberPicker";
import { updateUserProfile } from "../services/userProfileService";
import GooseAvatarPicker from "../components/settings/GooseAvatarPicker";
import { getAvatarUrl } from "../services/avatarservice";
import { getLocalAvatarImage } from '../utils/avatarHelper';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { reset } = useNightscout();
  const { userData, firebaseUser, updateUserData, isDoctor } = useAuth();
  
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [isAvatarPickerVisible, setIsAvatarPickerVisible] = useState(false);
  
  const [username, setUsername] = useState(userData?.username || "");
  const [weight, setWeight] = useState<number>(userData?.weight || 70);
  const [height, setHeight] = useState<number>(userData?.height || 170);
  const [age, setAge] = useState(userData?.age?.toString() || "");
  const [gender, setGender] = useState(userData?.gender || "");
  
  // Pola tylko dla lekarzy
  const [licenseNumber, setLicenseNumber] = useState(userData?.licenseNumber || "");
  const [specialization, setSpecialization] = useState(userData?.specialization || "");

  const [isWeightPickerVisible, setIsWeightPickerVisible] = useState(false);
  const [isHeightPickerVisible, setIsHeightPickerVisible] = useState(false);

  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(userData?.avatar || 'goose1');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(userData?.avatarUrl);

  useEffect(() => {
    const loadCurrentAvatar = async () => {
      if (selectedAvatarId) {
        try {
          const url = await getAvatarUrl(selectedAvatarId as any);
          setAvatarUrl(url);
        } catch (error) {
          console.error('Error loading avatar URL:', error);
        }
      }
    };
    
    loadCurrentAvatar();
  }, [selectedAvatarId]);

  const handleAvatarSelect = async (avatarId: string) => {
    setSelectedAvatarId(avatarId);
    
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
        console.log("Avatar ID saved to Firestore");
        
        if (updateUserData) {
          updateUserData({ avatar: avatarId });
        }
        
        setIsAvatarPickerVisible(false);
      } else {
        console.error("Failed to save avatar:", result.error);
      }
    } catch (error) {
      console.error("Error saving avatar:", error);
    }
  };

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

  const handleAccountProfilePress = () => {
    setIsProfileModalVisible(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalVisible(false);
    setUsername(userData?.username || "");
    setWeight(userData?.weight || 70);
    setHeight(userData?.height || 170);
    setAge(userData?.age?.toString() || "");
    setGender(userData?.gender || "");
    
    // Resetuj pola lekarza tylko jeśli użytkownik jest lekarzem
    if (isDoctor()) {
      setLicenseNumber(userData?.licenseNumber || "");
      setSpecialization(userData?.specialization || "");
    }
  };

  const openAvatarPicker = () => {
    setIsAvatarPickerVisible(true);
  };

  const handleGenderSelect = (selectedGender: string) => {
    setGender(selectedGender);
  };

  const handleWeightSelect = (selectedWeight: number) => {
    setWeight(selectedWeight);
  };

  const handleHeightSelect = (selectedHeight: number) => {
    setHeight(selectedHeight);
  };

  const openWeightPicker = () => {
    setIsWeightPickerVisible(true);
  };

  const openHeightPicker = () => {
    setIsHeightPickerVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!firebaseUser?.uid) {
      console.error("No user ID available");
      return;
    }

    // Podstawowe dane dla wszystkich użytkowników
    const profileData: any = {
      username,
      weight,
      height,
      age: age ? parseInt(age) : undefined,
      gender,
      updatedAt: Date.now(),
      avatar: selectedAvatarId,
    };

    // Dodaj pola lekarza tylko jeśli użytkownik jest lekarzem
    if (isDoctor()) {
      profileData.licenseNumber = licenseNumber;
      profileData.specialization = specialization;
    }

    try {
      const result = await updateUserProfile(firebaseUser.uid, profileData);

      if (result.success) {
        console.log("Profile saved successfully");
        
        // Aktualizuj dane w kontekście auth
        if (updateUserData) {
          updateUserData(profileData);
        }
      } else {
        console.error("Failed to save profile:", result.error);
      }
      
      setIsProfileModalVisible(false);
      
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  return (
    <View style={VintageStyles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={VintageStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[VintageStyles.headerSection]}>
          <View style={VintageStyles.headerDecoration}>
            <View style={VintageStyles.headerLine} />
            <Text style={VintageStyles.headerTitle}>
              {isDoctor() ? "Doctor Profile" : "My Profile"}
            </Text>
            <View style={VintageStyles.headerLine} />
          </View>
        </View>

        {/* Profile Section */}
        <View style={VintageStyles.profileSection}>
          <TouchableOpacity 
            style={VintageStyles.gooseAvatarCircle}
            onPress={openAvatarPicker}
          >
            <Image
              source={getLocalAvatarImage(selectedAvatarId)}
              style={VintageStyles.gooseAvatarImage}
              resizeMode="cover"
            />
            <View style={VintageStyles.editAvatarIcon}>
              <Feather name="edit-2" size={16} color={VintageColors.primaryText} />
            </View>
          </TouchableOpacity>

          <Text style={VintageStyles.profileName}>{username || (isDoctor() ? "Doctor Goose" : "Goose")}</Text>
          
          {/* Dodaj informację o specjalizacji dla lekarzy */}
          {isDoctor() && userData?.specialization && (
            <Text style={[VintageStyles.profileSpecialization, { color: VintageColors.secondaryText, fontStyle: 'italic', marginTop: 4 }]}>
              {userData.specialization}
            </Text>
          )}

          <View style={VintageStyles.spacing10} />

          {/* Stats */}
          <View style={VintageStyles.vintageStats}>
            <View style={VintageStyles.statItem}>
              <View style={VintageStyles.statIconContainer}>
                <Feather
                  name="droplet"
                  size={18}
                  color={VintageColors.statIcon}
                />
              </View>
              <Text style={VintageStyles.statValue}>5.8</Text>
              <Text style={VintageStyles.statLabel}>glucose</Text>
            </View>

            <View style={VintageStyles.statDivider} />

            <View style={VintageStyles.statItem}>
              <View style={VintageStyles.statIconContainer}>
                <Ionicons
                  name="flower"
                  size={18}
                  color={VintageColors.statIcon}
                />
              </View>
              <Text style={VintageStyles.statValue}>85%</Text>
              <Text style={VintageStyles.statLabel}>in range</Text>
            </View>

            <View style={VintageStyles.statDivider} />

            <View style={VintageStyles.statItem}>
              <View style={VintageStyles.statIconContainer}>
                <Feather name="sun" size={18} color={VintageColors.statIcon} />
              </View>
              <Text style={VintageStyles.statValue}>28</Text>
              <Text style={VintageStyles.statLabel}>days</Text>
            </View>
          </View>
        </View>

        {/* Settings Cards */}
        <View style={VintageStyles.settingsList}>
          <View style={VintageStyles.sectionHeader}>
            <Text style={VintageStyles.sectionTitle}>
              Settings & Preferences
            </Text>
            <View style={VintageStyles.featherAccent}>
              <FontAwesome5
                name="feather-alt"
                size={16}
                color={VintageColors.primaryText}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={VintageStyles.vintageCard}
            onPress={handleAccountProfilePress}
          >
            <View
              style={[
                VintageStyles.settingIcon,
                { backgroundColor: VintageColors.iconGreen },
              ]}
            >
              <Feather
                name="user"
                size={22}
                color={VintageColors.primaryText}
              />
            </View>
            <View style={VintageStyles.settingTextContainer}>
              <Text style={VintageStyles.settingText}>Account & Profile</Text>
              <Text style={VintageStyles.settingSubtext}>
                Update personal {isDoctor() ? "and professional" : ""} information
              </Text>
            </View>
            <View style={VintageStyles.vintageArrow}>
              <Feather
                name="chevron-right"
                size={20}
                color={VintageColors.secondaryText}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={VintageStyles.vintageCard}>
            <View
              style={[
                VintageStyles.settingIcon,
                { backgroundColor: VintageColors.iconYellow },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={VintageColors.primaryText}
              />
            </View>
            <View style={VintageStyles.settingTextContainer}>
              <Text style={VintageStyles.settingText}>Reminders & Alerts</Text>
              <Text style={VintageStyles.settingSubtext}>
                Glucose checks, medication
              </Text>
            </View>
            <View style={VintageStyles.vintageArrow}>
              <Feather
                name="chevron-right"
                size={20}
                color={VintageColors.secondaryText}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={VintageStyles.vintageCard}>
            <View
              style={[
                VintageStyles.settingIcon,
                { backgroundColor: VintageColors.iconBlue },
              ]}
            >
              <Feather
                name="activity"
                size={22}
                color={VintageColors.primaryText}
              />
            </View>
            <View style={VintageStyles.settingTextContainer}>
              <Text style={VintageStyles.settingText}>Health Data</Text>
              <Text style={VintageStyles.settingSubtext}>
                Connect devices & apps
              </Text>
            </View>
            <View style={VintageStyles.vintageArrow}>
              <Feather
                name="chevron-right"
                size={20}
                color={VintageColors.secondaryText}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={VintageStyles.vintageCard}>
            <View
              style={[
                VintageStyles.settingIcon,
                { backgroundColor: VintageColors.iconPink },
              ]}
            >
              <MaterialIcons
                name="support-agent"
                size={22}
                color={VintageColors.primaryText}
              />
            </View>
            <View style={VintageStyles.settingTextContainer}>
              <Text style={VintageStyles.settingText}>Goose Support</Text>
              <Text style={VintageStyles.settingSubtext}>
                Help, FAQ & community
              </Text>
            </View>
            <View style={VintageStyles.vintageArrow}>
              <Feather
                name="chevron-right"
                size={20}
                color={VintageColors.secondaryText}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={VintageStyles.vintageCard}>
            <View
              style={[
                VintageStyles.settingIcon,
                { backgroundColor: VintageColors.iconPurple },
              ]}
            >
              <Feather
                name="feather"
                size={22}
                color={VintageColors.primaryText}
              />
            </View>
            <View style={VintageStyles.settingTextContainer}>
              <Text style={VintageStyles.settingText}>Goose Features</Text>
              <Text style={VintageStyles.settingSubtext}>
                Themes & customization
              </Text>
            </View>
            <View style={VintageStyles.vintageArrow}>
              <Feather
                name="chevron-right"
                size={20}
                color={VintageColors.secondaryText}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Sign out */}
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

      {/* Modal for Account & Profile */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isProfileModalVisible}
        onRequestClose={closeProfileModal}
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
                  {isDoctor() ? "Doctor Settings" : "Account Settings"}
                </Text>
              </View>

              {/* Number Pickers */}
              <NumberPicker
                visible={isWeightPickerVisible}
                onClose={() => setIsWeightPickerVisible(false)}
                onValueSelect={handleWeightSelect}
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
                onValueSelect={handleHeightSelect}
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
                    <Feather name="user" size={16} color={VintageColors.primaryText} style={VintageStyles.labelIcon} />
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
                      <Feather name="target" size={16} color={VintageColors.primaryText} style={VintageStyles.labelIcon} />
                      <Text style={VintageStyles.label}>Weight (kg)</Text>
                    </View>
                    <TouchableOpacity 
                      style={VintageStyles.pickerButton}
                      onPress={openWeightPicker}
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
                      <Feather name="maximize-2" size={16} color={VintageColors.primaryText} style={VintageStyles.labelIcon} />
                      <Text style={VintageStyles.label}>Height (cm)</Text>
                    </View>
                    <TouchableOpacity 
                      style={VintageStyles.pickerButton}
                      onPress={openHeightPicker}
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
                    <Feather name="calendar" size={16} color={VintageColors.primaryText} style={VintageStyles.labelIcon} />
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
                    <Feather name="users" size={16} color={VintageColors.primaryText} style={VintageStyles.labelIcon} />
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
                            borderColor: VintageColors.primaryText
                          }
                        ]
                      ]}
                      onPress={() => handleGenderSelect("woman")}
                    >
                      <Feather 
                        name="user" 
                        size={18} 
                        color={gender === "woman" ? VintageColors.primaryText : VintageColors.secondaryText}
                      />
                      <Text style={[
                        VintageStyles.genderButtonText,
                        gender === "woman" && [VintageStyles.genderButtonTextSelected, { color: VintageColors.primaryText }]
                      ]}>Woman</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        VintageStyles.genderButton,
                        gender === "man" && [
                          VintageStyles.genderButtonSelected,
                          { 
                            backgroundColor: VintageColors.iconBlue,
                            borderColor: VintageColors.primaryText
                          }
                        ]
                      ]}
                      onPress={() => handleGenderSelect("man")}
                    >
                      <Feather 
                        name="user" 
                        size={18} 
                        color={gender === "man" ? VintageColors.primaryText : VintageColors.secondaryText}
                      />
                      <Text style={[
                        VintageStyles.genderButtonText,
                        gender === "man" && [VintageStyles.genderButtonTextSelected, { color: VintageColors.primaryText }]
                      ]}>Man</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        VintageStyles.genderButton,
                        gender === "other" && [
                          VintageStyles.genderButtonSelected,
                          { 
                            backgroundColor: VintageColors.iconGreen,
                            borderColor: VintageColors.primaryText
                          }
                        ]
                      ]}
                      onPress={() => handleGenderSelect("other")}
                    >
                      <Feather 
                        name="users" 
                        size={18} 
                        color={gender === "other" ? VintageColors.primaryText : VintageColors.secondaryText}
                      />
                      <Text style={[
                        VintageStyles.genderButtonText,
                        gender === "other" && [VintageStyles.genderButtonTextSelected, { color: VintageColors.primaryText }]
                      ]}>Other</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Pola tylko dla lekarzy */}
                {isDoctor() && (
                  <>
                    <View style={VintageStyles.formGroup}>
                      <View style={VintageStyles.labelContainer}>
                        <Feather name="shield" size={16} color={VintageColors.primaryText} style={VintageStyles.labelIcon} />
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
                        <Feather name="briefcase" size={16} color={VintageColors.primaryText} style={VintageStyles.labelIcon} />
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
                    onPress={closeProfileModal}
                  >
                    <Text style={VintageStyles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[VintageStyles.button, VintageStyles.saveButton]}
                    onPress={handleSaveProfile}
                  >
                    <Text style={VintageStyles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Goose Avatar Picker Modal */}
      <GooseAvatarPicker
        visible={isAvatarPickerVisible}
        onClose={() => setIsAvatarPickerVisible(false)}
        onAvatarSelect={handleAvatarSelect}
        currentAvatar={selectedAvatarId}
      />
    </View>
  );
};

export default SettingsScreen;