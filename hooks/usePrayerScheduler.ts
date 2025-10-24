// ============================================================================
// HOOK: usePrayerScheduler
// Location: hooks/usePrayerScheduler.ts
// Schedules local notifications for prayer times
// ============================================================================

import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import {
  AllPrayerNotifications,
  PrayerName,
} from "../types/prayerNotifications";
import { getSoundById } from "../constants/notificationSounds";

// Configure notification handler
// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // Show banner at top of screen
    shouldShowList: true, // Show in notification center
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface PrayerTimes {
  fajr_adhan?: string;
  dhuhr_adhan?: string;
  asr_adhan?: string;
  maghrib_adhan?: string;
  isha_adhan?: string;
}

export function usePrayerScheduler(
  prayerTimes: PrayerTimes | null,
  notificationSettings: AllPrayerNotifications
) {
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Request notification permissions on mount
  useEffect(() => {
    requestPermissions();
  }, []);

  // Reschedule notifications when prayer times or settings change
  useEffect(() => {
    if (permissionGranted && prayerTimes) {
      scheduleAllNotifications();
    }
  }, [permissionGranted, prayerTimes, notificationSettings]);

  const requestPermissions = async () => {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Notification permissions not granted");
        setPermissionGranted(false);
        return;
      }

      setPermissionGranted(true);
      console.log("✅ Notification permissions granted");

      // Android: Create notification channel
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(
          "prayer-notifications",
          {
            name: "Prayer Notifications",
            importance: Notifications.AndroidImportance.HIGH,
            sound: "default",
            vibrationPattern: [0, 250, 250, 250],
            enableVibrate: true,
          }
        );
      }
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      setPermissionGranted(false);
    }
  };

  const scheduleAllNotifications = async () => {
    try {
      // Cancel all existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("🗑️ Cleared all scheduled notifications");
      console.log(
        "📋 Current notification settings:",
        JSON.stringify(notificationSettings, null, 2)
      );
      console.log("⏰ Prayer times:", JSON.stringify(prayerTimes, null, 2));

      const prayers: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

      for (const prayer of prayers) {
        const settings = notificationSettings[prayer];

        // Skip if notifications are off
        if (settings.mode === "off") {
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
        if (!prayerDate || prayerDate < new Date()) {
          console.log(`⏭️ Skipping ${prayer} - time has passed`);
          continue;
        }

        // Get sound file if mode is 'sound'
        let soundFile = undefined;
        if (settings.mode === "sound") {
          const sound = getSoundById(settings.soundId);
          if (sound) {
            soundFile = sound.file;
          }
        }

        // Schedule notification
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `🕌 ${
              prayer.charAt(0).toUpperCase() + prayer.slice(1)
            } Prayer Time`,
            body: "It's time for prayer",
            sound: settings.mode === "sound" ? soundFile : undefined,
            vibrate:
              settings.mode === "vibrate" || settings.mode === "sound"
                ? [0, 250, 250, 250]
                : undefined,
          },
          trigger: {
            date: prayerDate,
          },
        });

        console.log(
          `✅ Scheduled ${prayer} notification at ${prayerTimeString} (ID: ${notificationId})`
        );
      }

      // Schedule next day's refresh at midnight
      await scheduleNextDayRefresh();
    } catch (error) {
      console.error("Error scheduling notifications:", error);
    }
  };

  const scheduleNextDayRefresh = async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 1, 0, 0); // 12:01 AM tomorrow

      console.log(
        `🔄 Will refresh notifications at ${tomorrow.toLocaleString()}`
      );

      // Note: This is a placeholder. In production, you'd use a background task
      // For now, notifications will reschedule when the app is opened
    } catch (error) {
      console.error("Error scheduling refresh:", error);
    }
  };

  const parseTimeToDate = (timeString: string): Date | null => {
    try {
      const today = new Date();
      const timeMatch = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);

      if (!timeMatch) return null;

      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const period = timeMatch[3].toUpperCase();

      if (period === "PM" && hours !== 12) {
        hours += 12;
      } else if (period === "AM" && hours === 12) {
        hours = 0;
      }

      const prayerDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        hours,
        minutes,
        0
      );

      return prayerDate;
    } catch (error) {
      console.error("Error parsing time:", error);
      return null;
    }
  };

  return {
    permissionGranted,
    requestPermissions,
    scheduleAllNotifications,
  };
}
