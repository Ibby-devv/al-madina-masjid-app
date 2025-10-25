// ============================================================================
// HOOK: usePrayerNotifications
// Location: hooks/usePrayerNotifications.ts
// Manages prayer notification settings (load, save, update)
// ============================================================================

import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import {
  AllPrayerNotifications,
  DEFAULT_PRAYER_NOTIFICATIONS,
  PrayerName,
  PrayerNotificationSettings,
} from "../types/prayerNotifications";

const STORAGE_KEY = "@prayer_notifications";

export function usePrayerNotifications() {
  const [notifications, setNotifications] = useState<AllPrayerNotifications>(
    DEFAULT_PRAYER_NOTIFICATIONS
  );
  const [loading, setLoading] = useState(true);

  // Load settings from storage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: AllPrayerNotifications) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setNotifications(newSettings);
    } catch (error) {
      console.error("Error saving notification settings:", error);
      throw error;
    }
  };

  const updatePrayerNotification = async (
    prayer: PrayerName,
    updates: Partial<PrayerNotificationSettings>
  ) => {
    const newSettings = {
      ...notifications,
      [prayer]: { ...notifications[prayer], ...updates },
    };

    setNotifications(newSettings);

    // Save to AsyncStorage (local backup)
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));

    // Save to Firestore (for Cloud Functions)
    try {
      const userId = auth().currentUser?.uid;
      if (userId) {
        await firestore().collection("users").doc(userId).set(
          {
            notificationSettings: newSettings,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        console.log("✅ Notification settings synced to Firestore");
      }
    } catch (error) {
      console.error("❌ Error syncing settings to Firestore:", error);
    }
  };

  const resetToDefaults = async () => {
    await saveSettings(DEFAULT_PRAYER_NOTIFICATIONS);
  };

  return {
    notifications,
    loading,
    updatePrayerNotification,
    resetToDefaults,
  };
}
