// ============================================================================
// SOUND REGISTRY (Updated for Notifee)
// Location: constants/notificationSounds.ts
// Centralized configuration for prayer notification sounds
// ============================================================================

export interface NotificationSound {
  id: string;
  label: string;
  file: any; // require() result (for preview playback)
  androidResource: string; // Android res/raw filename (for Notifee)
  duration: number; // seconds (for UI display)
  description?: string;
}

/**
 * Registry of available notification sounds
 * 
 * NOTE: Android sound files must be placed in:
 * android/app/src/main/res/raw/
 * 
 * Filenames must be lowercase with underscores (no dashes or spaces)
 */
export const NOTIFICATION_SOUNDS: NotificationSound[] = [
  {
    id: 'full-adhan',
    label: 'Full Adhan',
    file: require('../assets/sounds/notification/full_adhan.mp3'),
    androidResource: 'full_adhan', // Used by Notifee
    duration: 180,
    description: 'Traditional full adhan call',
  },
  {
    id: 'short-adhan',
    label: 'Short Adhan',
    file: require('../assets/sounds/notification/short_adhan.mp3'),
    androidResource: 'short_adhan', // Used by Notifee
    duration: 15,
    description: 'Brief adhan clip',
  },
  {
    id: 'long-beep',
    label: 'Long Beep',
    file: require('../assets/sounds/notification/long_beep.mp3'),
    androidResource: 'long_beep', // Used by Notifee
    duration: 3,
    description: 'Simple beep tone',
  },
];

/**
 * Get sound by ID
 */
export const getSoundById = (id: string): NotificationSound | undefined => {
  return NOTIFICATION_SOUNDS.find(sound => sound.id === id);
};

/**
 * Get Android resource name for sound (used by Notifee)
 */
export const getAndroidSoundResource = (id: string): string => {
  const sound = getSoundById(id);
  return sound?.androidResource || 'short_adhan';
};

/**
 * Default sound ID
 */
export const DEFAULT_SOUND_ID = 'short-adhan';
