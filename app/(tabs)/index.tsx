import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PatternOverlay from "../../components/PatternOverlay";
import NextBanner from "../../components/ui/NextBanner";
import PillToggle from "../../components/ui/PillToggle";

// Import custom components
import LoadingScreen from "../../components/LoadingScreen";

// Import custom hooks
import { useFirebaseData } from "../../hooks/useFirebaseData";

// Import types and utility
import { Theme } from "../../constants/theme";
import { Prayer, calculateIqamaTime } from "../../types";

type ViewType = "prayer" | "jumuah";

const getOrdinalSuffix = (num: number): string => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return `${num}st`;
  if (j === 2 && k !== 12) return `${num}nd`;
  if (j === 3 && k !== 13) return `${num}rd`;
  return `${num}th`;
};

export default function HomeScreen(): React.JSX.Element {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [activeView, setActiveView] = useState<ViewType>("prayer");

  // Load data from Firebase using custom hooks
  const { prayerTimes, jumuahTimes, mosqueSettings, loading } =
    useFirebaseData();

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

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

  // Show loading screen
  if (loading) {
    return <LoadingScreen />;
  }

  // Prayer times array
  const prayers: (Prayer & { icon: string; showIqama: boolean })[] = [
    {
      name: "Fajr",
      adhan: prayerTimes?.fajr_adhan,
      iqama: getDisplayedIqamaTime("fajr"),
      icon: "moon",
      showIqama: true,
    },
    {
      name: "Dhuhr",
      adhan: prayerTimes?.dhuhr_adhan,
      iqama: getDisplayedIqamaTime("dhuhr"),
      icon: "partly-sunny",
      showIqama: true,
    },
    {
      name: "Asr",
      adhan: prayerTimes?.asr_adhan,
      iqama: getDisplayedIqamaTime("asr"),
      icon: "sunny-outline",
      showIqama: true,
    },
    {
      name: "Maghrib",
      adhan: prayerTimes?.maghrib_adhan,
      iqama: getDisplayedIqamaTime("maghrib"),
      icon: "moon-outline",
      showIqama: true,
    },
    {
      name: "Isha",
      adhan: prayerTimes?.isha_adhan,
      iqama: getDisplayedIqamaTime("isha"),
      icon: "moon",
      showIqama: true,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={[Theme.colors.brand.navy[800], Theme.colors.brand.navy[700], Theme.colors.brand.navy[900]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Subtle geometric pattern behind the hero content */}
          <PatternOverlay
            style={styles.patternOverlay}
            variant="stars"
            opacity={0.05}
            tileSize={28}
            color="rgba(255,255,255,0.7)"
          />
          <SafeAreaView edges={["top"]}>
            <View style={styles.headerTop}>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => router.push("/settings")}
              >
                <Ionicons name="settings-outline" size={24} color={Theme.colors.text.inverse} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.heroSection}>
              <View style={styles.logoHalo}>
                <Image
                  source={require("../../assets/images/ansar_logo_white.png")}
                  style={styles.logoLarge}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.mosqueName}>
                {mosqueSettings?.name || "Al Ansar Masjid"}
              </Text>
              <Text style={styles.currentDate}>{formatDate(currentTime)}</Text>
              <Text style={styles.islamicDate}>{getIslamicDate(currentTime)}</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Toggle Buttons */}
        <PillToggle
          options={[
            { key: "prayer", label: "Prayer Times" },
            { key: "jumuah", label: "Jumu’ah Times" },
          ]}
          value={activeView}
          onChange={(key) => setActiveView(key as ViewType)}
          style={{ marginTop: -12, marginBottom: 12 }}
        />

        {/* Prayer Times View */}
        {activeView === "prayer" && (
          <View style={styles.prayerCardsContainer}>
            {nextPrayer && (
              <NextBanner text={`Next: ${nextPrayer.name} in ${nextPrayer.timeRemaining}`} />
            )}
            <View style={styles.prayerTableCard}>
              <View style={[styles.tableRow, styles.tableHeaderRow, styles.tableRowDivider]}>
                <View style={styles.rowLeft} />
                <Text style={[styles.rowTime, styles.rowHeaderLabel]}>Adhan</Text>
                <Text style={[styles.rowTime, styles.rowHeaderLabel]}>Iqama</Text>
              </View>
              {prayers.map((prayer, index) => {
                const isNextPrayer = nextPrayer?.name === prayer.name;
                const isLast = index === prayers.length - 1;

                return (
                  <View
                    key={prayer.name}
                    style={[
                      styles.tableRow,
                      isNextPrayer && styles.nextRow,
                      !isLast && styles.tableRowDivider,
                    ]}
                  >
                    <View style={styles.rowLeft}>
                      <View style={[styles.iconCircleSmall, isNextPrayer && styles.iconCircleActive]}>
                        <Ionicons
                          name={prayer.icon as any}
                          size={18}
                          color={isNextPrayer ? Theme.colors.brand.gold[600] : Theme.colors.accent.blue}
                        />
                      </View>
                      <Text style={[styles.rowName, isNextPrayer && styles.nextPrayerText]}>
                        {prayer.name}
                      </Text>
                    </View>
                    <Text style={styles.rowTime}>{prayer.adhan || "--:--"}</Text>
                    <Text style={[styles.rowTime, styles.rowIqama]}>
                      {prayer.showIqama ? prayer.iqama || "--:--" : ""}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Jumu'ah Times View */}
        {activeView === "jumuah" && jumuahTimes && (
          <View style={styles.jumuahCardsContainer}>
            {jumuahTimes.times.map((time, index) => (
              <View key={time.id} style={styles.jumuahCard}>
                <View style={styles.jumuahHeader}>
                  <Ionicons name="calendar" size={24} color={Theme.colors.brand.gold[600]} />
                  <Text style={styles.jumuahCardTitle}>
                    {jumuahTimes.times.length === 1
                      ? "Jumu'ah"
                      : `${getOrdinalSuffix(index + 1)} Jumu'ah`}
                  </Text>
                </View>
                <View style={styles.jumuahTimeRow}>
                  <Text style={styles.jumuahLabel}>Khutbah</Text>
                  <Text style={styles.jumuahTime}>{time.khutbah}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.surface.muted,
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: Theme.spacing.xl,
    borderBottomLeftRadius: Theme.radius.xl,
    borderBottomRightRadius: Theme.radius.xl,
    ...Theme.shadow.header,
  },
  patternOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.sm,
  },
  settingsButton: {
    padding: 6,
    borderRadius: Theme.spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  heroSection: {
    alignItems: "center",
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: 6,
    paddingBottom: 4,
  },
  logoLarge: {
    width: 90,
    height: 90,
    marginBottom: 10,
  },
  logoHalo: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: Theme.spacing.sm,
  },
  mosqueName: {
    fontSize: Theme.typography.h1,
    fontWeight: "bold",
    color: Theme.colors.text.inverse,
    marginBottom: 4,
    textAlign: "center",
  },
  currentDate: {
    fontSize: 13,
    color: Theme.colors.text.subtle,
    marginBottom: 1,
    textAlign: "center",
  },
  islamicDate: {
    fontSize: Theme.typography.small,
    color: Theme.colors.text.subtle,
    textAlign: "center",
  },
  prayerCardsContainer: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  prayerTableCard: {
    backgroundColor: Theme.colors.surface.base,
    borderRadius: Theme.radius.lg,
    paddingVertical: Theme.spacing.sm,
    ...Theme.shadow.soft,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: 14,
  },
  tableHeaderRow: {
    backgroundColor: Theme.colors.surface.soft,
  },
  tableRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.base,
  },
  nextRow: {
    backgroundColor: Theme.colors.accent.amberSoft,
  },
  rowLeft: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircleSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.accent.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Theme.spacing.sm,
  },
  rowName: {
    fontSize: Theme.typography.h3,
    color: Theme.colors.text.strong,
    fontWeight: "700",
  },
  rowTime: {
    flex: 1,
    textAlign: "center",
    fontSize: Theme.typography.h3,
    color: Theme.colors.text.base,
    fontWeight: "700",
  },
  rowHeaderLabel: {
    fontSize: Theme.typography.small,
    color: Theme.colors.text.muted,
    fontWeight: "800",
  },
  rowIqama: {
    color: Theme.colors.brand.navy[700],
  },
  prayerCard: {
    backgroundColor: Theme.colors.surface.base,
    borderRadius: 14,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    ...Theme.shadow.soft,
  },
  nextPrayerCard: {
    backgroundColor: "#fffbeb",
    borderWidth: 2,
    borderColor: Theme.colors.brand.gold[400],
    shadowColor: Theme.colors.brand.gold[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  prayerCardHeader: {
    marginBottom: 10,
  },
  prayerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.accent.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  iconCircleActive: {
    backgroundColor: "#fef3c7",
  },
  prayerCardName: {
    fontSize: Theme.typography.h3,
    fontWeight: "700",
    color: Theme.colors.text.strong,
    flex: 1,
  },
  nextPrayerText: {
    color: "#92400e",
  },
  nextBadge: {
    backgroundColor: Theme.colors.brand.gold[600],
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: 10,
  },
  nextBadgeText: {
    color: Theme.colors.text.inverse,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  countdownText: {
    fontSize: 13,
    fontWeight: "600",
    color: Theme.colors.brand.gold[600],
    marginLeft: 46,
  },
  prayerCardTimes: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.surface.soft,
    borderRadius: 10,
    padding: 10,
  },
  timeBlock: {
    flex: 1,
    alignItems: "center",
  },
  timeDivider: {
    width: 1,
    height: 35,
    backgroundColor: Theme.colors.border.soft,
    marginHorizontal: 6,
  },
  timeLabel: {
    fontSize: 11,
    color: Theme.colors.text.muted,
    marginTop: 3,
    marginBottom: 1,
  },
  timeValue: {
    fontSize: Theme.spacing.lg,
    fontWeight: "700",
    color: Theme.colors.text.strong,
  },
  iqamaTime: {
    color: Theme.colors.brand.navy[700],
  },
  jumuahCardsContainer: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  jumuahCard: {
    backgroundColor: Theme.colors.surface.base,
    borderRadius: 14,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
    ...Theme.shadow.soft,
  },
  jumuahHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  jumuahCardTitle: {
    fontSize: Theme.typography.h3,
    fontWeight: "700",
    color: Theme.colors.text.strong,
    marginLeft: 10,
  },
  jumuahTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Theme.colors.surface.soft,
    borderRadius: 10,
    padding: Theme.spacing.md,
  },
  jumuahLabel: {
    fontSize: Theme.typography.body,
    color: Theme.colors.text.muted,
    fontWeight: "500",
  },
  jumuahTime: {
    fontSize: Theme.typography.h2,
    fontWeight: "700",
    color: Theme.colors.brand.navy[700],
  },
});
