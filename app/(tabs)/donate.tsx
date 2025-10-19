// ============================================================================
// DONATION SCREEN - COMPLETE
// Location: src/screens/donate.tsx
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStripe, CardField } from '@stripe/stripe-react-native';

// Import custom hooks
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { useDonation } from '../../hooks/useDonation';
import { DonationFormData } from '../../types/donation';

export default function DonateScreen(): React.JSX.Element {
  const { mosqueSettings } = useFirebaseData();
  const { settings, loading, error, createDonation, createSubscription } = useDonation();
  const { confirmPayment } = useStripe();

  // Form state
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTypeLabel, setSelectedTypeLabel] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'weekly' | 'fortnightly' | 'monthly' | 'yearly'>('monthly');
  
  // Donor info
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorMessage, setDonorMessage] = useState('');

  // Card state
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Initialize selected type
  useEffect(() => {
    if (settings && settings.donation_types.length > 0) {
      const firstEnabled = settings.donation_types.find(t => t.enabled);
      if (firstEnabled) {
        setSelectedType(firstEnabled.id);
        setSelectedTypeLabel(firstEnabled.label);
      }
    }
  }, [settings]);

  const handlePresetAmount = (value: number) => {
    setAmount(value.toString());
    setCustomAmount('');
  };

  const handleCustomAmount = (text: string) => {
    setCustomAmount(text);
    setAmount('');
  };

  const getDisplayAmount = (): number => {
    if (customAmount) return parseFloat(customAmount) || 0;
    if (amount) return parseFloat(amount) || 0;
    return 0;
  };

  const validateForm = (): boolean => {
    const displayAmount = getDisplayAmount();
    const minAmount = settings?.minimum_amount || 5;

    if (!selectedType) {
      Alert.alert('Error', 'Please select a donation type');
      return false;
    }

    if (displayAmount < minAmount) {
      Alert.alert('Error', `Minimum donation is $${minAmount}`);
      return false;
    }

    if (!donorName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }

    if (!donorEmail.trim() || !donorEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return false;
    }

    if (!cardComplete) {
      Alert.alert('Error', 'Please enter valid card details');
      return false;
    }

    return true;
  };

  const handleDonate = async () => {
    if (!validateForm()) return;

    setProcessing(true);

    try {
      const donationData: DonationFormData = {
        amount: getDisplayAmount(),
        donationType: selectedType,
        donationTypeLabel: selectedTypeLabel,
        isRecurring,
        frequency: isRecurring ? frequency : undefined,
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim(),
        donorPhone: donorPhone.trim(),
        donorMessage: donorMessage.trim() || undefined,
      };

      // Create payment intent or subscription
      const result = isRecurring
        ? await createSubscription(donationData)
        : await createDonation(donationData);

      // Confirm payment with Stripe
      const { error: paymentError, paymentIntent } = await confirmPayment(result.clientSecret, {
        paymentMethodType: 'Card',
      });

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      // Success!
      Alert.alert(
        'Success! 🎉',
        isRecurring
          ? `Thank you for setting up a ${frequency} donation of $${getDisplayAmount()}!`
          : `Thank you for your donation of $${getDisplayAmount()}!`,
        [
          {
            text: 'Done',
            onPress: () => {
              // Reset form
              setAmount('');
              setCustomAmount('');
              setDonorName('');
              setDonorEmail('');
              setDonorPhone('');
              setDonorMessage('');
              setIsRecurring(false);
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!settings) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Loading donation options...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {mosqueSettings?.name || 'Al Madina Masjid Yagoona'}
            </Text>
            <Text style={styles.headerSubtitle}>Support Your Masjid</Text>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            {/* Donation Type Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Donation Type</Text>
              {settings.donation_types
                .filter(type => type.enabled)
                .map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeCard,
                      selectedType === type.id && styles.typeCardSelected,
                    ]}
                    onPress={() => {
                      setSelectedType(type.id);
                      setSelectedTypeLabel(type.label);
                    }}
                  >
                    <View style={styles.typeCardContent}>
                      <View style={styles.typeCardLeft}>
                        <Ionicons
                          name={selectedType === type.id ? 'radio-button-on' : 'radio-button-off'}
                          size={24}
                          color={selectedType === type.id ? '#1e3a8a' : '#9ca3af'}
                        />
                        <View style={styles.typeTextContainer}>
                          <Text style={[
                            styles.typeLabel,
                            selectedType === type.id && styles.typeLabelSelected,
                          ]}>
                            {type.label}
                          </Text>
                          <Text style={styles.typeDescription}>{type.description}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>

            {/* Amount Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amount (AUD)</Text>
              <View style={styles.amountGrid}>
                {settings.preset_amounts.map(presetAmount => (
                  <TouchableOpacity
                    key={presetAmount}
                    style={[
                      styles.amountButton,
                      amount === presetAmount.toString() && styles.amountButtonSelected,
                    ]}
                    onPress={() => handlePresetAmount(presetAmount)}
                  >
                    <Text
                      style={[
                        styles.amountButtonText,
                        amount === presetAmount.toString() && styles.amountButtonTextSelected,
                      ]}
                    >
                      ${presetAmount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.customAmountInput}
                placeholder="Or enter custom amount"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={customAmount}
                onChangeText={handleCustomAmount}
              />
            </View>

            {/* Recurring Toggle */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.recurringToggle}
                onPress={() => setIsRecurring(!isRecurring)}
              >
                <View style={styles.recurringToggleLeft}>
                  <Ionicons
                    name={isRecurring ? 'checkbox' : 'square-outline'}
                    size={24}
                    color="#1e3a8a"
                  />
                  <Text style={styles.recurringLabel}>Make this a recurring donation</Text>
                </View>
              </TouchableOpacity>

              {isRecurring && (
                <View style={styles.frequencyContainer}>
                  {settings.recurring_frequencies
                    .filter(freq => freq.enabled)
                    .map(freq => (
                      <TouchableOpacity
                        key={freq.id}
                        style={[
                          styles.frequencyButton,
                          frequency === freq.id && styles.frequencyButtonSelected,
                        ]}
                        onPress={() => setFrequency(freq.id as any)}
                      >
                        <Text
                          style={[
                            styles.frequencyButtonText,
                            frequency === freq.id && styles.frequencyButtonTextSelected,
                          ]}
                        >
                          {freq.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </View>

            {/* Donor Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Information</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Full Name *"
                placeholderTextColor="#9ca3af"
                value={donorName}
                onChangeText={setDonorName}
                autoCapitalize="words"
              />

              <TextInput
                style={styles.input}
                placeholder="Email *"
                placeholderTextColor="#9ca3af"
                value={donorEmail}
                onChangeText={setDonorEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Phone (optional)"
                placeholderTextColor="#9ca3af"
                value={donorPhone}
                onChangeText={setDonorPhone}
                keyboardType="phone-pad"
              />

              <TextInput
                style={[styles.input, styles.messageInput]}
                placeholder="Message (optional)"
                placeholderTextColor="#9ca3af"
                value={donorMessage}
                onChangeText={setDonorMessage}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Payment Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Details</Text>
              <CardField
                postalCodeEnabled={false}
                cardStyle={styles.cardFieldCard}
                style={styles.cardField}
                onCardChange={(cardDetails) => {
                  setCardComplete(cardDetails.complete);
                }}
              />
            </View>

            {/* Donate Button */}
            <TouchableOpacity
              style={[
                styles.donateButton,
                (processing || !cardComplete) && styles.donateButtonDisabled,
              ]}
              onPress={handleDonate}
              disabled={processing || !cardComplete}
            >
              {processing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="heart" size={24} color="#fff" />
                  <Text style={styles.donateButtonText}>
                    Donate ${getDisplayAmount().toFixed(2)}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Security Note */}
            <View style={styles.securityNote}>
              <Ionicons name="shield-checkmark" size={20} color="#10b981" />
              <Text style={styles.securityText}>
                Secure payment powered by Stripe
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
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
  },
  typeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  typeCardSelected: {
    borderColor: '#1e3a8a',
    backgroundColor: '#eff6ff',
  },
  typeCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  typeLabelSelected: {
    color: '#1e3a8a',
  },
  typeDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  amountButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  amountButtonSelected: {
    borderColor: '#1e3a8a',
    backgroundColor: '#1e3a8a',
  },
  amountButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  amountButtonTextSelected: {
    color: '#fff',
  },
  customAmountInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  recurringToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recurringToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recurringLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  frequencyButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  frequencyButtonSelected: {
    borderColor: '#1e3a8a',
    backgroundColor: '#eff6ff',
  },
  frequencyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  frequencyButtonTextSelected: {
    color: '#1e3a8a',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  cardField: {
    height: 50,
  },
  cardFieldCard: {
  backgroundColor: '#FFFFFF',
  textColor: '#000000',
  borderWidth: 2,
  borderColor: '#e5e7eb',
  borderRadius: 12,
},
  donateButton: {
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  donateButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  donateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  securityText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
