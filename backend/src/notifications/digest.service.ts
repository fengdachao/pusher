import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { NotificationSettings } from './notification-settings.entity';
import { ArticlesService } from '../articles/articles.service';
import { RankingService } from '../ranking/ranking.service';
import { EmailService, DigestArticle } from './email.service';
import { WebPushService } from './webpush.service';
import { Device } from '../users/device.entity';
import { DevicePlatform } from '../users/device.entity';

@Injectable()
export class DigestService {
  private readonly logger = new Logger(DigestService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(NotificationSettings)
    private settingsRepository: Repository<NotificationSettings>,
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    private articlesService: ArticlesService,
    private rankingService: RankingService,
    private emailService: EmailService,
    private webPushService: WebPushService,
    private configService: ConfigService,
  ) {}

  /**
   * Scheduled morning digest (default 7:30 AM)
   */
  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async sendMorningDigests() {
    this.logger.log('Starting morning digest generation...');
    await this.generateAndSendDigests('morning');
  }

  /**
   * Scheduled evening digest (default 7:30 PM)
   */
  @Cron('30 19 * * *') // 7:30 PM
  async sendEveningDigests() {
    this.logger.log('Starting evening digest generation...');
    await this.generateAndSendDigests('evening');
  }

  /**
   * Generate and send digests for all users
   */
  async generateAndSendDigests(digestType: 'morning' | 'evening'): Promise<void> {
    try {
      const currentTime = this.getCurrentTimeString();
      
      // Get users with appropriate digest settings
      const users = await this.getUsersForDigest(digestType, currentTime);
      
      this.logger.log(`Found ${users.length} users for ${digestType} digest`);

      let successCount = 0;
      let failCount = 0;

      for (const user of users) {
        try {
          await this.generateUserDigest(user, digestType);
          successCount++;
        } catch (error) {
          failCount++;
          this.logger.error(`Failed to generate digest for user ${user.id}:`, error);
        }
      }

      this.logger.log(`${digestType} digest completed: ${successCount} success, ${failCount} failed`);
    } catch (error) {
      this.logger.error(`Error in ${digestType} digest generation:`, error);
    }
  }

  /**
   * Generate digest for a specific user
   */
  async generateUserDigest(
    user: User,
    digestType: 'morning' | 'evening'
  ): Promise<void> {
    try {
      // Get user's notification settings
      const settings = await this.settingsRepository.findOne({
        where: { userId: user.id },
      });

      if (!settings) {
        this.logger.warn(`No notification settings found for user ${user.id}`);
        return;
      }

      // Check if user is in mute period
      if (this.isInMutePeriod(settings)) {
        this.logger.log(`User ${user.id} is in mute period, skipping digest`);
        return;
      }

      // Generate personalized article list
      const articles = await this.generatePersonalizedDigest(
        user.id,
        settings.maxItemsPerDigest || 20
      );

      if (articles.length === 0) {
        this.logger.log(`No articles found for user ${user.id} digest`);
        return;
      }

      // Send via enabled channels
      const promises = [];

      if (settings.channelEmail) {
        promises.push(this.sendEmailDigest(user.email, articles, digestType));
      }

      if (settings.channelWebpush) {
        promises.push(this.sendWebPushDigest(user.id, articles.length, digestType));
      }

      await Promise.allSettled(promises);

      this.logger.log(`Sent ${digestType} digest to user ${user.id} with ${articles.length} articles`);
    } catch (error) {
      this.logger.error(`Error generating digest for user ${user.id}:`, error);
      throw error;
    }
  }

