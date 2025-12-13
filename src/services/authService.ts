import { auth, db } from "../../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { getEmailFromUsername } from "../utils/cloudFunctions";
import Constants from "expo-constants";
import { StorageService } from "./localStorageService";
import { Platform } from "react-native";

const CLOUD_HOST = Constants.expoConfig?.extra?.cloudFunctionsHost;

export async function registerUser(
  email: string,
  password: string,
  storeLocally: boolean,
  nightscoutUrl: string,

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
      storeLocally: storeLocally,
      nightscoutUrl: storeLocally ? "" : nightscoutUrl,
      ...(extra || {}),
    });

    await setDoc(doc(db, "public_users", user.uid), {
      username_lower: extra.username.toLowerCase(),
      storeLocally: storeLocally,
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

export async function loginWithUsername(
  identifier: string,
  password: string,
  nightscoutUrl?: string,
  nightscoutSecretHash?: string,
  storeLocally: boolean = false,
  rememberMe: boolean = true,
  geminiAPIKey?: string
) {
  try {
    if (Platform.OS === "web") {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
    }

    let email = identifier;

    email = await getEmailFromUsername(CLOUD_HOST, identifier);

    if (!email) {
      return {
        success: false,
        error: {
          code: "auth/user-not-found",
          message: getFriendlyFirebaseError("auth/user-not-found"),
        },
      };
    }

    const result = await signInWithEmailAndPassword(auth, email, password);
    if (nightscoutSecretHash && result.user) {
      await StorageService.set(
        "nightscoutSecret",
        nightscoutSecretHash,
        rememberMe
      );
    }
    if (result.user && storeLocally && nightscoutUrl) {
      await StorageService.set("nightscoutUrl", nightscoutUrl, rememberMe);
    }
    if (result.user && geminiAPIKey) {
      await StorageService.set("geminiAPIKey", geminiAPIKey, rememberMe);
    }

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
    await StorageService.clearAll();
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
