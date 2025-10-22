import { User } from '../users/user.entity';
export declare class NotificationSettings {
    userId: string;
    morningTime: string;
    eveningTime: string;
    channelEmail: boolean;
    channelPush: boolean;
    channelWebpush: boolean;
    breakingEnabled: boolean;
    maxItemsPerDigest: number;
    muteStart?: string;
    muteEnd?: string;
    updatedAt: Date;
    user: User;
}
