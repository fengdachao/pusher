import { User } from './user.entity';
export declare enum DevicePlatform {
    IOS = "ios",
    ANDROID = "android",
    WEB = "web"
}
export declare class Device {
    id: string;
    userId: string;
    platform: DevicePlatform;
    pushToken?: string;
    webpushEndpoint?: string;
    webpushP256dh?: string;
    webpushAuth?: string;
    lastActiveAt?: Date;
    createdAt: Date;
    user: User;
}
