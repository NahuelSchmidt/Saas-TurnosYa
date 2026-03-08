
'use client';

import { useMemoFirebase, useDoc, useFirestore } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export function useSalon(salonId: string) {
  const db = useFirestore();

  const salonRef = useMemoFirebase(() => {
    if (!db || !salonId || salonId === 'default') return null;
    return doc(db, 'salons', salonId);
  }, [db, salonId]);

  const { data: salon, isLoading } = useDoc<any>(salonRef);

  const updateSalon = (updates: any) => {
    if (!db || !salonId || salonId === 'default') return;
    const sRef = doc(db, 'salons', salonId);
    
    // Usamos el patrón no bloqueante para mayor robustez
    setDocumentNonBlocking(sRef, { 
      ...updates, 
      updatedAt: serverTimestamp() 
    }, { merge: true });
  };

  return { salon, loading: isLoading, updateSalon };
}