  /**
   * Generate personalized article digest for user
   */
  private async generatePersonalizedDigest(
    userId: string,
    maxItems: number
  ): Promise<DigestArticle[]> {
    try {
      // Get articles from last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Get personalized feed
      const feedResult = await this.articlesService.getFeed({
        userId,
        sort: 'personal',
        from: yesterday,
        limit: maxItems,
        diversity: true,
      });

      // Convert to digest format
      const digestArticles: DigestArticle[] = feedResult.items.map(article => ({
        title: article.title,
        summary: article.summary || article.title,
        url: article.url,
        source: article.source?.name || 'Unknown',
        publishedAt: article.publishedAt || new Date(),
        imageUrl: article.imageUrl,
      }));

      return digestArticles;
    } catch (error) {
      this.logger.error(`Error generating personalized digest for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Send email digest
   */
  private async sendEmailDigest(
    userEmail: string,
    articles: DigestArticle[],
    digestType: 'morning' | 'evening'
  ): Promise<void> {
    await this.emailService.sendDigest(userEmail, articles, digestType);
  }

  /**
   * Send web push digest
   */
  private async sendWebPushDigest(
    userId: string,
    articleCount: number,
    digestType: 'morning' | 'evening'
  ): Promise<void> {
    const devices = await this.deviceRepository.find({
      where: { 
        userId,
        platform: DevicePlatform.WEB,
      },
    });

    for (const device of devices) {
      if (device.webpushEndpoint && device.webpushP256dh && device.webpushAuth) {
        try {
          const subscription = {
            endpoint: device.webpushEndpoint,
            keys: {
              p256dh: device.webpushP256dh,
              auth: device.webpushAuth,
            },
          };

          await this.webPushService.sendDigestNotification(
            subscription,
            articleCount,
            digestType
          );
        } catch (error) {
          this.logger.warn(`Failed to send web push to device ${device.id}:`, error);
        }
      }
    }
  }

  /**
   * Send breaking news to all users
   */
  async sendBreakingNews(
    articleId: string,
    threshold: number = 0.9
  ): Promise<void> {
    try {
      const article = await this.articlesService.findById(articleId);
      if (!article || (article.popularity || 0) < threshold) {
        return;
      }

      // Get users with breaking news enabled
      const users = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.notificationSettings', 'settings')
        .where('settings.breakingEnabled = true')
        .getMany();

      this.logger.log(`Sending breaking news to ${users.length} users: ${article.title}`);

      const digestArticle: DigestArticle = {
        title: article.title,
        summary: article.summary || article.title,
        url: article.url,
        source: article.source?.name || 'Unknown',
        publishedAt: article.publishedAt || new Date(),
        imageUrl: article.imageUrl,
      };

      for (const user of users) {
        try {
          const settings = user.notificationSettings;
          if (!settings || this.isInMutePeriod(settings)) {
            continue;
          }

          const promises = [];

          if (settings.channelEmail) {
            promises.push(
              this.emailService.sendBreakingNews(user.email, digestArticle)
            );
          }

          if (settings.channelWebpush) {
            promises.push(this.sendBreakingWebPush(user.id, digestArticle));
          }

          await Promise.allSettled(promises);
        } catch (error) {
          this.logger.warn(`Failed to send breaking news to user ${user.id}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('Error sending breaking news:', error);
    }
  }

  /**
   * Send breaking news web push
   */
  private async sendBreakingWebPush(
    userId: string,
    article: DigestArticle
  ): Promise<void> {
    const devices = await this.deviceRepository.find({
      where: { userId, platform: DevicePlatform.WEB },
    });

    for (const device of devices) {
      if (device.webpushEndpoint && device.webpushP256dh && device.webpushAuth) {
        try {
          const subscription = {
            endpoint: device.webpushEndpoint,
            keys: {
              p256dh: device.webpushP256dh,
              auth: device.webpushAuth,
            },
          };

          await this.webPushService.sendBreakingNewsNotification(
            subscription,
            article.title,
            article.summary,
            article.url
          );
        } catch (error) {
          this.logger.warn(`Failed to send breaking web push to device ${device.id}:`, error);
        }
      }
    }
  }

  /**
   * Get users eligible for digest based on type and time
   */
  private async getUsersForDigest(
    digestType: 'morning' | 'evening',
    currentTime: string
  ): Promise<User[]> {
    const timeField = digestType === 'morning' ? 'morningTime' : 'eveningTime';
    const channel = 'channelEmail'; // For now, focus on email digests

    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.notificationSettings', 'settings')
      .where(`settings.${channel} = true`)
      .andWhere(`settings.${timeField} = :time`, { time: currentTime })
      .getMany();
  }

  /**
   * Check if user is in mute period
   */
  private isInMutePeriod(settings: NotificationSettings): boolean {
    if (!settings.muteStart || !settings.muteEnd) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const muteStart = this.timeStringToMinutes(settings.muteStart);
    const muteEnd = this.timeStringToMinutes(settings.muteEnd);

    if (muteStart < muteEnd) {
      return currentTime >= muteStart && currentTime <= muteEnd;
    } else {
      // Mute period crosses midnight
      return currentTime >= muteStart || currentTime <= muteEnd;
    }
  }

  /**
   * Convert time string to minutes
   */
  private timeStringToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Get current time as HH:MM string
   */
  private getCurrentTimeString(): string {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }

  /**
   * Manual digest trigger for testing
   */
  async triggerDigest(
    userId: string,
    digestType: 'morning' | 'evening' | 'manual'
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    await this.generateUserDigest(user, digestType === 'manual' ? 'morning' : digestType);
  }
}