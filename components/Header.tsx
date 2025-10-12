import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrentTime, formatCurrentDate } from '../utils/dateHelpers';

interface HeaderProps {
  mosqueName: string | undefined;
  currentTime: Date;
}

export default function Header({ mosqueName, currentTime }: HeaderProps): React.JSX.Element {
  return (
    <View style={styles.header}>
      <Text style={styles.mosqueName}>
        {mosqueName || 'Al Madina Masjid Yagoona'}
      </Text>
      <Text style={styles.headerTitle}>Prayer Times</Text>
      
      <View style={styles.dateTimeContainer}>
        <View style={styles.dateTimeRow}>
          <Ionicons name="calendar-outline" size={16} color="#93c5fd" />
          <Text style={styles.dateText}>{formatCurrentDate(currentTime)}</Text>
        </View>
        <View style={styles.dateTimeRow}>
          <Ionicons name="time-outline" size={16} color="#93c5fd" />
          <Text style={styles.dateText}>Current Time: {formatCurrentTime(currentTime)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 24,
    paddingVertical: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  mosqueName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    color: '#93c5fd',
    textAlign: 'center',
    marginBottom: 16,
  },
  dateTimeContainer: {
    gap: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#93c5fd',
  },
});