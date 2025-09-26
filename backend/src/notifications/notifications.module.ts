import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationSettings } from './notification-settings.entity';
import { EmailService } from './email.service';
import { WebPushService } from './webpush.service';
import { DigestService } from './digest.service';
import { User } from '../users/user.entity';
import { Device } from '../users/device.entity';
import { ArticlesModule } from '../articles/articles.module';
import { RankingModule } from '../ranking/ranking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationSettings, User, Device]),
    ArticlesModule,
    RankingModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    EmailService,
    WebPushService,
    DigestService,
  ],
  exports: [
    NotificationsService,
    EmailService,
    WebPushService,
    DigestService,
  ],
})
export class NotificationsModule {}