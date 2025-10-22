import { NotificationsService } from './notifications.service';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { DigestService } from './digest.service';
import { WebPushService } from './webpush.service';
export declare class NotificationsController {
    private notificationsService;
    private digestService;
    private webPushService;
    constructor(notificationsService: NotificationsService, digestService: DigestService, webPushService: WebPushService);
    getSettings(req: any): Promise<import("./notification-settings.entity").NotificationSettings>;
    updateSettings(req: any, updateDto: UpdateNotificationSettingsDto): Promise<import("./notification-settings.entity").NotificationSettings>;
    triggerDigest(req: any, body: {
        type?: 'morning' | 'evening' | 'manual';
    }): Promise<{
        message: string;
    }>;
    getVapidPublicKey(): {
        publicKey: string;
    };
}
