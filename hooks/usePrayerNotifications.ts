// ============================================================================
// HOOK: usePrayerNotifications
// Location: hooks/usePrayerNotifications.ts
// Manages prayer notification settings (load, save, update)
// ============================================================================

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AllPrayerNotifications,
  DEFAULT_PRAYER_NOTIFICATIONS,
  PrayerName,
  PrayerNotificationSettings,
} from '../types/prayerNotifications';

const STORAGE_KEY = '@prayer_notifications';

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
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: AllPrayerNotifications) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setNotifications(newSettings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      throw error;
    }
  };

  const updatePrayerNotification = async (
    prayer: PrayerName,
    settings: PrayerNotificationSettings
  ) => {
    const newSettings = {
      ...notifications,
      [prayer]: settings,
    };
    await saveSettings(newSettings);
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
