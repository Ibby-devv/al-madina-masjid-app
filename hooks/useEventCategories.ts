// masjid-app/hooks/useEventCategories.ts

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { EventCategory, EventCategoriesConfig } from '../types';

interface UseEventCategoriesReturn {
  categories: EventCategory[];
  loading: boolean;
  error: string | null;
}

export const useEventCategories = (): UseEventCategoriesReturn => {
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      setError(null);
      
      // Real-time listener for event categories
      const categoriesRef = doc(db, 'eventCategories', 'default');
      
      unsubscribe = onSnapshot(
        categoriesRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data() as EventCategoriesConfig;
            
            if (data.categories) {
              // Filter active categories and sort by order
              const activeCategories = data.categories
                .filter((cat: EventCategory) => cat.is_active)
                .sort((a: EventCategory, b: EventCategory) => a.order - b.order);
              
              setCategories(activeCategories);
              console.log('Event categories loaded:', activeCategories.length);
            } else {
              // Fallback to default categories
              setCategories(getDefaultCategories());
            }
          } else {
            // Document doesn't exist, use defaults
            console.warn('⚠️ No event categories found in Firestore, using defaults');
            setCategories(getDefaultCategories());
          }
          
          setLoading(false);
        },
        (err) => {
          console.error('Error listening to event categories:', err);
          setError(err.message);
          setCategories(getDefaultCategories()); // Fallback on error
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Error setting up categories listener:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setCategories(getDefaultCategories());
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
        console.log('Unsubscribed from event categories listener');
      }
    };
  }, []);

  return {
    categories,
    loading,
    error,
  };
};

// Fallback default categories (same as admin dashboard)
const getDefaultCategories = (): EventCategory[] => [
  {
    id: 'lecture',
    label: 'Lectures',
    color_bg: '#dbeafe',
    color_text: '#1e40af',
    order: 1,
    is_active: true,
  },
  {
    id: 'community',
    label: 'Community Events',
    color_bg: '#fef3c7',
    color_text: '#92400e',
    order: 2,
    is_active: true,
  },
  {
    id: 'youth',
    label: 'Youth Programs',
    color_bg: '#fce7f3',
    color_text: '#9f1239',
    order: 3,
    is_active: true,
  },
  {
    id: 'women',
    label: "Women's Events",
    color_bg: '#f3e8ff',
    color_text: '#6b21a8',
    order: 4,
    is_active: true,
  },
  {
    id: 'education',
    label: 'Educational',
    color_bg: '#dcfce7',
    color_text: '#15803d',
    order: 5,
    is_active: true,
  },
  {
    id: 'charity',
    label: 'Charity & Fundraising',
    color_bg: '#fff7ed',
    color_text: '#c2410c',
    order: 6,
    is_active: true,
  },
];
