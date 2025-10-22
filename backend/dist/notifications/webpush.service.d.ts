import { ConfigService } from '@nestjs/config';
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
export declare class WebPushService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    private initializeWebPush;
    sendNotification(subscription: PushSubscription, notification: PushNotification): Promise<void>;
    sendDigestNotification(subscription: PushSubscription, articleCount: number, digestType: 'morning' | 'evening' | 'breaking'): Promise<void>;
    sendBreakingNewsNotification(subscription: PushSubscription, articleTitle: string, articleSummary: string, articleUrl: string): Promise<void>;
    sendBulkNotifications(subscriptions: PushSubscription[], notification: PushNotification): Promise<{
        success: number;
        failed: number;
    }>;
    getVapidPublicKey(): string;
    validateSubscription(subscription: any): boolean;
}
