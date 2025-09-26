import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Source, SourceType } from '../sources/source.entity';
import { RssCrawlerService } from './rss-crawler.service';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  constructor(
    @InjectRepository(Source)
    private sourcesRepository: Repository<Source>,
    private rssCrawlerService: RssCrawlerService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async crawlAllSources() {
    this.logger.log('Starting scheduled crawl of all sources');

    const sources = await this.sourcesRepository.find({
      where: { enabled: true },
    });

    let totalNewArticles = 0;

    for (const source of sources) {
      try {
        let newArticles = 0;

        switch (source.type) {
          case SourceType.RSS:
            newArticles = await this.rssCrawlerService.crawlRssSource(source);
            break;
          case SourceType.API:
            // TODO: Implement API crawler
            this.logger.log(`API crawler not implemented for ${source.code}`);
            break;
          case SourceType.LIST:
            // TODO: Implement list crawler
            this.logger.log(`List crawler not implemented for ${source.code}`);
            break;
        }

        totalNewArticles += newArticles;

      } catch (error) {
        this.logger.error(`Error crawling source ${source.code}:`, error);
      }
    }

    this.logger.log(`Crawl completed. Total new articles: ${totalNewArticles}`);
  }

  async crawlSource(sourceCode: string): Promise<number> {
    const source = await this.sourcesRepository.findOne({
      where: { code: sourceCode, enabled: true },
    });

    if (!source) {
      throw new Error(`Source ${sourceCode} not found or disabled`);
    }

    switch (source.type) {
      case SourceType.RSS:
        return this.rssCrawlerService.crawlRssSource(source);
      default:
        throw new Error(`Crawler not implemented for source type ${source.type}`);
    }
  }
}