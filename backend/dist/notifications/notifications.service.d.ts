import { Repository } from 'typeorm';
import { NotificationSettings } from './notification-settings.entity';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
export declare class NotificationsService {
    private notificationSettingsRepository;
    constructor(notificationSettingsRepository: Repository<NotificationSettings>);
    getSettings(userId: string): Promise<NotificationSettings>;
    updateSettings(userId: string, updateDto: UpdateNotificationSettingsDto): Promise<NotificationSettings>;
}
