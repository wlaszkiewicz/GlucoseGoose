import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { db } from "../../firebaseConfig";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";

export interface DoctorPatient {
  uid: string;
  nightscoutUrl: string;
  displayName?: string;
  addedAt?: any;
}

interface DoctorContextType {
  patients: DoctorPatient[];
  loadingPatients: boolean;
  refreshPatients: () => Promise<void>;
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

export const DoctorProvider = ({ children }: { children: React.ReactNode }) => {
  const { userData, loading } = useAuth();

  const doctorUid = userData?.uid;
  const isDoctorRole = userData?.role === "doctor";

  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  const patientsCol = useMemo(() => {
    if (!doctorUid) return null;
    return collection(db, "users", doctorUid, "patients");
  }, [doctorUid]);

  useEffect(() => {
    if (loading) return;
    if (!doctorUid) return;
    if (!isDoctorRole) return;
    if (!patientsCol) return;

    setLoadingPatients(true);

    const q = query(patientsCol, orderBy("addedAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: DoctorPatient[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            uid: d.id,
            nightscoutUrl: data.nightscoutUrl,
            displayName: data.displayName,
            addedAt: data.addedAt,
          };
        });

        setPatients(list);
        setLoadingPatients(false);
      },
      (err) => {
        console.error("Doctor patients snapshot error:", err);
        setPatients([]);
        setLoadingPatients(false);
      },
    );

    return () => unsub();
  }, [loading, doctorUid, isDoctorRole, patientsCol]);

  const refreshPatients = async () => {
    if (loading) return;
    if (!doctorUid) return;
    if (!isDoctorRole) return;
    if (!patientsCol) return;

    setLoadingPatients(true);
    try {
      const snap = await getDocs(patientsCol);
      const list: DoctorPatient[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          uid: d.id,
          nightscoutUrl: data.nightscoutUrl,
          displayName: data.displayName,
          addedAt: data.addedAt,
        };
      });
      setPatients(list);
    } catch (e) {
      console.error("refreshPatients error:", e);
    } finally {
      setLoadingPatients(false);
    }
  };

  return (
    <DoctorContext.Provider
      value={{ patients, loadingPatients, refreshPatients }}
    >
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctor = () => {
  const ctx = useContext(DoctorContext);
  if (!ctx) throw new Error("useDoctor must be used within a DoctorProvider");
  return ctx;
};
