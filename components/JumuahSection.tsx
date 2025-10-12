import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JumuahTimes } from '../types';

interface JumuahSectionProps {
  jumuahTimes: JumuahTimes | null;
}

export default function JumuahSection({ jumuahTimes }: JumuahSectionProps): React.JSX.Element | null {
  if (!jumuahTimes) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Ionicons name="notifications" size={28} color="#fbbf24" />
        <Text style={styles.title}>Friday Prayer (Jumuah)</Text>
      </View>
      
      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.label}>First Khutbah</Text>
          <Text style={styles.time}>{jumuahTimes.first_khutbah}</Text>
          <Text style={styles.label}>Prayer</Text>
          <Text style={styles.timeSecondary}>{jumuahTimes.first_prayer}</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.label}>Second Khutbah</Text>
          <Text style={styles.time}>{jumuahTimes.second_khutbah}</Text>
          <Text style={styles.label}>Prayer</Text>
          <Text style={styles.timeSecondary}>{jumuahTimes.second_prayer}</Text>
        </View>
      </View>
      
      <Text style={styles.note}>
        Please arrive 10-15 minutes before Khutbah
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    margin: 16,
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
  },
  label: {
    fontSize: 12,
    color: '#93c5fd',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 1,
  },
  time: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  timeSecondary: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  note: {
    textAlign: 'center',
    color: '#93c5fd',
    fontSize: 12,
    fontStyle: 'italic',
  },
});