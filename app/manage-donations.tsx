import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { httpsCallable } from 'firebase/functions';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { functions } from '../firebase';

export default function ManageDonationsScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestLink = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const requestManagementLink = httpsCallable(
        functions,
        'requestManagementLink'
      );

      const result = await requestManagementLink({ email: email.trim() });
      const data = result.data as any;

      // DEVELOPMENT: Navigate directly to verify screen
      if (data.devLink) {
        // Extract token from devLink (almadina://manage/TOKEN)
        const tokenId = data.devLink.split('/').pop();
        
        Alert.alert(
          'Success! 🎉',
          'Management link generated',
          [
            {
              text: 'Open Link',
              onPress: () => router.push(`/manage/${tokenId}` as any),
            },
            { text: 'Cancel' },
          ]
        );
      } else {
        Alert.alert(
          'Check Your Email! 📧',
          data.message,
          [{ text: 'OK' }]
        );
      }

      setEmail('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Manage Donations',
          headerShown: true,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar barStyle="dark-content" />
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#1e3a8a" />
            <Text style={styles.infoText}>
              Enter the email address you used when setting up your recurring donation.
              We'll send you a secure link to manage your subscriptions.
            </Text>
          </View>

          {/* Email Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Your Email</Text>
            <TextInput
              style={styles.input}
              placeholder="email@example.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Send Link Button */}
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={handleRequestLink}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="mail" size={24} color="#fff" />
                <Text style={styles.sendButtonText}>Send Management Link</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Features List */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>What you can do:</Text>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.featureText}>View all recurring donations</Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.featureText}>Cancel subscriptions</Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.featureText}>Update payment method</Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.featureText}>View payment history</Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.featureText}>Download receipts</Text>
            </View>
          </View>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark" size={20} color="#10b981" />
            <Text style={styles.securityText}>
              Secure management powered by Stripe
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e3a8a',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  sendButton: {
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  featuresSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#1f2937',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#6b7280',
  },
});