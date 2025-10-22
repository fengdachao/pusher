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
exports.Subscription = exports.KeywordsOp = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
var KeywordsOp;
(function (KeywordsOp) {
    KeywordsOp["AND"] = "AND";
    KeywordsOp["OR"] = "OR";
})(KeywordsOp || (exports.KeywordsOp = KeywordsOp = {}));
let Subscription = class Subscription {
};
exports.Subscription = Subscription;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Subscription.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], Subscription.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    __metadata("design:type", String)
], Subscription.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, default: '{}' }),
    __metadata("design:type", Array)
], Subscription.prototype, "keywords", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'keywords_op', type: 'enum', enum: KeywordsOp, default: KeywordsOp.OR }),
    __metadata("design:type", String)
], Subscription.prototype, "keywordsOp", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'topic_codes', type: 'text', array: true, default: '{}' }),
    __metadata("design:type", Array)
], Subscription.prototype, "topicCodes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source_codes', type: 'text', array: true, default: '{}' }),
    __metadata("design:type", Array)
], Subscription.prototype, "sourceCodes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lang_codes', type: 'text', array: true, default: '{}' }),
    __metadata("design:type", Array)
], Subscription.prototype, "langCodes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'region_codes', type: 'text', array: true, default: '{}' }),
    __metadata("design:type", Array)
], Subscription.prototype, "regionCodes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 5 }),
    __metadata("design:type", Number)
], Subscription.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'daily_limit', default: 30 }),
    __metadata("design:type", Number)
], Subscription.prototype, "dailyLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mute_start', type: 'time', nullable: true }),
    __metadata("design:type", String)
], Subscription.prototype, "muteStart", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mute_end', type: 'time', nullable: true }),
    __metadata("design:type", String)
], Subscription.prototype, "muteEnd", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Subscription.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Subscription.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.subscriptions, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Subscription.prototype, "user", void 0);
exports.Subscription = Subscription = __decorate([
    (0, typeorm_1.Entity)('subscriptions')
], Subscription);
//# sourceMappingURL=subscription.entity.js.map