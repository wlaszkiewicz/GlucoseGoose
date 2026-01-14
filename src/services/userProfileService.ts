import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { UserData } from "../contexts/AuthContext";

export const updateUserProfile = async (uid: string, userData: Partial<UserData>) => {
  try {
    const userRef = doc(db, "users", uid);
    
    const cleanUserData = Object.fromEntries(
      Object.entries(userData).filter(([_, value]) => value !== undefined)
    );
    
    await updateDoc(userRef, {
      ...cleanUserData,
      updatedAt: Date.now()
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return { success: false, error: error.message };
  }
};