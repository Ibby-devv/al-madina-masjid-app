import { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';

export function useAuth() {
  const [user, setUser] = useState(auth().currentUser);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!initializing && !user) {
      auth().signInAnonymously()
        .then(() => console.log('✅ Anonymous sign in successful'))
        .catch(err => console.error('❌ Anonymous sign in failed:', err));
    }
  }, [initializing, user]);

  return {
    user,
    initializing,
    isAuthenticated: !!user,
    userId: user?.uid,
  };
}