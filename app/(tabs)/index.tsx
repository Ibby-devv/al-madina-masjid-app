import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Import custom components
import LoadingScreen from "../../components/LoadingScreen";
import PrayerNotificationModal from "../../components/PrayerNotificationModal";

// Import custom hooks
import { useFirebaseData } from "../../hooks/useFirebaseData";
import { usePrayerNotifications } from "../../hooks/usePrayerNotifications";

// Import types and utility
import { Prayer, calculateIqamaTime } from "../../types";
import {
  PrayerName,
  PrayerNotificationSettings,
  getNotificationIconName,
  getNotificationIconColor,
} from "../../types/prayerNotifications";

type ViewType = "prayer" | "jumuah";

export default function HomeScreen(): React.JSX.Element {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [activeView, setActiveView] = useState<ViewType>("prayer");

  // Notification state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerName | null>(null);

  // Load data from Firebase using custom hooks
  const { prayerTimes, jumuahTimes, mosqueSettings, loading } =
    useFirebaseData();
  const {
    notifications,
    loading: notificationsLoading,
    updatePrayerNotification,
  } = usePrayerNotifications();

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Format current time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Calculate Islamic (Hijri) date
  const getIslamicDate = (date: Date): string => {
    try {
      const islamicDate = new Intl.DateTimeFormat("en-US-u-ca-islamic", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);

      return islamicDate;
    } catch (error) {
      console.error("Error formatting Islamic date:", error);
      return "";
    }
  };

  // Get the displayed iqama time
  const getDisplayedIqamaTime = (prayer: string): string => {
    if (!prayerTimes) return "--:--";

    const adhanTime = (prayerTimes as any)[`${prayer}_adhan`];
    const iqamaType = (prayerTimes as any)[`${prayer}_iqama_type`] || "fixed";
    const fixedIqama = (prayerTimes as any)[`${prayer}_iqama`];
    const offset = (prayerTimes as any)[`${prayer}_iqama_offset`];

    return calculateIqamaTime(adhanTime, iqamaType, fixedIqama, offset);
  };

  // Parse time string to Date object
  const parseTimeToDate = (timeString: string | undefined): Date | null => {
    if (!timeString) return null;

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

  // Calculate next prayer
  const getNextPrayer = (): { name: string; timeRemaining: string } | null => {
    const now = new Date();

    const prayers = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
    const prayerTimesWithDates = prayers.map((prayer) => ({
      name: prayer.charAt(0).toUpperCase() + prayer.slice(1),
      iqamaTime: parseTimeToDate(getDisplayedIqamaTime(prayer)),
    }));

    for (const prayer of prayerTimesWithDates) {
      if (prayer.iqamaTime && prayer.iqamaTime > now) {
        const diffMs = prayer.iqamaTime.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const minutes = diffMins % 60;

        let timeRemaining = "";
        if (hours > 0) {
          timeRemaining = `${hours} Hour${
            hours > 1 ? "s" : ""
          } ${minutes} Minute${minutes !== 1 ? "s" : ""}`;
        } else {
          timeRemaining = `${minutes} Minute${minutes !== 1 ? "s" : ""}`;
        }

        return { name: prayer.name, timeRemaining };
      }
    }

    // Next prayer is Fajr tomorrow
    const fajrIqama = getDisplayedIqamaTime("fajr");
    const fajrTime = parseTimeToDate(fajrIqama);
    if (fajrTime) {
      const tomorrow = new Date(fajrTime);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const diffMs = tomorrow.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;

      return {
        name: "Fajr",
        timeRemaining: `${hours} Hour${hours > 1 ? "s" : ""} ${minutes} Minute${
          minutes !== 1 ? "s" : ""
        }`,
      };
    }

    return null;
  };

  const nextPrayer = getNextPrayer();

  // Handle bell icon press
  const handleBellPress = (prayerName: PrayerName) => {
    setSelectedPrayer(prayerName);
    setModalVisible(true);
  };

  // Handle save notification settings
  const handleSaveNotification = async (
    settings: PrayerNotificationSettings
  ) => {
    if (selectedPrayer) {
      try {
        await updatePrayerNotification(selectedPrayer, settings);
        console.log("✅ Notification settings saved for", selectedPrayer);

        // Note: Notifications will reschedule automatically via useEffect
        // when the notifications state updates
      } catch (error) {
        console.error("Error saving notification:", error);
      }
    }
  };

  // Show loading screen
  if (loading || notificationsLoading) {
    return <LoadingScreen />;
  }

  // Prayer times array
  const prayers: Array<
    Prayer & { icon: string; showIqama: boolean; prayerKey: PrayerName }
  > = [
    {
      name: "Fajr",
      adhan: prayerTimes?.fajr_adhan,
      iqama: getDisplayedIqamaTime("fajr"),
      icon: "moon",
      showIqama: true,
      prayerKey: "fajr",
    },
    {
      name: "Dhuhr",
      adhan: prayerTimes?.dhuhr_adhan,
      iqama: getDisplayedIqamaTime("dhuhr"),
      icon: "partly-sunny",
      showIqama: true,
      prayerKey: "dhuhr",
    },
    {
      name: "Asr",
      adhan: prayerTimes?.asr_adhan,
      iqama: getDisplayedIqamaTime("asr"),
      icon: "sunny-outline",
      showIqama: true,
      prayerKey: "asr",
    },
    {
      name: "Maghrib",
      adhan: prayerTimes?.maghrib_adhan,
      iqama: getDisplayedIqamaTime("maghrib"),
      icon: "moon-outline",
      showIqama: true,
      prayerKey: "maghrib",
    },
    {
      name: "Isha",
      adhan: prayerTimes?.isha_adhan,
      iqama: getDisplayedIqamaTime("isha"),
      icon: "moon",
      showIqama: true,
      prayerKey: "isha",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push("../settings")}
            style={styles.settingsButton}
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.mosqueName}>
              {mosqueSettings?.name || "Al Ansar Masjid"}
            </Text>
            <Text style={styles.date}>
              {formatDate(currentTime)} | {getIslamicDate(currentTime)}
            </Text>
          </View>
        </View>

        {/* Toggle Buttons */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeView === "prayer" && styles.toggleButtonActive,
            ]}
            onPress={() => setActiveView("prayer")}
          >
            <Text
              style={[
                styles.toggleButtonText,
                activeView === "prayer" && styles.toggleButtonTextActive,
              ]}
            >
              Prayer Times
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeView === "jumuah" && styles.toggleButtonActive,
            ]}
            onPress={() => setActiveView("jumuah")}
          >
            <Text
              style={[
                styles.toggleButtonText,
                activeView === "jumuah" && styles.toggleButtonTextActive,
              ]}
            >
              Juma'ah Times
            </Text>
          </TouchableOpacity>
        </View>

        {/* Prayer Times View */}
        {activeView === "prayer" && (
          <>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <View style={styles.prayerNameColumn} />
                <View style={styles.timeColumn}>
                  <Ionicons name="time-outline" size={16} color="#93c5fd" />
                </View>
                <View style={styles.timeColumn}>
                  <Ionicons
                    name="notifications-outline"
                    size={16}
                    color="#93c5fd"
                  />
                </View>
                <View style={styles.bellColumn} />
              </View>

              {prayers.map((prayer, index) => {
                const isNextPrayer = nextPrayer?.name === prayer.name;
                const notificationMode = notifications[prayer.prayerKey].mode;
                const iconName = getNotificationIconName(notificationMode);
                const iconColor = getNotificationIconColor(notificationMode);
                return (
                  <View
                    key={prayer.name}
                    style={[
                      styles.prayerRow,
                      index === prayers.length - 1 && styles.lastPrayerRow,
                      isNextPrayer && styles.nextPrayerRow,
                    ]}
                  >
                    <View style={styles.prayerNameContainer}>
                      <View style={styles.iconContainer}>
                        <Ionicons
                          name={prayer.icon as any}
                          size={20}
                          color="#60a5fa"
                        />
                      </View>
                      <Text style={styles.prayerName}>{prayer.name}</Text>
                    </View>
                    <Text style={styles.prayerTime}>
                      {prayer.adhan || "--:--"}
                    </Text>
                    <Text style={styles.prayerTime}>
                      {prayer.showIqama ? prayer.iqama || "--:--" : ""}
                    </Text>
                    <TouchableOpacity
                      style={styles.bellIconContainer}
                      onPress={() => handleBellPress(prayer.prayerKey)}
                    >
                      <Ionicons
                        name={iconName as any}
                        size={24}
                        color={iconColor}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {nextPrayer && (
              <View style={styles.nextPrayerContainer}>
                <Text style={styles.nextPrayerText}>
                  {nextPrayer.name} Jama'ah is in {nextPrayer.timeRemaining}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Jumu'ah Times View */}
        {activeView === "jumuah" && jumuahTimes && (
          <View style={styles.jumuahTabContainer}>
            <View style={styles.jumuahCard}>
              <Text style={styles.jumuahCardTitle}>1st Jumu'ah</Text>
              <View style={styles.jumuahTimeRow}>
                <Text style={styles.jumuahLabel}>Khutbah</Text>
                <Text style={styles.jumuahTime}>
                  {jumuahTimes.first_khutbah}
                </Text>
              </View>
              <View style={styles.jumuahTimeRow}>
                <Text style={styles.jumuahLabel}>Prayer</Text>
                <Text style={styles.jumuahTime}>
                  {jumuahTimes.first_prayer}
                </Text>
              </View>
            </View>

            <View style={styles.jumuahCard}>
              <Text style={styles.jumuahCardTitle}>2nd Jumu'ah</Text>
              <View style={styles.jumuahTimeRow}>
                <Text style={styles.jumuahLabel}>Khutbah</Text>
                <Text style={styles.jumuahTime}>
                  {jumuahTimes.second_khutbah}
                </Text>
              </View>
              <View style={styles.jumuahTimeRow}>
                <Text style={styles.jumuahLabel}>Prayer</Text>
                <Text style={styles.jumuahTime}>
                  {jumuahTimes.second_prayer}
                </Text>
              </View>
            </View>

            <Text style={styles.jumuahNote}>
              Please arrive 10-15 minutes before Khutbah
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Notification Settings Modal */}
      {selectedPrayer && (
        <PrayerNotificationModal
          visible={modalVisible}
          prayerName={selectedPrayer}
          currentSettings={notifications[selectedPrayer]}
          onClose={() => {
            setModalVisible(false);
            setSelectedPrayer(null);
          }}
          onSave={handleSaveNotification}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e3a8a",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: "#1e3a8a",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    position: "relative",
  },
  headerContent: {
    alignItems: "center",
  },
  settingsButton: {
    position: "absolute",
    top: 20,
    right: 20,
    padding: 8,
    zIndex: 10,
  },
  mosqueName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: "#93c5fd",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
    gap: 8,
    paddingVertical: 10,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 25,
    alignItems: "center",
    backgroundColor: "#e8e8e8",
  },
  toggleButtonActive: {
    backgroundColor: "#1e3a8a",
  },
  toggleButtonText: {
    color: "#1e3a8a",
    fontSize: 13,
    fontWeight: "500",
  },
  toggleButtonTextActive: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  tableContainer: {
    backgroundColor: "#1e40af",
    borderRadius: 20,
    marginHorizontal: 15,
    marginTop: 10,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  prayerNameColumn: {
    flex: 2,
  },
  timeColumn: {
    flex: 1,
    alignItems: "center",
  },
  bellColumn: {
    width: 40,
    alignItems: "center",
  },
  prayerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  nextPrayerRow: {
    backgroundColor: "rgba(96, 165, 250, 0.2)",
  },
  lastPrayerRow: {
    borderBottomWidth: 0,
  },
  prayerNameContainer: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  prayerName: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "500",
  },
  prayerTime: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
  bellIconContainer: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  jumuahTabContainer: {
    padding: 15,
  },
  jumuahCard: {
    backgroundColor: "#1e40af",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  jumuahCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
  },
  jumuahTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  jumuahLabel: {
    fontSize: 14,
    color: "#93c5fd",
  },
  jumuahTime: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  jumuahNote: {
    textAlign: "center",
    color: "#1e3a8a",
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 10,
  },
  nextPrayerContainer: {
    backgroundColor: "#dbeafe",
    padding: 15,
    margin: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  nextPrayerText: {
    fontSize: 15,
    color: "#1e3a8a",
    fontWeight: "600",
  },
  settingsButton: {
    padding: 8,
  },
});
