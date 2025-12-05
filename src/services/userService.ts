import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function isUsernameAvailable(username: string): Promise<boolean> {
  if (!username) return false;

  const q = query(
    collection(db, "public_users"),
    where("username_lower", "==", username.toLowerCase())
  );

  const snapshot = await getDocs(q);
  return snapshot.empty; // true if no user has that username
}
