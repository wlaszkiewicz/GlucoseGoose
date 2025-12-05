export const getGlucoseColor = (value: number) => {
  if (value < 70) return "#C76B6B";
  if (value > 180) return "#EFD77A";
  return "#8FBF8F";
};

export const getGlucoseStatus = (value: number) => {
  if (value < 70) return "Low";
  if (value > 180) return "High";
  return "Normal";
};

export const getEventDisplayName = (event: any) => {
  if (event.eventType) {
    return event.eventType
      .replace("Meal: ", "")
      .replace("Activity: ", "")
      .replace("Exercise: ", "");
  }
  switch (event.type) {
    case "meal":
      return "Meal";
    case "activity":
      return "Activity";
    case "other":
      return event.eventType || "Other";
    default:
      return "Event";
  }
};
