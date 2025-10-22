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
var PersonalizationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalizationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const interaction_entity_1 = require("../articles/interaction.entity");
const subscription_entity_1 = require("../subscriptions/subscription.entity");
let PersonalizationService = PersonalizationService_1 = class PersonalizationService {
    constructor(userRepository, interactionRepository, subscriptionRepository) {
        this.userRepository = userRepository;
        this.interactionRepository = interactionRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.logger = new common_1.Logger(PersonalizationService_1.name);
        this.userProfileCache = new Map();
        this.cacheExpiration = 1000 * 60 * 30;
    }
    async getUserProfile(userId) {
        const cached = this.userProfileCache.get(userId);
        if (cached && Date.now() - cached.lastUpdated.getTime() < this.cacheExpiration) {
            return cached;
        }
        try {
            const profile = await this.buildUserProfile(userId);
            this.userProfileCache.set(userId, profile);
            return profile;
        }
        catch (error) {
            this.logger.error(`Error building profile for user ${userId}:`, error);
            return this.getDefaultProfile(userId);
        }
    }
    async buildUserProfile(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const interactions = await this.interactionRepository
            .createQueryBuilder('interaction')
            .leftJoinAndSelect('interaction.article', 'article')
            .leftJoinAndSelect('article.source', 'source')
            .leftJoinAndSelect('article.topics', 'topics')
            .where('interaction.userId = :userId', { userId })
            .andWhere('interaction.createdAt >= :date', { date: thirtyDaysAgo })
            .getMany();
        const subscriptions = await this.subscriptionRepository.find({
            where: { userId },
        });
        const topicPreferences = this.buildTopicPreferences(interactions, subscriptions);
        const sourcePreferences = this.buildSourcePreferences(interactions, subscriptions);
        const avgReadingTime = this.calculateAverageReadingTime(interactions);
        const activeHours = this.analyzeActiveHours(interactions);
        return {
            userId,
            topicPreferences,
            sourcePreferences,
            languagePreference: user.lang || 'zh',
            avgReadingTime,
            activeHours,
            lastUpdated: new Date(),
        };
    }
    buildTopicPreferences(interactions, subscriptions) {
        const preferences = {};
        for (const interaction of interactions) {
            if (!interaction.article?.topics)
                continue;
            const weight = this.getInteractionWeight(interaction.type);
            for (const topic of interaction.article.topics) {
                if (!preferences[topic.code]) {
                    preferences[topic.code] = { score: 0, weight: 0, totalInteractions: 0 };
                }
                preferences[topic.code].score += weight;
                preferences[topic.code].totalInteractions += 1;
            }
        }
        for (const subscription of subscriptions) {
            for (const topicCode of subscription.topicCodes || []) {
                if (!preferences[topicCode]) {
                    preferences[topicCode] = { score: 0, weight: 0, totalInteractions: 0 };
                }
                preferences[topicCode].score += subscription.priority * 0.2;
            }
        }
        const result = {};
        const maxScore = Math.max(...Object.values(preferences).map(p => p.score));
        for (const [topicCode, pref] of Object.entries(preferences)) {
            const normalizedScore = maxScore > 0 ? pref.score / maxScore : 0.5;
            const weight = Math.min(1.0, pref.totalInteractions / 10);
            result[topicCode] = {
                score: normalizedScore,
                weight: Math.max(0.1, weight),
            };
        }
        return result;
    }
    buildSourcePreferences(interactions, subscriptions) {
        const preferences = {};
        for (const interaction of interactions) {
            if (!interaction.article?.source)
                continue;
            const sourceCode = interaction.article.source.code;
            const weight = this.getInteractionWeight(interaction.type);
            if (!preferences[sourceCode]) {
                preferences[sourceCode] = { score: 0, weight: 0, totalInteractions: 0 };
            }
            preferences[sourceCode].score += weight;
            preferences[sourceCode].totalInteractions += 1;
        }
        for (const subscription of subscriptions) {
            for (const sourceCode of subscription.sourceCodes || []) {
                if (!preferences[sourceCode]) {
                    preferences[sourceCode] = { score: 0, weight: 0, totalInteractions: 0 };
                }
                preferences[sourceCode].score += subscription.priority * 0.2;
            }
        }
        const result = {};
        const maxScore = Math.max(...Object.values(preferences).map(p => p.score));
        for (const [sourceCode, pref] of Object.entries(preferences)) {
            const normalizedScore = maxScore > 0 ? pref.score / maxScore : 0.5;
            const weight = Math.min(1.0, pref.totalInteractions / 20);
            result[sourceCode] = {
                score: normalizedScore,
                weight: Math.max(0.1, weight),
            };
        }
        return result;
    }
    getInteractionWeight(interactionType) {
        const weights = {
            'click': 0.3,
            'read': 0.7,
            'like': 1.0,
            'share': 1.2,
            'open_push': 0.5,
            'dislike': -0.8,
        };
        return weights[interactionType] || 0.1;
    }
    calculateAverageReadingTime(interactions) {
        const readInteractions = interactions.filter(i => i.type === 'read' && i.readTimeSec && i.readTimeSec > 0);
        if (readInteractions.length === 0)
            return 60;
        const totalTime = readInteractions.reduce((sum, i) => sum + (i.readTimeSec || 0), 0);
        return totalTime / readInteractions.length;
    }
    analyzeActiveHours(interactions) {
        const hourCounts = {};
        for (const interaction of interactions) {
            const hour = new Date(interaction.createdAt).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
        const hours = Object.keys(hourCounts).map(Number);
        const avgActivity = Object.values(hourCounts).reduce((a, b) => a + b, 0) / 24;
        return hours.filter(hour => hourCounts[hour] > avgActivity * 1.2);
    }
    getDefaultProfile(userId) {
        return {
            userId,
            topicPreferences: {
                'tech': { score: 0.7, weight: 0.5 },
                'business': { score: 0.6, weight: 0.5 },
                'science': { score: 0.5, weight: 0.3 },
            },
            sourcePreferences: {},
            languagePreference: 'zh',
            avgReadingTime: 60,
            activeHours: [7, 8, 9, 18, 19, 20, 21],
            lastUpdated: new Date(),
        };
    }
    async updateUserPreferences(userId, interaction) {
        try {
            this.userProfileCache.delete(userId);
            this.logger.log(`Updated preferences for user ${userId} based on ${interaction.type} interaction`);
        }
        catch (error) {
            this.logger.error(`Error updating preferences for user ${userId}:`, error);
        }
    }
    clearCache(userId) {
        if (userId) {
            this.userProfileCache.delete(userId);
        }
        else {
            this.userProfileCache.clear();
        }
    }
    getCacheStats() {
        return {
            size: this.userProfileCache.size,
            users: Array.from(this.userProfileCache.keys()),
        };
    }
};
exports.PersonalizationService = PersonalizationService;
exports.PersonalizationService = PersonalizationService = PersonalizationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(interaction_entity_1.Interaction)),
    __param(2, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PersonalizationService);
//# sourceMappingURL=personalization.service.js.map