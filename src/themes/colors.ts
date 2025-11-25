export const Colors = {
  primary: "#4A90E2",
  secondary: "#FF9E6D",
  background: "#FFFDFA",
  cardBackground: "#FFFFFF",
  text: {
    primary: "#333333",
    secondary: "#555555",
    light: "#666666",
    accent: "#4A90E2",
  },
  border: "#E0E0E0",
  inputBackground: "#FFFFFF",
  helpCard: "#F8FBFF",
  shadow: "#000000",

  // journal
  journal: {
    food: "#4A90E2",
    sports: "#FF6B6B",
    other: "#6B8E23",
    success: "#4CAF50",
    warning: "#FFC107",
    info: "#2196F3",
    calorie: "#FF6B6B",
    nutrition: {
      carbs: "#FF9E6D",
      protein: "#4A90E2",
      fat: "#6B8E23",
      sugar: "#FF6B6B",
      fiber: "#9C27B0",
    },
  },

  // ai
  ai: {
    analyzing: "#2196F3",
    estimated: "#4CAF50",
  },

  // calendar
  calendar: {
    selected: "#4A90E2",
    today: "#4A90E2",
    weekend: "#FF6B6B",
  },
};

export const Spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const BorderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
};

export type ColorPalette = typeof Colors;
export type SpacingType = typeof Spacing;
export type BorderRadiusType = typeof BorderRadius;
