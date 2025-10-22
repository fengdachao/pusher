"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NlpModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const deduplication_service_1 = require("./deduplication.service");
const classification_service_1 = require("./classification.service");
const article_cluster_entity_1 = require("../articles/article-cluster.entity");
const topic_entity_1 = require("../articles/topic.entity");
let NlpModule = class NlpModule {
};
exports.NlpModule = NlpModule;
exports.NlpModule = NlpModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([article_cluster_entity_1.ArticleCluster, topic_entity_1.Topic]),
        ],
        providers: [deduplication_service_1.DeduplicationService, classification_service_1.ClassificationService],
        exports: [deduplication_service_1.DeduplicationService, classification_service_1.ClassificationService],
    })
], NlpModule);
//# sourceMappingURL=nlp.module.js.map