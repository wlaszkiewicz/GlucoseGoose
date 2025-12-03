import React from "react";
import { StatusBar } from "expo-status-bar";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";
import { registerUser, logoutUser } from "../services/authService";
import { isUsernameAvailable } from "../services/userService";
import { ActivityIndicator } from "react-native";
import sha1 from "js-sha1";
import { VintageColors } from "../themes/vintage/colors_vintage";
import { VintageStylesAuth } from "../themes/vintage/styles_vintage_auth";

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nightscoutUrl, setNightscoutUrl] = useState("");
  const [nightscoutSecret, setNightscoutSecret] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    nightscoutUrl?: string;
    firebase?: string;
  }>({});

  const emailRef = useRef<TextInput>(null);
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const nightscoutUrlRef = useRef<TextInput>(null);

  const focusFirstError = () => {
    if (errors.email) emailRef.current?.focus();
    else if (errors.username) usernameRef.current?.focus();
    else if (errors.password) passwordRef.current?.focus();
    else if (errors.confirmPassword) confirmPasswordRef.current?.focus();
    else if (errors.nightscoutUrl) nightscoutUrlRef.current?.focus();
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

    if (!nightscoutUrl) newErrors.nightscoutUrl = "Nightscout URL is required.";
    else {
      try {
        new URL(nightscoutUrl);
      } catch {
        newErrors.nightscoutUrl = "Invalid Nightscout URL.";
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

    const nightscoutSecretHash = sha1.sha1(nightscoutSecret);

    const result = await registerUser(email, password, {
      username,
      nightscoutUrl: nightscoutUrl,
      nightscoutSecret: nightscoutSecretHash,
      role: "user",
    });

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
    setNightscoutSecret("");
    setErrors({});
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
              <Image
                source={require("../../assets/goose1.png")}
                style={VintageStylesAuth.gooseIcon}
              />
            </View>
          </View>

          {/* Welcome Section */}
          <View style={VintageStylesAuth.welcomeSection}>
            <Text style={VintageStylesAuth.welcomeTitle}>Join Us!</Text>
          </View>

          {/* Registration Form */}
          <View style={VintageStylesAuth.formContainer}>
            {/* Email Input */}
            <View style={VintageStylesAuth.inputGroup}>
              <Text style={VintageStylesAuth.inputLabel}>Email</Text>
              <TextInput
                style={VintageStylesAuth.input}
                ref={emailRef}
                placeholder="Enter your email address"
                placeholderTextColor={VintageColors.secondaryText}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              {errors.email && (
                <Text style={VintageStylesAuth.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Username Input */}
            <View style={VintageStylesAuth.inputGroup}>
              <Text style={VintageStylesAuth.inputLabel}>Username</Text>
              <TextInput
                style={VintageStylesAuth.input}
                ref={usernameRef}
                placeholder="Choose a username"
                placeholderTextColor={VintageColors.secondaryText}
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
              {errors.username && (
                <Text style={VintageStylesAuth.errorText}>
                  {errors.username}
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View style={VintageStylesAuth.inputGroup}>
              <Text style={VintageStylesAuth.inputLabel}>Password</Text>
              <TextInput
                style={VintageStylesAuth.input}
                ref={passwordRef}
                placeholder="Create a password"
                placeholderTextColor={VintageColors.secondaryText}
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
              />
              {errors.password && (
                <Text style={VintageStylesAuth.errorText}>
                  {errors.password}
                </Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={VintageStylesAuth.inputGroup}>
              <Text style={VintageStylesAuth.inputLabel}>Confirm Password</Text>
              <TextInput
                style={VintageStylesAuth.input}
                ref={confirmPasswordRef}
                placeholder="Confirm your password"
                placeholderTextColor={VintageColors.secondaryText}
                secureTextEntry={true}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              {errors.confirmPassword && (
                <Text style={VintageStylesAuth.errorText}>
                  {errors.confirmPassword}
                </Text>
              )}
            </View>

            {/* Nightscout Section */}
            <View style={VintageStylesAuth.nightscoutSection}>
              <Text style={VintageStylesAuth.sectionTitle}>
                Nightscout Connection
              </Text>

              {/* Nightscout URL */}
              <View style={VintageStylesAuth.inputGroup}>
                <Text style={VintageStylesAuth.inputLabel}>
                  Nightscout URL *
                </Text>
                <TextInput
                  style={VintageStylesAuth.input}
                  ref={nightscoutUrlRef}
                  placeholder="https://your-nightscout-url.com"
                  placeholderTextColor={VintageColors.secondaryText}
                  autoCapitalize="none"
                  value={nightscoutUrl}
                  onChangeText={setNightscoutUrl}
                />
                {errors.nightscoutUrl && (
                  <Text style={VintageStylesAuth.errorText}>
                    {errors.nightscoutUrl}
                  </Text>
                )}
                <Text style={VintageStylesAuth.helpText}>
                  This is required to connect with your Nightscout data source.
                </Text>
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
                  API token here.
                </Text>
              </View>

              {/* Guide Links */}
              <View style={VintageStylesAuth.linksContainer}>
                <TouchableOpacity
                  style={VintageStylesAuth.guideLink}
                  onPress={() =>
                    Linking.openURL(
                      "https://i.pinimg.com/736x/d2/42/ca/d242ca98cfcc6a961aa77f29a3d9a834.jpg"
                    )
                  }
                >
                  <Text style={VintageStylesAuth.guideLinkText}>
                    xDrip+ Guide
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={VintageStylesAuth.guideLink}
                  onPress={() =>
                    Linking.openURL(
                      "https://i.pinimg.com/736x/55/c9/75/55c975c34c32722bea92dd0ba7272ee4.jpg"
                    )
                  }
                >
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

            {errors.firebase && (
              <Text style={VintageStylesAuth.errorText}>{errors.firebase}</Text>
            )}

            {/* Register Button */}
            <TouchableOpacity
              style={VintageStylesAuth.primaryButton}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={VintageStylesAuth.buttonText}>
                  Create Account & Connect
                </Text>
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
        <StatusBar style="auto" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
