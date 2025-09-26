import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationSettings } from './notification-settings.entity';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationSettings)
    private notificationSettingsRepository: Repository<NotificationSettings>,
  ) {}

  async getSettings(userId: string): Promise<NotificationSettings> {
    let settings = await this.notificationSettingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      // Create default settings
      settings = this.notificationSettingsRepository.create({ userId });
      settings = await this.notificationSettingsRepository.save(settings);
    }

    return settings;
  }

  async updateSettings(userId: string, updateDto: UpdateNotificationSettingsDto): Promise<NotificationSettings> {
    let settings = await this.notificationSettingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      settings = this.notificationSettingsRepository.create({ userId, ...updateDto });
    } else {
      Object.assign(settings, updateDto);
    }

    return this.notificationSettingsRepository.save(settings);
  }
}