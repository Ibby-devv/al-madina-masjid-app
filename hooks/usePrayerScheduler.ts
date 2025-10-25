// ============================================================================
// HOOK: usePrayerScheduler (NOTIFEE VERSION)
// Location: hooks/usePrayerScheduler.ts
// Schedules local notifications for prayer times using Notifee
// ============================================================================

import { useEffect, useState } from 'react';
import notifee, { 
  AndroidImportance,
  TimestampTrigger, 
  TriggerType,
  AuthorizationStatus 
} from '@notifee/react-native';
import { Platform } from 'react-native';
import { AllPrayerNotifications, PrayerName } from '../types/prayerNotifications';

// Track hook instances
let hookInstanceCount = 0;
let isScheduling = false;

interface PrayerTimes {
  fajr_adhan?: string;
  dhuhr_adhan?: string;
  asr_adhan?: string;
  maghrib_adhan?: string;
  isha_adhan?: string;
}

// Sound file mapping (Android requires lowercase with underscores)
const SOUND_MAP: Record<string, string> = {
  'full-adhan': 'full_adhan',
  'short-adhan': 'short_adhan',
  'takbir': 'takbir',
  'gentle-tone': 'gentle_tone',
};

export function usePrayerScheduler(
  prayerTimes: PrayerTimes | null,
  notificationSettings: AllPrayerNotifications
) {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [channelId, setChannelId] = useState<string>('');
  const [instanceId] = useState(() => {
    hookInstanceCount++;
    console.log(`🎣 Hook instance created: #${hookInstanceCount}`);
    return hookInstanceCount;
  });

  // Request notification permissions and create channel on mount
  useEffect(() => {
    console.log(`🎣 Instance #${instanceId} - Initializing Notifee`);
    initializeNotifee();
  }, []);

  // Reschedule notifications when prayer times or settings change
  useEffect(() => {
    if (permissionGranted && channelId && prayerTimes) {
      console.log(`🎣 Instance #${instanceId} - Settings/times changed, rescheduling...`);
      scheduleAllNotifications();
    }
  }, [permissionGranted, channelId, prayerTimes, notificationSettings]);

  const initializeNotifee = async () => {
    try {
      // Request permissions
      const settings = await notifee.requestPermission();

      if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
        console.log('✅ Notification permissions granted');
        setPermissionGranted(true);
      } else {
        console.log('❌ Notification permissions denied');
        setPermissionGranted(false);
        return;
      }

      // Create notification channel (Android only, but safe to call on iOS)
      const channelId = await notifee.createChannel({
        id: 'prayer-notifications',
        name: 'Prayer Notifications',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
        vibrationPattern: [500, 250, 250, 250],
      });

      console.log('✅ Notification channel created:', channelId);
      setChannelId(channelId);
    } catch (error) {
      console.error('❌ Error initializing Notifee:', error);
      setPermissionGranted(false);
    }
  };

  const scheduleAllNotifications = async () => {
    // Prevent concurrent scheduling
    if (isScheduling) {
      console.log('⏸️ Already scheduling, skipping...');
      return;
    }

    isScheduling = true;

    try {
      console.log('🔄 Starting notification scheduling...');

      // Cancel all existing notifications
      await notifee.cancelAllNotifications();
      console.log('🗑️ Cleared all scheduled notifications');

      // Log current settings and times
      console.log('📋 Current notification settings:', JSON.stringify(notificationSettings, null, 2));
      console.log('⏰ Prayer times:', JSON.stringify(prayerTimes, null, 2));

      const prayers: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
      let scheduledCount = 0;

      for (const prayer of prayers) {
        const settings = notificationSettings[prayer];

        // Skip if notifications are off
        if (settings.mode === 'off') {
          console.log(`⏭️ Skipping ${prayer} - notifications off`);
          continue;
        }

        const prayerTimeKey = `${prayer}_adhan` as keyof PrayerTimes;
        const prayerTimeString = prayerTimes?.[prayerTimeKey];

        if (!prayerTimeString) {
          console.warn(`⚠️ No time found for ${prayer}`);
          continue;
        }

        // Parse prayer time
        const prayerDate = parseTimeToDate(prayerTimeString);

        if (!prayerDate) {
          console.warn(`⚠️ Could not parse time for ${prayer}: ${prayerTimeString}`);
          continue;
        }

        // DEBUG: Log parsed time details
        const now = new Date();
        const timeUntilPrayer = prayerDate.getTime() - now.getTime();
        const minutesUntilPrayer = Math.floor(timeUntilPrayer / 60000);

        console.log(`🔍 ${prayer} parsed time:`, {
          original: prayerTimeString,
          parsed: prayerDate.toLocaleString(),
          timestamp: prayerDate.getTime(),
          now: now.getTime(),
          diff: timeUntilPrayer,
          minutes: minutesUntilPrayer,
        });

        // CRITICAL: Skip if time has passed or is too soon
        if (minutesUntilPrayer < 1) {
          console.log(`⏭️ Skipping ${prayer} - already passed or too soon (in ${minutesUntilPrayer} min)`);
          continue;
        }

        console.log(`⏰ Scheduling ${prayer} for ${prayerTimeString} (in ${minutesUntilPrayer} minutes)`);

        // Get sound filename (Android uses res/raw, iOS uses bundle)
        const soundFileName = SOUND_MAP[settings.soundId] || 'short_adhan';

        // Create trigger
        const trigger: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: prayerDate.getTime(),
        };

        // Schedule notification
        const notificationId = await notifee.createTriggerNotification(
          {
            id: `prayer-${prayer}`,
            title: `🕌 ${prayer.charAt(0).toUpperCase() + prayer.slice(1)} Prayer Time`,
            body: "It's time for prayer",
            android: {
              channelId: channelId,
              sound: settings.mode === 'sound' ? soundFileName : undefined,
              importance: AndroidImportance.HIGH,
              pressAction: {
                id: 'default',
              },
            },
            ios: {
              sound: settings.mode === 'sound' ? `${soundFileName}.mp3` : undefined,
            },
          },
          trigger
        );

        console.log(`✅ Scheduled ${prayer} at ${prayerTimeString} (ID: ${notificationId})`);
        scheduledCount++;
      }

      console.log(`📊 Total notifications scheduled: ${scheduledCount}`);

      // Log all scheduled notifications for verification
      await logAllScheduledNotifications();
    } catch (error) {
      console.error('❌ Error scheduling notifications:', error);
    } finally {
      isScheduling = false;
    }
  };

  const parseTimeToDate = (timeString: string): Date | null => {
    try {
      const today = new Date();
      const timeMatch = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);

      if (!timeMatch) {
        console.error(`❌ Invalid time format: ${timeString}`);
        return null;
      }

      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const period = timeMatch[3].toUpperCase();

      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }

      const prayerDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        hours,
        minutes,
        0,
        0
      );

      return prayerDate;
    } catch (error) {
      console.error('❌ Error parsing time:', error);
      return null;
    }
  };

  return {
    permissionGranted,
    requestPermissions: initializeNotifee,
    scheduleAllNotifications,
  };
}

// ============================================================================
// DEBUG UTILITIES
// ============================================================================

/**
 * Log all currently scheduled notifications
 */
export const logAllScheduledNotifications = async () => {
  try {
    const triggers = await notifee.getTriggerNotifications();
    console.log('📅 Currently scheduled notifications:', JSON.stringify(triggers, null, 2));
    console.log(`📊 Total scheduled: ${triggers.length}`);
    return triggers;
  } catch (error) {
    console.error('❌ Error getting scheduled notifications:', error);
    return [];
  }
};

/**
 * Manually clear all notifications (for testing)
 */
export const debugClearAllNotifications = async () => {
  try {
    await notifee.cancelAllNotifications();
    console.log('🧹 Manually cleared all notifications');
  } catch (error) {
    console.error('❌ Error clearing notifications:', error);
  }
};

/**
 * Cancel a specific notification by ID
 */
export const cancelNotification = async (notificationId: string) => {
  try {
    await notifee.cancelNotification(notificationId);
    console.log(`🗑️ Cancelled notification: ${notificationId}`);
  } catch (error) {
    console.error('❌ Error cancelling notification:', error);
  }
};
