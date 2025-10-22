"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrawlerModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const crawler_service_1 = require("./crawler.service");
const rss_crawler_service_1 = require("./rss-crawler.service");
const article_entity_1 = require("../articles/article.entity");
const source_entity_1 = require("../sources/source.entity");
const topic_entity_1 = require("../articles/topic.entity");
const sources_module_1 = require("../sources/sources.module");
let CrawlerModule = class CrawlerModule {
};
exports.CrawlerModule = CrawlerModule;
exports.CrawlerModule = CrawlerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([article_entity_1.Article, source_entity_1.Source, topic_entity_1.Topic]),
            sources_module_1.SourcesModule,
        ],
        providers: [crawler_service_1.CrawlerService, rss_crawler_service_1.RssCrawlerService],
        exports: [crawler_service_1.CrawlerService],
    })
], CrawlerModule);
//# sourceMappingURL=crawler.module.js.map