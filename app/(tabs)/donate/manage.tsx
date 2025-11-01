import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Theme } from '../../../constants/theme';
import { regionalFunctions } from '../../../firebase';

export default function ManageTab() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestLink = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const requestManagementLink = regionalFunctions.httpsCallable('requestManagementLink');

      await requestManagementLink({ email: email.trim() });

      Alert.alert(
        'Check Your Email! 📧',
        'We sent you a link to manage your recurring donations.',
        [{ text: 'OK' }]
      );

      setEmail('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={Theme.colors.brand.navy[700]} />
          <Text style={styles.infoText}>
            Enter the email address you used when setting up your recurring donation.
            We&apos;ll send you a secure link to manage your subscriptions.
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
            <Ionicons name="checkmark-circle" size={20} color={Theme.colors.accent.green} />
            <Text style={styles.featureText}>View all recurring donations</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={Theme.colors.accent.green} />
            <Text style={styles.featureText}>Cancel subscriptions</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={Theme.colors.accent.green} />
            <Text style={styles.featureText}>Update payment method</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={Theme.colors.accent.green} />
            <Text style={styles.featureText}>View payment history</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={Theme.colors.accent.green} />
            <Text style={styles.featureText}>Download receipts</Text>
          </View>
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={20} color={Theme.colors.accent.green} />
          <Text style={styles.securityText}>
            Secure management powered by Stripe
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.surface.muted,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.xl,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.accent.blueSoft,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xxl,
    gap: Theme.spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: Theme.typography.body,
    color: Theme.colors.brand.navy[700],
    lineHeight: 20,
  },
  section: {
    marginBottom: Theme.spacing.xxl,
  },
  label: {
    fontSize: Theme.spacing.lg,
    fontWeight: '600',
    color: Theme.colors.text.strong,
    marginBottom: Theme.spacing.sm,
  },
  input: {
    backgroundColor: Theme.colors.surface.base,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.lg,
    fontSize: Theme.spacing.lg,
    color: Theme.colors.text.strong,
    borderWidth: 2,
    borderColor: Theme.colors.border.base,
  },
  sendButton: {
    backgroundColor: Theme.colors.brand.navy[700],
    borderRadius: Theme.radius.md,
    padding: Theme.typography.h3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.md,
    marginBottom: 32,
  },
  sendButtonDisabled: {
    backgroundColor: Theme.colors.text.muted,
  },
  sendButtonText: {
    color: Theme.colors.text.inverse,
    fontSize: Theme.typography.h3,
    fontWeight: 'bold',
  },
  featuresSection: {
    backgroundColor: Theme.colors.surface.base,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.xl,
  },
  featuresTitle: {
    fontSize: Theme.spacing.lg,
    fontWeight: '600',
    color: Theme.colors.text.strong,
    marginBottom: Theme.spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  featureText: {
    fontSize: 15,
    color: Theme.colors.text.strong,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.sm,
  },
  securityText: {
    fontSize: Theme.typography.body,
    color: Theme.colors.text.muted,
  },
});
