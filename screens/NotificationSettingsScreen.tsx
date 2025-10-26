import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, ActivityIndicator } from 'react-native';
import { db } from '../firebase';
import auth from '@react-native-firebase/auth';

export default function NotificationSettingsScreen() {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const userId = auth().currentUser?.uid;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      const doc = await db.collection('users').doc(userId).get();
      if (doc.exists()) {
        const data = doc.data();
        setEnabled(data?.notificationsEnabled ?? true);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async (value: boolean) => {
    setEnabled(value);
    
    if (userId) {
      try {
        await db.collection('users').doc(userId).update({
          notificationsEnabled: value,
          updatedAt: new Date(),
        });
        console.log(`✅ Notifications ${value ? 'enabled' : 'disabled'}`);
      } catch (error) {
        console.error('Error updating settings:', error);
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.textContainer}>
            <Text style={styles.label}>Enable Notifications</Text>
            <Text style={styles.subtitle}>
              Get notified about new events, campaigns, and prayer time updates
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={enabled ? '#007AFF' : '#f4f3f4'}
          />
        </View>
      </View>

      <Text style={styles.note}>
        You can change this setting anytime. When disabled, you won't receive any notifications from the mosque.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  note: {
    fontSize: 12,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 18,
  },
});