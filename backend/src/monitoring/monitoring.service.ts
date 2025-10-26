import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Source } from '../sources/source.entity';
import { Article } from '../articles/article.entity';

@Injectable()
export class MonitoringService {
  constructor(
    @InjectRepository(Source)
    private sourceRepository: Repository<Source>,
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
  ) {}

  async getSystemStats() {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    return {
      system: {
        uptime: Math.floor(uptime),
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        },
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getDatabaseStats() {
    // 增强实现
    const articleCount = await this.articleRepository.count();
    const sourceCount = await this.sourceRepository.count();
    const enabledSourceCount = await this.sourceRepository.count({
      where: { enabled: true }
    });

    // 获取最近24小时的文章
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const recentArticles = await this.articleRepository
      .createQueryBuilder('article')
      .where('article.fetchedAt >= :yesterday', { yesterday })
      .getCount();

    return {
      database: {
        status: 'connected',
        articles: {
          total: articleCount,
          last24h: recentArticles,
        },
        sources: {
          total: sourceCount,
          enabled: enabledSourceCount,
        },
        timestamp: new Date().toISOString(),
      },
    };
  }

  async getCrawlerStats() {
    // 完全重写，提供详细统计
    const sources = await this.sourceRepository.find({
      where: { enabled: true }
    });

    const sourceStats = await Promise.all(
      sources.map(async (source) => {
        // 获取该源的文章总数
        const totalArticles = await this.articleRepository.count({
          where: { sourceId: source.id }
        });

        // 获取最近24小时的文章
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const recentArticles = await this.articleRepository
          .createQueryBuilder('article')
          .where('article.sourceId = :sourceId', { sourceId: source.id })
          .andWhere('article.fetchedAt >= :yesterday', { yesterday })
          .getCount();

        // 获取最新文章时间
        const latestArticle = await this.articleRepository.findOne({
          where: { sourceId: source.id },
          order: { fetchedAt: 'DESC' }
        });

        return {
          code: source.code,
          name: source.name,
          type: source.type,
          enabled: source.enabled,
          articles: {
            total: totalArticles,
            last24h: recentArticles,
          },
          lastFetch: latestArticle?.fetchedAt || null,
          feedUrl: source.feedUrl,
        };
      })
    );

    // 计算汇总统计
    const totalArticles = sourceStats.reduce((sum, s) => sum + s.articles.total, 0);
    const totalLast24h = sourceStats.reduce((sum, s) => sum + s.articles.last24h, 0);

    return {
      crawler: {
        status: 'running',
        sources: {
          total: sources.length,
          active: sources.filter(s => s.enabled).length,
        },
        articles: {
          total: totalArticles,
          last24h: totalLast24h,
        },
        sourceDetails: sourceStats,
        timestamp: new Date().toISOString(),
      },
    };
  }

  async getUserStats() {
    return {
      users: {
        status: 'active',
        message: 'User service is operational',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
