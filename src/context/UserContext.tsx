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

interface UserData {
  uid: string;
  email: string;
  username?: string;
  nightscoutUrl?: string;
  nightscoutSecret?: string;
  createdAt: number;
  role: string;
  [key: string]: any;
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
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        setUserData(docSnap.exists() ? (docSnap.data() as UserData) : null);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthData = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthData must be used inside AuthProvider");
  return ctx;
};
