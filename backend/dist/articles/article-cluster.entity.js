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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleCluster = void 0;
const typeorm_1 = require("typeorm");
const article_entity_1 = require("./article.entity");
let ArticleCluster = class ArticleCluster {
};
exports.ArticleCluster = ArticleCluster;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ArticleCluster.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], ArticleCluster.prototype, "simhash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'representative_article_id', nullable: true }),
    __metadata("design:type", String)
], ArticleCluster.prototype, "representativeArticleId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ArticleCluster.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => article_entity_1.Article, article => article.cluster),
    __metadata("design:type", Array)
], ArticleCluster.prototype, "articles", void 0);
exports.ArticleCluster = ArticleCluster = __decorate([
    (0, typeorm_1.Entity)('article_clusters')
], ArticleCluster);
//# sourceMappingURL=article-cluster.entity.js.map