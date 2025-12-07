import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { getPlatformStyles } from "../themes/styles";
import { useWindowDimensions } from "react-native";
import { LoginScreenProps } from "../types/navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { loginWithUsername } from "../services/authService";
import { ActivityIndicator } from "react-native";
import { VintageColors } from "../themes/vintage/colors_vintage";
import { VintageStylesAuth } from "../themes/vintage/styles_vintage_auth";
import { Ionicons, Feather, FontAwesome5 } from "@expo/vector-icons";
const gooseImage = require("../../assets/goose1.png");
import * as sha1 from "js-sha1";
import { getStoreLocallyFlag } from "../services/userService";
import { VintageStyles } from "../themes/vintage/styles_vintage";

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const platformStyles = getPlatformStyles();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [nightscoutSecret, setNightscoutSecret] = useState("");
  const [nightscoutUrl, setNightscoutUrl] = useState("");
  const isWeb = Platform.OS === "web";
  const [rememberMe, setRememberMe] = useState(!isWeb);
  const [storeLocally, setStoreLocally] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const identifierRef = React.useRef<TextInput>(null);
  const passwordRef = React.useRef<TextInput>(null);
  const nightscoutUrlRef = React.useRef<TextInput>(null);
  const nightscoutSecretRef = React.useRef<TextInput>(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    identifier?: string;
    password?: string;
    firebase?: string;
    nightscoutUrl?: string;
  }>({});

  const handleIdentifierChange = async (value: string) => {
    setIdentifier(value);

    if (value.trim().length > 0) {
      const flag = await getStoreLocallyFlag(value);
      setStoreLocally(flag);
      setShowUrlInput(flag);
    } else {
      // empty input
      setShowUrlInput(false);
      setStoreLocally(false);
    }
  };

  const focusFirstError = () => {
    if (errors.identifier) identifierRef.current?.focus();
    else if (errors.password) passwordRef.current?.focus();
    else if (errors.nightscoutUrl) nightscoutUrlRef.current?.focus();
  };

  async function handleLogin() {
    if (!validateData()) {
      focusFirstError();
      return;
    }

    setLoading(true);

    try {
      let nightscoutSecretHash: string | undefined = undefined;
      if (nightscoutSecret && nightscoutSecret.trim().length > 0) {
        nightscoutSecretHash = sha1.sha1(nightscoutSecret);
      }

      const result = await loginWithUsername(
        identifier,
        password,
        nightscoutUrl ? nightscoutUrl : "",
        nightscoutSecretHash || undefined,
        storeLocally,
        rememberMe
      );

      if (!result.success) {
        setErrors((prev) => ({ ...prev, firebase: result.error?.message }));
        setLoading(false);
        return;
      }

      cleanup();
      navigation.navigate("MainTabs" as never);
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        firebase: "Unexpected error, try again.",
      }));
    } finally {
      setLoading(false);
    }
  }

  const cleanup = () => {
    setIdentifier("");
    setPassword("");
    setNightscoutSecret("");
    setNightscoutUrl("");
    setErrors({});
    setFocusedInput(null);
  };

  const validateData = () => {
    const newErrors: typeof errors = {};
    if (!identifier) {
      newErrors.identifier = "Please enter your username or email.";
    }
    if (!password) {
      newErrors.password = "Please enter your password.";
    }

    if (showUrlInput && !nightscoutUrl) {
      newErrors.nightscoutUrl = "Please enter your Nightscout URL.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <View style={[VintageStyles.container]}>
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
            <Text style={VintageStylesAuth.welcomeTitle}>Welcome Back!</Text>
            <Text style={VintageStylesAuth.welcomeSubtitle}>
              Glad to see you again in our cozy flock
            </Text>
          </View>

          {/* Registration Form*/}
          <View style={VintageStylesAuth.formContainer}>
            {/* Email Input */}
            <View style={VintageStylesAuth.inputGroup}>
              <View style={VintageStylesAuth.inputLabelContainer}>
                <View
                  style={[
                    VintageStylesAuth.inputIcon,
                    { backgroundColor: VintageColors.iconPurple },
                  ]}
                >
                  <Ionicons
                    name="person-circle-outline"
                    size={16}
                    color={VintageColors.primaryText}
                  />
                </View>
                <Text style={VintageStylesAuth.inputLabel}>Username</Text>
              </View>
              <TextInput
                ref={identifierRef}
                style={[
                  VintageStylesAuth.input,
                  focusedInput === "identifier" &&
                    VintageStylesAuth.inputFocused,
                  errors.identifier && VintageStylesAuth.inputError,
                ]}
                placeholder="Enter your username"
                placeholderTextColor={VintageColors.secondaryText}
                autoCapitalize="none"
                onChangeText={handleIdentifierChange}
                value={identifier}
                onFocus={() => setFocusedInput("identifier")}
                onBlur={() => setFocusedInput(null)}
              />
              {errors.identifier && (
                <View style={VintageStylesAuth.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#D32F2F" />
                  <Text style={VintageStylesAuth.errorText}>
                    {errors.identifier}
                  </Text>
                </View>
              )}
            </View>

            {/* Password Input*/}
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
                ref={passwordRef}
                onChangeText={setPassword}
                value={password}
                style={[
                  VintageStylesAuth.input,
                  focusedInput === "password" && VintageStylesAuth.inputFocused,
                  errors.password && VintageStylesAuth.inputError,
                ]}
                placeholder="Enter your password"
                placeholderTextColor={VintageColors.secondaryText}
                secureTextEntry={true}
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

            {/* Nightscout URL - Only show when needed */}
            {showUrlInput && (
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
                    focusedInput === "nightscoutUrl" &&
                      VintageStylesAuth.inputFocused,
                    errors.nightscoutUrl && VintageStylesAuth.inputError,
                  ]}
                  ref={nightscoutUrlRef}
                  placeholder="https://your-nightscout-url.com"
                  placeholderTextColor={VintageColors.secondaryText}
                  autoCapitalize="none"
                  value={nightscoutUrl}
                  onChangeText={setNightscoutUrl}
                  onFocus={() => setFocusedInput("nightscoutUrl")}
                  onBlur={() => setFocusedInput(null)}
                />
                {errors.nightscoutUrl && (
                  <View style={VintageStylesAuth.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color="#D32F2F" />
                    <Text style={VintageStylesAuth.errorText}>
                      {errors.nightscoutUrl}
                    </Text>
                  </View>
                )}
                <View style={VintageStylesAuth.infoNote}>
                  <Ionicons
                    name="information-circle"
                    size={16}
                    color={VintageColors.secondaryText}
                  />
                  <Text style={VintageStylesAuth.infoText}>
                    {storeLocally
                      ? "You're using local storage mode. Please enter your Nightscout URL."
                      : "Enter your Nightscout URL to connect to your data source."}
                  </Text>
                </View>
              </View>
            )}

            {/* Nightscout Secret */}
            <View style={VintageStylesAuth.inputGroup}>
              <View style={VintageStylesAuth.inputLabelContainer}>
                <View
                  style={[
                    VintageStylesAuth.inputIcon,
                    { backgroundColor: VintageColors.iconYellow },
                  ]}
                >
                  <Ionicons
                    name="key-outline"
                    size={16}
                    color={VintageColors.primaryText}
                  />
                </View>
                <Text style={VintageStylesAuth.inputLabel}>
                  Nightscout API Secret (Optional)
                </Text>
              </View>
              <TextInput
                style={[
                  VintageStylesAuth.input,
                  focusedInput === "nightscoutSecret" &&
                    VintageStylesAuth.inputFocused,
                ]}
                ref={nightscoutSecretRef}
                placeholder="Enter your API token if you have one"
                placeholderTextColor={VintageColors.secondaryText}
                autoCapitalize="none"
                value={nightscoutSecret}
                onChangeText={setNightscoutSecret}
                onFocus={() => setFocusedInput("nightscoutSecret")}
                onBlur={() => setFocusedInput(null)}
              />
              <Text style={VintageStylesAuth.helpText}>
                If your Nightscout instance requires authentication, add your
                API token here. It will only be stored locally on your device.
              </Text>
            </View>

            {/* Remember Me checkbox - Web only */}
            {isWeb && (
              <View style={VintageStylesAuth.inputGroup}>
                <TouchableOpacity
                  style={VintageStylesAuth.checkboxContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      VintageStylesAuth.checkbox,
                      rememberMe && VintageStylesAuth.checkboxChecked,
                    ]}
                  >
                    {rememberMe && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={VintageStylesAuth.checkboxLabel}>
                    Remember Me
                  </Text>
                </TouchableOpacity>
                <Text style={VintageStylesAuth.helpText}>
                  Stay signed in on this device
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

            {/* Login Button  */}
            <TouchableOpacity
              style={VintageStylesAuth.primaryButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View style={VintageStylesAuth.buttonContent}>
                  <Feather
                    name="feather"
                    size={18}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={VintageStylesAuth.buttonText}>Sign In</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={VintageStylesAuth.forgotLink}>
              <Ionicons
                name="help-circle-outline"
                size={16}
                color={VintageColors.formAccent1}
                style={{ marginRight: 6 }}
              />
              <Text style={VintageStylesAuth.linkText}>
                Forgot your password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Section */}
          <View style={VintageStylesAuth.signupContainer}>
            <Text style={VintageStylesAuth.signupText}>
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              style={VintageStylesAuth.signupLinkContainer}
            >
              <Text style={VintageStylesAuth.linkText}>Sign up here</Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={VintageColors.formAccent1}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={VintageStylesAuth.spacing40} />
        <StatusBar style="auto" />
      </ScrollView>
    </View>
  );
};

export default LoginScreen;
