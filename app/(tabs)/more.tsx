import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import custom hooks
import { useFirebaseData } from '../../hooks/useFirebaseData';

export default function MoreScreen(): React.JSX.Element {
  const { mosqueSettings } = useFirebaseData();

  const handlePress = (type: 'phone' | 'email' | 'website' | 'map') => {
    let url = '';
    
    switch (type) {
      case 'phone':
        if (mosqueSettings?.phone) {
          url = `tel:${mosqueSettings.phone.replace(/[^0-9]/g, '')}`;
        }
        break;
      case 'email':
        if (mosqueSettings?.email) {
          url = `mailto:${mosqueSettings.email}`;
        }
        break;
      case 'website':
        if (mosqueSettings?.website) {
          url = mosqueSettings.website.startsWith('http') 
            ? mosqueSettings.website 
            : `https://${mosqueSettings.website}`;
        }
        break;
      case 'map':
        if (mosqueSettings?.address) {
          const encodedAddress = encodeURIComponent(mosqueSettings.address);
          url = `https://maps.google.com/?q=${encodedAddress}`;
        }
        break;
    }
    
    if (url) {
      Linking.openURL(url).catch(err => console.error('Error opening link:', err));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {mosqueSettings?.name || 'Al Madina Masjid Yagoona'}
          </Text>
          <Text style={styles.headerSubtitle}>Mosque Information</Text>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            
            {mosqueSettings?.address && (
              <TouchableOpacity 
                style={styles.infoItem}
                onPress={() => handlePress('map')}
              >
                <View style={styles.infoIconContainer}>
                  <Ionicons name="location" size={24} color="#1e3a8a" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>{mosqueSettings.address}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}

            {mosqueSettings?.phone && (
              <TouchableOpacity 
                style={styles.infoItem}
                onPress={() => handlePress('phone')}
              >
                <View style={styles.infoIconContainer}>
                  <Ionicons name="call" size={24} color="#1e3a8a" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{mosqueSettings.phone}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}

            {mosqueSettings?.email && (
              <TouchableOpacity 
                style={styles.infoItem}
                onPress={() => handlePress('email')}
              >
                <View style={styles.infoIconContainer}>
                  <Ionicons name="mail" size={24} color="#1e3a8a" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{mosqueSettings.email}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}

            {mosqueSettings?.website && (
              <TouchableOpacity 
                style={styles.infoItem}
                onPress={() => handlePress('website')}
              >
                <View style={styles.infoIconContainer}>
                  <Ionicons name="globe" size={24} color="#1e3a8a" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Website</Text>
                  <Text style={styles.infoValue}>{mosqueSettings.website}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}

            {mosqueSettings?.imam && (
              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="person" size={24} color="#1e3a8a" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Imam</Text>
                  <Text style={styles.infoValue}>{mosqueSettings.imam}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Quick Actions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => handlePress('map')}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="navigate" size={24} color="#10b981" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionLabel}>Get Directions</Text>
                <Text style={styles.actionSubtext}>Open in Maps</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => handlePress('phone')}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="call-outline" size={24} color="#3b82f6" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionLabel}>Call Masjid</Text>
                <Text style={styles.actionSubtext}>Contact us directly</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* App Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Information</Text>
            
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="information-circle" size={24} color="#6b7280" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Version</Text>
                <Text style={styles.infoValue}>1.0.0</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="code-slash" size={24} color="#6b7280" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Developed by</Text>
                <Text style={styles.infoValue}>Ibrahim Eter</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Built with ❤️ for the Muslim Community
            </Text>
            <Text style={styles.footerSubtext}>
              © 2025 Al Ansar Masjid Yagoona
            </Text>
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
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    paddingLeft: 4,
  },
  infoItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  actionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
  footer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
