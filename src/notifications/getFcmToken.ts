import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { ensureAndroidChannel, requestNotifPermissions } from "./notifications";

export async function getFcmToken(): Promise<string | null> {
  //if (!Device.isDevice) return null;

  await ensureAndroidChannel();
  const ok = await requestNotifPermissions();
  if (!ok) return null;

  const token = await Notifications.getDevicePushTokenAsync();
  console.log("FCM Token:", token);
  return token.data ?? null;
}
