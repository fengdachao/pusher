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
var SearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const opensearch_1 = require("@opensearch-project/opensearch");
let SearchService = SearchService_1 = class SearchService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(SearchService_1.name);
        this.client = null;
        this.indexName = 'news_articles';
        const opensearchUrl = this.configService.get('OPENSEARCH_URL');
        if (!opensearchUrl) {
            this.logger.warn('OPENSEARCH_URL not set. Search features are disabled.');
            return;
        }
        try {
            this.client = new opensearch_1.Client({
                node: opensearchUrl,
                ssl: {
                    rejectUnauthorized: false,
                },
            });
        }
        catch (err) {
            this.logger.error('Failed to initialize OpenSearch client. Disabling search.', err);
            this.client = null;
        }
    }
    async onModuleInit() {
        try {
            if (this.client) {
                await this.createIndexIfNotExists();
                this.logger.log('OpenSearch connection established');
            }
        }
        catch (error) {
            this.logger.error('Failed to connect to OpenSearch:', error);
        }
    }
    async createIndexIfNotExists() {
        if (!this.client)
            return;
        const exists = await this.client.indices.exists({
            index: this.indexName,
        });
        if (!exists.body) {
            await this.client.indices.create({
                index: this.indexName,
                body: {
                    mappings: {
                        properties: {
                            id: { type: 'keyword' },
                            title: {
                                type: 'text',
                                analyzer: 'smartcn',
                                fields: {
                                    keyword: { type: 'keyword' }
                                }
                            },
                            summary: {
                                type: 'text',
                                analyzer: 'smartcn'
                            },
                            content: {
                                type: 'text',
                                analyzer: 'smartcn'
                            },
                            url: { type: 'keyword' },
                            sourceId: { type: 'keyword' },
                            sourceCode: { type: 'keyword' },
                            sourceName: { type: 'keyword' },
                            topics: { type: 'keyword' },
                            lang: { type: 'keyword' },
                            publishedAt: { type: 'date' },
                            popularity: { type: 'float' },
                            clusterId: { type: 'keyword' },
                        },
                    },
                    settings: {
                        analysis: {
                            analyzer: {
                                smartcn: {
                                    type: 'smartcn',
                                },
                            },
                        },
                        number_of_shards: 1,
                        number_of_replicas: 0,
                    },
                },
            });
            this.logger.log(`Created index: ${this.indexName}`);
        }
    }
    async indexArticle(article) {
        try {
            if (!this.client)
                return;
            await this.client.index({
                index: this.indexName,
                id: article.id,
                body: {
                    id: article.id,
                    title: article.title,
                    summary: article.summary,
                    content: article.content,
                    url: article.url,
                    sourceId: article.source?.id,
                    sourceCode: article.source?.code,
                    sourceName: article.source?.name,
                    topics: article.topics?.map(t => t.code) || [],
                    lang: article.lang,
                    publishedAt: article.publishedAt,
                    popularity: article.popularity,
                    clusterId: article.clusterId,
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to index article ${article.id}:`, error);
        }
    }
    async search(searchQuery) {
        if (!this.client) {
            return {
                results: [],
                total: 0,
                page: searchQuery.page || 1,
                limit: searchQuery.limit || 20,
                tookMs: 0,
            };
        }
        const { query, filters = {}, sort = 'relevance', page = 1, limit = 20 } = searchQuery;
        const must = [];
        const filter = [];
        if (query && query.trim()) {
            must.push({
                multi_match: {
                    query: query.trim(),
                    fields: ['title^3', 'summary^2', 'content'],
                    type: 'best_fields',
                    fuzziness: 'AUTO',
                },
            });
        }
        else {
            must.push({ match_all: {} });
        }
        if (filters.topics?.length) {
            filter.push({ terms: { topics: filters.topics } });
        }
        if (filters.sources?.length) {
            filter.push({ terms: { sourceCode: filters.sources } });
        }
        if (filters.lang?.length) {
            filter.push({ terms: { lang: filters.lang } });
        }
        if (filters.dateFrom || filters.dateTo) {
            const dateRange = {};
            if (filters.dateFrom)
                dateRange.gte = filters.dateFrom.toISOString();
            if (filters.dateTo)
                dateRange.lte = filters.dateTo.toISOString();
            filter.push({ range: { publishedAt: dateRange } });
        }
        const sortOptions = [];
        switch (sort) {
            case 'recency':
                sortOptions.push({ publishedAt: { order: 'desc' } });
                break;
            case 'popularity':
                sortOptions.push({ popularity: { order: 'desc' } });
                sortOptions.push({ publishedAt: { order: 'desc' } });
                break;
            case 'relevance':
            default:
                sortOptions.push({ _score: { order: 'desc' } });
                sortOptions.push({ publishedAt: { order: 'desc' } });
                break;
        }
        const searchBody = {
            query: {
                bool: {
                    must,
                    filter,
                },
            },
            sort: sortOptions,
            from: (page - 1) * limit,
            size: limit,
            _source: [
                'id', 'title', 'summary', 'url', 'sourceId', 'sourceCode',
                'sourceName', 'topics', 'publishedAt', 'popularity'
            ],
        };
        try {
            const response = await this.client.search({
                index: this.indexName,
                body: searchBody,
            });
            const hits = response.body.hits;
            const results = hits.hits.map((hit) => ({
                ...hit._source,
                score: hit._score,
                publishedAt: new Date(hit._source.publishedAt),
            }));
            return {
                results,
                total: hits.total.value,
                page,
                limit,
                tookMs: response.body.took,
            };
        }
        catch (error) {
            this.logger.error('Search query failed:', error);
            throw new Error('Search failed');
        }
    }
    async deleteArticle(articleId) {
        try {
            if (!this.client)
                return;
            await this.client.delete({
                index: this.indexName,
                id: articleId,
            });
        }
        catch (error) {
            if (error.meta?.statusCode !== 404) {
                this.logger.error(`Failed to delete article ${articleId}:`, error);
            }
        }
    }
    async bulkIndex(articles) {
        if (!articles.length)
            return;
        if (!this.client)
            return;
        const body = articles.flatMap(article => [
            { index: { _index: this.indexName, _id: article.id } },
            {
                id: article.id,
                title: article.title,
                summary: article.summary,
                content: article.content,
                url: article.url,
                sourceId: article.source?.id,
                sourceCode: article.source?.code,
                sourceName: article.source?.name,
                topics: article.topics?.map(t => t.code) || [],
                lang: article.lang,
                publishedAt: article.publishedAt,
                popularity: article.popularity,
                clusterId: article.clusterId,
            },
        ]);
        try {
            const response = await this.client.bulk({ body });
            if (response.body.errors) {
                const errorCount = response.body.items.filter(item => item.index?.error || item.create?.error).length;
                this.logger.warn(`Bulk index completed with ${errorCount} errors`);
            }
            else {
                this.logger.log(`Bulk indexed ${articles.length} articles`);
            }
        }
        catch (error) {
            this.logger.error('Bulk index failed:', error);
        }
    }
    async getHealthStatus() {
        try {
            const health = await this.client.cluster.health({
                index: this.indexName,
            });
            return health.body;
        }
        catch (error) {
            this.logger.error('Failed to get search health:', error);
            return { status: 'red', error: error.message };
        }
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = SearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SearchService);
//# sourceMappingURL=search.service.js.map