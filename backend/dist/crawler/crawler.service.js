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
var CrawlerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrawlerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const source_entity_1 = require("../sources/source.entity");
const rss_crawler_service_1 = require("./rss-crawler.service");
let CrawlerService = CrawlerService_1 = class CrawlerService {
    constructor(sourcesRepository, rssCrawlerService) {
        this.sourcesRepository = sourcesRepository;
        this.rssCrawlerService = rssCrawlerService;
        this.logger = new common_1.Logger(CrawlerService_1.name);
    }
    async crawlAllSources() {
        this.logger.log('Starting scheduled crawl of all sources');
        const sources = await this.sourcesRepository.find({
            where: { enabled: true },
        });
        let totalNewArticles = 0;
        for (const source of sources) {
            try {
                let newArticles = 0;
                switch (source.type) {
                    case source_entity_1.SourceType.RSS:
                        newArticles = await this.rssCrawlerService.crawlRssSource(source);
                        break;
                    case source_entity_1.SourceType.API:
                        this.logger.log(`API crawler not implemented for ${source.code}`);
                        break;
                    case source_entity_1.SourceType.LIST:
                        this.logger.log(`List crawler not implemented for ${source.code}`);
                        break;
                }
                totalNewArticles += newArticles;
            }
            catch (error) {
                this.logger.error(`Error crawling source ${source.code}:`, error);
            }
        }
        this.logger.log(`Crawl completed. Total new articles: ${totalNewArticles}`);
    }
    async crawlSource(sourceCode) {
        const source = await this.sourcesRepository.findOne({
            where: { code: sourceCode, enabled: true },
        });
        if (!source) {
            throw new Error(`Source ${sourceCode} not found or disabled`);
        }
        switch (source.type) {
            case source_entity_1.SourceType.RSS:
                return this.rssCrawlerService.crawlRssSource(source);
            default:
                throw new Error(`Crawler not implemented for source type ${source.type}`);
        }
    }
};
exports.CrawlerService = CrawlerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_10_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CrawlerService.prototype, "crawlAllSources", null);
exports.CrawlerService = CrawlerService = CrawlerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(source_entity_1.Source)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        rss_crawler_service_1.RssCrawlerService])
], CrawlerService);
//# sourceMappingURL=crawler.service.js.map