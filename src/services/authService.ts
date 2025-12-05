import { auth, db } from "../../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { getEmailFromUsername } from "../utils/cloud_functions";
import Constants from "expo-constants";

const CLOUD_HOST = Constants.expoConfig?.extra?.cloudFunctionsHost;

export async function registerUser(
  email: string,
  password: string,
  extra: any = {}
) {
  try {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await setDoc(doc(db, "users", user.uid), {
      email,
      createdAt: Date.now(),
      ...(extra || {}),
    });

    await setDoc(doc(db, "public_users", user.uid), {
      username_lower: extra.username.toLowerCase(),
    });

    return { success: true, user };
  } catch (error: any) {
    console.log("Registration error:", error);

    if (auth.currentUser) {
      await deleteDoc(doc(db, "users", auth.currentUser.uid)).catch(() => {});
      await deleteDoc(doc(db, "public_users", auth.currentUser.uid)).catch(
        () => {}
      );
      await deleteUser(auth.currentUser).catch(() => {});
    }

    return { success: false, error };
  }
}

export async function loginWithEmailOrUsername(
  identifier: string,
  password: string
) {
  try {
    let email = identifier;

    if (!identifier.includes("@")) {
      email = await getEmailFromUsername(CLOUD_HOST, identifier);

      console.log("Fetched email for username:", email);

      if (!email) {
        return {
          success: false,
          error: {
            code: "auth/user-not-found",
            message: getFriendlyFirebaseError("auth/user-not-found"),
          },
        };
      }
    }

    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error: any) {
    const friendlyMessage = getFriendlyFirebaseError(
      error.code || "auth/unknown"
    );
    return {
      success: false,
      error: { code: error.code, message: friendlyMessage },
    };
  }
}

export async function logoutUser() {
  try {
    await auth.signOut();
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

//TODO: expand this and CHECK IF THESE ARE ACTAULLY REAL FIREBASE ERRORS
export function getFriendlyFirebaseError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "The email address is badly formatted.";
    case "auth/user-not-found":
      return "Incorrect email/username or password. Please try again.";
    case "auth/invalid-credential":
      return "Incorrect email/username or password. Please try again.";
    case "auth/email-already-in-use":
      return "This email is already registered. Try logging in.";
    case "auth/weak-password":
      return "Password must be at least 6 characters long.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return `Something went wrong. Please try again: ${code}`;
  }
}
