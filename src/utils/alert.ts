import { Alert, Platform } from "react-native";

// TODO: MAKE ALERTS PRETTY THIS IS JUST SO IT WORKS ON BOTH WEB AND NATIVE FOR NOW
type AlertButton = {
  text?: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
};

const alertPolyfill = (
  title: string,
  description?: string,
  options: AlertButton[] = [],
  _extra?: any
): void => {
  const result = window.confirm(
    [title, description].filter(Boolean).join("\n")
  );

  if (result) {
    const confirmOption = options.find((opt) => opt.style !== "cancel");
    confirmOption && confirmOption.onPress && confirmOption.onPress();
  } else {
    const cancelOption = options.find((opt) => opt.style === "cancel");
    cancelOption && cancelOption.onPress && cancelOption.onPress();
  }
};

const alert = Platform.OS === "web" ? alertPolyfill : Alert.alert;

export default alert;
