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
exports.Interaction = exports.InteractionType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const article_entity_1 = require("./article.entity");
var InteractionType;
(function (InteractionType) {
    InteractionType["CLICK"] = "click";
    InteractionType["LIKE"] = "like";
    InteractionType["DISLIKE"] = "dislike";
    InteractionType["READ"] = "read";
    InteractionType["SHARE"] = "share";
    InteractionType["OPEN_PUSH"] = "open_push";
})(InteractionType || (exports.InteractionType = InteractionType = {}));
let Interaction = class Interaction {
};
exports.Interaction = Interaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], Interaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], Interaction.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'article_id' }),
    __metadata("design:type", String)
], Interaction.prototype, "articleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: InteractionType }),
    __metadata("design:type", String)
], Interaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'read_time_sec', nullable: true }),
    __metadata("design:type", Number)
], Interaction.prototype, "readTimeSec", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 16 }),
    __metadata("design:type", String)
], Interaction.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Interaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.interactions, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Interaction.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => article_entity_1.Article, article => article.interactions, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'article_id' }),
    __metadata("design:type", article_entity_1.Article)
], Interaction.prototype, "article", void 0);
exports.Interaction = Interaction = __decorate([
    (0, typeorm_1.Entity)('interactions')
], Interaction);
//# sourceMappingURL=interaction.entity.js.map