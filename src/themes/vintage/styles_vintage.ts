import { StyleSheet } from "react-native";
import { VintageColors } from "./colors";

export const VintageStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: VintageColors.lightBackground,
    paddingTop: 40,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },

  headerSection: {
    marginBottom: 24,
    paddingTop: 8,
  },

  header: {
    marginBottom: 30,
    alignItems: "center",
  },

  headerDecoration: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  headerLine: {
    width: 40,
    height: 1,
    backgroundColor: VintageColors.headerLine,
    marginHorizontal: 12,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: "300",
    color: VintageColors.headerTitle,
    letterSpacing: 2,
    fontFamily: "System",
  },

  profileSection: {
    alignItems: "center",
    marginBottom: 35,
  },

  gooseAvatarCircle: {
    width: 160,
    height: 160,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: VintageColors.cardBackground,
    position: "relative",
  },

  profileName: {
    fontSize: 26,
    fontWeight: "300",
    color: VintageColors.primaryText,
    marginBottom: 4,
    marginTop: 15,
    letterSpacing: 1,
  },

  profileSubtitle: {
    fontSize: 13,
    color: VintageColors.secondaryText,
    fontWeight: "400",
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 20,
  },

  vintageStats: {
    flexDirection: "row",
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  statItem: {
    alignItems: "center",
    flex: 1,
  },

  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  statValue: {
    fontSize: 18,
    fontWeight: "300",
    color: VintageColors.statValue,
    marginBottom: 2,
    fontFamily: "System",
  },

  statLabel: {
    fontSize: 11,
    color: VintageColors.statLabel,
    fontWeight: "400",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  statDivider: {
    width: 1,
    backgroundColor: VintageColors.border,
    height: "60%",
    alignSelf: "center",
  },

  settingsList: {
    marginBottom: 25,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "300",
    color: VintageColors.primaryText,
    letterSpacing: 1,
  },

  featherAccent: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  vintageCard: {
    backgroundColor: VintageColors.cardBackground,
    padding: 18,
    borderRadius: 12,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  settingTextContainer: {
    flex: 1,
  },

  settingText: {
    fontSize: 16,
    fontWeight: "400",
    color: VintageColors.primaryText,
    marginBottom: 3,
    letterSpacing: 0.3,
  },

  settingSubtext: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    fontWeight: "300",
    letterSpacing: 0.3,
  },

  vintageArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
  },

  signOutButton: {
    backgroundColor: VintageColors.signOutButton,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: VintageColors.signOutBorder,
    shadowColor: VintageColors.signOutButton,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  signOutIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  signOutText: {
    color: VintageColors.signOutText,
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 1,
  },

  footer: {
    alignItems: "center",
    marginBottom: 40,
    paddingTop: 20,
  },

  footerLine: {
    width: 60,
    height: 1,
    backgroundColor: VintageColors.footerLine,
    marginBottom: 16,
  },

  footerText: {
    fontSize: 12,
    color: VintageColors.footerText,
    fontWeight: "300",
    letterSpacing: 1,
    marginBottom: 12,
  },

  footerIcons: {
    flexDirection: "row",
    justifyContent: "center",
  },

  footerIcon: {
    fontSize: 16,
    marginHorizontal: 8,
    color: VintageColors.footerIcon,
  },

  gooseAvatarImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },

  // Additional styles
  spacing10: {
    height: 10,
  },

  spacing60: {
    height: 60,
  },

  shadowLight: {
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  shadowMedium: {
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  // Tab Bar Styles
  tabBarContainer: {
    backgroundColor: VintageColors.tabBarBackground,
    borderTopWidth: 1,
    borderTopColor: VintageColors.tabBarBorder,
    height: 70,
    paddingBottom: 4,
    paddingTop: 10,
    shadowColor: VintageColors.tabBarShadowColor,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 5,
  },

  // Styles for Edit Profile Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContentCenter: {
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 20,
    width: '100%',
    maxHeight: '88%',
    borderWidth: 6,
    borderColor: VintageColors.lightBackground,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalProfileSection: {
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  modalIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: VintageColors.cardBackground,
    backgroundColor: VintageColors.lightBackground,
    marginBottom: 15,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: VintageColors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: VintageColors.cardBackground,
  },
  modalProfileTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: VintageColors.primaryText,
    letterSpacing: 1,
    textAlign: 'center',
  },
  formScroll: {
    paddingHorizontal: 20,
    maxHeight: '75%',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  halfFormGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelIcon: {
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    color: VintageColors.primaryText,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: VintageColors.cardBackground,
    borderWidth: 1,
    borderColor: VintageColors.border,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: VintageColors.primaryText,
  },
  inputHalf: {
    backgroundColor: VintageColors.cardBackground,
    borderWidth: 1,
    borderColor: VintageColors.border,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: VintageColors.primaryText,
    width: '100%',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: VintageColors.cardBackground,
    borderWidth: 1,
    borderColor: VintageColors.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginHorizontal: 4,
  },
  genderButtonSelected: {
    backgroundColor: VintageColors.iconGreen,
    borderColor: VintageColors.iconGreen,
  },
  genderButtonText: {
    fontSize: 14,
    color: VintageColors.secondaryText,
    marginLeft: 8,
  },
  genderButtonTextSelected: {
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
  },
  cancelButton: {
    backgroundColor: VintageColors.cardBackground,
    borderColor: VintageColors.border,
  },
  saveButton: {
    backgroundColor: VintageColors.signOutButton,
    borderColor: VintageColors.iconPink,
  },
  cancelButtonText: {
    color: VintageColors.primaryText,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
  },

pickerButton: {
  backgroundColor: VintageColors.cardBackground,
  borderWidth: 1,
  borderColor: VintageColors.border,
  borderRadius: 10,
  padding: 15,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},
pickerButtonText: {
  fontSize: 16,
  color: VintageColors.primaryText,
  flex: 1,
},
pickerIcon: {
  marginLeft: 10,
},
inputText: {
  fontSize: 16,
  color: VintageColors.primaryText,
},
});