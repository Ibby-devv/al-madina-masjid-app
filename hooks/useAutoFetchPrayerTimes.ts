import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { PrayerTimes, MosqueSettings } from '../types';

export const useAutoFetchPrayerTimes = (
  prayerTimes: PrayerTimes | null,
  mosqueSettings: MosqueSettings | null
) => {
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetchAttempt, setLastFetchAttempt] = useState<string | null>(null);

  useEffect(() => {
    // Only run if we have the necessary data
    if (!prayerTimes || !mosqueSettings) return;
    if (!mosqueSettings.latitude || !mosqueSettings.longitude) return;

    // Check if we should fetch prayer times
    const shouldFetch = checkIfShouldFetchPrayerTimes();
    
    if (shouldFetch) {
      fetchAndUpdateAllPrayerTimes();
    }
  }, [prayerTimes, mosqueSettings]);

  const checkIfShouldFetchPrayerTimes = (): boolean => {
    if (!prayerTimes) return false;

    const today = new Date().toISOString().split('T')[0];
    
    // Don't fetch if we already tried today
    if (lastFetchAttempt === today) {
      return false;
    }

    // Check if prayer times were already updated today
    const lastUpdate = prayerTimes.last_updated;
    
    if (lastUpdate === today) {
      console.log('Prayer times already updated today');
      return false;
    }

    return true;
  };

  const fetchAndUpdateAllPrayerTimes = async (): Promise<void> => {
    if (isFetching || !mosqueSettings) return;

    setIsFetching(true);
    const today = new Date().toISOString().split('T')[0];
    setLastFetchAttempt(today);

    try {
      console.log('🕌 Auto-fetching all prayer times...');
      
      const timestamp = Math.floor(Date.now() / 1000);
      const method = mosqueSettings.calculation_method || 3;

      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${mosqueSettings.latitude}&longitude=${mosqueSettings.longitude}&method=${method}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch prayer times');
      }

      const data = await response.json();
      
      if (data.code !== 200 || !data.data?.timings) {
        throw new Error('Invalid API response');
      }

      // Convert all prayer times from 24-hour to 12-hour format
      const timings = data.data.timings;
      
      const convertTo12Hour = (time24: string): string => {
        const [hours24, minutes] = time24.split(':');
        let hours = parseInt(hours24);
        const period = hours >= 12 ? 'PM' : 'AM';
        
        if (hours > 12) {
          hours -= 12;
        } else if (hours === 0) {
          hours = 12;
        }

        return `${hours}:${minutes} ${period}`;
      };

      // Get current prayer times from Firebase
      const prayerTimesDoc = await db
        .collection('prayerTimes')
        .doc('current')
        .get();
      
      const currentPrayerTimes = prayerTimesDoc.data() as PrayerTimes;

      // Update ALL Adhan times, keep existing Iqama settings
      const updatedPrayerTimes: PrayerTimes = {
        ...currentPrayerTimes,
        fajr_adhan: convertTo12Hour(timings.Fajr),
        dhuhr_adhan: convertTo12Hour(timings.Dhuhr),
        asr_adhan: convertTo12Hour(timings.Asr),
        maghrib_adhan: convertTo12Hour(timings.Maghrib),
        isha_adhan: convertTo12Hour(timings.Isha),
        last_updated: today
      };

      await db
        .collection('prayerTimes')
        .doc('current')
        .set(updatedPrayerTimes);

      console.log(`✅ All prayer times auto-updated:
        Fajr: ${convertTo12Hour(timings.Fajr)}
        Dhuhr: ${convertTo12Hour(timings.Dhuhr)}
        Asr: ${convertTo12Hour(timings.Asr)}
        Maghrib: ${convertTo12Hour(timings.Maghrib)}
        Isha: ${convertTo12Hour(timings.Isha)}
      `);
    } catch (error) {
      console.error('❌ Error auto-fetching prayer times:', error);
    } finally {
      setIsFetching(false);
    }
  };

  return { isFetching };
};
