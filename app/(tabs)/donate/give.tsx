// ============================================================================
// DONATION SCREEN - SIMPLIFIED WITH PAYMENT SHEET + CAMPAIGNS
// ============================================================================

import React, { useState, useEffect } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStripe } from "@stripe/stripe-react-native";
import { Picker } from "@react-native-picker/picker";

// Import custom hooks
import { useFirebaseData } from "../../../hooks/useFirebaseData";
import { useDonation } from "../../../hooks/useDonation";
import { DonationFormData } from "../../../types/donation";
import { router } from "expo-router";
import { useCampaigns, Campaign } from "../../../hooks/useCampaigns";
import CampaignCard from "../../../components/CampaignCard";
import GeneralDonationCard from "../../../components/GeneralDonationCard";

export default function GiveTab(): React.JSX.Element {
  const { mosqueSettings } = useFirebaseData();
  const { campaigns, loading: campaignsLoading } = useCampaigns();
  const { settings, loading, error, createDonation, createSubscription } =
    useDonation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // Form state
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedTypeLabel, setSelectedTypeLabel] = useState<string>("");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<
    "weekly" | "fortnightly" | "monthly" | "yearly"
  >("monthly");

  // Donor info
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");

  // Processing state
  const [processing, setProcessing] = useState(false);

  // Initialize selected type
  useEffect(() => {
    if (settings && settings.donation_types.length > 0) {
      const firstEnabled = settings.donation_types.find((t) => t.enabled);
      if (firstEnabled) {
        setSelectedType(firstEnabled.id);
        setSelectedTypeLabel(firstEnabled.label);
      }
    }
  }, [settings]);

  const handlePresetAmount = (value: number) => {
    setAmount(value.toString());
    setCustomAmount("");
  };

  const handleCustomAmount = (text: string) => {
    setCustomAmount(text);
    setAmount("");
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
      Alert.alert("Error", "Please select a donation type");
      return false;
    }

    if (displayAmount < minAmount) {
      Alert.alert("Error", `Minimum donation is $${minAmount}`);
      return false;
    }

    if (!isAnonymous && !donorName.trim()) {
      Alert.alert("Error", "Please enter your name or select Anonymous");
      return false;
    }

    // Email required for recurring donations
    if (isRecurring && (!donorEmail.trim() || !donorEmail.includes("@"))) {
      Alert.alert(
        "Email Required",
        "A valid email address is required for recurring donations so you can manage your subscription."
      );
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
        donorName: isAnonymous ? "Anonymous" : donorName.trim(),
        donorEmail: donorEmail.trim() || "anonymous@donation.com",
        donorPhone: "",
        donorMessage: undefined,
        campaignId: selectedCampaign?.id || undefined,
      };

      // Create payment intent or subscription
      const result = isRecurring
        ? await createSubscription(donationData)
        : await createDonation(donationData);

      // Initialize Payment Sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: result.clientSecret,
        merchantDisplayName: mosqueSettings?.name || "Al Madina Masjid",
        applePay: {
          merchantCountryCode: "AU",
        },
        googlePay: {
          merchantCountryCode: "AU",
          testEnv: true, // Set to false in production
          currencyCode: "AUD",
        },
        defaultBillingDetails: {
          name: isAnonymous ? "Anonymous" : donorName.trim(),
          email: donorEmail.trim() || undefined,
        },
        returnURL: "almadina://payment-complete",
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // Present Payment Sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        // User cancelled or error occurred
        if (presentError.code !== "Canceled") {
          throw new Error(presentError.message);
        }
        setProcessing(false);
        return;
      }

      // Success!
      Alert.alert(
        "Success! 🎉",
        isRecurring
          ? `Thank you for setting up a ${frequency} donation of $${getDisplayAmount()}!`
          : `Thank you for your donation of $${getDisplayAmount()}!${
              selectedCampaign ? ` Your support for ${selectedCampaign.title} is greatly appreciated.` : ''
            }`,
        [
          {
            text: "Done",
            onPress: () => {
              // Reset form
              setAmount("");
              setCustomAmount("");
              setDonorName("");
              setDonorEmail("");
              setIsAnonymous(false);
              setIsRecurring(false);
              setShowDonationForm(false);
              setSelectedCampaign(null);
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCampaignPress = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowDonationForm(true);
  };

  const handleGeneralDonationPress = () => {
    setSelectedCampaign(null);
    setShowDonationForm(true);
  };

  const handleBackToCampaigns = () => {
    setShowDonationForm(false);
    setSelectedCampaign(null);
    // Reset form
    setAmount("");
    setCustomAmount("");
    setDonorName("");
    setDonorEmail("");
    setIsAnonymous(false);
    setIsRecurring(false);
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

  // Check if we should show campaigns view or donation form
  const shouldShowCampaigns = campaigns.length > 0 && !showDonationForm;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Content */}
          <View style={styles.contentContainer}>
            {/* Show Campaigns View */}
            {shouldShowCampaigns && (
              <>
                <Text style={styles.sectionTitle}>Support a Campaign</Text>
                
                {/* General Donation Card (always first) */}
                <GeneralDonationCard onPress={handleGeneralDonationPress} />

                {/* Campaign Cards */}
                {campaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onPress={() => handleCampaignPress(campaign)}
                  />
                ))}
              </>
            )}

            {/* Show Donation Form (original form) */}
            {(!shouldShowCampaigns || showDonationForm) && (
              <>
                {/* Back button if came from campaigns */}
                {showDonationForm && campaigns.length > 0 && (
                  <TouchableOpacity 
                    style={styles.backButton}
                    onPress={handleBackToCampaigns}
                  >
                    <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
                    <Text style={styles.backButtonText}>Back to Campaigns</Text>
                  </TouchableOpacity>
                )}

                {/* Show selected campaign info if applicable */}
                {selectedCampaign && (
                  <View style={styles.selectedCampaignBanner}>
                    <Ionicons name="heart" size={20} color="#1e3a8a" />
                    <Text style={styles.selectedCampaignText}>
                      Donating to: {selectedCampaign.title}
                    </Text>
                  </View>
                )}

                {/* Original donation form */}
                {/* Donation Type Dropdown */}
                <View style={styles.section}>
                  <Text style={styles.label}>Donation Type *</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={selectedType}
                      onValueChange={(value, index) => {
                        setSelectedType(value);
                        const type = settings.donation_types.find(
                          (t) => t.id === value
                        );
                        if (type) setSelectedTypeLabel(type.label);
                      }}
                      style={styles.picker}
                    >
                      {settings.donation_types
                        .filter((type) => type.enabled)
                        .map((type) => (
                          <Picker.Item
                            key={type.id}
                            label={type.label}
                            value={type.id}
                          />
                        ))}
                    </Picker>
                  </View>
                </View>

                {/* Amount Selection */}
                <View style={styles.section}>
                  <Text style={styles.label}>Amount (AUD) *</Text>
                  <View style={styles.amountGrid}>
                    {settings.preset_amounts.map((presetAmount) => (
                      <TouchableOpacity
                        key={presetAmount}
                        style={[
                          styles.amountButton,
                          amount === presetAmount.toString() &&
                            styles.amountButtonSelected,
                        ]}
                        onPress={() => handlePresetAmount(presetAmount)}
                      >
                        <Text
                          style={[
                            styles.amountButtonText,
                            amount === presetAmount.toString() &&
                              styles.amountButtonTextSelected,
                          ]}
                        >
                          ${presetAmount}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="Or enter custom amount"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    value={customAmount}
                    onChangeText={handleCustomAmount}
                  />
                </View>

                {/* Recurring Toggle */}
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => {
                    const newValue = !isRecurring;
                    setIsRecurring(newValue);
                    if (newValue && isAnonymous) {
                      setIsAnonymous(false); // Auto-uncheck anonymous
                    }
                  }}
                >
                  <Ionicons
                    name={isRecurring ? "checkbox" : "square-outline"}
                    size={24}
                    color="#1e3a8a"
                  />
                  <Text style={styles.checkboxLabel}>Make this recurring</Text>
                </TouchableOpacity>

                {isRecurring && (
                  <View style={styles.frequencyRow}>
                    {settings.recurring_frequencies
                      .filter((freq) => freq.enabled)
                      .map((freq) => (
                        <TouchableOpacity
                          key={freq.id}
                          style={[
                            styles.frequencyChip,
                            frequency === freq.id && styles.frequencyChipSelected,
                          ]}
                          onPress={() => setFrequency(freq.id as any)}
                        >
                          <Text
                            style={[
                              styles.frequencyChipText,
                              frequency === freq.id &&
                                styles.frequencyChipTextSelected,
                            ]}
                          >
                            {freq.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                )}

                {/* Anonymous Toggle */}
                <View style={styles.section}>
                  <TouchableOpacity
                    style={[
                      styles.checkboxRow,
                      isRecurring && styles.checkboxRowDisabled,
                    ]}
                    onPress={() => {
                      if (!isRecurring) {
                        setIsAnonymous(!isAnonymous);
                      }
                    }}
                    disabled={isRecurring}
                  >
                    <Ionicons
                      name={isAnonymous ? "checkbox" : "square-outline"}
                      size={24}
                      color="#1e3a8a"
                    />
                    <Text
                      style={[
                        styles.checkboxLabel,
                        isRecurring && styles.checkboxLabelDisabled,
                      ]}
                    >
                      Donate anonymously
                      {isRecurring && " (Not available for recurring)"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Donor Information */}
                {(!isAnonymous || isRecurring) && (
                  <View style={styles.section}>
                    <Text style={styles.label}>Your Information</Text>

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
                      placeholder={isRecurring ? "Email *" : "Email (optional)"}
                      placeholderTextColor="#9ca3af"
                      value={donorEmail}
                      onChangeText={setDonorEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />

                    {isRecurring && (
                      <View style={styles.infoBox}>
                        <Ionicons
                          name="information-circle"
                          size={20}
                          color="#1e3a8a"
                        />
                        <Text style={styles.infoText}>
                          Email required to manage your recurring donation
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Payment Methods Info */}
                <View style={styles.paymentMethodsInfo}>
                  <Text style={styles.paymentMethodsTitle}>We accept:</Text>
                  <View style={styles.paymentMethodsIcons}>
                    {Platform.OS === "ios" && (
                      <View style={styles.paymentMethodBadge}>
                        <Ionicons name="logo-apple" size={20} color="#000" />
                        <Text style={styles.paymentMethodText}>Apple Pay</Text>
                      </View>
                    )}
                    {Platform.OS === "android" && (
                      <View style={styles.paymentMethodBadge}>
                        <Ionicons name="logo-google" size={20} color="#4285F4" />
                        <Text style={styles.paymentMethodText}>Google Pay</Text>
                      </View>
                    )}
                    <View style={styles.paymentMethodBadge}>
                      <Ionicons name="card" size={20} color="#1e3a8a" />
                      <Text style={styles.paymentMethodText}>Card</Text>
                    </View>
                  </View>
                </View>

                {/* Donate Button */}
                <TouchableOpacity
                  style={[
                    styles.donateButton,
                    processing && styles.donateButtonDisabled,
                  ]}
                  onPress={handleDonate}
                  disabled={processing}
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
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 24,
    paddingBottom: 40,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  selectedCampaignBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#1e3a8a',
  },
  selectedCampaignText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  amountButton: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  amountButtonSelected: {
    borderColor: "#1e3a8a",
    backgroundColor: "#1e3a8a",
  },
  amountButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  amountButtonTextSelected: {
    color: "#fff",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1f2937",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    marginLeft: 12,
  },
  frequencyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
    paddingLeft: 36,
  },
  frequencyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  frequencyChipSelected: {
    backgroundColor: "#eff6ff",
    borderColor: "#1e3a8a",
  },
  frequencyChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  frequencyChipTextSelected: {
    color: "#1e3a8a",
  },
  paymentMethodsInfo: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  paymentMethodsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 12,
  },
  paymentMethodsIcons: {
    flexDirection: "row",
    gap: 12,
  },
  paymentMethodBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  paymentMethodText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
  },
  donateButton: {
    backgroundColor: "#1e3a8a",
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  donateButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0,
    elevation: 0,
  },
  donateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  securityText: {
    fontSize: 14,
    color: "#6b7280",
  },
  checkboxRowDisabled: {
    opacity: 0.5,
  },
  checkboxLabelDisabled: {
    color: "#9ca3af",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1e3a8a",
    lineHeight: 18,
  },
});
