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
exports.Article = void 0;
const typeorm_1 = require("typeorm");
const source_entity_1 = require("../sources/source.entity");
const topic_entity_1 = require("./topic.entity");
const article_cluster_entity_1 = require("./article-cluster.entity");
const interaction_entity_1 = require("./interaction.entity");
let Article = class Article {
};
exports.Article = Article;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Article.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source_id' }),
    __metadata("design:type", String)
], Article.prototype, "sourceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cluster_id', nullable: true }),
    __metadata("design:type", String)
], Article.prototype, "clusterId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Article.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'url_hash', length: 40 }),
    __metadata("design:type", String)
], Article.prototype, "urlHash", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Article.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Article.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Article.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 8 }),
    __metadata("design:type", String)
], Article.prototype, "lang", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'image_url', nullable: true }),
    __metadata("design:type", String)
], Article.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'published_at', nullable: true }),
    __metadata("design:type", Date)
], Article.prototype, "publishedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'fetched_at' }),
    __metadata("design:type", Date)
], Article.prototype, "fetchedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], Article.prototype, "popularity", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Article.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => source_entity_1.Source, source => source.articles),
    (0, typeorm_1.JoinColumn)({ name: 'source_id' }),
    __metadata("design:type", source_entity_1.Source)
], Article.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => article_cluster_entity_1.ArticleCluster, cluster => cluster.articles),
    (0, typeorm_1.JoinColumn)({ name: 'cluster_id' }),
    __metadata("design:type", article_cluster_entity_1.ArticleCluster)
], Article.prototype, "cluster", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => topic_entity_1.Topic, topic => topic.articles),
    (0, typeorm_1.JoinTable)({
        name: 'article_topics',
        joinColumn: { name: 'article_id' },
        inverseJoinColumn: { name: 'topic_id' }
    }),
    __metadata("design:type", Array)
], Article.prototype, "topics", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => interaction_entity_1.Interaction, interaction => interaction.article),
    __metadata("design:type", Array)
], Article.prototype, "interactions", void 0);
exports.Article = Article = __decorate([
    (0, typeorm_1.Entity)('articles')
], Article);
//# sourceMappingURL=article.entity.js.map