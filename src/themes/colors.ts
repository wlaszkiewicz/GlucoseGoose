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
};

export type ColorPalette = typeof Colors;
export type SpacingType = typeof Spacing;
export type BorderRadiusType = typeof BorderRadius;
