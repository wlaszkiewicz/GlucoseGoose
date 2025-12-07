import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Switch,
} from "react-native";
import { getPlatformStyles } from "../themes/styles";
import { useWindowDimensions } from "react-native";
import { LoginScreenProps } from "../types/navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { loginWithEmailOrUsername } from "../services/authService";
import { ActivityIndicator } from "react-native";
import { VintageColors } from "../themes/vintage/colors_vintage";
import { VintageStylesAuth } from "../themes/vintage/styles_vintage_auth";
const gooseImage = require("../../assets/goose1.png");
import * as sha1 from "js-sha1";

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const platformStyles = getPlatformStyles();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [nightscoutSecret, setNightscoutSecret] = useState("");
  const isWeb = Platform.OS === "web";
  const [rememberMe, setRememberMe] = useState(!isWeb); // default true on non-web

  const identifierRef = React.useRef<TextInput>(null);
  const passwordRef = React.useRef<TextInput>(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    identifier?: string;
    password?: string;
    firebase?: string;
  }>({});

  const focusFirstError = () => {
    if (errors.identifier) identifierRef.current?.focus();
    else if (errors.password) passwordRef.current?.focus();
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

      const result = await loginWithEmailOrUsername(
        identifier,
        password,
        nightscoutSecretHash,
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
    setErrors({});
  };

  const validateData = () => {
    const newErrors: typeof errors = {};
    if (!identifier) {
      newErrors.identifier = "Please enter your username or email.";
    }
    if (!password) {
      newErrors.password = "Please enter your password.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const CustomCheckbox: React.FC<{
    value: boolean;
    onValueChange: (value: boolean) => void;
    label: string;
  }> = ({ value, onValueChange, label }) => {
    return (
      <TouchableOpacity
        style={VintageStylesAuth.checkboxContainer}
        onPress={() => onValueChange(!value)}
        activeOpacity={0.7}
      >
        <View
          style={[
            VintageStylesAuth.checkbox,
            value && VintageStylesAuth.checkboxChecked,
          ]}
        >
          {value && <Text style={VintageStylesAuth.checkboxCheckmark}>✓</Text>}
        </View>
        <Text style={VintageStylesAuth.checkboxLabel}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={VintageStylesAuth.container}>
      <ScrollView
        contentContainerStyle={VintageStylesAuth.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={VintageStylesAuth.mainContainer}>
          {/* Vintage Header */}
          <View style={VintageStylesAuth.headerSection}>
            <View style={VintageStylesAuth.header}>
              <View style={VintageStylesAuth.headerDecoration}>
                <View style={VintageStylesAuth.headerLine} />
                <Text style={VintageStylesAuth.headerTitle}>GlucoseGoose</Text>
                <View style={VintageStylesAuth.headerLine} />
              </View>
              <View style={VintageStylesAuth.avatarContainer}>
                <View style={VintageStylesAuth.gooseAvatarCircle}>
                  <Image
                    source={gooseImage}
                    style={VintageStylesAuth.gooseAvatarImage}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Welcome Section */}
          <View style={VintageStylesAuth.welcomeSection}>
            <Text style={VintageStylesAuth.welcomeTitle}>Welcome Back!</Text>
          </View>

          {/* Login Form */}
          <View style={VintageStylesAuth.formContainer}>
            <View style={VintageStylesAuth.inputGroup}>
              <Text style={VintageStylesAuth.inputLabel}>
                Username or Email
              </Text>
              <TextInput
                ref={identifierRef}
                style={VintageStylesAuth.input}
                placeholder="Enter your username or email"
                placeholderTextColor={VintageColors.secondaryText}
                autoCapitalize="none"
                onChangeText={setIdentifier}
                value={identifier}
              />
              {errors.identifier && (
                <Text style={VintageStylesAuth.errorText}>
                  {errors.identifier}
                </Text>
              )}
            </View>

            {/* Nightscout Secret */}
            <View style={VintageStylesAuth.inputGroup}>
              <Text style={VintageStylesAuth.inputLabel}>
                Nightscout API Secret (Optional)
              </Text>
              <TextInput
                style={VintageStylesAuth.input}
                placeholder="Enter your API token if you have one"
                placeholderTextColor={VintageColors.secondaryText}
                autoCapitalize="none"
                value={nightscoutSecret}
                onChangeText={setNightscoutSecret}
              />
              <Text style={VintageStylesAuth.helpText}>
                If your Nightscout instance requires authentication, add your
                API token here. This will only be stored locally on your device
                to ensure secure access to your data.
              </Text>
            </View>

            <View style={VintageStylesAuth.inputGroup}>
              <Text style={VintageStylesAuth.inputLabel}>Password</Text>
              <TextInput
                ref={passwordRef}
                onChangeText={setPassword}
                value={password}
                style={VintageStylesAuth.input}
                placeholder="Enter your password"
                placeholderTextColor={VintageColors.secondaryText}
                secureTextEntry={true}
              />
              {errors.password && (
                <Text style={VintageStylesAuth.errorText}>
                  {errors.password}
                </Text>
              )}
            </View>

            {/* Remember Me checkbox - Web only */}
            {isWeb && (
              <View style={VintageStylesAuth.inputGroup}>
                <CustomCheckbox
                  value={rememberMe}
                  onValueChange={setRememberMe}
                  label="Remember Me"
                />
                <Text style={VintageStylesAuth.helpText}>
                  Stay signed in on this device
                </Text>
              </View>
            )}

            {errors.firebase && (
              <Text style={VintageStylesAuth.errorText}>{errors.firebase}</Text>
            )}

            {/* Login Button */}
            <TouchableOpacity
              style={VintageStylesAuth.primaryButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={VintageStylesAuth.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={VintageStylesAuth.forgotLink}>
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
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={VintageStylesAuth.linkText}>Sign up here</Text>
            </TouchableOpacity>
          </View>
        </View>

        <StatusBar style="auto" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
