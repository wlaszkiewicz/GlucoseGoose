import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Linking,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { getPlatformStyles, CommonStyles } from "../themes/styles";
import { useWindowDimensions } from "react-native";
import { RegisterScreenProps } from "../types/navigation";
import { Colors } from "../themes/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";
import { registerUser } from "../services/authService";
import { isUsernameAvailable } from "../services/userService";
import { ActivityIndicator } from "react-native";

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const platformStyles = getPlatformStyles();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [xdripUrl, setXdripUrl] = useState("");
  const [xdripToken, setXdripToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    xdripUrl?: string;
    firebase?: string;
  }>({});

  const emailRef = useRef<TextInput>(null);
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const xdripUrlRef = useRef<TextInput>(null);

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

    if (!xdripUrl) newErrors.xdripUrl = "xDrip+ URL is required.";
    else {
      try {
        new URL(xdripUrl);
      } catch {
        newErrors.xdripUrl = "Invalid xDrip+ URL.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const focusFirstError = () => {
    if (errors.email) emailRef.current?.focus();
    else if (errors.username) usernameRef.current?.focus();
    else if (errors.password) passwordRef.current?.focus();
    else if (errors.confirmPassword) confirmPasswordRef.current?.focus();
    else if (errors.xdripUrl) xdripUrlRef.current?.focus();
  };

  async function handleRegister() {
    if (!validateData()) {
      focusFirstError();
      return;
    }

    setLoading(true);

    // TODO: check availability while typing instead of only on submit!!

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

    const result = await registerUser(email, password, {
      username,
      url: xdripUrl,
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
      navigation.navigate("Login");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView
        style={platformStyles.container}
        contentContainerStyle={platformStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={platformStyles.mainContainer}>
          {/* Goose Header */}
          <View style={CommonStyles.header}>
            <Image
              source={require("../../assets/logo-placeholder.png")}
              style={CommonStyles.gooseIcon}
            />
            <Text style={CommonStyles.appTitle}>GlucoseGoose</Text>
            <Text style={CommonStyles.subtitle}>Create Your Account</Text>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              Create your account to start tracking your glucose levels and get
              personalized insights. You'll need your xDrip+ URL to connect your
              data.
            </Text>
          </View>

          {/* Registration Form */}
          <View style={styles.formContainer}>
            <View style={CommonStyles.inputGroup}>
              <Text style={CommonStyles.inputLabel}>Email</Text>
              <TextInput
                style={CommonStyles.input}
                ref={emailRef}
                placeholder="Enter your email address"
                placeholderTextColor="#A0A0A0"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            <View style={CommonStyles.inputGroup}>
              <Text style={CommonStyles.inputLabel}>Username</Text>
              <TextInput
                style={CommonStyles.input}
                ref={usernameRef}
                placeholder="Choose a username"
                placeholderTextColor="#A0A0A0"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
              />
              {errors.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}
            </View>

            <View style={CommonStyles.inputGroup}>
              <Text style={CommonStyles.inputLabel}>Password</Text>
              <TextInput
                style={CommonStyles.input}
                ref={passwordRef}
                placeholder="Create a password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            <View style={CommonStyles.inputGroup}>
              <Text style={CommonStyles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={CommonStyles.input}
                ref={confirmPasswordRef}
                placeholder="Confirm your password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry={true}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* xDrip+ Section */}
            <View style={styles.xdripSection}>
              <Text style={styles.sectionTitle}>xDrip+ Connection</Text>
              <Text style={styles.sectionDescription}>
                To get the most out of GlucoseGoose, connect your xDrip+ data.
                This allows real-time glucose monitoring and AI-powered
                insights.
              </Text>

              <View style={CommonStyles.inputGroup}>
                <Text style={CommonStyles.inputLabel}>xDrip+ URL *</Text>
                <TextInput
                  style={CommonStyles.input}
                  ref={xdripUrlRef}
                  placeholder="https://your-xdrip-url.com"
                  placeholderTextColor="#A0A0A0"
                  autoCapitalize="none"
                  value={xdripUrl}
                  onChangeText={setXdripUrl}
                />
                {errors.xdripUrl && (
                  <Text style={styles.errorText}>{errors.xdripUrl}</Text>
                )}
                <Text style={CommonStyles.helpText}>
                  This is required to connect with your xDrip+ data source. Make
                  sure your xDrip+ web server is enabled and accessible.
                </Text>
              </View>

              <View style={CommonStyles.inputGroup}>
                <Text style={CommonStyles.inputLabel}>
                  xDrip+ Token (Optional)
                </Text>
                <TextInput
                  style={CommonStyles.input}
                  placeholder="Enter your API token if you have one"
                  placeholderTextColor="#A0A0A0"
                  autoCapitalize="none"
                  value={xdripToken}
                  onChangeText={setXdripToken}
                />
                <Text style={CommonStyles.helpText}>
                  If your xDrip+ instance requires authentication, add your API
                  token here. Most users can leave this field empty.
                </Text>
              </View>

              {errors.firebase && (
                <Text style={styles.errorText}>{errors.firebase}</Text>
              )}

              <View style={styles.linksContainer}>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      "https://i.pinimg.com/736x/d2/42/ca/d242ca98cfcc6a961aa77f29a3d9a834.jpg"
                    )
                  }
                >
                  <Text style={styles.buttonText}>xDrip+ Setup Guide</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      "https://i.pinimg.com/736x/55/c9/75/55c975c34c32722bea92dd0ba7272ee4.jpg"
                    )
                  }
                >
                  <Text style={styles.buttonText}>Nightscout Setup Guide</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.setupHelp}>
                Don't have xDrip+ set up yet? No problem! These user friendly
                guides will walk you through the installation, configuration,
                and connection process step by step.
              </Text>
            </View>

            {/* Register Button & Login Link */}
            <TouchableOpacity
              style={CommonStyles.primaryButton}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={CommonStyles.buttonText}>
                  Create Account & Connect
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={CommonStyles.linkText}>Sign in here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <StatusBar style="auto" />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  welcomeSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
  },
  formContainer: {
    alignItems: "center",
    width: "100%",
    marginBottom: 40,
  },
  xdripSection: {
    width: "100%",
    marginBottom: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 15,
    color: "#555",
    lineHeight: 21,
    marginBottom: 20,
  },
  setupHelp: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginTop: 16,
    fontStyle: "italic",
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: "#666",
  },
  linksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: Colors.secondary,
    fontSize: 15,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  errorText: { color: "red", marginTop: 4 },
});

export default RegisterScreen;
