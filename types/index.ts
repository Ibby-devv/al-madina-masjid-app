// Firebase Data Types

export interface PrayerTimes {
  fajr_adhan: string;
  fajr_iqama: string;
  fajr_iqama_type: 'fixed' | 'offset';
  fajr_iqama_offset?: number;
  
  dhuhr_adhan: string;
  dhuhr_iqama: string;
  dhuhr_iqama_type: 'fixed' | 'offset';
  dhuhr_iqama_offset?: number;
  
  asr_adhan: string;
  asr_iqama: string;
  asr_iqama_type: 'fixed' | 'offset';
  asr_iqama_offset?: number;
  
  maghrib_adhan: string;
  maghrib_iqama: string;
  maghrib_iqama_type: 'fixed' | 'offset';
  maghrib_iqama_offset?: number;
  
  isha_adhan: string;
  isha_iqama: string;
  isha_iqama_type: 'fixed' | 'offset';
  isha_iqama_offset?: number;
  
  last_updated?: string;
}

export interface JumuahTimes {
  first_khutbah: string;
  first_prayer: string;
  second_khutbah: string;
  second_prayer: string;
  last_updated?: string;
}

export interface MosqueSettings {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  imam?: string;
  latitude?: number;
  longitude?: number;
  calculation_method?: number;
  auto_fetch_maghrib?: boolean;
  last_updated?: string;
}

// Component Props Types

export interface Prayer {
  name: string;
  adhan: string | undefined;
  iqama: string | undefined;
}

// Utility function to calculate iqama time from adhan + offset
export const calculateIqamaTime = (
  adhanTime: string | undefined, 
  iqamaType: 'fixed' | 'offset' | undefined,
  fixedIqama: string | undefined,
  offset: number | undefined
): string => {
  // If it's a fixed time, return the fixed iqama
  if (iqamaType === 'fixed') {
    return fixedIqama || '--:--';
  }

  // If it's an offset, calculate from adhan time
  if (!adhanTime || !offset) return '--:--';

  try {
    const timeMatch = adhanTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) return '--:--';

    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const period = timeMatch[3].toUpperCase();

    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    // Add offset
    let totalMinutes = hours * 60 + minutes + offset;
    let newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;

    // Convert back to 12-hour format
    const newPeriod = newHours >= 12 ? 'PM' : 'AM';
    if (newHours > 12) {
      newHours -= 12;
    } else if (newHours === 0) {
      newHours = 12;
    }

    return `${newHours}:${newMinutes.toString().padStart(2, '0')} ${newPeriod}`;
  } catch (error) {
    console.error('Error calculating iqama time:', error);
    return '--:--';
  }
};