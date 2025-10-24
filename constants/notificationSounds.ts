// ============================================================================
// SOUND REGISTRY
// Location: constants/notificationSounds.ts
// Centralized configuration for prayer notification sounds
// ============================================================================

export interface NotificationSound {
  id: string;
  label: string;
  file: any; // require() result
  duration: number; // seconds (for UI display)
  description?: string;
}

/**
 * Registry of available notification sounds
 * To add a new sound:
 * 1. Add the audio file to assets/sounds/notification/
 * 2. Add a new entry to this array
 */
export const NOTIFICATION_SOUNDS: NotificationSound[] = [
  {
    id: 'full-adhan',
    label: 'Full Adhan',
    file: require('../assets/sounds/notification/full-adhan.mp3'),
    duration: 180, // 3 minutes
    description: 'Traditional full adhan call',
  },
  {
    id: 'short-adhan',
    label: 'Short Adhan',
    file: require('../assets/sounds/notification/short-adhan.mp3'),
    duration: 5, // 5 seconds
    description: 'Brief adhan clip',
  },
  {
    id: 'long-beep',
    label: 'Long Beep',
    file: require('../assets/sounds/notification/long-beep.mp3'),
    duration: 3, // 3 seconds
    description: 'Soft notification sound',
  },
  // Easy to add more sounds here in the future:
  // {
  //   id: 'madinah-adhan',
  //   label: 'Madinah Adhan',
  //   file: require('../assets/sounds/notification/madinah-adhan.mp3'),
  //   duration: 120,
  //   description: 'Adhan from Masjid Nabawi',
  // },
];

/**
 * Get sound by ID
 */
export const getSoundById = (id: string): NotificationSound | undefined => {
  return NOTIFICATION_SOUNDS.find(sound => sound.id === id);
};

/**
 * Default sound ID
 */
export const DEFAULT_SOUND_ID = 'short-adhan';
