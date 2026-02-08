import { doc, setDoc, deleteDoc } from "firebase/firestore";
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
      platform,
      updatedAt: Date.now(),
      deviceId,
    },
    { merge: true },
  );

  return deviceId;
}

export async function removeThisDevice(uid: string) {
  const deviceId = await getOrCreateDeviceId();
  await deleteDoc(doc(db, "users", uid, "devices", deviceId));
}
