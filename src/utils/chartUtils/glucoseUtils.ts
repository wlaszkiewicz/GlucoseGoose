export const GLUCOSE_RANGES = {
  LOW: 80,
  HIGH: 180,
  NORMAL_LOW: 80,
  NORMAL_HIGH: 180,
  VERY_HIGH: 250,
  VERY_LOW: 50,
};

export const getGlucoseColor = (value: number) => {
  if (value < 70) return "#C76B6B";
  if (value < 80) return "#EFD77A";
  if (value <= 180) return "#8FBF8F";
  if (value > 200) return "#C76B6B";
  if (value > 180) return "#EFD77A";

  return "#8FBF8F";
};

export const getGlucoseStatus = (value: number) => {
  if (value < 80) return "Low";
  if (value > 180) return "High";
  return "Normal";
};
