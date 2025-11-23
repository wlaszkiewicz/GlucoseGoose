import { Colors, Spacing, BorderRadius } from "./colors";
import {
  Platform,
  useWindowDimensions,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";

interface PlatformStyles {
  container: ViewStyle;
  scrollContent: ViewStyle;
  mainContainer: ViewStyle;
}

interface CommonStylesType {
  header: ViewStyle;
  gooseIcon: ImageStyle;
  appTitle: TextStyle;
  subtitle: TextStyle;
  inputGroup: ViewStyle;
  inputLabel: TextStyle;
  input: TextStyle;
  helpText: TextStyle;
  primaryButton: ViewStyle;
  secondaryButton: ViewStyle;
  buttonText: TextStyle;
  secondaryButtonText: TextStyle;
  linkText: TextStyle;
}

export const getPlatformStyles = (): PlatformStyles => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isWeb = Platform.OS === "web";

  return {
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      alignItems: "center" as const,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.xxl,
      ...(isWeb &&
        !isMobile && {
          justifyContent: "center",
          minHeight: "100vh" as unknown as any,
        }),
    },
    mainContainer: {
      width: "100%",
      maxWidth: 400,
      ...(isWeb &&
        !isMobile && {
          maxWidth: 500,
          backgroundColor: Colors.cardBackground,
          borderRadius: BorderRadius.xl,
          paddingHorizontal: Spacing.xxl,
          paddingVertical: Spacing.xxl + Spacing.md,
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 5,
          borderWidth: 1,
          borderColor: Colors.border,
        }),
    },
  };
};

export const CommonStyles = StyleSheet.create<CommonStylesType>({
  header: {
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },
  gooseIcon: {
    width: 100,
    height: 100,
    marginBottom: Spacing.lg,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.secondary,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.primary,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 22,
  },
  inputGroup: {
    width: "100%",
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: 15,
    color: Colors.primary,
    marginBottom: Spacing.xs,
    fontWeight: "600",
  },
  input: {
    height: 52,
    borderColor: Colors.border,
    borderWidth: 1.5,
    width: "100%",
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.inputBackground,
    fontSize: 16,
    borderRadius: BorderRadius.md,
    color: Colors.text.primary,
  },
  helpText: {
    fontSize: 13,
    color: Colors.text.light,
    marginTop: Spacing.xs,
    lineHeight: 18,
    fontStyle: "italic",
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    width: "100%",
    alignItems: "center",
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  linkText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
});
