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
var RssCrawlerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RssCrawlerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Parser = require("rss-parser");
const crypto = require("crypto");
const article_entity_1 = require("../articles/article.entity");
let RssCrawlerService = RssCrawlerService_1 = class RssCrawlerService {
    constructor(articlesRepository) {
        this.articlesRepository = articlesRepository;
        this.logger = new common_1.Logger(RssCrawlerService_1.name);
        this.parser = new Parser();
    }
    async crawlRssSource(source) {
        if (!source.feedUrl) {
            this.logger.warn(`No feed URL for source ${source.code}`);
            return 0;
        }
        try {
            this.logger.log(`Crawling RSS feed: ${source.feedUrl}`);
            const feed = await this.parser.parseURL(source.feedUrl);
            let newArticlesCount = 0;
            for (const item of feed.items) {
                if (!item.link || !item.title) {
                    continue;
                }
                const urlHash = crypto.createHash('sha1').update(item.link).digest('hex');
                const existingArticle = await this.articlesRepository.findOne({
                    where: { urlHash },
                });
                if (existingArticle) {
                    continue;
                }
                const article = this.articlesRepository.create({
                    sourceId: source.id,
                    url: item.link,
                    urlHash,
                    title: item.title,
                    summary: item.contentSnippet || item.content?.substring(0, 500),
                    content: item.content,
                    lang: source.lang || 'zh',
                    publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                    popularity: 0,
                });
                await this.articlesRepository.save(article);
                newArticlesCount++;
            }
            this.logger.log(`Crawled ${newArticlesCount} new articles from ${source.code}`);
            return newArticlesCount;
        }
        catch (error) {
            this.logger.error(`Error crawling RSS feed ${source.feedUrl}:`, error);
            return 0;
        }
    }
};
exports.RssCrawlerService = RssCrawlerService;
exports.RssCrawlerService = RssCrawlerService = RssCrawlerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(article_entity_1.Article)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RssCrawlerService);
//# sourceMappingURL=rss-crawler.service.js.map