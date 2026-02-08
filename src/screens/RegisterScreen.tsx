import React from "react";
import {
  Text,
  TextInput,
  View,
  Linking,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { RegisterScreenProps } from "../types/navigation";
import { useState, useRef, useEffect } from "react";
import { registerUser, logoutUser } from "../services/authService";
import { isUsernameAvailable } from "../services/userService";
import { ActivityIndicator } from "react-native";
import { VintageColors } from "../themes/vintage/colors";
import { VintageStylesAuth } from "../themes/vintage/styles_vintage_auth";
import { Ionicons, Feather, FontAwesome5 } from "@expo/vector-icons";
import { VintageStyles } from "../themes/vintage/styles_vintage";
const gooseImage = require("../../assets/goose1.png");

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nightscoutUrl, setNightscoutUrl] = useState("");
  const [storeLocally, setStoreLocally] = useState(false);
  const [showLocalStorageDetails, setShowLocalStorageDetails] = useState(false);
  const [isDoctorMode, setIsDoctorMode] = useState(false);
  const [doctorSpecialization, setDoctorSpecialization] = useState("");
  const [doctorLicense, setDoctorLicense] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    nightscoutUrl?: string;
    doctorSpecialization?: string;
    doctorLicense?: string;
    firebase?: string;
  }>({});

  const emailRef = useRef<TextInput>(null);
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const nightscoutUrlRef = useRef<TextInput>(null);
  const specializationRef = useRef<TextInput>(null);
  const licenseRef = useRef<TextInput>(null);

  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => {
    if (isDoctorMode) {
      setStoreLocally(false);
      setNightscoutUrl("");
    }
  }, [isDoctorMode]);

  const focusFirstError = () => {
    if (errors.email) emailRef.current?.focus();
    else if (errors.username) usernameRef.current?.focus();
    else if (errors.password) passwordRef.current?.focus();
    else if (errors.confirmPassword) confirmPasswordRef.current?.focus();
    else if (errors.nightscoutUrl) nightscoutUrlRef.current?.focus();
    else if (errors.doctorSpecialization) specializationRef.current?.focus();
    else if (errors.doctorLicense) licenseRef.current?.focus();
  };

  const validateData = () => {
    const newErrors: typeof errors = {};

    if (!email) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Invalid email.";

    if (!username) newErrors.username = "Username is required.";
    else if (username.length < 3)
      newErrors.username = "Username must be at least 3 characters.";

    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";

    if (!confirmPassword)
      newErrors.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

    if (isDoctorMode) {
      if (!doctorSpecialization.trim()) {
        newErrors.doctorSpecialization = "Specialization is required.";
      }
      if (!doctorLicense.trim()) {
        newErrors.doctorLicense = "License number is required.";
      }
    } else {
      if (!storeLocally) {
        if (!nightscoutUrl) {
          newErrors.nightscoutUrl = "Nightscout URL is required.";
        } else {
          try {
            new URL(nightscoutUrl);
          } catch {
            newErrors.nightscoutUrl = "Invalid Nightscout URL.";
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleRegister() {
    if (!validateData()) {
      focusFirstError();
      return;
    }

    setLoading(true);

    const available = await isUsernameAvailable(username);
    if (!available) {
      setErrors((prev) => ({
        ...prev,
        username: "Username is already taken.",
      }));
      usernameRef.current?.focus();
      setLoading(false);
      return;
    }

    const extraData: any = {
      username: username,
    };

    if (isDoctorMode) {
      extraData.specialization = doctorSpecialization;
      extraData.licenseNumber = doctorLicense;
    }

    const result = await registerUser(
      email,
      password,
      isDoctorMode ? false : storeLocally,
      isDoctorMode ? "" : (nightscoutUrl ?? ""),
      isDoctorMode ? "doctor" : "patient",
      extraData,
    );

    setLoading(false);

    if (!result.success) {
      if (result.error.code === "auth/email-already-in-use") {
        setErrors((prev) => ({ ...prev, email: "Email already in use" }));
        emailRef.current?.focus();
      } else {
        setErrors((prev) => ({ ...prev, firebase: result.error.message }));
      }
    } else {
      logoutUser();
      clearUp();
      navigation.navigate("Login");
    }
  }

  const clearUp = () => {
    setEmail("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setNightscoutUrl("");
    setDoctorSpecialization("");
    setDoctorLicense("");
    setErrors({});
    setStoreLocally(false);
    setShowLocalStorageDetails(false);
    setIsDoctorMode(false);
    setFocusedInput(null);
  };

  return (
    <View style={VintageStyles.container}>
      <ScrollView
        contentContainerStyle={VintageStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={VintageStylesAuth.mainContainer}>
          <View style={VintageStyles.headerSection}>
            <View style={VintageStyles.headerDecoration}>
              <View style={VintageStyles.headerLine} />
              <Text style={[VintageStyles.headerTitle, { paddingBottom: 10 }]}>
                GlucoseGoose
              </Text>
              <View style={VintageStyles.headerLine} />
            </View>
            <View style={VintageStylesAuth.avatarContainer}>
              <View style={VintageStylesAuth.gooseAvatarCircle}>
                <Image
                  source={gooseImage}
                  style={VintageStylesAuth.gooseAvatarImage}
                  resizeMode="cover"
                />
                <View style={VintageStylesAuth.avatarFeather}>
                  <FontAwesome5
                    name="feather-alt"
                    size={20}
                    color={VintageColors.primaryText}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={VintageStylesAuth.welcomeSection}>
            <Text style={VintageStylesAuth.welcomeTitle}>
              {isDoctorMode ? "Welcome, Doctor" : "Welcome, Friend!"}
            </Text>
            <Text style={VintageStylesAuth.welcomeSubtitle}>
              {isDoctorMode
                ? "Monitor and analyze patient glucose data"
                : "Join our cozy flock of glucose guardians"}
            </Text>
          </View>

          {/* Doctor/Patient Toggle*/}
          <View style={VintageStylesAuth.doctorToggleContainer}>
            <TouchableOpacity
              style={[
                VintageStylesAuth.doctorToggleButton,
                isDoctorMode && VintageStylesAuth.doctorToggleButtonActive,
              ]}
              onPress={() => setIsDoctorMode(!isDoctorMode)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isDoctorMode ? "medical" : "person"}
                size={20}
                color={isDoctorMode ? "#FFFFFF" : VintageColors.primaryText}
              />
              <Text
                style={[
                  VintageStylesAuth.doctorToggleText,
                  isDoctorMode && VintageStylesAuth.doctorToggleTextActive,
                ]}
              >
                {isDoctorMode ? "I'm a Doctor" : "I'm a Patient"}
              </Text>
              <Ionicons
                name="swap-horizontal"
                size={16}
                color={isDoctorMode ? "#FFFFFF" : VintageColors.secondaryText}
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>

          {/* Registration Form */}
          <View style={VintageStylesAuth.formContainer}>
            {/* Email Input */}
            <View style={VintageStylesAuth.inputGroup}>
              <View style={VintageStylesAuth.inputLabelContainer}>
                <View
                  style={[
                    VintageStylesAuth.inputIcon,
                    { backgroundColor: VintageColors.iconPink },
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={16}
                    color={VintageColors.primaryText}
                  />
                </View>
                <Text style={VintageStylesAuth.inputLabel}>Email</Text>
              </View>
              <TextInput
                style={[
                  VintageStylesAuth.input,
                  focusedInput === "email" && VintageStylesAuth.inputFocused,
                  errors.email && VintageStylesAuth.inputError,
                ]}
                ref={emailRef}
                placeholder="your.email@example.com"
                placeholderTextColor={VintageColors.secondaryText}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedInput("email")}
                onBlur={() => setFocusedInput(null)}
              />
              {errors.email && (
                <View style={VintageStylesAuth.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#D32F2F" />
                  <Text style={VintageStylesAuth.errorText}>
                    {errors.email}
                  </Text>
                </View>
              )}
            </View>

            {/* Username Input */}
            <View style={VintageStylesAuth.inputGroup}>
              <View style={VintageStylesAuth.inputLabelContainer}>
                <View
                  style={[
                    VintageStylesAuth.inputIcon,
                    { backgroundColor: VintageColors.iconBlue },
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={16}
                    color={VintageColors.primaryText}
                  />
                </View>
                <Text style={VintageStylesAuth.inputLabel}>Username</Text>
              </View>
              <TextInput
                style={[
                  VintageStylesAuth.input,
                  focusedInput === "username" && VintageStylesAuth.inputFocused,
                  errors.username && VintageStylesAuth.inputError,
                ]}
                ref={usernameRef}
                placeholder="Choose a memorable username"
                placeholderTextColor={VintageColors.secondaryText}
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
                onFocus={() => setFocusedInput("username")}
                onBlur={() => setFocusedInput(null)}
              />
              {errors.username && (
                <View style={VintageStylesAuth.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#D32F2F" />
                  <Text style={VintageStylesAuth.errorText}>
                    {errors.username}
                  </Text>
                </View>
              )}
            </View>

            {/* Doctor-specific fields */}
            {isDoctorMode && (
              <>
                <View style={VintageStylesAuth.inputGroup}>
                  <View style={VintageStylesAuth.inputLabelContainer}>
                    <View
                      style={[
                        VintageStylesAuth.inputIcon,
                        { backgroundColor: VintageColors.iconYellow },
                      ]}
                    >
                      <Ionicons
                        name="medkit"
                        size={16}
                        color={VintageColors.primaryText}
                      />
                    </View>
                    <Text style={VintageStylesAuth.inputLabel}>
                      Specialization *
                    </Text>
                  </View>
                  <TextInput
                    style={[
                      VintageStylesAuth.input,
                      focusedInput === "specialization" &&
                        VintageStylesAuth.inputFocused,
                      errors.doctorSpecialization &&
                        VintageStylesAuth.inputError,
                    ]}
                    ref={specializationRef}
                    placeholder="e.g., Diabetologist"
                    placeholderTextColor={VintageColors.secondaryText}
                    value={doctorSpecialization}
                    onChangeText={setDoctorSpecialization}
                    onFocus={() => setFocusedInput("specialization")}
                    onBlur={() => setFocusedInput(null)}
                  />
                  {errors.doctorSpecialization && (
                    <View style={VintageStylesAuth.errorContainer}>
                      <Ionicons name="alert-circle" size={14} color="#D32F2F" />
                      <Text style={VintageStylesAuth.errorText}>
                        {errors.doctorSpecialization}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={VintageStylesAuth.inputGroup}>
                  <View style={VintageStylesAuth.inputLabelContainer}>
                    <View
                      style={[
                        VintageStylesAuth.inputIcon,
                        { backgroundColor: VintageColors.iconPink },
                      ]}
                    >
                      <Ionicons
                        name="document-text"
                        size={16}
                        color={VintageColors.primaryText}
                      />
                    </View>
                    <Text style={VintageStylesAuth.inputLabel}>
                      License Number *
                    </Text>
                  </View>
                  <TextInput
                    style={[
                      VintageStylesAuth.input,
                      focusedInput === "license" &&
                        VintageStylesAuth.inputFocused,
                      errors.doctorLicense && VintageStylesAuth.inputError,
                    ]}
                    ref={licenseRef}
                    placeholder="Medical license number"
                    placeholderTextColor={VintageColors.secondaryText}
                    value={doctorLicense}
                    onChangeText={setDoctorLicense}
                    onFocus={() => setFocusedInput("license")}
                    onBlur={() => setFocusedInput(null)}
                  />
                  {errors.doctorLicense && (
                    <View style={VintageStylesAuth.errorContainer}>
                      <Ionicons name="alert-circle" size={14} color="#D32F2F" />
                      <Text style={VintageStylesAuth.errorText}>
                        {errors.doctorLicense}
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}

            {/* Password Input */}
            <View style={VintageStylesAuth.inputGroup}>
              <View style={VintageStylesAuth.inputLabelContainer}>
                <View
                  style={[
                    VintageStylesAuth.inputIcon,
                    { backgroundColor: VintageColors.iconGreen },
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={16}
                    color={VintageColors.primaryText}
                  />
                </View>
                <Text style={VintageStylesAuth.inputLabel}>Password</Text>
              </View>
              <TextInput
                style={[
                  VintageStylesAuth.input,
                  focusedInput === "password" && VintageStylesAuth.inputFocused,
                  errors.password && VintageStylesAuth.inputError,
                ]}
                ref={passwordRef}
                placeholder="Create a secure password"
                placeholderTextColor={VintageColors.secondaryText}
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
              />
              {errors.password && (
                <View style={VintageStylesAuth.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#D32F2F" />
                  <Text style={VintageStylesAuth.errorText}>
                    {errors.password}
                  </Text>
                </View>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={VintageStylesAuth.inputGroup}>
              <View style={VintageStylesAuth.inputLabelContainer}>
                <View
                  style={[
                    VintageStylesAuth.inputIcon,
                    { backgroundColor: VintageColors.iconYellow },
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={16}
                    color={VintageColors.primaryText}
                  />
                </View>
                <Text style={VintageStylesAuth.inputLabel}>
                  Confirm Password
                </Text>
              </View>
              <TextInput
                style={[
                  VintageStylesAuth.input,
                  focusedInput === "confirmPassword" &&
                    VintageStylesAuth.inputFocused,
                  errors.confirmPassword && VintageStylesAuth.inputError,
                ]}
                ref={confirmPasswordRef}
                placeholder="Repeat your password"
                placeholderTextColor={VintageColors.secondaryText}
                secureTextEntry={true}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusedInput("confirmPassword")}
                onBlur={() => setFocusedInput(null)}
              />
              {errors.confirmPassword && (
                <View style={VintageStylesAuth.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#D32F2F" />
                  <Text style={VintageStylesAuth.errorText}>
                    {errors.confirmPassword}
                  </Text>
                </View>
              )}
            </View>

            {/* Nightscout Section - Only for patients */}
            {!isDoctorMode && (
              <View style={VintageStylesAuth.nightscoutSection}>
                <View style={VintageStylesAuth.sectionHeader}>
                  <View
                    style={[
                      VintageStylesAuth.sectionIcon,
                      { backgroundColor: VintageColors.iconPurple },
                    ]}
                  >
                    <Ionicons
                      name="cloud-outline"
                      size={20}
                      color={VintageColors.primaryText}
                    />
                  </View>
                  <Text style={VintageStylesAuth.sectionTitle}>
                    Nightscout Connection
                  </Text>
                </View>

                {/* Nightscout URL - Only show when NOT storing locally */}
                {!storeLocally && (
                  <View style={VintageStylesAuth.inputGroup}>
                    <View style={VintageStylesAuth.inputLabelContainer}>
                      <View
                        style={[
                          VintageStylesAuth.inputIcon,
                          { backgroundColor: VintageColors.iconBlue },
                        ]}
                      >
                        <Ionicons
                          name="link-outline"
                          size={16}
                          color={VintageColors.primaryText}
                        />
                      </View>
                      <Text style={VintageStylesAuth.inputLabel}>
                        Nightscout URL *
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        VintageStylesAuth.input,
                        focusedInput === "nightscout" &&
                          VintageStylesAuth.inputFocused,
                        errors.nightscoutUrl && VintageStylesAuth.inputError,
                      ]}
                      ref={nightscoutUrlRef}
                      placeholder="https://your-nightscout.com"
                      placeholderTextColor={VintageColors.secondaryText}
                      autoCapitalize="none"
                      value={nightscoutUrl}
                      onChangeText={setNightscoutUrl}
                      onFocus={() => setFocusedInput("nightscout")}
                      onBlur={() => setFocusedInput(null)}
                    />
                    {errors.nightscoutUrl && (
                      <View style={VintageStylesAuth.errorContainer}>
                        <Ionicons
                          name="alert-circle"
                          size={14}
                          color="#D32F2F"
                        />
                        <Text style={VintageStylesAuth.errorText}>
                          {errors.nightscoutUrl}
                        </Text>
                      </View>
                    )}
                    <Text style={VintageStylesAuth.helpText}>
                      This is required to connect with your Nightscout data
                      source.
                    </Text>
                  </View>
                )}

                {/* Local Storage Option - Only for patients */}
                <View
                  style={[
                    VintageStylesAuth.localStorageCard,
                    storeLocally && VintageStylesAuth.localStorageCardActive,
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      VintageStylesAuth.localStorageHeader,
                      storeLocally &&
                        VintageStylesAuth.localStorageHeaderActive,
                    ]}
                    onPress={() =>
                      setShowLocalStorageDetails(!showLocalStorageDetails)
                    }
                    activeOpacity={0.7}
                  >
                    <View style={VintageStylesAuth.localStorageHeaderLeft}>
                      <View
                        style={[
                          VintageStylesAuth.iconContainer,
                          storeLocally
                            ? { backgroundColor: VintageColors.formAccent1 }
                            : { backgroundColor: VintageColors.formAccent3 },
                        ]}
                      >
                        <Ionicons
                          name={storeLocally ? "phone-portrait" : "cloud"}
                          size={20}
                          color="#FFFFFF"
                        />
                      </View>
                      <View>
                        <Text style={VintageStylesAuth.localStorageTitle}>
                          {storeLocally
                            ? "Local Storage Mode"
                            : "Cloud Storage Mode"}
                        </Text>
                        <Text style={VintageStylesAuth.localStorageSubtitle}>
                          {storeLocally
                            ? "Your data stays on your device only"
                            : "Your data is stored in your account"}
                        </Text>
                      </View>
                    </View>

                    <View style={VintageStylesAuth.headerRight}>
                      <TouchableOpacity
                        style={VintageStylesAuth.toggleSwitchSmall}
                        onPress={(e) => {
                          e.stopPropagation();
                          setStoreLocally(!storeLocally);
                        }}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            VintageStylesAuth.toggleKnobSmall,
                            storeLocally &&
                              VintageStylesAuth.toggleKnobSmallActive,
                          ]}
                        />
                      </TouchableOpacity>
                      <Ionicons
                        name={
                          showLocalStorageDetails
                            ? "chevron-up"
                            : "chevron-down"
                        }
                        size={20}
                        color={
                          storeLocally
                            ? VintageColors.formAccent1
                            : VintageColors.formAccent3
                        }
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Expandable Details Section */}
                  {showLocalStorageDetails && (
                    <View style={VintageStylesAuth.localStorageContent}>
                      <View style={VintageStylesAuth.descriptionContainer}>
                        {storeLocally ? (
                          <>
                            <View style={VintageStylesAuth.featureItem}>
                              <View
                                style={[
                                  VintageStylesAuth.featureIcon,
                                  { backgroundColor: VintageColors.iconGreen },
                                ]}
                              >
                                <Ionicons
                                  name="checkmark-circle"
                                  size={14}
                                  color={VintageColors.primaryText}
                                />
                              </View>
                              <Text style={VintageStylesAuth.featureText}>
                                Enhanced privacy - URL never leaves your device
                              </Text>
                            </View>
                            <View style={VintageStylesAuth.featureItem}>
                              <View
                                style={[
                                  VintageStylesAuth.featureIcon,
                                  { backgroundColor: VintageColors.iconYellow },
                                ]}
                              >
                                <Ionicons
                                  name="key"
                                  size={14}
                                  color={VintageColors.primaryText}
                                />
                              </View>
                              <Text style={VintageStylesAuth.featureText}>
                                Enter your Nightscout URL securely at each login
                              </Text>
                            </View>
                            <View style={VintageStylesAuth.infoNote}>
                              <Ionicons
                                name="information-circle"
                                size={16}
                                color={VintageColors.secondaryText}
                              />
                              <Text style={VintageStylesAuth.infoText}>
                                When Local Storage is enabled, you'll enter your
                                Nightscout URL each time you log in.
                              </Text>
                            </View>
                          </>
                        ) : (
                          <>
                            <View style={VintageStylesAuth.featureItem}>
                              <View
                                style={[
                                  VintageStylesAuth.featureIcon,
                                  { backgroundColor: VintageColors.iconBlue },
                                ]}
                              >
                                <Ionicons
                                  name="globe"
                                  size={14}
                                  color={VintageColors.primaryText}
                                />
                              </View>
                              <Text style={VintageStylesAuth.featureText}>
                                URL stored in your secure, encrypted account
                              </Text>
                            </View>
                            <View style={VintageStylesAuth.featureItem}>
                              <View
                                style={[
                                  VintageStylesAuth.featureIcon,
                                  { backgroundColor: VintageColors.iconPink },
                                ]}
                              >
                                <Ionicons
                                  name="flash"
                                  size={14}
                                  color={VintageColors.primaryText}
                                />
                              </View>
                              <Text style={VintageStylesAuth.featureText}>
                                Automatic login - no URL entry needed
                              </Text>
                            </View>
                            <View style={VintageStylesAuth.featureItem}>
                              <View
                                style={[
                                  VintageStylesAuth.featureIcon,
                                  { backgroundColor: VintageColors.iconPurple },
                                ]}
                              >
                                <Ionicons
                                  name="sync"
                                  size={14}
                                  color={VintageColors.primaryText}
                                />
                              </View>
                              <Text style={VintageStylesAuth.featureText}>
                                Seamless sync across all your devices
                              </Text>
                            </View>
                          </>
                        )}
                      </View>
                    </View>
                  )}
                </View>

                {/* Guide Links */}
                <View style={VintageStylesAuth.linksContainer}>
                  <TouchableOpacity
                    style={VintageStylesAuth.guideLink}
                    onPress={() =>
                      Linking.openURL(
                        "https://i.pinimg.com/736x/d2/42/ca/d242ca98cfcc6a961aa77f29a3d9a834.jpg",
                      )
                    }
                  >
                    <View
                      style={[
                        VintageStylesAuth.guideIcon,
                        { backgroundColor: VintageColors.iconYellow },
                      ]}
                    >
                      <Ionicons
                        name="book"
                        size={18}
                        color={VintageColors.primaryText}
                      />
                    </View>
                    <Text style={VintageStylesAuth.guideLinkText}>
                      xDrip+ Guide
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={VintageStylesAuth.guideLink}
                    onPress={() =>
                      Linking.openURL(
                        "https://i.pinimg.com/736x/55/c9/75/55c975c34c32722bea92dd0ba7272ee4.jpg",
                      )
                    }
                  >
                    <View
                      style={[
                        VintageStylesAuth.guideIcon,
                        { backgroundColor: VintageColors.iconBlue },
                      ]}
                    >
                      <Ionicons
                        name="document-text"
                        size={18}
                        color={VintageColors.primaryText}
                      />
                    </View>
                    <Text style={VintageStylesAuth.guideLinkText}>
                      Nightscout Guide
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={VintageStylesAuth.setupHelp}>
                  Don't have Nightscout set up yet? These guides will walk you
                  through the installation.
                </Text>
              </View>
            )}

            {errors.firebase && (
              <View style={VintageStylesAuth.errorContainer}>
                <Ionicons name="alert-circle" size={14} color="#D32F2F" />
                <Text style={VintageStylesAuth.errorText}>
                  {errors.firebase}
                </Text>
              </View>
            )}

            {/* Register Button */}
            <TouchableOpacity
              style={[
                VintageStylesAuth.primaryButton,
                isDoctorMode && { backgroundColor: VintageColors.formAccent1 },
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View style={VintageStylesAuth.buttonContent}>
                  <Ionicons
                    name={isDoctorMode ? "medical" : "leaf"}
                    size={18}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <View>
                    <Text style={VintageStylesAuth.buttonText}>
                      {isDoctorMode ? "Register as Doctor" : "Create Account"}
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={VintageStylesAuth.signupContainer}>
              <Text style={VintageStylesAuth.signupText}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={VintageStylesAuth.linkText}>Sign in here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={VintageStylesAuth.spacing40} />
      </ScrollView>
    </View>
  );
};

export default RegisterScreen;
