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

      // Real-time listener for active events, ordered by date
      const eventsRef = collection(db, 'events');
      const q = query(
        eventsRef,
        where('is_active', '==', true),
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
          console.log('Events updated from Firebase:', loadedEvents.length);
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

  // Separate events into upcoming and past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split('T')[0];

  const upcomingEvents = events.filter(event => event.date >= todayString);
  const pastEvents = events.filter(event => event.date < todayString);

  return {
    events,
    loading,
    error,
    upcomingEvents,
    pastEvents,
  };
};
