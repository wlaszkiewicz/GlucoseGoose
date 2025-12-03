import { StyleSheet } from "react-native";
import { VintageColors } from "./colors_vintage";

export const VintageStylesAuth = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: VintageColors.lightBackground,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  mainContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerSection: {
    alignItems: "center",
    marginBottom: 40,
  },

  header: {
    alignItems: "center",
    marginBottom: 16,
  },

  headerDecoration: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: VintageColors.border,
  },

  headerTitle: {
    fontSize: 24,
    color: VintageColors.primaryText,
    marginHorizontal: 12,
    letterSpacing: 1,
  },

  gooseIcon: {
    width: 80,
    height: 80,
    marginBottom: 12,
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

  welcomeSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
  },

  welcomeTitle: {
    fontSize: 20,
    color: VintageColors.primaryText,
    marginBottom: 12,
    textAlign: "center",
  },

  welcomeText: {
    fontSize: 15,
    color: VintageColors.secondaryText,
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
  },

  formContainer: {
    alignItems: "center",
    width: "100%",
    marginBottom: 32,
  },

  inputGroup: {
    marginBottom: 20,
    width: "100%",
  },

  inputLabel: {
    fontSize: 14,
    color: VintageColors.primaryText,
    marginBottom: 8,
    fontWeight: "500",
    letterSpacing: 0.3,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: VintageColors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: VintageColors.primaryText,
    backgroundColor: "#FFFFFF",
  },

  helpText: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    marginTop: 6,
    fontStyle: "italic",
  },

  primaryButton: {
    backgroundColor: VintageColors.primaryText,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#774622",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  linkText: {
    color: VintageColors.primaryText,
    fontSize: 14,
    fontWeight: "500",
    textDecorationLine: "underline",
  },

  forgotLink: {
    paddingVertical: 12,
    marginTop: 12,
  },

  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    width: "100%",
  },

  signupText: {
    fontSize: 14,
    color: VintageColors.secondaryText,
    marginRight: 4,
  },

  errorText: {
    color: "#D32F2F",
    fontSize: 12,
    marginTop: 4,
    alignSelf: "flex-start",
  },

  nightscoutSection: {
    width: "100%",
    marginBottom: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: VintageColors.border,
  },

  sectionTitle: {
    fontSize: 18,
    color: VintageColors.primaryText,
    marginBottom: 12,
    letterSpacing: 0.5,
  },

  sectionDescription: {
    fontSize: 14,
    color: VintageColors.secondaryText,
    lineHeight: 20,
    marginBottom: 20,
    fontStyle: "italic",
  },

  setupHelp: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    lineHeight: 18,
    marginTop: 16,
    fontStyle: "italic",
    textAlign: "center",
  },

  linksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 20,
  },

  guideLink: {
    flex: 1,
    marginHorizontal: 6,
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: VintageColors.border,
    alignItems: "center",
  },

  guideLinkText: {
    color: VintageColors.primaryText,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    textDecorationLine: "underline",
  },

  spacing20: {
    height: 20,
  },

  spacing40: {
    height: 40,
  },
});
