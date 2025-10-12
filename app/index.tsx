import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import custom components
import LoadingScreen from '../components/LoadingScreen';

// Import custom hook
import { useFirebaseData } from '../hooks/useFirebaseData';

// Import types
import { Prayer } from '../types';

type TabType = 'prayer' | 'jumuah';

export default function PrayerTimesScreen(): React.JSX.Element {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<TabType>('prayer');
  
  // Load data from Firebase using custom hook
  const { prayerTimes, jumuahTimes, mosqueSettings, loading } = useFirebaseData();

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Format current time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Calculate Islamic (Hijri) date
  const getIslamicDate = (date: Date): string => {
    try {
      // Using Intl.DateTimeFormat for Hijri calendar
      const islamicDate = new Intl.DateTimeFormat('en-US-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
      
      return islamicDate;
    } catch (error) {
      console.error('Error formatting Islamic date:', error);
      return '';
    }
  };

  // Parse time string (e.g., "05:30 AM") to Date object for today
  const parseTimeToDate = (timeString: string | undefined): Date | null => {
    if (!timeString) return null;
    
    try {
      const today = new Date();
      const timeMatch = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
      
      if (!timeMatch) return null;
      
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const period = timeMatch[3].toUpperCase();
      
      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      const prayerDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, 0);
      return prayerDate;
    } catch (error) {
      console.error('Error parsing time:', error);
      return null;
    }
  };

  // Calculate next prayer and time remaining
  const getNextPrayer = (): { name: string; timeRemaining: string } | null => {
    const now = new Date();
    
    const prayerTimesWithDates = [
      { name: 'Fajr', iqamaTime: parseTimeToDate(prayerTimes?.fajr_iqama) },
      { name: 'Dhuhr', iqamaTime: parseTimeToDate(prayerTimes?.dhuhr_iqama) },
      { name: 'Asr', iqamaTime: parseTimeToDate(prayerTimes?.asr_iqama) },
      { name: 'Maghrib', iqamaTime: parseTimeToDate(prayerTimes?.maghrib_iqama) },
      { name: 'Isha', iqamaTime: parseTimeToDate(prayerTimes?.isha_iqama) },
    ];

    // Find next prayer (Iqama time that's in the future)
    for (const prayer of prayerTimesWithDates) {
      if (prayer.iqamaTime && prayer.iqamaTime > now) {
        const diffMs = prayer.iqamaTime.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const minutes = diffMins % 60;
        
        let timeRemaining = '';
        if (hours > 0) {
          timeRemaining = `${hours} Hour${hours > 1 ? 's' : ''} ${minutes} Minute${minutes !== 1 ? 's' : ''}`;
        } else {
          timeRemaining = `${minutes} Minute${minutes !== 1 ? 's' : ''}`;
        }
        
        return { name: prayer.name, timeRemaining };
      }
    }
    
    // If no prayer found today, next prayer is Fajr tomorrow
    const fajrTime = parseTimeToDate(prayerTimes?.fajr_iqama);
    if (fajrTime) {
      const tomorrow = new Date(fajrTime);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const diffMs = tomorrow.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;
      
      return { 
        name: 'Fajr', 
        timeRemaining: `${hours} Hour${hours > 1 ? 's' : ''} ${minutes} Minute${minutes !== 1 ? 's' : ''}` 
      };
    }
    
    return null;
  };

  const nextPrayer = getNextPrayer();

  // Show loading screen while data is being fetched
  if (loading) {
    return <LoadingScreen />;
  }

  // Prayer times array with icons
  const prayers: Array<Prayer & { icon: string; showIqama: boolean }> = [
    { name: 'Fajr', adhan: prayerTimes?.fajr_adhan, iqama: prayerTimes?.fajr_iqama, icon: 'moon', showIqama: true },
    { name: 'Dhuhr', adhan: prayerTimes?.dhuhr_adhan, iqama: prayerTimes?.dhuhr_iqama, icon: 'partly-sunny', showIqama: true },
    { name: 'Asr', adhan: prayerTimes?.asr_adhan, iqama: prayerTimes?.asr_iqama, icon: 'sunny-outline', showIqama: true },
    { name: 'Maghrib', adhan: prayerTimes?.maghrib_adhan, iqama: prayerTimes?.maghrib_iqama, icon: 'moon-outline', showIqama: true },
    { name: 'Isha', adhan: prayerTimes?.isha_adhan, iqama: prayerTimes?.isha_iqama, icon: 'moon', showIqama: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.mosqueName}>
            {mosqueSettings?.name || 'Al Madina Masjid Yagoona'}
          </Text>
          <Text style={styles.date}>
            {formatDate(currentTime)} | {getIslamicDate(currentTime)}
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'prayer' && styles.activeTab]}
            onPress={() => setActiveTab('prayer')}
          >
            <Text style={[styles.tabText, activeTab === 'prayer' && styles.activeTabText]}>
              Prayer Times
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'jumuah' && styles.activeTab]}
            onPress={() => setActiveTab('jumuah')}
          >
            <Text style={[styles.tabText, activeTab === 'jumuah' && styles.activeTabText]}>
              Juma'ah Times
            </Text>
          </TouchableOpacity>
        </View>

        {/* Prayer Times Tab */}
        {activeTab === 'prayer' && (
          <>
            {/* Prayer Times Table */}
            <View style={styles.tableContainer}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <View style={styles.prayerNameColumn} />
                <View style={styles.timeColumn}>
                  <Ionicons name="time-outline" size={16} color="#93c5fd" />
                </View>
                <View style={styles.timeColumn}>
                  <Ionicons name="notifications-outline" size={16} color="#93c5fd" />
                </View>
              </View>

              {/* Prayer Rows */}
              {prayers.map((prayer, index) => {
                const isNextPrayer = nextPrayer?.name === prayer.name;
                
                return (
                  <View 
                    key={prayer.name} 
                    style={[
                      styles.prayerRow,
                      index === prayers.length - 1 && styles.lastPrayerRow,
                      isNextPrayer && styles.nextPrayerRow
                    ]}
                  >
                    <View style={styles.prayerNameContainer}>
                      <View style={styles.iconContainer}>
                        <Ionicons name={prayer.icon as any} size={20} color="#60a5fa" />
                      </View>
                      <Text style={styles.prayerName}>{prayer.name}</Text>
                    </View>
                    <Text style={styles.prayerTime}>{prayer.adhan || '--:--'}</Text>
                    <Text style={styles.prayerTime}>
                      {prayer.showIqama ? (prayer.iqama || '--:--') : ''}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Next Prayer Countdown */}
            {nextPrayer && (
              <View style={styles.nextPrayerContainer}>
                <Text style={styles.nextPrayerText}>
                  {nextPrayer.name} Jama'ah is in {nextPrayer.timeRemaining}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Jumu'ah Times Tab */}
        {activeTab === 'jumuah' && jumuahTimes && (
          <View style={styles.jumuahTabContainer}>
            <View style={styles.jumuahCard}>
              <Text style={styles.jumuahCardTitle}>1st Jumu'ah</Text>
              <View style={styles.jumuahTimeRow}>
                <Text style={styles.jumuahLabel}>Khutbah</Text>
                <Text style={styles.jumuahTime}>{jumuahTimes.first_khutbah}</Text>
              </View>
              <View style={styles.jumuahTimeRow}>
                <Text style={styles.jumuahLabel}>Prayer</Text>
                <Text style={styles.jumuahTime}>{jumuahTimes.first_prayer}</Text>
              </View>
            </View>

            <View style={styles.jumuahCard}>
              <Text style={styles.jumuahCardTitle}>2nd Jumu'ah</Text>
              <View style={styles.jumuahTimeRow}>
                <Text style={styles.jumuahLabel}>Khutbah</Text>
                <Text style={styles.jumuahTime}>{jumuahTimes.second_khutbah}</Text>
              </View>
              <View style={styles.jumuahTimeRow}>
                <Text style={styles.jumuahLabel}>Prayer</Text>
                <Text style={styles.jumuahTime}>{jumuahTimes.second_prayer}</Text>
              </View>
            </View>

            <Text style={styles.jumuahNote}>
              Please arrive 10-15 minutes before Khutbah
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    alignItems: 'center',
  },
  mosqueName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: '#93c5fd',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    gap: 8,
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 25,
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
  },
  activeTab: {
    backgroundColor: '#1e3a8a',
  },
  tabText: {
    color: '#1e3a8a',
    fontSize: 13,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  tableContainer: {
    backgroundColor: '#1e40af',
    borderRadius: 20,
    marginHorizontal: 15,
    marginTop: 10,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  prayerNameColumn: {
    flex: 2,
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
  },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  nextPrayerRow: {
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
  },
  lastPrayerRow: {
    borderBottomWidth: 0,
  },
  prayerNameContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayerName: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
  prayerTime: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  jumuahTabContainer: {
    padding: 15,
  },
  jumuahCard: {
    backgroundColor: '#1e40af',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  jumuahCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  jumuahTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  jumuahLabel: {
    fontSize: 14,
    color: '#93c5fd',
  },
  jumuahTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  jumuahNote: {
    textAlign: 'center',
    color: '#1e3a8a',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 10,
  },
  nextPrayerContainer: {
    backgroundColor: '#dbeafe',
    padding: 15,
    margin: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  nextPrayerText: {
    fontSize: 15,
    color: '#1e3a8a',
    fontWeight: '600',
  },
});