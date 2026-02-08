import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { UserData } from "../contexts/AuthContext";

const allowedFields = [
  "username",
  "weight",
  "height",
  "age",
  "gender",
  "avatar",
  "licenseNumber",
  "specialization",

  // notifications
  "notificationsEnabled",
  "cooldownMinutes",
  "lowThreshold",
  "highThreshold",
  "urgentLowThreshold",
  "staleMinutes",
  "trendAlertsEnabled",
  "fastDropThreshold",

  // nightscout
  "nightscoutUrl",
  "storeLocally",
];

export const updateUserProfile = async (
  uid: string,
  userData: Partial<UserData>,
) => {
  try {
    const userRef = doc(db, "users", uid);

    const updateData: any = { updatedAt: Date.now() };

    allowedFields.forEach((field) => {
      if (userData[field] !== undefined) {
        updateData[field] = userData[field];
      }
    });

    await updateDoc(userRef, updateData);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return { success: false, error: error.message };
  }
};
