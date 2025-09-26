import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { Topic } from './topic.entity';
import { Interaction, InteractionType } from './interaction.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
    @InjectRepository(Topic)
    private topicsRepository: Repository<Topic>,
    @InjectRepository(Interaction)
    private interactionsRepository: Repository<Interaction>,
  ) {}

  async getFeed(options: {
    page?: number;
    limit?: number;
    sort?: 'recency' | 'trend' | 'personal';
    topic?: string;
    source?: string;
    lang?: string;
    from?: Date;
    to?: Date;
  }) {
    const { page = 1, limit = 20, sort = 'recency', topic, source, lang, from, to } = options;
    
    const query = this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.source', 'source')
      .leftJoinAndSelect('article.topics', 'topics')
      .where('article.deleted = false')
      .andWhere('source.enabled = true');

    if (topic) {
      query.andWhere('topics.code = :topic', { topic });
    }

    if (source) {
      query.andWhere('source.code = :source', { source });
    }

    if (lang) {
      query.andWhere('article.lang = :lang', { lang });
    }

    if (from) {
      query.andWhere('article.publishedAt >= :from', { from });
    }

    if (to) {
      query.andWhere('article.publishedAt <= :to', { to });
    }

    // Simple sorting for MVP
    switch (sort) {
      case 'trend':
        query.orderBy('article.popularity', 'DESC');
        break;
      case 'personal':
        // For MVP, just use recency
        query.orderBy('article.publishedAt', 'DESC');
        break;
      default:
        query.orderBy('article.publishedAt', 'DESC');
    }

    query
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      page,
      limit,
      total,
      hasNext: page * limit < total,
    };
  }

  async findById(id: string): Promise<Article | null> {
    return this.articlesRepository.findOne({
      where: { id },
      relations: ['source', 'topics'],
    });
  }

  async getTopics(): Promise<Topic[]> {
    return this.topicsRepository.find({
      order: { name: 'ASC' },
    });
  }

  async recordInteraction(userId: string, articleId: string, type: InteractionType, metadata?: any): Promise<void> {
    const interaction = this.interactionsRepository.create({
      userId,
      articleId,
      type,
      readTimeSec: metadata?.readTimeSec,
      channel: metadata?.channel,
    });

    await this.interactionsRepository.save(interaction);
  }

  async search(query: string, options: {
    page?: number;
    limit?: number;
    topic?: string;
    source?: string;
    lang?: string;
    from?: Date;
    to?: Date;
  }) {
    const { page = 1, limit = 20, topic, source, lang, from, to } = options;
    
    // Simple text search for MVP (can be enhanced with OpenSearch later)
    const searchQuery = this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.source', 'source')
      .leftJoinAndSelect('article.topics', 'topics')
      .where('article.deleted = false')
      .andWhere('source.enabled = true')
      .andWhere(
        '(article.title ILIKE :query OR article.summary ILIKE :query)',
        { query: `%${query}%` }
      );

    if (topic) {
      searchQuery.andWhere('topics.code = :topic', { topic });
    }

    if (source) {
      searchQuery.andWhere('source.code = :source', { source });
    }

    if (lang) {
      searchQuery.andWhere('article.lang = :lang', { lang });
    }

    if (from) {
      searchQuery.andWhere('article.publishedAt >= :from', { from });
    }

    if (to) {
      searchQuery.andWhere('article.publishedAt <= :to', { to });
    }

    searchQuery
      .orderBy('article.publishedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await searchQuery.getManyAndCount();

    return {
      items,
      page,
      limit,
      total,
      hasNext: page * limit < total,
      totalHits: total,
    };
  }
}