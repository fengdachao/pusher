"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const notifications_controller_1 = require("./notifications.controller");
const notifications_service_1 = require("./notifications.service");
const notification_settings_entity_1 = require("./notification-settings.entity");
const email_service_1 = require("./email.service");
const webpush_service_1 = require("./webpush.service");
const digest_service_1 = require("./digest.service");
const user_entity_1 = require("../users/user.entity");
const device_entity_1 = require("../users/device.entity");
const articles_module_1 = require("../articles/articles.module");
const ranking_module_1 = require("../ranking/ranking.module");
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([notification_settings_entity_1.NotificationSettings, user_entity_1.User, device_entity_1.Device]),
            articles_module_1.ArticlesModule,
            ranking_module_1.RankingModule,
        ],
        controllers: [notifications_controller_1.NotificationsController],
        providers: [
            notifications_service_1.NotificationsService,
            email_service_1.EmailService,
            webpush_service_1.WebPushService,
            digest_service_1.DigestService,
        ],
        exports: [
            notifications_service_1.NotificationsService,
            email_service_1.EmailService,
            webpush_service_1.WebPushService,
            digest_service_1.DigestService,
        ],
    })
], NotificationsModule);
//# sourceMappingURL=notifications.module.js.map