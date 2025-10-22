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
exports.Source = exports.SourceType = void 0;
const typeorm_1 = require("typeorm");
const article_entity_1 = require("../articles/article.entity");
var SourceType;
(function (SourceType) {
    SourceType["RSS"] = "rss";
    SourceType["API"] = "api";
    SourceType["LIST"] = "list";
})(SourceType || (exports.SourceType = SourceType = {}));
let Source = class Source {
};
exports.Source = Source;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Source.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 64 }),
    __metadata("design:type", String)
], Source.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 128 }),
    __metadata("design:type", String)
], Source.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SourceType }),
    __metadata("design:type", String)
], Source.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'homepage_url', nullable: true }),
    __metadata("design:type", String)
], Source.prototype, "homepageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'feed_url', nullable: true }),
    __metadata("design:type", String)
], Source.prototype, "feedUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 8 }),
    __metadata("design:type", String)
], Source.prototype, "lang", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 8 }),
    __metadata("design:type", String)
], Source.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Source.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fetch_interval_sec', default: 600 }),
    __metadata("design:type", Number)
], Source.prototype, "fetchIntervalSec", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'health_status', default: 'healthy', length: 32 }),
    __metadata("design:type", String)
], Source.prototype, "healthStatus", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Source.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Source.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => article_entity_1.Article, article => article.source),
    __metadata("design:type", Array)
], Source.prototype, "articles", void 0);
exports.Source = Source = __decorate([
    (0, typeorm_1.Entity)('sources')
], Source);
//# sourceMappingURL=source.entity.js.map