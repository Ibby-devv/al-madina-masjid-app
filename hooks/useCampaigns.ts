// ============================================================================
// HOOK: useCampaigns
// Location: hooks/useCampaigns.ts
// Fetches active campaigns from Firestore - React Native Firebase version
// ============================================================================

import { useState, useEffect } from 'react';
import { db } from '../firebase';

export interface Campaign {
  id: string;
  title: string;
  description: string;
  goal_amount: number; // in cents
  current_amount: number; // in cents
  currency: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'paused';
  image_url?: string;
  is_visible_in_app: boolean;
  created_at: any;
  updated_at: any;
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      // Query active campaigns that are visible in app
      const querySnapshot = await db
        .collection('campaigns')
        .where('status', '==', 'active')
        .where('is_visible_in_app', '==', true)
        .orderBy('created_at', 'desc')
        .get();
      
      const loadedCampaigns: Campaign[] = [];
      querySnapshot.forEach((doc) => {
        loadedCampaigns.push({ id: doc.id, ...doc.data() } as Campaign);
      });

      setCampaigns(loadedCampaigns);
      console.log('✅ Campaigns loaded:', loadedCampaigns.length);
    } catch (err: any) {
      console.error('❌ Error loading campaigns:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { campaigns, loading, error, refetch: loadCampaigns };
}
