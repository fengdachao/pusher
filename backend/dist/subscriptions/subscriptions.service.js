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
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_entity_1 = require("./subscription.entity");
let SubscriptionsService = class SubscriptionsService {
    constructor(subscriptionsRepository) {
        this.subscriptionsRepository = subscriptionsRepository;
    }
    async findAll(userId) {
        const subscriptions = await this.subscriptionsRepository.find({
            where: { userId },
            order: { priority: 'DESC', createdAt: 'ASC' },
        });
        return {
            items: subscriptions,
            page: 1,
            limit: subscriptions.length,
            total: subscriptions.length,
        };
    }
    async findById(id, userId) {
        return this.subscriptionsRepository.findOne({
            where: { id, userId },
        });
    }
    async create(userId, createSubscriptionDto) {
        const subscription = this.subscriptionsRepository.create({
            ...createSubscriptionDto,
            userId,
        });
        return this.subscriptionsRepository.save(subscription);
    }
    async update(id, userId, updateSubscriptionDto) {
        const subscription = await this.findById(id, userId);
        if (!subscription) {
            throw new common_1.NotFoundException('Subscription not found');
        }
        Object.assign(subscription, updateSubscriptionDto);
        return this.subscriptionsRepository.save(subscription);
    }
    async delete(id, userId) {
        const result = await this.subscriptionsRepository.delete({
            id,
            userId,
        });
        if (result.affected === 0) {
            throw new common_1.NotFoundException('Subscription not found');
        }
    }
    async findByUserId(userId) {
        return this.subscriptionsRepository.find({
            where: { userId },
            order: { priority: 'DESC' },
        });
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map