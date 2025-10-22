"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cache_manager_1 = require("@nestjs/cache-manager");
const schedule_1 = require("@nestjs/schedule");
const cache_manager_redis_store_1 = require("cache-manager-redis-store");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const sources_module_1 = require("./sources/sources.module");
const articles_module_1 = require("./articles/articles.module");
const subscriptions_module_1 = require("./subscriptions/subscriptions.module");
const notifications_module_1 = require("./notifications/notifications.module");
const crawler_module_1 = require("./crawler/crawler.module");
const database_module_1 = require("./database/database.module");
const search_module_1 = require("./search/search.module");
const nlp_module_1 = require("./nlp/nlp.module");
const ranking_module_1 = require("./ranking/ranking.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            database_module_1.DatabaseModule,
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                useFactory: () => {
                    const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
                    return {
                        store: cache_manager_redis_store_1.redisStore,
                        url: redisUrl,
                        ttl: 300,
                    };
                },
            }),
            schedule_1.ScheduleModule.forRoot(),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            sources_module_1.SourcesModule,
            articles_module_1.ArticlesModule,
            subscriptions_module_1.SubscriptionsModule,
            notifications_module_1.NotificationsModule,
            crawler_module_1.CrawlerModule,
            search_module_1.SearchModule,
            nlp_module_1.NlpModule,
            ranking_module_1.RankingModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map