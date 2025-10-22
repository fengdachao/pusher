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
var ArticlesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const article_entity_1 = require("./article.entity");
const topic_entity_1 = require("./topic.entity");
const interaction_entity_1 = require("./interaction.entity");
const search_service_1 = require("../search/search.service");
const ranking_service_1 = require("../ranking/ranking.service");
const personalization_service_1 = require("../ranking/personalization.service");
const deduplication_service_1 = require("../nlp/deduplication.service");
const classification_service_1 = require("../nlp/classification.service");
let ArticlesService = ArticlesService_1 = class ArticlesService {
    constructor(articlesRepository, topicsRepository, interactionsRepository, searchService, rankingService, personalizationService, deduplicationService, classificationService) {
        this.articlesRepository = articlesRepository;
        this.topicsRepository = topicsRepository;
        this.interactionsRepository = interactionsRepository;
        this.searchService = searchService;
        this.rankingService = rankingService;
        this.personalizationService = personalizationService;
        this.deduplicationService = deduplicationService;
        this.classificationService = classificationService;
        this.logger = new common_1.Logger(ArticlesService_1.name);
    }
    async getFeed(options) {
        const { page = 1, limit = 20, sort = 'recency', topic, source, lang, from, to, userId, diversity = true } = options;
        const query = this.articlesRepository
            .createQueryBuilder('article')
            .leftJoinAndSelect('article.source', 'source')
            .leftJoinAndSelect('article.topics', 'topics')
            .leftJoinAndSelect('article.cluster', 'cluster')
            .where('article.deleted = false')
            .andWhere('source.enabled = true');
        if (topic) {
            query.andWhere('topics.code = :topic', { topic });
        }
        if (source) {
            query.andWhere('source.code = :source', { source });
        }
        if (lang) {
            query.andWhere('article.lang = :lang', { lang });
        }
        if (from) {
            query.andWhere('article.publishedAt >= :from', { from });
        }
        if (to) {
            query.andWhere('article.publishedAt <= :to', { to });
        }
        const rankingLimit = Math.min(limit * 5, 200);
        query
            .orderBy('article.publishedAt', 'DESC')
            .take(rankingLimit);
        const articles = await query.getMany();
        let rankedArticles = articles;
        if (userId && sort === 'personal' && articles.length > 0) {
            try {
                const scoredArticles = await this.rankingService.rankArticlesForUser(articles, userId, { sort, diversityEnabled: diversity });
                rankedArticles = scoredArticles.map(sa => sa.article);
            }
            catch (error) {
                this.logger.warn(`Failed to apply personalized ranking for user ${userId}:`, error);
            }
        }
        else if (sort === 'trend') {
            rankedArticles = articles.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        }
        const start = (page - 1) * limit;
        const paginatedArticles = rankedArticles.slice(start, start + limit);
        const countQuery = this.articlesRepository
            .createQueryBuilder('article')
            .leftJoin('article.source', 'source')
            .leftJoin('article.topics', 'topics')
            .where('article.deleted = false')
            .andWhere('source.enabled = true');
        if (topic)
            countQuery.andWhere('topics.code = :topic', { topic });
        if (source)
            countQuery.andWhere('source.code = :source', { source });
        if (lang)
            countQuery.andWhere('article.lang = :lang', { lang });
        if (from)
            countQuery.andWhere('article.publishedAt >= :from', { from });
        if (to)
            countQuery.andWhere('article.publishedAt <= :to', { to });
        const total = await countQuery.getCount();
        return {
            items: paginatedArticles,
            page,
            limit,
            total,
            hasNext: page * limit < total,
        };
    }
    async findById(id) {
        return this.articlesRepository.findOne({
            where: { id },
            relations: ['source', 'topics'],
        });
    }
    async getTopics() {
        return this.topicsRepository.find({
            order: { name: 'ASC' },
        });
    }
    async recordInteraction(userId, articleId, type, metadata) {
        const interaction = this.interactionsRepository.create({
            userId,
            articleId,
            type,
            readTimeSec: metadata?.readTimeSec,
            channel: metadata?.channel,
        });
        const savedInteraction = await this.interactionsRepository.save(interaction);
        try {
            await this.personalizationService.updateUserPreferences(userId, savedInteraction);
        }
        catch (error) {
            this.logger.warn(`Failed to update user preferences for ${userId}:`, error);
        }
    }
    async getRelatedArticles(articleId, limit = 5) {
        try {
            const duplicates = await this.deduplicationService.getDuplicates(articleId);
            if (duplicates.length >= limit) {
                return duplicates.slice(0, limit);
            }
            const article = await this.findById(articleId);
            if (!article)
                return [];
            const query = this.articlesRepository
                .createQueryBuilder('article')
                .leftJoinAndSelect('article.source', 'source')
                .leftJoinAndSelect('article.topics', 'topics')
                .where('article.id != :articleId', { articleId })
                .andWhere('article.deleted = false')
                .andWhere('source.enabled = true');
            if (article.topics && article.topics.length > 0) {
                const topicCodes = article.topics.map(t => t.code);
                query.andWhere('topics.code IN (:...topicCodes)', { topicCodes });
            }
            const relatedArticles = await query
                .orderBy('article.publishedAt', 'DESC')
                .take(limit)
                .getMany();
            return relatedArticles;
        }
        catch (error) {
            this.logger.error(`Error getting related articles for ${articleId}:`, error);
            return [];
        }
    }
    async search(query, options) {
        const { page = 1, limit = 20, topic, source, lang, from, to, sort = 'relevance' } = options;
        try {
            const searchResult = await this.searchService.search({
                query,
                filters: {
                    topics: topic ? [topic] : undefined,
                    sources: source ? [source] : undefined,
                    lang: lang ? [lang] : undefined,
                    dateFrom: from,
                    dateTo: to,
                },
                sort,
                page,
                limit,
            });
            const articleIds = searchResult.results.map(r => r.id);
            if (articleIds.length === 0) {
                return {
                    items: [],
                    page,
                    limit,
                    total: 0,
                    hasNext: false,
                    totalHits: 0,
                    tookMs: searchResult.tookMs,
                };
            }
            const articles = await this.articlesRepository
                .createQueryBuilder('article')
                .leftJoinAndSelect('article.source', 'source')
                .leftJoinAndSelect('article.topics', 'topics')
                .where('article.id IN (:...ids)', { ids: articleIds })
                .getMany();
            const orderedArticles = articleIds
                .map(id => articles.find(a => a.id === id))
                .filter(Boolean);
            return {
                items: orderedArticles,
                page,
                limit,
                total: searchResult.total,
                hasNext: page * limit < searchResult.total,
                totalHits: searchResult.total,
                tookMs: searchResult.tookMs,
            };
        }
        catch (error) {
            this.logger.warn('OpenSearch failed, falling back to database search:', error);
            const searchQuery = this.articlesRepository
                .createQueryBuilder('article')
                .leftJoinAndSelect('article.source', 'source')
                .leftJoinAndSelect('article.topics', 'topics')
                .where('article.deleted = false')
                .andWhere('source.enabled = true')
                .andWhere('(article.title ILIKE :query OR article.summary ILIKE :query)', { query: `%${query}%` });
            if (topic) {
                searchQuery.andWhere('topics.code = :topic', { topic });
            }
            if (source) {
                searchQuery.andWhere('source.code = :source', { source });
            }
            if (lang) {
                searchQuery.andWhere('article.lang = :lang', { lang });
            }
            if (from) {
                searchQuery.andWhere('article.publishedAt >= :from', { from });
            }
            if (to) {
                searchQuery.andWhere('article.publishedAt <= :to', { to });
            }
            searchQuery
                .orderBy('article.publishedAt', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);
            const [items, total] = await searchQuery.getManyAndCount();
            return {
                items,
                page,
                limit,
                total,
                hasNext: page * limit < total,
                totalHits: total,
                tookMs: 0,
            };
        }
    }
    async processNewArticle(article) {
        try {
            const cluster = await this.deduplicationService.processArticleForDuplication(article);
            if (cluster) {
                article.clusterId = cluster.id;
            }
            const classifications = await this.classificationService.classifyArticle(article);
            if (classifications.length > 0) {
                const topics = [];
                for (const classification of classifications) {
                    const topic = await this.classificationService.getOrCreateTopic(classification.topicCode);
                    topics.push(topic);
                }
                article.topics = topics;
            }
            const savedArticle = await this.articlesRepository.save(article);
            await this.searchService.indexArticle(savedArticle);
            this.logger.log(`Processed new article: ${savedArticle.id}`);
            return savedArticle;
        }
        catch (error) {
            this.logger.error(`Error processing article ${article.id}:`, error);
            throw error;
        }
    }
};
exports.ArticlesService = ArticlesService;
exports.ArticlesService = ArticlesService = ArticlesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(article_entity_1.Article)),
    __param(1, (0, typeorm_1.InjectRepository)(topic_entity_1.Topic)),
    __param(2, (0, typeorm_1.InjectRepository)(interaction_entity_1.Interaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        search_service_1.SearchService,
        ranking_service_1.RankingService,
        personalization_service_1.PersonalizationService,
        deduplication_service_1.DeduplicationService,
        classification_service_1.ClassificationService])
], ArticlesService);
//# sourceMappingURL=articles.service.js.map