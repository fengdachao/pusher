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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationSettings = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
let NotificationSettings = class NotificationSettings {
};
exports.NotificationSettings = NotificationSettings;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'user_id' }),
    __metadata("design:type", String)
], NotificationSettings.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'morning_time', type: 'time', default: '07:30' }),
    __metadata("design:type", String)
], NotificationSettings.prototype, "morningTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'evening_time', type: 'time', default: '19:30' }),
    __metadata("design:type", String)
], NotificationSettings.prototype, "eveningTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'channel_email', default: true }),
    __metadata("design:type", Boolean)
], NotificationSettings.prototype, "channelEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'channel_push', default: true }),
    __metadata("design:type", Boolean)
], NotificationSettings.prototype, "channelPush", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'channel_webpush', default: true }),
    __metadata("design:type", Boolean)
], NotificationSettings.prototype, "channelWebpush", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'breaking_enabled', default: true }),
    __metadata("design:type", Boolean)
], NotificationSettings.prototype, "breakingEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_items_per_digest', default: 20 }),
    __metadata("design:type", Number)
], NotificationSettings.prototype, "maxItemsPerDigest", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mute_start', type: 'time', nullable: true }),
    __metadata("design:type", String)
], NotificationSettings.prototype, "muteStart", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mute_end', type: 'time', nullable: true }),
    __metadata("design:type", String)
], NotificationSettings.prototype, "muteEnd", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], NotificationSettings.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, user => user.notificationSettings, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], NotificationSettings.prototype, "user", void 0);
exports.NotificationSettings = NotificationSettings = __decorate([
    (0, typeorm_1.Entity)('notification_settings')
], NotificationSettings);
//# sourceMappingURL=notification-settings.entity.js.map