import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import custom components
import LoadingScreen from '../components/LoadingScreen';

// Import custom hooks
import { useAutoFetchPrayerTimes } from '../hooks/useAutoFetchPrayerTimes';
import { useEvents } from '../hooks/useEvents';
import { useFirebaseData } from '../hooks/useFirebaseData';

// Import types and utility
import { Prayer, calculateIqamaTime, getCategoryColor } from '../types';

type TabType = 'prayer' | 'jumuah' | 'events';

export default function PrayerTimesScreen(): React.JSX.Element {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<TabType>('prayer');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Load data from Firebase using custom hooks
  const { prayerTimes, jumuahTimes, mosqueSettings, loading } = useFirebaseData();
  const { events, upcomingEvents, loading: eventsLoading } = useEvents();
  
  // Auto-fetch Maghrib if enabled
  const { isFetching: fetchingMaghrib } = useAutoFetchPrayerTimes(prayerTimes, mosqueSettings);

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

  // Format event date
  const formatEventDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Calculate Islamic (Hijri) date
  const getIslamicDate = (date: Date): string => {
    try {
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

  // Get the displayed iqama time (either fixed or calculated from offset)
  const getDisplayedIqamaTime = (prayer: string): string => {
    if (!prayerTimes) return '--:--';
    
    const adhanTime = (prayerTimes as any)[`${prayer}_adhan`];
    const iqamaType = (prayerTimes as any)[`${prayer}_iqama_type`] || 'fixed';
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

  // Calculate next prayer
  const getNextPrayer = (): { name: string; timeRemaining: string } | null => {
    const now = new Date();
    
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const prayerTimesWithDates = prayers.map(prayer => ({
      name: prayer.charAt(0).toUpperCase() + prayer.slice(1),
      iqamaTime: parseTimeToDate(getDisplayedIqamaTime(prayer))
    }));

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
    
    // Next prayer is Fajr tomorrow
    const fajrIqama = getDisplayedIqamaTime('fajr');
    const fajrTime = parseTimeToDate(fajrIqama);
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

  // Show loading screen
  if (loading) {
    return <LoadingScreen />;
  }

  const showMaghribFetchIndicator = fetchingMaghrib && mosqueSettings?.auto_fetch_maghrib;

  // Prayer times array
  const prayers: (Prayer & { icon: string; showIqama: boolean })[] = [
    { name: 'Fajr', adhan: prayerTimes?.fajr_adhan, iqama: getDisplayedIqamaTime('fajr'), icon: 'moon', showIqama: true },
    { name: 'Dhuhr', adhan: prayerTimes?.dhuhr_adhan, iqama: getDisplayedIqamaTime('dhuhr'), icon: 'partly-sunny', showIqama: true },
    { name: 'Asr', adhan: prayerTimes?.asr_adhan, iqama: getDisplayedIqamaTime('asr'), icon: 'sunny-outline', showIqama: true },
    { name: 'Maghrib', adhan: prayerTimes?.maghrib_adhan, iqama: getDisplayedIqamaTime('maghrib'), icon: 'moon-outline', showIqama: true },
    { name: 'Isha', adhan: prayerTimes?.isha_adhan, iqama: getDisplayedIqamaTime('isha'), icon: 'moon', showIqama: true },
  ];

  // Filter events by category
  const filteredEvents = selectedCategory === 'all' 
    ? upcomingEvents 
    : upcomingEvents.filter(event => event.category === selectedCategory);

  // Event categories for filter
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'lecture', label: 'Lectures' },
    { id: 'community', label: 'Community' },
    { id: 'youth', label: 'Youth' },
    { id: 'women', label: 'Women' },
    { id: 'education', label: 'Education' },
    { id: 'charity', label: 'Charity' },
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

        {/* Maghrib Fetch Indicator */}
        {showMaghribFetchIndicator && (
          <View style={styles.fetchIndicator}>
            <Text style={styles.fetchIndicatorText}>
              🌅 Updating Maghrib time...
            </Text>
          </View>
        )}

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
              Juma'ah
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'events' && styles.activeTab]}
            onPress={() => setActiveTab('events')}
          >
            <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
              Events
            </Text>
          </TouchableOpacity>
        </View>

        {/* Prayer Times Tab */}
        {activeTab === 'prayer' && (
          <>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <View style={styles.prayerNameColumn} />
                <View style={styles.timeColumn}>
                  <Ionicons name="time-outline" size={16} color="#93c5fd" />
                </View>
                <View style={styles.timeColumn}>
                  <Ionicons name="notifications-outline" size={16} color="#93c5fd" />
                </View>
              </View>

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

        {/* Events Tab */}
        {activeTab === 'events' && (
          <View style={styles.eventsTabContainer}>
            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === cat.id && styles.categoryButtonActive
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory === cat.id && styles.categoryButtonTextActive
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Events List */}
            {eventsLoading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Loading events...</Text>
              </View>
            ) : filteredEvents.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={64} color="#9ca3af" />
                <Text style={styles.emptyStateTitle}>No Upcoming Events</Text>
                <Text style={styles.emptyStateText}>
                  {selectedCategory === 'all' 
                    ? 'Check back soon for new events!' 
                    : `No upcoming ${selectedCategory} events`}
                </Text>
              </View>
            ) : (
              <View style={styles.eventsList}>
                {filteredEvents.map(event => {
                  const categoryColors = getCategoryColor(event.category);
                  
                  return (
                    <View key={event.id} style={styles.eventCard}>
                      <View style={[styles.eventCategory, { backgroundColor: categoryColors.bg }]}>
                        <Text style={[styles.eventCategoryText, { color: categoryColors.text }]}>
                          {event.category.toUpperCase()}
                        </Text>
                      </View>
                      
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      
                      <View style={styles.eventDetail}>
                        <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                        <Text style={styles.eventDetailText}>
                          {formatEventDate(event.date)} at {event.time}
                        </Text>
                      </View>
                      
                      {event.location && (
                        <View style={styles.eventDetail}>
                          <Ionicons name="location-outline" size={16} color="#6b7280" />
                          <Text style={styles.eventDetailText}>{event.location}</Text>
                        </View>
                      )}
                      
                      {event.speaker && (
                        <View style={styles.eventDetail}>
                          <Ionicons name="person-outline" size={16} color="#6b7280" />
                          <Text style={styles.eventDetailText}>Speaker: {event.speaker}</Text>
                        </View>
                      )}
                      
                      {event.rsvp_enabled && (
                        <View style={styles.eventDetail}>
                          <Ionicons name="people-outline" size={16} color="#6b7280" />
                          <Text style={styles.eventDetailText}>
                            {event.rsvp_count || 0} / {event.rsvp_limit || 'Unlimited'} RSVPs
                          </Text>
                        </View>
                      )}
                      
                      <Text style={styles.eventDescription} numberOfLines={3}>
                        {event.description}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
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
  fetchIndicator: {
    backgroundColor: '#fef3c7',
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  fetchIndicatorText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
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
  eventsTabContainer: {
    padding: 15,
  },
  categoryFilter: {
    marginBottom: 15,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#1e3a8a',
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  eventsList: {
    gap: 15,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventCategory: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  eventCategoryText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  eventDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    lineHeight: 20,
  },
});
