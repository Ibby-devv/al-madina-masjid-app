// masjid-app/hooks/useEvents.ts - UPDATED VERSION

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';
import { Event } from '../types';

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  upcomingEvents: Event[];
  pastEvents: Event[];
}

export const useEvents = (): UseEventsReturn => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: Unsubscribe;

    try {
      setError(null);

      // Get today's date in Sydney timezone (YYYY-MM-DD format)
      const getSydneyDate = (): string => {
        const sydneyDate = new Date().toLocaleString('en-AU', {
          timeZone: 'Australia/Sydney',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        // Convert DD/MM/YYYY to YYYY-MM-DD
        const [day, month, year] = sydneyDate.split('/');
        return `${year}-${month}-${day}`;
      };

      const today = getSydneyDate();
      console.log('Fetching events from date:', today);

      // Real-time listener for active upcoming events only
      const eventsRef = collection(db, 'events');
      const q = query(
        eventsRef,
        where('is_active', '==', true),
        where('date', '>=', today),  // ✅ NEW: Only fetch upcoming events
        orderBy('date', 'asc')
      );

      unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const loadedEvents: Event[] = [];
          querySnapshot.forEach((doc) => {
            loadedEvents.push({ id: doc.id, ...doc.data() } as Event);
          });
          
          setEvents(loadedEvents);
          setLoading(false);
          console.log('Upcoming events loaded:', loadedEvents.length);
        },
        (err) => {
          console.error('Error listening to events:', err);
          setError(err.message);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Error setting up events listener:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
        console.log('Unsubscribed from events listener');
      }
    };
  }, []);

  // Since we're only fetching upcoming events, upcomingEvents = events
  const upcomingEvents = events;
  
  // pastEvents will always be empty now (we don't fetch them)
  const pastEvents: Event[] = [];

  return {
    events,
    loading,
    error,
    upcomingEvents,
    pastEvents,
  };
};
