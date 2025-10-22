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
exports.Topic = void 0;
const typeorm_1 = require("typeorm");
const article_entity_1 = require("./article.entity");
let Topic = class Topic {
};
exports.Topic = Topic;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Topic.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 64 }),
    __metadata("design:type", String)
], Topic.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 64 }),
    __metadata("design:type", String)
], Topic.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Topic.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Topic.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => article_entity_1.Article, article => article.topics),
    __metadata("design:type", Array)
], Topic.prototype, "articles", void 0);
exports.Topic = Topic = __decorate([
    (0, typeorm_1.Entity)('topics')
], Topic);
//# sourceMappingURL=topic.entity.js.map