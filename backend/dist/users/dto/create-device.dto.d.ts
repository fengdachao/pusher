import { DevicePlatform } from '../device.entity';
declare class WebPushSubscription {
    endpoint: string;
    p256dh: string;
    auth: string;
}
export declare class CreateDeviceDto {
    platform: DevicePlatform;
    token?: string;
    webPush?: WebPushSubscription;
}
export {};
