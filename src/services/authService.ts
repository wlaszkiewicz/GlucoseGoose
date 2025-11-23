import { auth, db } from "../../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";

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

    return { success: true, user };
  } catch (error: any) {
    console.log("Registration error:", error);

    if (auth.currentUser) {
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
      const q = query(
        collection(db, "users"),
        where("username", "==", identifier)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return {
          success: false,
          error: {
            code: "auth/user-not-found",
            message: getFriendlyFirebaseError("auth/user-not-found"),
          },
        };
      }

      email = snapshot.docs[0].data().email;
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
      return "Something went wrong. Please try again.";
  }
}
