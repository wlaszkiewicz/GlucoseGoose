import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface Patient {
  uid: string;
  email: string;
  username?: string;
}

interface DoctorContextType {
  patients: Patient[];
  loadingPatients: boolean;
  refreshPatients: () => Promise<void>;
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

export const DoctorProvider = ({ children }: { children: React.ReactNode }) => {
  const { userData, isDoctor } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  useEffect(() => {
    if (!isDoctor() || !userData?.uid) return;

    const q = query(
      collection(db, 'users'),
      where('assignedDoctorId', '==', userData.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const patientList: Patient[] = [];
      snapshot.forEach((doc) => {
        patientList.push({ uid: doc.id, ...doc.data() } as Patient);
      });
      setPatients(patientList);
    });

    return () => unsubscribe();
  }, [userData?.uid, isDoctor]);

  const refreshPatients = async () => {
    // Implement refresh logic
  };

  return (
    <DoctorContext.Provider value={{ patients, loadingPatients, refreshPatients }}>
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctor = () => {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error('useDoctor must be used within a DoctorProvider');
  }
  return context;
};