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
import { getAvatarUrl } from "../services/avatarservice";

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
  avatar?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
  updateUserData: (data: Partial<UserData>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const updateUserData = (data: Partial<UserData>) => {
    setUserData(prev => prev ? { ...prev, ...data } : null);
  };

  const loadAvatarUrl = async (avatarId: string | undefined): Promise<string | undefined> => {
    if (!avatarId) return undefined;
    
    try {
      if (avatarId.startsWith('http')) {
        return avatarId;
      }
      
      return await getAvatarUrl(avatarId as any);
    } catch (error) {
      console.error('Error loading avatar URL:', error);
      return undefined;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        const data = docSnap.exists() ? (docSnap.data() as UserData) : null;

        const localSecret = await StorageService.get("nightscoutSecret");

        const geminiAPIKey = await StorageService.get("geminiAPIKey");

        let nightscoutUrl;
        if (data?.storeLocally) {
          nightscoutUrl = await StorageService.get("nightscoutUrl");
        }

        let avatarUrl = undefined;
        if (data?.avatar) {
          avatarUrl = await loadAvatarUrl(data.avatar);
        }

        setUserData(
          data
            ? {
                ...data,
                nightscoutSecret: localSecret ?? "",
                nightscoutUrl: nightscoutUrl ?? data.nightscoutUrl,
                geminiAPIKey: geminiAPIKey ?? "",
                avatarUrl,
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
    <AuthContext.Provider value={{ firebaseUser, userData, loading, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
