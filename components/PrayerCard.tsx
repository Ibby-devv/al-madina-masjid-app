import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PrayerCardProps {
  name: string;
  adhan: string | undefined;
  iqama: string | undefined;
}

export default function PrayerCard({ name, adhan, iqama }: PrayerCardProps): React.JSX.Element {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={24} color="#1e3a8a" />
        </View>
        <Text style={styles.name}>{name}</Text>
      </View>
      
      <View style={styles.timesContainer}>
        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>Adhan</Text>
          <Text style={styles.timeValue}>{adhan || '--:--'}</Text>
        </View>
        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>Iqama</Text>
          <Text style={styles.timeValue}>{iqama || '--:--'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#1e3a8a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  timesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timeBlock: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 1,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3a8a',
  },
});