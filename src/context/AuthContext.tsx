import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  nightscoutUrl: string | null;
  nightscoutSecret: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [nightscoutUrl, setNightscoutUrl] = useState<string | null>(null);
  const [nightscoutSecret, setNightscoutSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        const ref = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);
        const data = snap.data();
        setNightscoutUrl(data?.nightscoutUrl || null);
        setNightscoutSecret(data?.nightscoutSecret || null);
      } else {
        setUser(null);
        setNightscoutUrl(null);
        setNightscoutSecret(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, nightscoutUrl, nightscoutSecret, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
