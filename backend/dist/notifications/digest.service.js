"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DigestService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigestService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../users/user.entity");
const notification_settings_entity_1 = require("./notification-settings.entity");
const articles_service_1 = require("../articles/articles.service");
const ranking_service_1 = require("../ranking/ranking.service");
const email_service_1 = require("./email.service");
const webpush_service_1 = require("./webpush.service");
const device_entity_1 = require("../users/device.entity");
const device_entity_2 = require("../users/device.entity");
let DigestService = DigestService_1 = class DigestService {
    constructor(userRepository, settingsRepository, deviceRepository, articlesService, rankingService, emailService, webPushService, configService) {
        this.userRepository = userRepository;
        this.settingsRepository = settingsRepository;
        this.deviceRepository = deviceRepository;
        this.articlesService = articlesService;
        this.rankingService = rankingService;
        this.emailService = emailService;
        this.webPushService = webPushService;
        this.configService = configService;
        this.logger = new common_1.Logger(DigestService_1.name);
    }
    async sendMorningDigests() {
        this.logger.log('Starting morning digest generation...');
        await this.generateAndSendDigests('morning');
    }
    async sendEveningDigests() {
        this.logger.log('Starting evening digest generation...');
        await this.generateAndSendDigests('evening');
    }
    async generateAndSendDigests(digestType) {
        try {
            const currentTime = this.getCurrentTimeString();
            const users = await this.getUsersForDigest(digestType, currentTime);
            this.logger.log(`Found ${users.length} users for ${digestType} digest`);
            let successCount = 0;
            let failCount = 0;
            for (const user of users) {
                try {
                    await this.generateUserDigest(user, digestType);
                    successCount++;
                }
                catch (error) {
                    failCount++;
                    this.logger.error(`Failed to generate digest for user ${user.id}:`, error);
                }
            }
            this.logger.log(`${digestType} digest completed: ${successCount} success, ${failCount} failed`);
        }
        catch (error) {
            this.logger.error(`Error in ${digestType} digest generation:`, error);
        }
    }
    async generateUserDigest(user, digestType) {
        try {
            const settings = await this.settingsRepository.findOne({
                where: { userId: user.id },
            });
            if (!settings) {
                this.logger.warn(`No notification settings found for user ${user.id}`);
                return;
            }
            if (this.isInMutePeriod(settings)) {
                this.logger.log(`User ${user.id} is in mute period, skipping digest`);
                return;
            }
            const articles = await this.generatePersonalizedDigest(user.id, settings.maxItemsPerDigest || 20);
            if (articles.length === 0) {
                this.logger.log(`No articles found for user ${user.id} digest`);
                return;
            }
            const promises = [];
            if (settings.channelEmail) {
                promises.push(this.sendEmailDigest(user.email, articles, digestType));
            }
            if (settings.channelWebpush) {
                promises.push(this.sendWebPushDigest(user.id, articles.length, digestType));
            }
            await Promise.allSettled(promises);
            this.logger.log(`Sent ${digestType} digest to user ${user.id} with ${articles.length} articles`);
        }
        catch (error) {
            this.logger.error(`Error generating digest for user ${user.id}:`, error);
            throw error;
        }
    }
    async generatePersonalizedDigest(userId, maxItems) {
        try {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const feedResult = await this.articlesService.getFeed({
                userId,
                sort: 'personal',
                from: yesterday,
                limit: maxItems,
                diversity: true,
            });
            const digestArticles = feedResult.items.map(article => ({
                title: article.title,
                summary: article.summary || article.title,
                url: article.url,
                source: article.source?.name || 'Unknown',
                publishedAt: article.publishedAt || new Date(),
                imageUrl: article.imageUrl,
            }));
            return digestArticles;
        }
        catch (error) {
            this.logger.error(`Error generating personalized digest for user ${userId}:`, error);
            return [];
        }
    }
    async sendEmailDigest(userEmail, articles, digestType) {
        await this.emailService.sendDigest(userEmail, articles, digestType);
    }
    async sendWebPushDigest(userId, articleCount, digestType) {
        const devices = await this.deviceRepository.find({
            where: {
                userId,
                platform: device_entity_2.DevicePlatform.WEB,
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
                    await this.webPushService.sendDigestNotification(subscription, articleCount, digestType);
                }
                catch (error) {
                    this.logger.warn(`Failed to send web push to device ${device.id}:`, error);
                }
            }
        }
    }
    async sendBreakingNews(articleId, threshold = 0.9) {
        try {
            const article = await this.articlesService.findById(articleId);
            if (!article || (article.popularity || 0) < threshold) {
                return;
            }
            const users = await this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.notificationSettings', 'settings')
                .where('settings.breakingEnabled = true')
                .getMany();
            this.logger.log(`Sending breaking news to ${users.length} users: ${article.title}`);
            const digestArticle = {
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
                        promises.push(this.emailService.sendBreakingNews(user.email, digestArticle));
                    }
                    if (settings.channelWebpush) {
                        promises.push(this.sendBreakingWebPush(user.id, digestArticle));
                    }
                    await Promise.allSettled(promises);
                }
                catch (error) {
                    this.logger.warn(`Failed to send breaking news to user ${user.id}:`, error);
                }
            }
        }
        catch (error) {
            this.logger.error('Error sending breaking news:', error);
        }
    }
    async sendBreakingWebPush(userId, article) {
        const devices = await this.deviceRepository.find({
            where: { userId, platform: device_entity_2.DevicePlatform.WEB },
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
                    await this.webPushService.sendBreakingNewsNotification(subscription, article.title, article.summary, article.url);
                }
                catch (error) {
                    this.logger.warn(`Failed to send breaking web push to device ${device.id}:`, error);
                }
            }
        }
    }
    async getUsersForDigest(digestType, currentTime) {
        const timeField = digestType === 'morning' ? 'morningTime' : 'eveningTime';
        const channel = 'channelEmail';
        return this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.notificationSettings', 'settings')
            .where(`settings.${channel} = true`)
            .andWhere(`settings.${timeField} = :time`, { time: currentTime })
            .getMany();
    }
    isInMutePeriod(settings) {
        if (!settings.muteStart || !settings.muteEnd) {
            return false;
        }
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const muteStart = this.timeStringToMinutes(settings.muteStart);
        const muteEnd = this.timeStringToMinutes(settings.muteEnd);
        if (muteStart < muteEnd) {
            return currentTime >= muteStart && currentTime <= muteEnd;
        }
        else {
            return currentTime >= muteStart || currentTime <= muteEnd;
        }
    }
    timeStringToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }
    getCurrentTimeString() {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }
    async triggerDigest(userId, digestType) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        await this.generateUserDigest(user, digestType === 'manual' ? 'morning' : digestType);
    }
};
exports.DigestService = DigestService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_7AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DigestService.prototype, "sendMorningDigests", null);
__decorate([
    (0, schedule_1.Cron)('30 19 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DigestService.prototype, "sendEveningDigests", null);
exports.DigestService = DigestService = DigestService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(notification_settings_entity_1.NotificationSettings)),
    __param(2, (0, typeorm_1.InjectRepository)(device_entity_1.Device)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        articles_service_1.ArticlesService,
        ranking_service_1.RankingService,
        email_service_1.EmailService,
        webpush_service_1.WebPushService,
        config_1.ConfigService])
], DigestService);
//# sourceMappingURL=digest.service.js.map