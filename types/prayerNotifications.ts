// ============================================================================
// TYPES: Prayer Notifications
// Location: types/prayerNotifications.ts
// ============================================================================

export type NotificationMode = 'sound' | 'vibrate' | 'off';

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerNotificationSettings {
  mode: NotificationMode;
  soundId: string; // ID from NOTIFICATION_SOUNDS registry
}

export interface AllPrayerNotifications {
  fajr: PrayerNotificationSettings;
  dhuhr: PrayerNotificationSettings;
  asr: PrayerNotificationSettings;
  maghrib: PrayerNotificationSettings;
  isha: PrayerNotificationSettings;
}

/**
 * Default notification settings
 */
export const DEFAULT_PRAYER_NOTIFICATIONS: AllPrayerNotifications = {
  fajr: { mode: 'off', soundId: 'short-adhan' },
  dhuhr: { mode: 'off', soundId: 'short-adhan' },
  asr: { mode: 'off', soundId: 'short-adhan' },
  maghrib: { mode: 'off', soundId: 'short-adhan' },
  isha: { mode: 'off', soundId: 'short-adhan' },
};

/**
 * Get icon for notification mode
 */
export const getNotificationIconName = (mode: NotificationMode): string => {
  switch (mode) {
    case 'sound':
      return 'notifications';          // Bell icon
    case 'vibrate':
      return 'volume-mute-outline'; // Phone/vibrate icon
    case 'off':
      return 'notifications-off';      // Bell with slash
  }
};

// Optional: Get color for each state
export const getNotificationIconColor = (mode: NotificationMode): string => {
  switch (mode) {
    case 'sound':
      return '#60a5fa';  // Blue (active)
    case 'vibrate':
      return '#f59e0b';  // Amber (vibrate)
    case 'off':
      return '#9ca3af';  // Gray (disabled)
  }
};

/**
 * Get display label for notification mode
 */
export const getNotificationLabel = (mode: NotificationMode): string => {
  switch (mode) {
    case 'sound':
      return 'Sound + Vibrate';
    case 'vibrate':
      return 'Vibrate Only';
    case 'off':
      return 'Off';
  }
};
