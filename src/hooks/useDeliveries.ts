import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from '@react-native-firebase/firestore';
import { db } from '../services/firebase';
import { COLLECTIONS } from '../utils/constants';
import { Delivery, DeliveryStatus } from '../types/delivery';

export function useDeliveries(driverUid: string | undefined) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!driverUid) {
      setDeliveries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, COLLECTIONS.DELIVERIES),
      where('assignedDriverUid', '==', driverUid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs: Delivery[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Delivery, 'id'>),
        }));
        setDeliveries(docs);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore snapshot error:', err);
        setError('Failed to load deliveries.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [driverUid]);

  const updateStatus = useCallback(
    async (deliveryId: string, status: DeliveryStatus) => {
      try {
        await updateDoc(doc(db, COLLECTIONS.DELIVERIES, deliveryId), {
          status,
          updatedAt: Date.now(),
        });
      } catch (err) {
        console.error('updateStatus error:', err);
      }
    },
    []
  );

  return { deliveries, loading, error, updateStatus };
}
