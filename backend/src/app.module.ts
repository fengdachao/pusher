import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { redisStore } from 'cache-manager-redis-store';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SourcesModule } from './sources/sources.module';
import { ArticlesModule } from './articles/articles.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CrawlerModule } from './crawler/crawler.module';
import { DatabaseModule } from './database/database.module';
import { SearchModule } from './search/search.module';
import { NlpModule } from './nlp/nlp.module';
import { RankingModule } from './ranking/ranking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    DatabaseModule,
    
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        store: redisStore as any,
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        ttl: 300, // 5 minutes default TTL
      }),
    }),
    
    ScheduleModule.forRoot(),
    
    AuthModule,
    UsersModule,
    SourcesModule,
    ArticlesModule,
    SubscriptionsModule,
    NotificationsModule,
    CrawlerModule,
    SearchModule,
    NlpModule,
    RankingModule,
  ],
})
export class AppModule {}