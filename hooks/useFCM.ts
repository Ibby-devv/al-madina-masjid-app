import { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';


export function useFCM(userId: string | undefined) {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    requestPermissionAndGetToken();
  }, [userId]);

  const requestPermissionAndGetToken = async () => {
    try {
      // Request notification permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('❌ Notification permission denied');
        return;
      }

      console.log('✅ Notification permission granted');

      // Get FCM token
      const token = await messaging().getToken();
      console.log('📱 FCM Token:', token);
      setFcmToken(token);

      // Save token to Firestore
      if (userId) {
        await firestore()
          .collection('users')
          .doc(userId)
          .set(
            {
              fcmToken: token,
              updatedAt: firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        console.log('✅ FCM token saved to Firestore');
      }

      // Listen for token refresh
      const unsubscribe = messaging().onTokenRefresh(async (newToken) => {
        console.log('🔄 FCM token refreshed:', newToken);
        setFcmToken(newToken);
        
        if (userId) {
          await firestore()
            .collection('users')
            .doc(userId)
            .update({ fcmToken: newToken });
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
    }
  };

  return { fcmToken };
}