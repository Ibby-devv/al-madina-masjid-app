import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import custom hooks
import { useEvents } from '../../hooks/useEvents';
import { useEventCategories } from '../../hooks/useEventCategories';  // ✅ NEW: Import categories hook
import { useFirebaseData } from '../../hooks/useFirebaseData';

export default function EventsScreen(): React.JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Load events and categories from Firebase
  const { upcomingEvents, loading: eventsLoading } = useEvents();
  const { categories, loading: categoriesLoading } = useEventCategories();  // ✅ NEW: Load categories
  const { mosqueSettings } = useFirebaseData();

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

  // ✅ NEW: Get category colors dynamically
  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      return { bg: category.color_bg, text: category.color_text };
    }
    // Fallback gray
    return { bg: '#e5e7eb', text: '#374151' };
  };

  // ✅ NEW: Get category label dynamically
  const getCategoryLabel = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.label || categoryId;
  };

  // Filter events by category
  const filteredEvents = selectedCategory === 'all' 
    ? upcomingEvents 
    : upcomingEvents.filter(event => event.category === selectedCategory);

  // ✅ NEW: Build category filter dynamically from Firestore
  const categoryFilters = [
    { id: 'all', label: 'All' },
    ...categories.map(cat => ({ id: cat.id, label: cat.label }))
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {mosqueSettings?.name || 'Al Madina Masjid Yagoona'}
        </Text>
        <Text style={styles.headerSubtitle}>Upcoming Events</Text>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoryFilter}
        contentContainerStyle={styles.categoryFilterContent}
      >
        {categoriesLoading ? (
          <Text style={styles.categoryButtonText}>Loading categories...</Text>
        ) : (
          categoryFilters.map(cat => (
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
          ))
        )}
      </ScrollView>

      {/* Events List */}
      <View style={styles.eventsContainer}>
        <ScrollView 
          style={styles.eventsScrollView}
          contentContainerStyle={styles.eventsScrollContent}
        >
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
                  : `No upcoming ${getCategoryLabel(selectedCategory)} events`}
              </Text>
            </View>
          ) : (
            <>
              {filteredEvents.map(event => {
                const categoryColors = getCategoryColor(event.category);
                
                return (
                  <View key={event.id} style={styles.eventCard}>
                    <View style={[styles.eventCategory, { backgroundColor: categoryColors.bg }]}>
                      <Text style={[styles.eventCategoryText, { color: categoryColors.text }]}>
                        {getCategoryLabel(event.category).toUpperCase()}
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
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  header: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#93c5fd',
  },
  categoryFilter: {
    backgroundColor: '#f5f5f5',
    maxHeight: 60,
  },
  categoryFilterContent: {
    paddingHorizontal: 15,
    paddingVertical: 15,
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
  eventsContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  eventsScrollView: {
    flex: 1,
  },
  eventsScrollContent: {
    padding: 15,
    paddingBottom: 30,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
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
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    marginBottom: 15,
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
    marginBottom: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    lineHeight: 20,
  },
});
