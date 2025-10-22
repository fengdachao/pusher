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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const articles_service_1 = require("./articles.service");
let ArticlesController = class ArticlesController {
    constructor(articlesService) {
        this.articlesService = articlesService;
    }
    async getFeed(page, limit, sort, topic, source, lang, from, to) {
        return this.articlesService.getFeed({
            page,
            limit,
            sort,
            topic,
            source,
            lang,
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
        });
    }
    async getArticle(id) {
        return this.articlesService.findById(id);
    }
    async getTopics() {
        return this.articlesService.getTopics();
    }
    async recordInteraction(req, body) {
        await this.articlesService.recordInteraction(req.user.userId, body.articleId, body.type, body.metadata);
        return { success: true };
    }
    async search(query, page, limit, topic, source, lang, from, to) {
        return this.articlesService.search(query, {
            page,
            limit,
            topic,
            source,
            lang,
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
        });
    }
};
exports.ArticlesController = ArticlesController;
__decorate([
    (0, common_1.Get)('feed'),
    (0, swagger_1.ApiOperation)({ summary: 'Get personalized news feed' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Feed retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'sort', required: false, enum: ['recency', 'trend', 'personal'] }),
    (0, swagger_1.ApiQuery)({ name: 'topic', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'source', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'lang', required: false, type: String }),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('sort')),
    __param(3, (0, common_1.Query)('topic')),
    __param(4, (0, common_1.Query)('source')),
    __param(5, (0, common_1.Query)('lang')),
    __param(6, (0, common_1.Query)('from')),
    __param(7, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "getFeed", null);
__decorate([
    (0, common_1.Get)('articles/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get article details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "getArticle", null);
__decorate([
    (0, common_1.Get)('topics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all available topics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Topics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "getTopics", null);
__decorate([
    (0, common_1.Post)('interactions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Record user interaction with article' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Interaction recorded successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "recordInteraction", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search articles' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Search results retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('topic')),
    __param(4, (0, common_1.Query)('source')),
    __param(5, (0, common_1.Query)('lang')),
    __param(6, (0, common_1.Query)('from')),
    __param(7, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "search", null);
exports.ArticlesController = ArticlesController = __decorate([
    (0, swagger_1.ApiTags)('Articles'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [articles_service_1.ArticlesService])
], ArticlesController);
//# sourceMappingURL=articles.controller.js.map