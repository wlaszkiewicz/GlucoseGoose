import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { getOrCreateDeviceId } from "./deviceIdService";

export async function upsertDeviceToken(
  uid: string,
  token: string,
  platform: string,
) {
  const deviceId = await getOrCreateDeviceId();

  await setDoc(
    doc(db, "users", uid, "devices", deviceId),
    {
      token,
      enabled: true,
      platform,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      deviceId,
    },
    { merge: true },
  );

  return deviceId;
}

export async function disableThisDeviceToken(uid: string) {
  const deviceId = await getOrCreateDeviceId();
  await updateDoc(doc(db, "users", uid, "devices", deviceId), {
    enabled: false,
    updatedAt: Date.now(),
  });
}
