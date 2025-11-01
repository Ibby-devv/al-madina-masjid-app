import { NotificationChannelId } from './notificationChannels';

export interface NotificationStyleConfig {
  color: string;
  smallIcon?: string;
  largeIcon?: string;
  useBigTextStyle?: boolean;
}

// App color theme - adjust to match your branding
export const NOTIFICATION_COLORS = {
  primary: '#1e3a8a', // Deep blue
  prayer: '#059669',  // Green
  event: '#7c3aed',   // Purple
  campaign: '#dc2626', // Red
  general: '#0284c7', // Sky blue
  urgent: '#ea580c',  // Orange
} as const;

export const NOTIFICATION_STYLES: Record<NotificationChannelId, NotificationStyleConfig> = {
  prayer: {
    color: NOTIFICATION_COLORS.prayer,
    smallIcon: 'ic_notification', // Will need to add this icon
    useBigTextStyle: true,
  },
  events: {
    color: NOTIFICATION_COLORS.event,
    smallIcon: 'ic_notification',
    useBigTextStyle: true,
  },
  campaigns: {
    color: NOTIFICATION_COLORS.campaign,
    smallIcon: 'ic_notification',
    useBigTextStyle: true,
  },
  general: {
    color: NOTIFICATION_COLORS.general,
    smallIcon: 'ic_notification',
    useBigTextStyle: true,
  },
  urgent: {
    color: NOTIFICATION_COLORS.urgent,
    smallIcon: 'ic_notification',
    useBigTextStyle: true,
  },
};
