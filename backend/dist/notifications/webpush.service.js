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
var WebPushService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebPushService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const webpush = require("web-push");
let WebPushService = WebPushService_1 = class WebPushService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(WebPushService_1.name);
        this.initializeWebPush();
    }
    initializeWebPush() {
        const vapidPublicKey = this.configService.get('VAPID_PUBLIC_KEY');
        const vapidPrivateKey = this.configService.get('VAPID_PRIVATE_KEY');
        const vapidSubject = this.configService.get('VAPID_SUBJECT');
        if (vapidPublicKey && vapidPrivateKey && vapidSubject) {
            webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
            this.logger.log('WebPush VAPID details configured');
        }
        else {
            this.logger.warn('WebPush VAPID configuration incomplete');
        }
    }
    async sendNotification(subscription, notification) {
        try {
            const payload = JSON.stringify({
                title: notification.title,
                body: notification.body,
                icon: notification.icon || '/icon-192x192.png',
                badge: notification.badge || '/badge-72x72.png',
                image: notification.image,
                data: {
                    url: notification.url,
                    ...notification.data,
                },
                actions: notification.url ? [
                    {
                        action: 'open',
                        title: '查看详情',
                    },
                ] : [],
            });
            await webpush.sendNotification(subscription, payload);
            this.logger.log(`Sent web push notification: ${notification.title}`);
        }
        catch (error) {
            this.logger.error('Failed to send web push notification:', error);
            throw error;
        }
    }
    async sendDigestNotification(subscription, articleCount, digestType) {
        const typeLabel = digestType === 'morning' ? '晨报' :
            digestType === 'evening' ? '晚报' : '突发';
        const notification = {
            title: `📰 ${typeLabel}推送`,
            body: `为您精选了 ${articleCount} 条新闻资讯`,
            icon: '/icon-192x192.png',
            url: '/',
            data: {
                type: 'digest',
                digestType,
                articleCount,
            },
        };
        await this.sendNotification(subscription, notification);
    }
    async sendBreakingNewsNotification(subscription, articleTitle, articleSummary, articleUrl) {
        const notification = {
            title: '🚨 突发新闻',
            body: articleTitle,
            icon: '/icon-192x192.png',
            url: articleUrl,
            data: {
                type: 'breaking',
                articleTitle,
                articleSummary,
                articleUrl,
            },
        };
        await this.sendNotification(subscription, notification);
    }
    async sendBulkNotifications(subscriptions, notification) {
        let success = 0;
        let failed = 0;
        const promises = subscriptions.map(async (subscription) => {
            try {
                await this.sendNotification(subscription, notification);
                success++;
            }
            catch (error) {
                failed++;
                this.logger.warn(`Failed to send notification to subscription:`, error);
            }
        });
        await Promise.allSettled(promises);
        this.logger.log(`Bulk notification sent: ${success} success, ${failed} failed`);
        return { success, failed };
    }
    getVapidPublicKey() {
        return this.configService.get('VAPID_PUBLIC_KEY', '');
    }
    validateSubscription(subscription) {
        return (subscription &&
            typeof subscription.endpoint === 'string' &&
            subscription.keys &&
            typeof subscription.keys.p256dh === 'string' &&
            typeof subscription.keys.auth === 'string');
    }
};
exports.WebPushService = WebPushService;
exports.WebPushService = WebPushService = WebPushService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WebPushService);
//# sourceMappingURL=webpush.service.js.map