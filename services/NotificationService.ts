import notifee from '@notifee/react-native';
import { NOTIFICATION_CHANNELS, NotificationChannelId } from '../constants/notificationChannels';
import { NOTIFICATION_STYLES } from '../constants/notificationStyles';

export interface DisplayNotificationOptions {
  title: string;
  body: string;
  channelId?: NotificationChannelId;
  data?: Record<string, any>;
  largeIcon?: string;
}

class NotificationService {
  /**
   * Initialize all notification channels
   * Should be called once on app startup
   */
  async initializeChannels() {
    console.log('🔔 Creating notification channels...');
    
    try {
      // Create all defined channels
      for (const channel of Object.values(NOTIFICATION_CHANNELS)) {
        await notifee.createChannel({
          id: channel.id,
          name: channel.name,
          description: channel.description,
          importance: channel.importance,
          sound: channel.sound,
          vibrationPattern: channel.vibrationPattern,
        });
      }
      
      console.log('✅ Notification channels created');
    } catch (error) {
      console.error('❌ Error creating notification channels:', error);
      throw error;
    }
  }

  /**
   * Display a notification with proper styling
   */
  async displayNotification(options: DisplayNotificationOptions) {
    const {
      title,
      body,
      channelId = 'general',
      data,
      largeIcon,
    } = options;

    try {
      const styleConfig = NOTIFICATION_STYLES[channelId];

      const notification: any = {
        title,
        body,
        android: {
          channelId,
          importance: NOTIFICATION_CHANNELS[channelId].importance,
          color: styleConfig.color,
          smallIcon: styleConfig.smallIcon || 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
        data,
      };

      // Only add largeIcon if it exists
      const finalLargeIcon = largeIcon || styleConfig.largeIcon;
      if (finalLargeIcon) {
        notification.android.largeIcon = finalLargeIcon;
      }

      // Add BigText style if enabled
      if (styleConfig.useBigTextStyle) {
        notification.android.style = {
          type: 1, // AndroidStyle.BIGTEXT
          text: body,
        };
      }

      await notifee.displayNotification(notification);

      console.log(`✅ Notification displayed: ${title} (${channelId})`);
    } catch (error) {
      console.error('❌ Error displaying notification:', error);
      throw error;
    }
  }

  /**
   * Display a prayer time notification
   */
  async displayPrayerNotification(title: string, body: string, data?: Record<string, any>) {
    return this.displayNotification({
      title,
      body,
      channelId: 'prayer',
      data,
    });
  }

  /**
   * Display an event notification
   */
  async displayEventNotification(title: string, body: string, data?: Record<string, any>) {
    return this.displayNotification({
      title,
      body,
      channelId: 'events',
      data,
    });
  }

  /**
   * Display a campaign notification
   */
  async displayCampaignNotification(title: string, body: string, data?: Record<string, any>) {
    return this.displayNotification({
      title,
      body,
      channelId: 'campaigns',
      data,
    });
  }

  /**
   * Display an urgent notification
   */
  async displayUrgentNotification(title: string, body: string, data?: Record<string, any>) {
    return this.displayNotification({
      title,
      body,
      channelId: 'urgent',
      data,
    });
  }

  /**
   * Check if notifications are enabled
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
   * Open notification settings
   */
  async openSettings() {
    try {
      await notifee.openNotificationSettings();
    } catch (error) {
      console.error('Error opening notification settings:', error);
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      console.log('📱 Requesting notification permission...');
      
      const settings = await notifee.requestPermission();
      console.log('Permission settings:', settings);
      
      const isGranted = 
        settings.authorizationStatus === 1 || // Android granted
        settings.authorizationStatus >= 2;     // iOS authorized/provisional
      
      if (isGranted) {
        console.log('✅ Notification permission granted');
        await this.initializeChannels();
        return true;
      } else {
        console.log('⚠️ Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('❌ Error requesting permission:', error);
      return false;
    }
  }
}

export default new NotificationService();
