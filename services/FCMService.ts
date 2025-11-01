import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { db } from '../firebase';

class FCMService {
  /**
   * Initialize FCM - Call on app startup
   */
  async initialize() {
    console.log('🔔 Initializing FCM Service...');
    
    // 1. Sign in anonymously
    await this.signInAnonymously();
    
    // 2. Request notification permission
    const permissionGranted = await this.requestPermission();
    
    if (permissionGranted) {
      // 3. Get and save FCM token
      await this.registerToken();
      
      // 4. Listen for token refresh
      this.listenForTokenRefresh();
      
      // 5. Setup foreground notification handler
      this.setupForegroundHandler();
    } else {
      console.log('⚠️ Notifications disabled - user denied permission');
    }
    
    console.log('✅ FCM Service initialized');
  }

  /**
   * Sign in user anonymously
   */
  private async signInAnonymously() {
    try {
      const user = auth().currentUser;
      
      if (user) {
        console.log('✅ Already signed in:', user.uid);
        return user.uid;
      }
      
      const userCredential = await auth().signInAnonymously();
      console.log('✅ Signed in anonymously:', userCredential.user.uid);
      return userCredential.user.uid;
    } catch (error) {
      console.error('❌ Error signing in anonymously:', error);
      throw error;
    }
  }

  /**
   * Request notification permission (fixed for Android)
   */
  private async requestPermission(): Promise<boolean> {
    try {
      console.log('📱 Requesting notification permission...');
      
      const settings = await notifee.requestPermission();
      console.log('Permission settings:', settings);
      
      // On Android: authorizationStatus 1 = GRANTED
      // On iOS: authorizationStatus 2 = AUTHORIZED, 3 = PROVISIONAL
      const isGranted = 
        settings.authorizationStatus === 1 || // Android granted
        settings.authorizationStatus >= 2;     // iOS authorized/provisional
      
      if (isGranted) {
        console.log('✅ Notification permission granted');
        
        // Create notification channel for Android
        await notifee.createChannel({
          id: 'default',
          name: 'Al-Ansar Notifications',
          importance: AndroidImportance.HIGH,
          description: 'Notifications for events, campaigns, and prayer times',
        });
        
        console.log('✅ Notification channel created');
        return true;
      } else {
        console.log('⚠️ Notification permission denied');
        console.log('User can enable notifications later in Settings screen');
        return false;
      }
    } catch (error) {
      console.error('❌ Error requesting permission:', error);
      return false;
    }
  }

  /**
   * Get FCM token and save to Firestore
   */
  private async registerToken() {
    try {
      const uid = auth().currentUser?.uid;
      if (!uid) {
        console.error('❌ No user ID available');
        return;
      }

      const token = await messaging().getToken();
      console.log('📱 FCM Token:', token);

      // Save to Firestore
      await db.collection('users').doc(uid).set({
        fcmToken: token,
        notificationsEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, { merge: true });

      console.log('✅ FCM token saved to Firestore');
    } catch (error) {
      console.error('❌ Error registering token:', error);
    }
  }

  /**
   * Listen for token refresh
   */
  private listenForTokenRefresh() {
    messaging().onTokenRefresh(async (newToken) => {
      console.log('🔄 FCM token refreshed:', newToken);
      
      const uid = auth().currentUser?.uid;
      if (uid) {
        await db.collection('users').doc(uid).update({
          fcmToken: newToken,
          updatedAt: new Date(),
        });
        console.log('✅ New token saved');
      }
    });
  }

  /**
   * Setup foreground notification handler
   * This displays notifications when app is open
   */
  private setupForegroundHandler() {
    messaging().onMessage(async (remoteMessage) => {
      console.log('📬 Foreground notification received:', remoteMessage);
      
      // Display notification using Notifee when app is in foreground
      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'Al-Ansar Masjid',
        body: remoteMessage.notification?.body || '',
        android: {
          channelId: 'default',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
        },
        data: remoteMessage.data,
      });
    });

    console.log('✅ Foreground notification handler setup');
  }

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    return auth().currentUser?.uid || null;
  }

  /**
   * Check if notifications are enabled (permission granted)
   */
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const settings = await notifee.getNotificationSettings();
      return settings.authorizationStatus === 1 || settings.authorizationStatus >= 2;
    } catch (error) {
      console.error('Error checking notification settings:', error);
      return false;
    }
  }

  /**
   * Open notification settings (for when user needs to manually enable)
   */
  async openSettings() {
    try {
      await notifee.openNotificationSettings();
    } catch (error) {
      console.error('Error opening notification settings:', error);
    }
  }
}

export default new FCMService();
