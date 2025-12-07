import { db } from "../../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

export async function isUsernameAvailable(username: string): Promise<boolean> {
  if (!username) return false;

  const q = query(
    collection(db, "public_users"),
    where("username_lower", "==", username.toLowerCase())
  );

  const snapshot = await getDocs(q);
  return snapshot.empty; // true if no user has that username
}

export async function getStoreLocallyFlag(username: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, "public_users"),
      where("username_lower", "==", username.toLowerCase())
    );
    const snap = await getDocs(q);

    if (snap.empty) return false;

    const data = snap.docs[0].data();

    return data?.storeLocally ?? false;
  } catch (err) {
    console.error("Error fetching storeLocally flag", err);
    return false;
  }
}
