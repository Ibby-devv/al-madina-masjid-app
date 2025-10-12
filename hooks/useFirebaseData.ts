import { useState, useEffect } from 'react';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';
import { PrayerTimes, JumuahTimes, MosqueSettings } from '../types';

interface UseFirebaseDataReturn {
  prayerTimes: PrayerTimes | null;
  jumuahTimes: JumuahTimes | null;
  mosqueSettings: MosqueSettings | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFirebaseData = (): UseFirebaseDataReturn => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [jumuahTimes, setJumuahTimes] = useState<JumuahTimes | null>(null);
  const [mosqueSettings, setMosqueSettings] = useState<MosqueSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribePrayer: Unsubscribe;
    let unsubscribeJumuah: Unsubscribe;
    let unsubscribeSettings: Unsubscribe;

    try {
      setError(null);

      // Real-time listener for prayer times
      unsubscribePrayer = onSnapshot(
        doc(db, 'prayerTimes', 'current'),
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            setPrayerTimes(docSnapshot.data() as PrayerTimes);
            console.log('Prayer times updated from Firebase');
          }
          setLoading(false);
        },
        (err) => {
          console.error('Error listening to prayer times:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      // Real-time listener for Jumuah times
      unsubscribeJumuah = onSnapshot(
        doc(db, 'jumuahTimes', 'current'),
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            setJumuahTimes(docSnapshot.data() as JumuahTimes);
            console.log('Jumuah times updated from Firebase');
          }
        },
        (err) => {
          console.error('Error listening to Jumuah times:', err);
          setError(err.message);
        }
      );

      // Real-time listener for mosque settings
      unsubscribeSettings = onSnapshot(
        doc(db, 'mosqueSettings', 'info'),
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            setMosqueSettings(docSnapshot.data() as MosqueSettings);
            console.log('Mosque settings updated from Firebase');
          }
        },
        (err) => {
          console.error('Error listening to mosque settings:', err);
          setError(err.message);
        }
      );
    } catch (err) {
      console.error('Error setting up listeners:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }

    // Cleanup function - unsubscribe from all listeners when component unmounts
    return () => {
      if (unsubscribePrayer) unsubscribePrayer();
      if (unsubscribeJumuah) unsubscribeJumuah();
      if (unsubscribeSettings) unsubscribeSettings();
      console.log('Unsubscribed from Firebase listeners');
    };
  }, []);

  // Manual refetch function (for pull-to-refresh)
  // Note: With real-time listeners, this happens automatically,
  // but we keep this for the pull-to-refresh gesture
  const loadData = async (): Promise<void> => {
    // With listeners, data updates automatically
    // This function is kept for compatibility with pull-to-refresh
    console.log('Manual refresh triggered (listeners handle updates automatically)');
  };

  return {
    prayerTimes,
    jumuahTimes,
    mosqueSettings,
    loading,
    error,
    refetch: loadData
  };
};