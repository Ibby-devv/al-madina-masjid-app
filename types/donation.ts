// ============================================================================
// DONATION TYPES
// Location: src/types/donation.ts
// ============================================================================

export interface DonationType {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface DonationSettings {
  donation_types: DonationType[];
  preset_amounts: number[];
  minimum_amount: number;
  recurring_frequencies: {
    id: string;
    label: string;
    enabled: boolean;
  }[];
  receipt_enabled: boolean;
  receipt_prefix: string;
}

export interface DonationFormData {
  amount: number;
  donationType: string;
  donationTypeLabel: string;
  isRecurring: boolean;
  frequency?: 'weekly' | 'fortnightly' | 'monthly' | 'yearly';
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorMessage?: string;
}

export interface Donation {
  id: string;
  receipt_number: string;
  donor_name: string;
  donor_email: string;
  amount: number;
  currency: string;
  donation_type_label: string;
  is_recurring: boolean;
  frequency?: string;
  status?: string
  payment_status: 'succeeded' | 'pending' | 'failed';
  date: string;
  created_at: any;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface SubscriptionResponse {
  clientSecret: string;
  subscriptionId: string;
  customerId: string;
}
