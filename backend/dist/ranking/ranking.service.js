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
var RankingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const article_entity_1 = require("../articles/article.entity");
const interaction_entity_1 = require("../articles/interaction.entity");
const personalization_service_1 = require("./personalization.service");
let RankingService = RankingService_1 = class RankingService {
    constructor(articleRepository, interactionRepository, personalizationService, configService) {
        this.articleRepository = articleRepository;
        this.interactionRepository = interactionRepository;
        this.personalizationService = personalizationService;
        this.configService = configService;
        this.logger = new common_1.Logger(RankingService_1.name);
    }
    async rankArticlesForUser(articles, userId, options = {}) {
        try {
            const { sort = 'personal', diversityEnabled = true, explorationRate = 0.1, } = options;
            const userProfile = await this.personalizationService.getUserProfile(userId);
            const scoredArticles = [];
            for (const article of articles) {
                const score = await this.calculateArticleScore(article, userId, userProfile, sort);
                const reasons = this.generateScoreReasons(article, userProfile, sort);
                scoredArticles.push({
                    article,
                    score,
                    reasons,
                });
            }
            let rankedArticles = scoredArticles.sort((a, b) => b.score - a.score);
            if (diversityEnabled) {
                rankedArticles = this.applyDiversityConstraint(rankedArticles);
            }
            if (explorationRate > 0) {
                rankedArticles = this.applyExploration(rankedArticles, explorationRate);
            }
            this.logger.log(`Ranked ${articles.length} articles for user ${userId} using ${sort} strategy`);
            return rankedArticles;
        }
        catch (error) {
            this.logger.error(`Error ranking articles for user ${userId}:`, error);
            return articles.map(article => ({
                article,
                score: this.calculateRecencyScore(article),
                reasons: ['Fallback: Recency'],
            })).sort((a, b) => b.score - a.score);
        }
    }
    async calculateArticleScore(article, userId, userProfile, sort) {
        let score = 0;
        switch (sort) {
            case 'personal':
                score = await this.calculatePersonalizedScore(article, userId, userProfile);
                break;
            case 'recency':
                score = this.calculateRecencyScore(article);
                break;
            case 'popularity':
                score = this.calculatePopularityScore(article);
                break;
            case 'trending':
                score = await this.calculateTrendingScore(article);
                break;
            default:
                score = await this.calculatePersonalizedScore(article, userId, userProfile);
        }
        return Math.max(0, Math.min(1, score));
    }
    async calculatePersonalizedScore(article, userId, userProfile) {
        let score = 0;
        const weights = {
            topicMatch: 0.3,
            sourcePreference: 0.2,
            recency: 0.2,
            popularity: 0.15,
            behaviorPattern: 0.15,
        };
        const topicScore = this.calculateTopicMatchScore(article, userProfile.topicPreferences);
        score += topicScore * weights.topicMatch;
        const sourceScore = this.calculateSourcePreferenceScore(article, userProfile.sourcePreferences);
        score += sourceScore * weights.sourcePreference;
        const recencyScore = this.calculateRecencyScore(article);
        score += recencyScore * weights.recency;
        const popularityScore = this.calculatePopularityScore(article);
        score += popularityScore * weights.popularity;
        const behaviorScore = await this.calculateBehaviorScore(article, userId, userProfile);
        score += behaviorScore * weights.behaviorPattern;
        return score;
    }
    calculateTopicMatchScore(article, topicPreferences) {
        if (!article.topics || !topicPreferences)
            return 0.5;
        let score = 0;
        let totalWeight = 0;
        for (const articleTopic of article.topics) {
            const preference = topicPreferences[articleTopic.code];
            if (preference) {
                score += preference.score * preference.weight;
                totalWeight += preference.weight;
            }
        }
        return totalWeight > 0 ? score / totalWeight : 0.3;
    }
    calculateSourcePreferenceScore(article, sourcePreferences) {
        if (!sourcePreferences || !article.source)
            return 0.5;
        const preference = sourcePreferences[article.source.code];
        return preference ? preference.score : 0.3;
    }
    calculateRecencyScore(article) {
        if (!article.publishedAt)
            return 0.1;
        const now = new Date();
        const publishTime = new Date(article.publishedAt);
        const hoursAgo = (now.getTime() - publishTime.getTime()) / (1000 * 60 * 60);
        if (hoursAgo < 6)
            return 1.0;
        if (hoursAgo < 24)
            return 0.8;
        if (hoursAgo < 72)
            return 0.6;
        if (hoursAgo < 168)
            return 0.4;
        return 0.2;
    }
    calculatePopularityScore(article) {
        if (article.popularity !== undefined) {
            return article.popularity;
        }
        if (article.source) {
            const authorityMap = {
                'techcrunch': 0.9,
                'theverge': 0.8,
                '36kr': 0.7,
                'ithome': 0.6,
            };
            return authorityMap[article.source.code] || 0.5;
        }
        return 0.5;
    }
    async calculateTrendingScore(article) {
        try {
            const dayAgo = new Date();
            dayAgo.setDate(dayAgo.getDate() - 1);
            const interactionCount = await this.interactionRepository.count({
                where: {
                    articleId: article.id,
                    createdAt: { $gte: dayAgo },
                },
            });
            return Math.min(1.0, Math.log(interactionCount + 1) / 10);
        }
        catch (error) {
            return this.calculatePopularityScore(article);
        }
    }
    async calculateBehaviorScore(article, userId, userProfile) {
        try {
            const readingTimeScore = this.calculateReadingTimeScore(article, userProfile.avgReadingTime);
            const timePreferenceScore = this.calculateTimePreferenceScore(userProfile.activeHours);
            const langScore = this.calculateLanguageScore(article, userProfile.languagePreference);
            return (readingTimeScore + timePreferenceScore + langScore) / 3;
        }
        catch (error) {
            return 0.5;
        }
    }
    calculateReadingTimeScore(article, avgReadingTime) {
        if (!avgReadingTime)
            return 0.5;
        const contentLength = (article.title?.length || 0) + (article.summary?.length || 0);
        const estimatedReadTime = Math.max(1, contentLength / 200);
        const ratio = Math.min(estimatedReadTime, avgReadingTime) / Math.max(estimatedReadTime, avgReadingTime);
        return ratio;
    }
    calculateTimePreferenceScore(activeHours) {
        if (!activeHours || activeHours.length === 0)
            return 0.5;
        const currentHour = new Date().getHours();
        return activeHours.includes(currentHour) ? 1.0 : 0.3;
    }
    calculateLanguageScore(article, languagePreference) {
        if (!languagePreference || !article.lang)
            return 0.5;
        return article.lang === languagePreference ? 1.0 : 0.3;
    }
    applyDiversityConstraint(scoredArticles) {
        const diversified = [];
        const usedSources = new Set();
        const usedTopics = new Set();
        for (const item of scoredArticles) {
            const article = item.article;
            const sourceCode = article.source?.code;
            const topicCodes = article.topics?.map(t => t.code) || [];
            const sourceUsed = sourceCode && usedSources.has(sourceCode);
            const topicOverlap = topicCodes.some(code => usedTopics.has(code));
            if (!sourceUsed && !topicOverlap || item.score > 0.9) {
                diversified.push(item);
                if (sourceCode)
                    usedSources.add(sourceCode);
                topicCodes.forEach(code => usedTopics.add(code));
                if (diversified.length >= 20)
                    break;
            }
        }
        const remaining = scoredArticles.filter(item => !diversified.includes(item));
        diversified.push(...remaining);
        return diversified;
    }
    applyExploration(scoredArticles, explorationRate) {
        if (Math.random() > explorationRate) {
            return scoredArticles;
        }
        const result = [...scoredArticles];
        const explorationCount = Math.min(3, Math.floor(result.length * 0.1));
        for (let i = 0; i < explorationCount; i++) {
            const randomIndex = Math.floor(Math.random() * result.length);
            const randomItem = result.splice(randomIndex, 1)[0];
            if (randomItem) {
                randomItem.reasons.push('Exploration');
                result.splice(i * 3, 0, randomItem);
            }
        }
        return result;
    }
    generateScoreReasons(article, userProfile, sort) {
        const reasons = [];
        if (sort === 'personal') {
            if (article.topics?.some(t => userProfile.topicPreferences?.[t.code])) {
                reasons.push('Matches your interests');
            }
            if (article.source && userProfile.sourcePreferences?.[article.source.code]) {
                reasons.push('From preferred source');
            }
            if (this.calculateRecencyScore(article) > 0.8) {
                reasons.push('Recent news');
            }
            if (this.calculatePopularityScore(article) > 0.7) {
                reasons.push('Popular article');
            }
        }
        else {
            reasons.push(`Sorted by ${sort}`);
        }
        return reasons.length > 0 ? reasons : ['Recommended for you'];
    }
};
exports.RankingService = RankingService;
exports.RankingService = RankingService = RankingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(article_entity_1.Article)),
    __param(1, (0, typeorm_1.InjectRepository)(interaction_entity_1.Interaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        personalization_service_1.PersonalizationService,
        config_1.ConfigService])
], RankingService);
//# sourceMappingURL=ranking.service.js.map