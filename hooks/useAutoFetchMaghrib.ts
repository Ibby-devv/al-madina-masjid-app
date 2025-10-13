import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { PrayerTimes, MosqueSettings } from '../types';

export const useAutoFetchMaghrib = (
  prayerTimes: PrayerTimes | null,
  mosqueSettings: MosqueSettings | null
) => {
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetchAttempt, setLastFetchAttempt] = useState<string | null>(null);

  useEffect(() => {
    // Only run if we have the necessary data
    if (!prayerTimes || !mosqueSettings) return;
    if (!mosqueSettings.auto_fetch_maghrib) return;
    if (!mosqueSettings.latitude || !mosqueSettings.longitude) return;

    // Check if we should fetch Maghrib
    const shouldFetch = checkIfShouldFetchMaghrib();
    
    if (shouldFetch) {
      fetchAndUpdateMaghrib();
    }
  }, [prayerTimes, mosqueSettings]);

  const checkIfShouldFetchMaghrib = (): boolean => {
    if (!prayerTimes) return false;

    const today = new Date().toISOString().split('T')[0];
    
    // Don't fetch if we already tried today
    if (lastFetchAttempt === today) {
      return false;
    }

    // Check if Maghrib was already updated today
    const lastUpdate = prayerTimes.last_updated;
    
    if (lastUpdate === today) {
      console.log('Maghrib already updated today');
      return false;
    }

    return true;
  };

  const fetchAndUpdateMaghrib = async (): Promise<void> => {
    if (isFetching || !mosqueSettings) return;

    setIsFetching(true);
    const today = new Date().toISOString().split('T')[0];
    setLastFetchAttempt(today);

    try {
      console.log('🌅 Auto-fetching Maghrib time...');
      
      const timestamp = Math.floor(Date.now() / 1000);
      const method = mosqueSettings.calculation_method || 3;

      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${mosqueSettings.latitude}&longitude=${mosqueSettings.longitude}&method=${method}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch prayer times');
      }

      const data = await response.json();
      
      if (data.code !== 200 || !data.data?.timings?.Maghrib) {
        throw new Error('Invalid API response');
      }

      // Convert 24-hour format to 12-hour format
      const maghribTime24 = data.data.timings.Maghrib;
      const [hours24, minutes] = maghribTime24.split(':');
      let hours = parseInt(hours24);
      const period = hours >= 12 ? 'PM' : 'AM';
      
      if (hours > 12) {
        hours -= 12;
      } else if (hours === 0) {
        hours = 12;
      }

      const maghribTime12 = `${hours}:${minutes} ${period}`;

      // Update Firebase with new Maghrib time
      const prayerTimesRef = doc(db, 'prayerTimes', 'current');
      
      // Get current prayer times from Firebase
      const prayerTimesSnap = await getDoc(prayerTimesRef);
      const currentPrayerTimes = prayerTimesSnap.data() as PrayerTimes;

      // Update only Maghrib adhan and last_updated
      const updatedPrayerTimes: PrayerTimes = {
        ...currentPrayerTimes,
        maghrib_adhan: maghribTime12,
        last_updated: today
      };

      await setDoc(prayerTimesRef, updatedPrayerTimes);

      console.log(`✅ Maghrib auto-updated to ${maghribTime12}`);
    } catch (error) {
      console.error('❌ Error auto-fetching Maghrib:', error);
    } finally {
      setIsFetching(false);
    }
  };

  return { isFetching };
};