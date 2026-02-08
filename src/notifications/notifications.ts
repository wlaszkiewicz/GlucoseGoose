import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("alerts_normal", {
    name: "Alerts (Normal)",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: "default",
  });

  await Notifications.setNotificationChannelAsync("alerts_goose", {
    name: "Alerts (Goose)",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: "goose_soft.wav",
  });

  await Notifications.setNotificationChannelAsync("glucose_live", {
    name: "Live glucose",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [],
    sound: null,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
  });
}

export async function requestNotifPermissions() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}
