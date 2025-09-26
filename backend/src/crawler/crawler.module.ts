import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrawlerService } from './crawler.service';
import { RssCrawlerService } from './rss-crawler.service';
import { Article } from '../articles/article.entity';
import { Source } from '../sources/source.entity';
import { Topic } from '../articles/topic.entity';
import { SourcesModule } from '../sources/sources.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Source, Topic]),
    SourcesModule,
  ],
  providers: [CrawlerService, RssCrawlerService],
  exports: [CrawlerService],
})
export class CrawlerModule {}