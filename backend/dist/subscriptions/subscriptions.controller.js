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
exports.SubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const subscriptions_service_1 = require("./subscriptions.service");
const create_subscription_dto_1 = require("./dto/create-subscription.dto");
const update_subscription_dto_1 = require("./dto/update-subscription.dto");
const articles_service_1 = require("../articles/articles.service");
const ranking_service_1 = require("../ranking/ranking.service");
let SubscriptionsController = class SubscriptionsController {
    constructor(subscriptionsService, articlesService, rankingService) {
        this.subscriptionsService = subscriptionsService;
        this.articlesService = articlesService;
        this.rankingService = rankingService;
    }
    async findAll(req) {
        return this.subscriptionsService.findAll(req.user.userId);
    }
    async create(req, createSubscriptionDto) {
        const subscription = await this.subscriptionsService.create(req.user.userId, createSubscriptionDto);
        this.refreshUserRecommendations(req.user.userId).catch(err => console.error('Failed to refresh recommendations:', err));
        return subscription;
    }
    async findOne(req, id) {
        return this.subscriptionsService.findById(id, req.user.userId);
    }
    async update(req, id, updateSubscriptionDto) {
        const subscription = await this.subscriptionsService.update(id, req.user.userId, updateSubscriptionDto);
        this.refreshUserRecommendations(req.user.userId).catch(err => console.error('Failed to refresh recommendations:', err));
        return subscription;
    }
    async delete(req, id) {
        await this.subscriptionsService.delete(id, req.user.userId);
    }
    async getInstantRecommendations(req) {
        return this.getPersonalizedFeed(req.user.userId, 20);
    }
    async refreshUserRecommendations(userId) {
        await this.getPersonalizedFeed(userId, 20);
    }
    async getPersonalizedFeed(userId, limit = 20) {
        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const feedResult = await this.articlesService.getFeed({
                userId,
                sort: 'personal',
                from: sevenDaysAgo,
                limit,
                diversity: true,
            });
            return feedResult;
        }
        catch (error) {
            console.error('Error getting personalized feed:', error);
            return {
                items: [],
                page: 1,
                limit,
                total: 0,
            };
        }
    }
};
exports.SubscriptionsController = SubscriptionsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user subscriptions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscriptions retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new subscription' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Subscription created successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_subscription_dto_1.CreateSubscriptionDto]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get subscription details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Subscription not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update subscription' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subscription updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Subscription not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_subscription_dto_1.UpdateSubscriptionDto]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete subscription' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Subscription deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Subscription not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)('recommendations/instant'),
    (0, swagger_1.ApiOperation)({ summary: 'Get instant personalized recommendations based on subscriptions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recommendations retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getInstantRecommendations", null);
exports.SubscriptionsController = SubscriptionsController = __decorate([
    (0, swagger_1.ApiTags)('Subscriptions'),
    (0, common_1.Controller)('subscriptions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [subscriptions_service_1.SubscriptionsService,
        articles_service_1.ArticlesService,
        ranking_service_1.RankingService])
], SubscriptionsController);
//# sourceMappingURL=subscriptions.controller.js.map