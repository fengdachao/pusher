"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const articles_controller_1 = require("./articles.controller");
const articles_service_1 = require("./articles.service");
const article_entity_1 = require("./article.entity");
const topic_entity_1 = require("./topic.entity");
const article_cluster_entity_1 = require("./article-cluster.entity");
const interaction_entity_1 = require("./interaction.entity");
const search_module_1 = require("../search/search.module");
const nlp_module_1 = require("../nlp/nlp.module");
const ranking_module_1 = require("../ranking/ranking.module");
let ArticlesModule = class ArticlesModule {
};
exports.ArticlesModule = ArticlesModule;
exports.ArticlesModule = ArticlesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([article_entity_1.Article, topic_entity_1.Topic, article_cluster_entity_1.ArticleCluster, interaction_entity_1.Interaction]),
            search_module_1.SearchModule,
            nlp_module_1.NlpModule,
            ranking_module_1.RankingModule,
        ],
        controllers: [articles_controller_1.ArticlesController],
        providers: [articles_service_1.ArticlesService],
        exports: [articles_service_1.ArticlesService],
    })
], ArticlesModule);
//# sourceMappingURL=articles.module.js.map