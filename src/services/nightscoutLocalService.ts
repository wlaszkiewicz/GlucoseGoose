import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { StorageService } from "./localStorageService";

export async function getNightscoutUrlForUser(uid: string): Promise<string> {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  const data = snap.data();
  const storeLocally = !!data?.storeLocally;

  if (storeLocally) {
    return (await StorageService.get("nightscoutUrl")) ?? "";
  }
  return data?.nightscoutUrl ?? "";
}

export async function setNightscoutUrlForUser(
  uid: string,
  url: string,
): Promise<void> {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  const data = snap.data();
  const storeLocally = !!data?.storeLocally;

  if (storeLocally) {
    await StorageService.set("nightscoutUrl", url, true);
  } else {
    await updateDoc(userRef, { nightscoutUrl: url, updatedAt: Date.now() });
  }
}

export async function getNightscoutSecret(): Promise<string> {
  return (await StorageService.get("nightscoutSecret")) ?? "";
}

export async function setNightscoutSecret(secret: string): Promise<void> {
  // TODO: rememberMe
  await StorageService.set("nightscoutSecret", secret, true);
}
