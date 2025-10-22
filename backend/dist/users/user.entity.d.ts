import { Device } from './device.entity';
import { Subscription } from '../subscriptions/subscription.entity';
import { Interaction } from '../articles/interaction.entity';
import { NotificationSettings } from '../notifications/notification-settings.entity';
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    name?: string;
    lang: string;
    region?: string;
    timezone: string;
    createdAt: Date;
    updatedAt: Date;
    devices: Device[];
    subscriptions: Subscription[];
    interactions: Interaction[];
    notificationSettings: NotificationSettings;
}
