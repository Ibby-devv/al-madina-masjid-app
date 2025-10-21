import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db, functions } from "../../../firebase";
import { httpsCallable } from "firebase/functions";
import { Donation } from "../../../types/donation";

type DonationType = "one-time" | "recurring";


export default function HistoryTab() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [subscriptions, setSubscriptions] = useState<Donation[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<DonationType>("one-time");

  const loadDonations = async () => {
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    setHasLoaded(false);

    try {
      const getUserDonations = httpsCallable(functions, "getUserDonations");
      const result = await getUserDonations({ email: email.trim() });
      const data = result.data as any;

      setDonations(data.donations || []);
      setSubscriptions(data.subscriptions || []);
      setHasLoaded(true);

      if (data.donations.length === 0 && data.subscriptions.length === 0) {
        Alert.alert(
          "No Donations Found",
          "No donations found for this email address."
        );
      }
    } catch (error: any) {
      console.error("Error loading donations:", error);
      Alert.alert("Error", "Failed to load donations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";

    try {
      let date: Date;

      // Handle Firestore Timestamp
      if (timestamp.toDate && typeof timestamp.toDate === "function") {
        date = timestamp.toDate();
      }
      // Handle seconds/nanoseconds object
      else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      }
      // Handle ISO string or number
      else {
        date = new Date(timestamp);
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "N/A";
      }

      return date.toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error, timestamp);
      return "N/A";
    }
  };

  const formatCurrency = (amount: number) => {
    // Stripe stores amounts in cents, divide by 100
    const dollars = amount / 100;
    return `$${dollars.toFixed(2)}`;
  };

  const renderDonation = (donation: Donation) => (
    <View key={donation.id} style={styles.donationCard}>
      <View style={styles.donationHeader}>
        <View style={styles.donationIcon}>
          <Ionicons name="heart" size={24} color="#1e3a8a" />
        </View>
        <View style={styles.donationInfo}>
          <Text style={styles.donationType}>
            {donation.donation_type_label || "General Donation"}
          </Text>
          <Text style={styles.donationDate}>
           {donation.date || formatDate(donation.created_at)}
          </Text>
        </View>
        <Text style={styles.donationAmount}>
          {formatCurrency(donation.amount)}
        </Text>
      </View>

      {donation.receipt_number && (
        <View style={styles.receiptRow}>
          <Ionicons name="document-text-outline" size={16} color="#6b7280" />
          <Text style={styles.receiptText}>
            Receipt: {donation.receipt_number}
          </Text>
        </View>
      )}
    </View>
  );

  const renderSubscription = (subscription: Donation) => (
    <View key={subscription.id} style={styles.donationCard}>
      <View style={styles.donationHeader}>
        <View style={[styles.donationIcon, styles.recurringIcon]}>
          <Ionicons name="refresh" size={24} color="#059669" />
        </View>
        <View style={styles.donationInfo}>
          <Text style={styles.donationType}>
            {subscription.donation_type_label || "General Donation"}
          </Text>
          <Text style={styles.donationDate}>
            {subscription.frequency || "Monthly"} •{" "}
            {subscription.status || "Active"}
          </Text>
        </View>
        <Text style={styles.donationAmount}>
          {formatCurrency(subscription.amount)}
        </Text>
      </View>

      <View style={styles.subscriptionBadge}>
        <Text style={styles.subscriptionBadgeText}>💚 Recurring Donation</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Email Input Section */}
        {!hasLoaded && (
          <View style={styles.inputSection}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color="#1e3a8a" />
              <Text style={styles.infoText}>
                Enter your email address to view your donation history
              </Text>
            </View>

            <Text style={styles.label}>Email Address</Text>
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

            <TouchableOpacity
              style={[styles.loadButton, loading && styles.loadButtonDisabled]}
              onPress={loadDonations}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="search" size={20} color="#fff" />
                  <Text style={styles.loadButtonText}>Load Donations</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Results Section */}
        {hasLoaded && (
          <>
            {/* Email Display & Change Button */}
            <View style={styles.emailDisplay}>
              <View style={styles.emailInfo}>
                <Ionicons name="mail" size={20} color="#6b7280" />
                <Text style={styles.emailText}>{email}</Text>
              </View>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={() => {
                  setHasLoaded(false);
                  setDonations([]);
                  setSubscriptions([]);
                }}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabSwitcher}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "one-time" && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab("one-time")}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === "one-time" && styles.tabButtonTextActive,
                  ]}
                >
                  One-Time ({donations.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "recurring" && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab("recurring")}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === "recurring" && styles.tabButtonTextActive,
                  ]}
                >
                  Recurring ({subscriptions.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Donations List */}
            <View style={styles.donationsList}>
              {activeTab === "one-time" &&
                (donations.length > 0 ? (
                  donations.map(renderDonation)
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="heart-outline" size={48} color="#d1d5db" />
                    <Text style={styles.emptyText}>
                      No one-time donations found
                    </Text>
                  </View>
                ))}

              {activeTab === "recurring" &&
                (subscriptions.length > 0 ? (
                  subscriptions.map(renderSubscription)
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons
                      name="refresh-outline"
                      size={48}
                      color="#d1d5db"
                    />
                    <Text style={styles.emptyText}>
                      No recurring donations found
                    </Text>
                  </View>
                ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputSection: {
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1e3a8a",
    lineHeight: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1f2937",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    marginBottom: 16,
  },
  loadButton: {
    backgroundColor: "#1e3a8a",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  loadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emailDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  emailInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  emailText: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#eff6ff",
    borderRadius: 6,
  },
  changeButtonText: {
    color: "#1e3a8a",
    fontSize: 14,
    fontWeight: "600",
  },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: "#1e3a8a",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  tabButtonTextActive: {
    color: "#fff",
  },
  donationsList: {
    gap: 12,
  },
  donationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  donationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  donationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  recurringIcon: {
    backgroundColor: "#d1fae5",
  },
  donationInfo: {
    flex: 1,
  },
  donationType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  donationDate: {
    fontSize: 14,
    color: "#6b7280",
  },
  donationAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e3a8a",
  },
  receiptRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  receiptText: {
    fontSize: 13,
    color: "#6b7280",
  },
  subscriptionBadge: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  subscriptionBadgeText: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
    marginTop: 12,
  },
});
