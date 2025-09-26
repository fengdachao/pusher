import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  data?: any;
}

@Injectable()
export class WebPushService {
  private readonly logger = new Logger(WebPushService.name);

  constructor(private configService: ConfigService) {
    this.initializeWebPush();
  }

  private initializeWebPush() {
    const vapidPublicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const vapidSubject = this.configService.get<string>('VAPID_SUBJECT');

    if (vapidPublicKey && vapidPrivateKey && vapidSubject) {
      webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
      this.logger.log('WebPush VAPID details configured');
    } else {
      this.logger.warn('WebPush VAPID configuration incomplete');
    }
  }

  /**
   * Send push notification to a subscription
   */
  async sendNotification(
    subscription: PushSubscription,
    notification: PushNotification
  ): Promise<void> {
    try {
      const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/icon-192x192.png',
        badge: notification.badge || '/badge-72x72.png',
        image: notification.image,
        data: {
          url: notification.url,
          ...notification.data,
        },
        actions: notification.url ? [
          {
            action: 'open',
            title: '查看详情',
          },
        ] : [],
      });

      await webpush.sendNotification(subscription, payload);
      this.logger.log(`Sent web push notification: ${notification.title}`);
    } catch (error) {
      this.logger.error('Failed to send web push notification:', error);
      throw error;
    }
  }

  /**
   * Send digest notification
   */
  async sendDigestNotification(
    subscription: PushSubscription,
    articleCount: number,
    digestType: 'morning' | 'evening' | 'breaking'
  ): Promise<void> {
    const typeLabel = digestType === 'morning' ? '晨报' : 
                     digestType === 'evening' ? '晚报' : '突发';
    
    const notification: PushNotification = {
      title: `📰 ${typeLabel}推送`,
      body: `为您精选了 ${articleCount} 条新闻资讯`,
      icon: '/icon-192x192.png',
      url: '/',
      data: {
        type: 'digest',
        digestType,
        articleCount,
      },
    };

    await this.sendNotification(subscription, notification);
  }

  /**
   * Send breaking news notification
   */
  async sendBreakingNewsNotification(
    subscription: PushSubscription,
    articleTitle: string,
    articleSummary: string,
    articleUrl: string
  ): Promise<void> {
    const notification: PushNotification = {
      title: '🚨 突发新闻',
      body: articleTitle,
      icon: '/icon-192x192.png',
      url: articleUrl,
      data: {
        type: 'breaking',
        articleTitle,
        articleSummary,
        articleUrl,
      },
    };

    await this.sendNotification(subscription, notification);
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(
    subscriptions: PushSubscription[],
    notification: PushNotification
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const promises = subscriptions.map(async (subscription) => {
      try {
        await this.sendNotification(subscription, notification);
        success++;
      } catch (error) {
        failed++;
        this.logger.warn(`Failed to send notification to subscription:`, error);
      }
    });

    await Promise.allSettled(promises);

    this.logger.log(`Bulk notification sent: ${success} success, ${failed} failed`);
    return { success, failed };
  }

  /**
   * Generate VAPID public key (for client-side subscription)
   */
  getVapidPublicKey(): string {
    return this.configService.get<string>('VAPID_PUBLIC_KEY', '');
  }

  /**
   * Validate push subscription
   */
  validateSubscription(subscription: any): boolean {
    return (
      subscription &&
      typeof subscription.endpoint === 'string' &&
      subscription.keys &&
      typeof subscription.keys.p256dh === 'string' &&
      typeof subscription.keys.auth === 'string'
    );
  }
}