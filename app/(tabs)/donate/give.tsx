// ============================================================================
// DONATION SCREEN - SIMPLIFIED WITH PAYMENT SHEET + CAMPAIGNS
// ============================================================================

import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useStripe } from "@stripe/stripe-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import custom hooks
import CampaignCard from "../../../components/CampaignCard";
import GeneralDonationCard from "../../../components/GeneralDonationCard";
import { Theme } from "../../../constants/theme";
import { Campaign, useCampaigns } from "../../../hooks/useCampaigns";
import { useDonation } from "../../../hooks/useDonation";
import { useFirebaseData } from "../../../hooks/useFirebaseData";
import { DonationFormData } from "../../../types/donation";

export default function GiveTab(): React.JSX.Element {
  const { mosqueSettings } = useFirebaseData();
  const { campaigns, loading: campaignsLoading } = useCampaigns();
  const { settings, loading, error, createDonation, createSubscription } =
    useDonation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // Form state
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedTypeLabel, setSelectedTypeLabel] = useState<string>("");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
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
        returnURL: "alansar://payment-complete",
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
              selectedCampaign
                ? ` Your support for ${selectedCampaign.title} is greatly appreciated.`
                : ""
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
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.brand.navy[700]} />
          <Text style={styles.loadingText}>Loading donation options...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Check if we should show campaigns view or donation form
  const shouldShowCampaigns = campaigns.length > 0 && !showDonationForm;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
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
                  <View style={styles.backButtonContainer}>
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={handleBackToCampaigns}
                    >
                      <View style={styles.backButtonContent}>
                        <Ionicons name="arrow-back-circle" size={28} color={Theme.colors.brand.navy[700]} />
                        <View>
                          <Text style={styles.backButtonText}>Back to Campaigns</Text>
                          <Text style={styles.backButtonSubtext}>Choose a different cause</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Show selected campaign info if applicable */}
                {selectedCampaign && (
                  <View style={styles.selectedCampaignBanner}>
                    <View style={styles.campaignBannerIcon}>
                      <Ionicons name="heart" size={20} color={Theme.colors.brand.navy[700]} />
                    </View>
                    <View style={styles.campaignBannerText}>
                      <Text style={styles.campaignBannerLabel}>Donating to</Text>
                      <Text style={styles.selectedCampaignText}>
                        {selectedCampaign.title}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Original donation form */}
                {/* Donation Type Dropdown */}
                {!selectedCampaign && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="list" size={20} color={Theme.colors.brand.navy[700]} />
                      <Text style={styles.label}>Donation Type *</Text>
                    </View>
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
                )}

                {/* Amount Selection */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="cash" size={20} color={Theme.colors.brand.gold[600]} />
                    <Text style={styles.label}>Amount (AUD) *</Text>
                  </View>
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
                    placeholderTextColor={Theme.colors.text.muted}
                    keyboardType="numeric"
                    value={customAmount}
                    onChangeText={handleCustomAmount}
                  />
                </View>

                {/* Recurring Toggle */}
                <View style={styles.recurringSection}>
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
                      color={Theme.colors.brand.navy[700]}
                    />
                    <View style={styles.recurringLabelContainer}>
                      <Text style={styles.checkboxLabel}>Make this recurring</Text>
                      <Text style={styles.recurringSubtext}>Support us every month</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Inline Frequency Chips */}
                  {isRecurring && (
                    <View style={styles.frequencyRowInline}>
                      {settings.recurring_frequencies
                        .filter((freq) => freq.enabled)
                        .map((freq) => (
                          <TouchableOpacity
                            key={freq.id}
                            style={[
                              styles.frequencyChipCompact,
                              frequency === freq.id &&
                                styles.frequencyChipSelected,
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
                </View>

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
                      color={Theme.colors.brand.navy[700]}
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
                    <View style={styles.sectionHeader}>
                      <Ionicons name="person" size={20} color={Theme.colors.brand.navy[700]} />
                      <Text style={styles.label}>Your Information</Text>
                    </View>

                    <TextInput
                      style={styles.input}
                      placeholder="Full Name *"
                      placeholderTextColor={Theme.colors.text.muted}
                      value={donorName}
                      onChangeText={setDonorName}
                      autoCapitalize="words"
                    />

                    <TextInput
                      style={styles.input}
                      placeholder={isRecurring ? "Email *" : "Email (optional)"}
                      placeholderTextColor={Theme.colors.text.muted}
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
                          color={Theme.colors.brand.navy[700]}
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
                        <Ionicons
                          name="logo-google"
                          size={20}
                          color="#4285F4"
                        />
                        <Text style={styles.paymentMethodText}>Google Pay</Text>
                      </View>
                    )}
                    <View style={styles.paymentMethodBadge}>
                      <Ionicons name="card" size={20} color={Theme.colors.brand.navy[700]} />
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
                  <Ionicons name="shield-checkmark" size={20} color={Theme.colors.accent.green} />
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
    backgroundColor: Theme.colors.surface.muted,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.surface.muted,
  },
  loadingText: {
    marginTop: Theme.spacing.lg,
    fontSize: Theme.spacing.lg,
    color: Theme.colors.text.muted,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Theme.spacing.xxl,
    paddingBottom: 40,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: Theme.colors.surface.muted,
    padding: Theme.spacing.xl,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Theme.colors.text.strong,
    marginBottom: Theme.spacing.xl,
  },
  backButtonContainer: {
    marginBottom: Theme.spacing.xxl,
  },
  backButton: {
    backgroundColor: Theme.colors.surface.base,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.lg,
    ...Theme.shadow.soft,
  },
  backButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
  },
  backButtonText: {
    fontSize: Theme.spacing.lg,
    fontWeight: "700",
    color: Theme.colors.brand.navy[700],
  },
  backButtonSubtext: {
    fontSize: Theme.typography.small,
    color: Theme.colors.text.muted,
    marginTop: 2,
  },
  selectedCampaignBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    backgroundColor: Theme.colors.accent.amberSoft,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.md,
    marginBottom: Theme.spacing.xxl,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.brand.gold[600],
    ...Theme.shadow.soft,
  },
  campaignBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surface.base,
    alignItems: "center",
    justifyContent: "center",
  },
  campaignBannerText: {
    flex: 1,
  },
  campaignBannerLabel: {
    fontSize: Theme.typography.small,
    color: Theme.colors.text.muted,
    marginBottom: 2,
  },
  selectedCampaignText: {
    fontSize: Theme.spacing.lg,
    fontWeight: "700",
    color: Theme.colors.brand.gold[600],
  },
  section: {
    marginBottom: Theme.spacing.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  label: {
    fontSize: Theme.spacing.lg,
    fontWeight: "600",
    color: Theme.colors.text.strong,
  },
  pickerContainer: {
    backgroundColor: Theme.colors.surface.base,
    borderRadius: Theme.radius.md,
    borderWidth: 2,
    borderColor: Theme.colors.border.base,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  amountButton: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: Theme.colors.surface.base,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.lg,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Theme.colors.border.base,
  },
  amountButtonSelected: {
    borderColor: Theme.colors.brand.navy[700],
    backgroundColor: Theme.colors.brand.navy[700],
  },
  amountButtonText: {
    fontSize: Theme.typography.h3,
    fontWeight: "bold",
    color: Theme.colors.text.strong,
  },
  amountButtonTextSelected: {
    color: Theme.colors.text.inverse,
  },
  input: {
    backgroundColor: Theme.colors.surface.base,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.lg,
    fontSize: Theme.spacing.lg,
    color: Theme.colors.text.strong,
    marginBottom: Theme.spacing.md,
    borderWidth: 2,
    borderColor: Theme.colors.border.base,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.lg,
  },
  recurringSection: {
    backgroundColor: Theme.colors.surface.base,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    ...Theme.shadow.soft,
  },
  recurringLabelContainer: {
    flex: 1,
  },
  recurringSubtext: {
    fontSize: Theme.typography.small,
    color: Theme.colors.text.muted,
    marginTop: 2,
  },
  checkboxLabel: {
    fontSize: Theme.spacing.lg,
    fontWeight: "500",
    color: Theme.colors.text.strong,
    marginLeft: Theme.spacing.md,
  },
  frequencyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: Theme.spacing.xl,
    paddingLeft: 36,
  },
  frequencyChip: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.pill,
    backgroundColor: Theme.colors.surface.base,
    borderWidth: 2,
    borderColor: Theme.colors.border.base,
  },
  frequencyChipSelected: {
    backgroundColor: Theme.colors.accent.blueSoft,
    borderColor: Theme.colors.brand.navy[700],
  },
  frequencyChipText: {
    fontSize: Theme.typography.body,
    fontWeight: "600",
    color: Theme.colors.text.muted,
  },
  frequencyChipTextSelected: {
    color: Theme.colors.brand.navy[700],
  },
  paymentMethodsInfo: {
    backgroundColor: Theme.colors.surface.base,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  paymentMethodsTitle: {
    fontSize: Theme.typography.body,
    fontWeight: "600",
    color: Theme.colors.text.muted,
    marginBottom: Theme.spacing.md,
  },
  paymentMethodsIcons: {
    flexDirection: "row",
    gap: Theme.spacing.md,
  },
  paymentMethodBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.surface.soft,
    borderRadius: Theme.radius.sm,
  },
  paymentMethodText: {
    fontSize: 13,
    fontWeight: "600",
    color: Theme.colors.text.strong,
  },
  donateButton: {
    backgroundColor: Theme.colors.brand.navy[700],
    borderRadius: Theme.radius.md,
    padding: Theme.typography.h3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Theme.spacing.md,
    ...Theme.shadow.header,
  },
  donateButtonDisabled: {
    backgroundColor: Theme.colors.text.muted,
    shadowOpacity: 0,
    elevation: 0,
  },
  donateButtonText: {
    color: Theme.colors.text.inverse,
    fontSize: Theme.typography.h3,
    fontWeight: "bold",
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.lg,
  },
  securityText: {
    fontSize: Theme.typography.body,
    color: Theme.colors.text.muted,
  },
  checkboxRowDisabled: {
    opacity: 0.5,
  },
  checkboxLabelDisabled: {
    color: Theme.colors.text.muted,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.accent.blueSoft,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.sm,
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Theme.colors.brand.navy[700],
    lineHeight: 18,
  },
});
