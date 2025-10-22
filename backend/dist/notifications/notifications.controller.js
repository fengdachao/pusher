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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const notifications_service_1 = require("./notifications.service");
const update_notification_settings_dto_1 = require("./dto/update-notification-settings.dto");
const digest_service_1 = require("./digest.service");
const webpush_service_1 = require("./webpush.service");
let NotificationsController = class NotificationsController {
    constructor(notificationsService, digestService, webPushService) {
        this.notificationsService = notificationsService;
        this.digestService = digestService;
        this.webPushService = webPushService;
    }
    async getSettings(req) {
        return this.notificationsService.getSettings(req.user.userId);
    }
    async updateSettings(req, updateDto) {
        return this.notificationsService.updateSettings(req.user.userId, updateDto);
    }
    async triggerDigest(req, body) {
        const digestType = body.type || 'manual';
        await this.digestService.triggerDigest(req.user.userId, digestType);
        return { message: 'Digest triggered successfully' };
    }
    getVapidPublicKey() {
        return {
            publicKey: this.webPushService.getVapidPublicKey(),
        };
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get notification settings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Settings retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update notification settings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Settings updated successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_notification_settings_dto_1.UpdateNotificationSettingsDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Post)('digest/trigger'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger manual digest' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "triggerDigest", null);
__decorate([
    (0, common_1.Get)('vapid-public-key'),
    (0, swagger_1.ApiOperation)({ summary: 'Get VAPID public key for web push' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "getVapidPublicKey", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, common_1.Controller)('notification-settings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        digest_service_1.DigestService,
        webpush_service_1.WebPushService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map