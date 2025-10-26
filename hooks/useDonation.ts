// ============================================================================
// DONATION HOOK - React Native Firebase version
// Location: src/hooks/useDonation.ts
// ============================================================================

import { useState, useEffect } from 'react';
import { db, regionalFunctions } from '../firebase';
import { 
  DonationSettings, 
  DonationFormData, 
  PaymentIntentResponse, 
  SubscriptionResponse,
  Donation 
} from '../types/donation';

export const useDonation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<DonationSettings | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);

  // Get regional functions instance
  const functions = regionalFunctions;

  // Load donation settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsDoc = await db
        .collection('donationSettings')
        .doc('config')
        .get();
      
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as DonationSettings);
        console.log('✅ Donation settings loaded');
      } else {
        console.error('❌ Donation settings not found in Firestore');
      }
    } catch (err: any) {
      console.error('❌ Error loading donation settings:', err);
      setError(err.message);
    }
  };

  // Create one-time donation
  const createDonation = async (data: DonationFormData): Promise<PaymentIntentResponse> => {
    setLoading(true);
    setError(null);

    try {
      console.log('📤 Creating payment intent...');
      
      const createPaymentIntent = functions.httpsCallable('createPaymentIntent');

      const payload = {
        amount: Math.round(data.amount * 100), // Convert to cents
        donor_name: data.donorName,
        donor_email: data.donorEmail,
        donor_phone: data.donorPhone,
        donation_type_id: data.donationType,
        donation_type_label: data.donationTypeLabel,
        campaign_id: data.campaignId || "",
        donor_message: data.donorMessage,
      };

      console.log('📦 Payload:', payload);

      const result = await createPaymentIntent(payload);

      console.log('✅ Payment intent created:', result.data.paymentIntentId);
      
      setLoading(false);
      return result.data as PaymentIntentResponse;
    } catch (err: any) {
      console.error('❌ Error creating payment intent:');
      console.error('   Code:', err.code);
      console.error('   Message:', err.message);
      console.error('   Details:', err.details);
      
      setLoading(false);
      
      // Better error messages
      let errorMessage = 'Failed to create donation';
      
      if (err.code === 'functions/unauthenticated') {
        errorMessage = 'Authentication required';
      } else if (err.code === 'functions/permission-denied') {
        errorMessage = 'Permission denied';
      } else if (err.code === 'functions/not-found') {
        errorMessage = 'Payment service not available';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Create recurring donation
  const createSubscription = async (data: DonationFormData): Promise<SubscriptionResponse> => {
    setLoading(true);
    setError(null);

    try {
      if (!data.frequency) {
        throw new Error('Frequency is required for recurring donations');
      }

      console.log('📤 Creating subscription...');

      const createSubscriptionFunc = functions.httpsCallable('createSubscription');

      const payload = {
        amount: Math.round(data.amount * 100), // Convert to cents
        frequency: data.frequency,
        donor_name: data.donorName,
        donor_email: data.donorEmail,
        donor_phone: data.donorPhone,
        donation_type_id: data.donationType,
        donation_type_label: data.donationTypeLabel,
        campaign_id: data.campaignId || ""
      };

      console.log('📦 Payload:', payload);

      const result = await createSubscriptionFunc(payload);

      console.log('✅ Subscription created:', result.data.subscriptionId);

      setLoading(false);
      return result.data as SubscriptionResponse;
    } catch (err: any) {
      console.error('❌ Error creating subscription:');
      console.error('   Code:', err.code);
      console.error('   Message:', err.message);
      console.error('   Details:', err.details);
      
      setLoading(false);
      
      // Better error messages
      let errorMessage = 'Failed to create subscription';
      
      if (err.code === 'functions/unauthenticated') {
        errorMessage = 'Authentication required';
      } else if (err.code === 'functions/permission-denied') {
        errorMessage = 'Permission denied';
      } else if (err.code === 'functions/not-found') {
        errorMessage = 'Subscription service not available';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Load user's donations (if authenticated)
  const loadUserDonations = async (email: string) => {
    try {
      const snapshot = await db
        .collection('donations')
        .where('donor_email', '==', email)
        .orderBy('created_at', 'desc')
        .get();

      const userDonations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Donation[];

      setDonations(userDonations);
    } catch (err: any) {
      console.error('❌ Error loading donations:', err);
    }
  };

  // Subscribe to real-time donation updates
  const subscribeToDonations = (email: string) => {
    return db
      .collection('donations')
      .where('donor_email', '==', email)
      .orderBy('created_at', 'desc')
      .onSnapshot((snapshot) => {
        const userDonations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Donation[];

        setDonations(userDonations);
      });
  };

  return {
    loading,
    error,
    settings,
    donations,
    createDonation,
    createSubscription,
    loadUserDonations,
    subscribeToDonations,
  };
};
