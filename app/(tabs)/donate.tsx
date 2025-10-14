import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import custom hooks
import { useFirebaseData } from '../../hooks/useFirebaseData';

export default function DonateScreen(): React.JSX.Element {
  const { mosqueSettings } = useFirebaseData();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {mosqueSettings?.name || 'Al Madina Masjid Yagoona'}
          </Text>
          <Text style={styles.headerSubtitle}>Support Your Masjid</Text>
        </View>

        {/* Coming Soon Content */}
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="heart" size={80} color="#1e3a8a" />
          </View>
          
          <Text style={styles.comingSoonTitle}>Donations Coming Soon</Text>
          
          <Text style={styles.comingSoonText}>
            We're building a secure donation system to make it easier for you to support your masjid.
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text style={styles.featureText}>One-time donations</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text style={styles.featureText}>Recurring donations</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text style={styles.featureText}>Secure payment processing</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text style={styles.featureText}>Tax-deductible receipts</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text style={styles.featureText}>Campaign tracking</Text>
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>In the meantime</Text>
            <Text style={styles.contactText}>
              For donations, please contact the masjid directly:
            </Text>
            
            {mosqueSettings?.phone && (
              <View style={styles.contactDetail}>
                <Ionicons name="call" size={18} color="#1e3a8a" />
                <Text style={styles.contactDetailText}>{mosqueSettings.phone}</Text>
              </View>
            )}
            
            {mosqueSettings?.email && (
              <View style={styles.contactDetail}>
                <Ionicons name="mail" size={18} color="#1e3a8a" />
                <Text style={styles.contactDetailText}>{mosqueSettings.email}</Text>
              </View>
            )}
            
            {mosqueSettings?.website && (
              <View style={styles.contactDetail}>
                <Ionicons name="globe" size={18} color="#1e3a8a" />
                <Text style={styles.contactDetailText}>{mosqueSettings.website}</Text>
              </View>
            )}
          </View>
        </View>
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
  scrollContent: {
    flexGrow: 1,
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
  contentContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 40,
    marginBottom: 20,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresList: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  contactCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  contactDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  contactDetailText: {
    fontSize: 15,
    color: '#1f2937',
  },
});
