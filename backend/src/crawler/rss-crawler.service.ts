import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Parser from 'rss-parser';
import * as crypto from 'crypto';
import { Article } from '../articles/article.entity';
import { Source } from '../sources/source.entity';

@Injectable()
export class RssCrawlerService {
  private readonly logger = new Logger(RssCrawlerService.name);
  private readonly parser = new Parser();

  constructor(
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
  ) {}

  async crawlRssSource(source: Source): Promise<number> {
    if (!source.feedUrl) {
      this.logger.warn(`No feed URL for source ${source.code}`);
      return 0;
    }

    try {
      this.logger.log(`Crawling RSS feed: ${source.feedUrl}`);
      const feed = await this.parser.parseURL(source.feedUrl);
      
      let newArticlesCount = 0;

      for (const item of feed.items) {
        if (!item.link || !item.title) {
          continue;
        }

        const urlHash = crypto.createHash('sha1').update(item.link).digest('hex');
        
        // Check if article already exists
        const existingArticle = await this.articlesRepository.findOne({
          where: { urlHash },
        });

        if (existingArticle) {
          continue;
        }

        // Create new article
        const article = this.articlesRepository.create({
          sourceId: source.id,
          url: item.link,
          urlHash,
          title: item.title,
          summary: item.contentSnippet || item.content?.substring(0, 500),
          content: item.content,
          lang: source.lang || 'zh',
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          popularity: 0,
        });

        await this.articlesRepository.save(article);
        newArticlesCount++;
      }

      this.logger.log(`Crawled ${newArticlesCount} new articles from ${source.code}`);
      return newArticlesCount;

    } catch (error) {
      this.logger.error(`Error crawling RSS feed ${source.feedUrl}:`, error);
      return 0;
    }
  }
}