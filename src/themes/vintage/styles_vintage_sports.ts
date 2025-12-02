import { StyleSheet } from 'react-native';
import { VintageColors } from './colors_vintage';

export const VintageStylesSports = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  sectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  
  // Activity Type Selector
  activityTypeScroll: {
    marginTop: 8,
  },
  
  activityTypeScrollContent: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  
  activityTypeButton: {
    alignItems: 'center',
    marginHorizontal: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: VintageColors.cardBackground,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  
  activityTypeButtonSelected: {
    borderColor: VintageColors.primaryText,
    backgroundColor: VintageColors.lightBackground,
    transform: [{ scale: 1.05 }], 
  },
  
  activityIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  
  activityIconContainerSelected: {
    borderColor: VintageColors.primaryText,
    borderWidth: 2, 
  },
  
  activityTypeText: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  
  activityTypeTextSelected: {
    color: VintageColors.primaryText,
    fontWeight: '600',
  },
  
  // Description
  descriptionCard: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  
  descriptionInput: {
    fontSize: 14,
    color: VintageColors.primaryText,
    lineHeight: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  
  // Duration & Intensity
  durationIntensityCard: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    flexDirection: 'column',
  },

  durationSection: {
    flex: 1,
    marginRight: 12,
  },

  intensitySection: {
    flex: 1,
  },
  
  inputLabel: {
    fontSize: 14,
    color: VintageColors.primaryText,
    fontWeight: '500',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  
  durationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  durationInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: VintageColors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: VintageColors.primaryText,
    backgroundColor: VintageColors.lightBackground,
  },
  
  durationUnit: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  
  durationUnitText: {
    fontSize: 14,
    color: VintageColors.secondaryText,
    fontWeight: '400',
  },
  
  intensityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  intensityButton: {
    flex: 1,
    marginHorizontal: 2,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
    backgroundColor: VintageColors.lightBackground,
    alignItems: 'center',
  },
  
  intensityButtonSelected: {
    backgroundColor: VintageColors.primaryText,
    borderColor: VintageColors.primaryText,
  },
  
  intensityText: {
    fontSize: 13,
    color: VintageColors.secondaryText,
    fontWeight: '500',
  },
  
  intensityTextSelected: {
    color: '#FFFFFF',
  },
  
  // Manual Inputs
  manualInputsCard: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  inputIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  
  inputLabelText: {
    fontSize: 15,
    color: VintageColors.primaryText,
    fontWeight: '400',
  },
  
  numberInput: {
    width: 140,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: VintageColors.border,
    fontSize: 15,
    color: VintageColors.primaryText,
    textAlign: 'right',
    marginLeft: 12,
    height: 40,
  },
  
  // AI Estimation
  caloriesCalculation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: VintageColors.lightBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  
  calculationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: VintageColors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  
  caloriesCalculationText: {
    fontSize: 14,
    color: VintageColors.primaryText,
    fontWeight: '400',
    flex: 1,
  },
  
  aiEstimationCard: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  aiIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  
  aiTitle: {
    fontSize: 16,
    color: VintageColors.primaryText,
    fontWeight: '500',
  },
  
  caloriesDisplay: {
    alignItems: 'center',
    marginVertical: 10,
  },
  
  caloriesValue: {
    fontSize: 36,
    fontWeight: '300',
    color: VintageColors.primaryText,
    marginBottom: 4,
  },
  
  caloriesUnit: {
    fontSize: 14,
    color: VintageColors.secondaryText,
    fontWeight: '400',
  },
  
  caloriesNote: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  
  // Toggle
  toggleCard: {
    backgroundColor: VintageColors.cardBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  toggleTitle: {
    fontSize: 16,
    color: VintageColors.primaryText,
    fontWeight: '500',
    marginLeft: 12,
  },
  
  toggleArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: VintageColors.lightBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  
  // Activities List
  activitiesCount: {
    backgroundColor: VintageColors.lightBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  
  activitiesCountText: {
    fontSize: 12,
    color: VintageColors.primaryText,
    fontWeight: '600',
  },
  
  activityCard: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  activityHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  activityTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  
  activityCardType: {
    fontSize: 16,
    color: VintageColors.primaryText,
    fontWeight: '500',
    marginBottom: 2,
  },
  
  activityTime: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    fontWeight: '300',
  },
  
  activityHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  activityDuration: {
    fontSize: 14,
    color: VintageColors.primaryText,
    fontWeight: '500',
    marginRight: 12,
  },
  
  deleteButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: VintageColors.lightBackground,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  
  activityDescription: {
    fontSize: 14,
    color: VintageColors.primaryText,
    lineHeight: 20,
    marginBottom: 12,
  },
  
  activityMetrics: {
    borderTopWidth: 1,
    borderTopColor: VintageColors.border,
    paddingTop: 12,
  },
  
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  
  metricText: {
    fontSize: 12,
    color: VintageColors.secondaryText,
    marginLeft: 6,
    fontWeight: '400',
  },
  
  // Total Stats
  totalStatsCard: {
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  
  totalTitle: {
    fontSize: 16,
    color: VintageColors.primaryText,
    fontWeight: '500',
    marginBottom: 16,
  },
  
  totalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  
  totalStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  
  totalStatValue: {
    fontSize: 20,
    fontWeight: '300',
    color: VintageColors.primaryText,
    marginBottom: 4,
  },
  
  totalStatLabel: {
    fontSize: 11,
    color: VintageColors.secondaryText,
    fontWeight: '400',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  totalStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: VintageColors.border,
  },
  
  // Save Button
  saveButton: {
    backgroundColor: VintageColors.signOutButton,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: VintageColors.signOutBorder,
    shadowColor: VintageColors.signOutButton,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 10,
    marginBottom: 20,
  },
  
  updateButton: {
    backgroundColor: '#77b779ff',
    borderColor: '#77b779ff',
  },
  
  saveButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  saveButtonText: {
    color: VintageColors.signOutText,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  
  // Cancel Button
  cancelButton: {
    backgroundColor: VintageColors.lightBackground,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  
  cancelButtonText: {
    color: VintageColors.primaryText,
    fontSize: 14,
    fontWeight: '500',
  },
});