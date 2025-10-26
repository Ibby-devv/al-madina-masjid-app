import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
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
    await this.requestPermission();
    
    // 3. Get and save FCM token
    await this.registerToken();
    
    // 4. Listen for token refresh
    this.listenForTokenRefresh();
    
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
   * Request notification permission
   */
  private async requestPermission() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ Notification permission granted');
        return true;
      } else {
        console.log('❌ Notification permission denied');
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
      }, { merge: true }); // merge to not overwrite existing settings

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
   * Get current user ID
   */
  getUserId(): string | null {
    return auth().currentUser?.uid || null;
  }
}

export default new FCMService();