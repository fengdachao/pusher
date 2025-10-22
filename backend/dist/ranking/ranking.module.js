"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ranking_service_1 = require("./ranking.service");
const personalization_service_1 = require("./personalization.service");
const user_entity_1 = require("../users/user.entity");
const article_entity_1 = require("../articles/article.entity");
const interaction_entity_1 = require("../articles/interaction.entity");
const subscription_entity_1 = require("../subscriptions/subscription.entity");
let RankingModule = class RankingModule {
};
exports.RankingModule = RankingModule;
exports.RankingModule = RankingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, article_entity_1.Article, interaction_entity_1.Interaction, subscription_entity_1.Subscription]),
        ],
        providers: [ranking_service_1.RankingService, personalization_service_1.PersonalizationService],
        exports: [ranking_service_1.RankingService, personalization_service_1.PersonalizationService],
    })
], RankingModule);
//# sourceMappingURL=ranking.module.js.map