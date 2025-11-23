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
} from "react-native";
import { getPlatformStyles, CommonStyles } from "../themes/styles";
import { useWindowDimensions } from "react-native";
import { LoginScreenProps } from "../types/navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { loginWithEmailOrUsername } from "../services/authService";
import { ActivityIndicator } from "react-native";

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const platformStyles = getPlatformStyles();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

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
      const result = await loginWithEmailOrUsername(identifier, password);

      if (!result.success) {
        setErrors((prev) => ({ ...prev, firebase: result.error?.message }));
        setLoading(false);
        return;
      }

      navigation.navigate("Home");
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        firebase: "Unexpected error, try again.",
      }));
    } finally {
      setLoading(false);
    }
  }

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
            <Text style={CommonStyles.subtitle}>Your CGM Companion</Text>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              Sign in to access your glucose data, patterns, and AI-powered
              insights.
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={CommonStyles.inputGroup}>
              <Text style={CommonStyles.inputLabel}>Username or Email</Text>
              <TextInput
                ref={identifierRef}
                style={CommonStyles.input}
                placeholder="Enter your username or email"
                placeholderTextColor="#A0A0A0"
                autoCapitalize="none"
                onChangeText={setIdentifier}
                value={identifier}
              />
              {errors.identifier && (
                <Text style={styles.errorText}>{errors.identifier}</Text>
              )}
            </View>

            <View style={CommonStyles.inputGroup}>
              <Text style={CommonStyles.inputLabel}>Password</Text>
              <TextInput
                ref={passwordRef}
                onChangeText={setPassword}
                value={password}
                style={CommonStyles.input}
                placeholder="Enter your password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry={true}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {errors.firebase && (
              <Text style={styles.errorText}>{errors.firebase}</Text>
            )}

            {/*Login Button */}
            <TouchableOpacity
              style={CommonStyles.primaryButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={CommonStyles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.forgotLink}>
              <Text style={CommonStyles.linkText}>Forgot your password?</Text>
            </TouchableOpacity>
          </View>

          {/* Help Section */}
          <View style={styles.helpSection}>
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={CommonStyles.linkText}>Sign up here</Text>
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
  forgotLink: {
    paddingVertical: 8,
  },
  helpSection: {
    alignItems: "center",
    width: "100%",
  },
  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  signupText: {
    fontSize: 14,
    color: "#666",
  },
  errorText: { color: "red", marginBottom: 8, alignSelf: "flex-start" },
});

export default LoginScreen;
