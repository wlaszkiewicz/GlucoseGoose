import { initializeApp } from "firebase/app";
import Constants from "expo-constants";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/** @type {import("firebase/app").FirebaseAppExtraConfig | undefined} */
const extra = Constants.expoConfig?.extra;
if (!extra) throw new Error("No Firebase config found.");

const firebaseConfig = {
  apiKey: extra.apiKey,
  authDomain: extra.authDomain,
  projectId: extra.projectId,
  storageBucket: extra.storageBucket,
  messagingSenderId: extra.messagingSenderId,
  appId: extra.appId,
  measurementId: extra.measurementId,
};

const app = initializeApp(firebaseConfig);

/** @type {import("firebase/auth").Auth} */
let auth;

if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

/** @type {import("firebase/firestore").Firestore} */
const db = getFirestore(app);

export { auth, db };
