import { StyleSheet } from 'react-native';
import { VintageColors } from './colors_vintage';

export const VintageStylesJournal = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: VintageColors.lightBackground,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  headerSection: {
    marginBottom: 24,
    paddingTop: 8,
  },
  
  dateSection: {
    marginTop: 16,
  },
  
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: VintageColors.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  
  dateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  
  dateTextContainer: {
    flex: 1,
  },
  
  dateText: {
    fontSize: 16,
    color: VintageColors.primaryText,
    fontWeight: "400",
    marginBottom: 2,
  },
  
  dateSubtext: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    fontWeight: "300",
  },
  
  dateArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  
  categoryTabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  
  categoryTab: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: VintageColors.cardBackground,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    flex: 1,
    marginHorizontal: 4,
  },
  
  categoryTabSelected: {
    backgroundColor: VintageColors.lightBackground,
    transform: [{ scale: 1.05 }],
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  categoryIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  categoryIconContainerSelected: {
    borderColor: '#FFFFFF',
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  
  categoryTabText: {
    fontSize: 14,
    color: VintageColors.secondaryText,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  
  categoryTabTextSelected: {
    color: VintageColors.primaryText,
    fontWeight: "700",
  },
  
  mainContent: {
    flex: 1,
  },
});
