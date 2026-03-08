'use client';

import { useMemoFirebase, useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where, serverTimestamp, doc } from 'firebase/firestore';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Appointment } from '@/lib/data';

export function useAppointments(tenantId: string = 'default') {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  
  const customerId = user?.uid;

  const appointmentsRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'appointments');
  }, [db]);

  const tenantQuery = useMemoFirebase(() => {
    if (!appointmentsRef || !tenantId || !user) return null;
    return query(appointmentsRef, where('salonId', '==', tenantId));
  }, [appointmentsRef, tenantId, user]);

  const { data: rawAppointments, isLoading: isCollectionLoading } = useCollection<Appointment>(tenantQuery);
  const appointments = rawAppointments || [];

  const addAppointment = (newAppointment: Omit<Appointment, 'id' | 'customerId' | 'status'>) => {
    if (!db || !user) return null;
    
    // Generamos un ID de documento cliente-side para poder redirigir inmediatamente
    const apptDocRef = doc(collection(db, 'appointments'));
    const appointmentId = apptDocRef.id;

    setDocumentNonBlocking(apptDocRef, {
      ...newAppointment,
      id: appointmentId,
      salonId: tenantId,
      customerId: user.uid,
      status: 'confirmed',
      createdAt: serverTimestamp(),
    }, { merge: true });

    return appointmentId;
  };
  
  const cancelAppointment = (appointmentId: string) => {
    if (!db) return;
    const apptRef = doc(db, 'appointments', appointmentId);
    updateDocumentNonBlocking(apptRef, { 
      status: 'cancelled',
      updatedAt: serverTimestamp()
    });
  };

  return { 
    appointments, 
    addAppointment, 
    cancelAppointment, 
    loading: isCollectionLoading || isUserLoading, 
    customerId 
  };
}
