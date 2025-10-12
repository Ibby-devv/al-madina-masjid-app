// Firebase Data Types

export interface PrayerTimes {
  fajr_adhan: string;
  fajr_iqama: string;
  dhuhr_adhan: string;
  dhuhr_iqama: string;
  asr_adhan: string;
  asr_iqama: string;
  maghrib_adhan: string;
  maghrib_iqama: string;
  isha_adhan: string;
  isha_iqama: string;
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
  last_updated?: string;
}

// Component Props Types

export interface Prayer {
  name: string;
  adhan: string | undefined;
  iqama: string | undefined;
}