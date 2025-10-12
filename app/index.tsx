import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import custom components
import LoadingScreen from '../components/LoadingScreen';
import Header from '../components/Header';
import PrayerCard from '../components/PrayerCard';
import JumuahSection from '../components/JumuahSection';

// Import custom hook
import { useFirebaseData } from '../hooks/useFirebaseData';

// Import utility
import { formatShortDate } from '../utils/dateHelpers';

// Import types
import { Prayer } from '../types';

export default function PrayerTimesScreen(): React.JSX.Element {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Load data from Firebase using custom hook
  const { prayerTimes, jumuahTimes, mosqueSettings, loading, refetch } = useFirebaseData();

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Pull to refresh handler
  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Show loading screen while data is being fetched
  if (loading) {
    return <LoadingScreen />;
  }

  // Prayer times array for mapping
  const prayers: Prayer[] = [
    { name: 'Fajr', adhan: prayerTimes?.fajr_adhan, iqama: prayerTimes?.fajr_iqama },
    { name: 'Dhuhr', adhan: prayerTimes?.dhuhr_adhan, iqama: prayerTimes?.dhuhr_iqama },
    { name: 'Asr', adhan: prayerTimes?.asr_adhan, iqama: prayerTimes?.asr_iqama },
    { name: 'Maghrib', adhan: prayerTimes?.maghrib_adhan, iqama: prayerTimes?.maghrib_iqama },
    { name: 'Isha', adhan: prayerTimes?.isha_adhan, iqama: prayerTimes?.isha_iqama },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Component */}
        <Header 
          mosqueName={mosqueSettings?.name} 
          currentTime={currentTime} 
        />

        {/* Prayer Times List */}
        <View style={styles.prayerList}>
          {prayers.map((prayer) => (
            <PrayerCard
              key={prayer.name}
              name={prayer.name}
              adhan={prayer.adhan}
              iqama={prayer.iqama}
            />
          ))}
        </View>

        {/* Jumuah Section Component */}
        <JumuahSection jumuahTimes={jumuahTimes} />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Times are updated by mosque administration
          </Text>
          {prayerTimes?.last_updated && (
            <Text style={styles.footerText}>
              Last updated: {formatShortDate(prayerTimes.last_updated)}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollView: {
    flex: 1,
  },
  prayerList: {
    padding: 16,
  },
  footer: {
    padding: 32,
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});