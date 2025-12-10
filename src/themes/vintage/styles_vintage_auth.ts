import { StyleSheet } from "react-native";
import { VintageColors } from "./colors";

export const VintageStylesAuth = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarContainer: {
    position: "relative",
    alignItems: "center",
  },

  gooseAvatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: VintageColors.cardBackground,
    backgroundColor: VintageColors.cardBackground,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
  },

  gooseAvatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  avatarFeather: {
    position: "absolute",
    bottom: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: VintageColors.iconYellow,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 4,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: VintageColors.formAccent1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },

  checkboxChecked: {
    backgroundColor: VintageColors.formAccent1,
    borderColor: VintageColors.accentDark,
  },

  checkboxLabel: {
    fontSize: 15,
    color: VintageColors.primaryText,
    fontWeight: "500",
    letterSpacing: 0.2,
  },

  forgotLink: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },

  signupLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  welcomeSection: {
    alignItems: "center",
    marginBottom: 24,
    width: "100%",
  },

  welcomeTitle: {
    fontSize: 22,
    color: VintageColors.primaryText,
    fontWeight: "300",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 4,
  },

  welcomeSubtitle: {
    fontSize: 14,
    color: VintageColors.secondaryText,
    fontStyle: "italic",
    textAlign: "center",
    letterSpacing: 0.3,
  },

  formContainer: {
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
  },

  inputGroup: {
    marginBottom: 16,
    width: "100%",
  },

  inputLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  inputIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  inputLabel: {
    fontSize: 14,
    color: VintageColors.primaryText,
    fontWeight: "500",
    letterSpacing: 0.3,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: VintageColors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: VintageColors.primaryText,
    backgroundColor: VintageColors.cardBackground,
    fontFamily: "System",
  },

  inputFocused: {
    borderColor: VintageColors.formAccent1,
    backgroundColor: VintageColors.inputFocus,
  },

  inputError: {
    borderColor: VintageColors.error,
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  errorText: {
    color: VintageColors.error,
    fontSize: 12,
    marginLeft: 6,
    fontStyle: "italic",
  },

  helpText: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    marginTop: 6,
    fontStyle: "italic",
    lineHeight: 16,
  },

  nightscoutSection: {
    width: "100%",
    marginBottom: 28,
    paddingTop: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: VintageColors.border,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  sectionTitle: {
    fontSize: 18,
    color: VintageColors.primaryText,
    fontWeight: "400",
    letterSpacing: 0.5,
  },

  // Local Storage Styles
  localStorageCard: {
    width: "100%",
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  localStorageCardActive: {
    borderColor: VintageColors.formAccent1,
    backgroundColor: "rgba(212, 165, 165, 0.02)",
  },

  localStorageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "rgba(168, 184, 200, 0.05)",
  },

  localStorageHeaderActive: {
    backgroundColor: "rgba(212, 165, 165, 0.08)",
  },

  localStorageHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  localStorageTitle: {
    fontSize: 16,
    color: VintageColors.primaryText,
    fontWeight: "500",
    letterSpacing: 0.2,
    marginBottom: 2,
  },

  localStorageSubtitle: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    fontStyle: "italic",
    letterSpacing: 0.3,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  toggleSwitchSmall: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: VintageColors.lightBorder,
    justifyContent: "center",
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: VintageColors.border,
    position: "relative",
  },

  toggleKnobSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: VintageColors.cardBackground,
    borderWidth: 1,
    borderColor: VintageColors.border,
    position: "absolute",
    left: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },

  toggleKnobSmallActive: {
    backgroundColor: VintageColors.formAccent1,
    left: 22,
    borderColor: "rgba(212, 165, 165, 0.8)",
  },

  localStorageContent: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },

  descriptionContainer: {
    paddingTop: 12,
  },

  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    paddingVertical: 4,
  },

  featureIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  featureText: {
    flex: 1,
    fontSize: 13,
    color: VintageColors.primaryText,
    lineHeight: 18,
    letterSpacing: 0.1,
  },

  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    backgroundColor: "rgba(143, 191, 143, 0.05)",
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(143, 191, 143, 0.1)",
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    color: VintageColors.secondaryText,
    lineHeight: 16,
    fontStyle: "italic",
    marginLeft: 8,
  },

  linksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
    gap: 12,
  },

  guideLink: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  guideIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  guideLinkText: {
    color: VintageColors.primaryText,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 0.3,
  },

  setupHelp: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    lineHeight: 18,
    fontStyle: "italic",
    textAlign: "center",
    paddingHorizontal: 8,
  },

  primaryButton: {
    backgroundColor: VintageColors.formAccent1,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: VintageColors.accentDark,
    marginTop: 8,
    marginBottom: 20,
    shadowColor: VintageColors.formAccent1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  buttonSubtext: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 12,
    marginTop: 2,
    fontStyle: "italic",
    letterSpacing: 0.3,
  },

  linkText: {
    color: VintageColors.formAccent1,
    fontSize: 14,
    fontWeight: "500",
    textDecorationLine: "underline",
    letterSpacing: 0.3,
  },

  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,

    width: "100%",
  },

  signupText: {
    fontSize: 14,
    color: VintageColors.secondaryText,
    marginRight: 4,
    fontStyle: "italic",
  },

  spacing20: {
    height: 20,
  },

  spacing40: {
    height: 40,
  },

  header: {
    alignItems: "center",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(119, 70, 34, 0.1)",
    marginVertical: 14,
  },

  securityNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 10,
    backgroundColor: "rgba(119, 70, 34, 0.03)",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(119, 70, 34, 0.1)",
  },

  securityText: {
    flex: 1,
    fontSize: 11,
    color: VintageColors.secondaryText,
    lineHeight: 16,
    fontStyle: "italic",
    marginLeft: 8,
  },

  appTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: VintageColors.primaryText,
    letterSpacing: 1,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: VintageColors.secondaryText,
    fontStyle: "italic",
    letterSpacing: 0.5,
  },

  welcomeText: {
    fontSize: 15,
    color: VintageColors.secondaryText,
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
  },

  sectionDescription: {
    fontSize: 14,
    color: VintageColors.secondaryText,
    lineHeight: 20,
    marginBottom: 20,
    fontStyle: "italic",
  },
});
