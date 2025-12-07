import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { StorageService } from "../services/localStorageService";

export interface UserData {
  uid: string;
  email: string;
  username?: string;
  nightscoutUrl?: string;
  nightscoutSecret?: string;
  createdAt: number;
  role: string;
  [key: string]: any;
  weight?: number;
  height?: number;
  age?: number;
  gender?: string;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        const data = docSnap.exists() ? (docSnap.data() as UserData) : null;

        const localSecret = await StorageService.get("nightscoutSecret");

        let nightscoutUrl;
        if (data?.storeLocally) {
          nightscoutUrl = await StorageService.get("nightscoutUrl");
        }

        setUserData(
          data
            ? {
                ...data,
                nightscoutSecret: localSecret ?? "",
                nightscoutUrl: nightscoutUrl ?? data.nightscoutUrl,
              }
            : null
        );
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
