import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { Topic } from './topic.entity';
import { Interaction, InteractionType } from './interaction.entity';
import { SearchService } from '../search/search.service';
import { RankingService } from '../ranking/ranking.service';
import { PersonalizationService } from '../ranking/personalization.service';
import { DeduplicationService } from '../nlp/deduplication.service';
import { ClassificationService } from '../nlp/classification.service';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
    @InjectRepository(Topic)
    private topicsRepository: Repository<Topic>,
    @InjectRepository(Interaction)
    private interactionsRepository: Repository<Interaction>,
    private searchService: SearchService,
    private rankingService: RankingService,
    private personalizationService: PersonalizationService,
    private deduplicationService: DeduplicationService,
    private classificationService: ClassificationService,
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
    userId?: string;
    diversity?: boolean;
  }) {
    const { 
      page = 1, 
      limit = 20, 
      sort = 'recency', 
      topic, 
      source, 
      lang, 
      from, 
      to,
      userId,
      diversity = true
    } = options;
    
    const query = this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.source', 'source')
      .leftJoinAndSelect('article.topics', 'topics')
      .leftJoinAndSelect('article.cluster', 'cluster')
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

    // Get a larger set for ranking
    const rankingLimit = Math.min(limit * 5, 200);
    query
      .orderBy('article.publishedAt', 'DESC')
      .take(rankingLimit);

    const articles = await query.getMany();

    // Apply intelligent ranking if user provided and personal sort requested
    let rankedArticles = articles;
    if (userId && sort === 'personal' && articles.length > 0) {
      try {
        const scoredArticles = await this.rankingService.rankArticlesForUser(
          articles,
          userId,
          { sort, diversityEnabled: diversity }
        );
        rankedArticles = scoredArticles.map(sa => sa.article);
      } catch (error) {
        this.logger.warn(`Failed to apply personalized ranking for user ${userId}:`, error);
        // Fallback to default sorting
      }
    } else if (sort === 'trend') {
      rankedArticles = articles.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }

    // Apply pagination to ranked results
    const start = (page - 1) * limit;
    const paginatedArticles = rankedArticles.slice(start, start + limit);

    // Get total count for pagination
    const countQuery = this.articlesRepository
      .createQueryBuilder('article')
      .leftJoin('article.source', 'source')
      .leftJoin('article.topics', 'topics')
      .where('article.deleted = false')
      .andWhere('source.enabled = true');

    if (topic) countQuery.andWhere('topics.code = :topic', { topic });
    if (source) countQuery.andWhere('source.code = :source', { source });
    if (lang) countQuery.andWhere('article.lang = :lang', { lang });
    if (from) countQuery.andWhere('article.publishedAt >= :from', { from });
    if (to) countQuery.andWhere('article.publishedAt <= :to', { to });

    const total = await countQuery.getCount();

    return {
      items: paginatedArticles,
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

    const savedInteraction = await this.interactionsRepository.save(interaction);

    // Update user personalization based on interaction
    try {
      await this.personalizationService.updateUserPreferences(userId, savedInteraction);
    } catch (error) {
      this.logger.warn(`Failed to update user preferences for ${userId}:`, error);
    }
  }

  /**
   * Get related articles for a given article
   */
  async getRelatedArticles(articleId: string, limit: number = 5): Promise<Article[]> {
    try {
      // Get duplicates from same cluster
      const duplicates = await this.deduplicationService.getDuplicates(articleId);
      
      if (duplicates.length >= limit) {
        return duplicates.slice(0, limit);
      }

      // Get the article to find similar topics/sources
      const article = await this.findById(articleId);
      if (!article) return [];

      // Find articles with similar topics
      const query = this.articlesRepository
        .createQueryBuilder('article')
        .leftJoinAndSelect('article.source', 'source')
        .leftJoinAndSelect('article.topics', 'topics')
        .where('article.id != :articleId', { articleId })
        .andWhere('article.deleted = false')
        .andWhere('source.enabled = true');

      if (article.topics && article.topics.length > 0) {
        const topicCodes = article.topics.map(t => t.code);
        query.andWhere('topics.code IN (:...topicCodes)', { topicCodes });
      }

      const relatedArticles = await query
        .orderBy('article.publishedAt', 'DESC')
        .take(limit)
        .getMany();

      return relatedArticles;
    } catch (error) {
      this.logger.error(`Error getting related articles for ${articleId}:`, error);
      return [];
    }
  }

  async search(query: string, options: {
    page?: number;
    limit?: number;
    topic?: string;
    source?: string;
    lang?: string;
    from?: Date;
    to?: Date;
    sort?: 'relevance' | 'recency' | 'popularity';
  }) {
    const { page = 1, limit = 20, topic, source, lang, from, to, sort = 'relevance' } = options;
    
    try {
      // Use OpenSearch for advanced search
      const searchResult = await this.searchService.search({
        query,
        filters: {
          topics: topic ? [topic] : undefined,
          sources: source ? [source] : undefined,
          lang: lang ? [lang] : undefined,
          dateFrom: from,
          dateTo: to,
        },
        sort,
        page,
        limit,
      });

      // Convert search results to article entities
      const articleIds = searchResult.results.map(r => r.id);
      
      if (articleIds.length === 0) {
        return {
          items: [],
          page,
          limit,
          total: 0,
          hasNext: false,
          totalHits: 0,
          tookMs: searchResult.tookMs,
        };
      }

      const articles = await this.articlesRepository
        .createQueryBuilder('article')
        .leftJoinAndSelect('article.source', 'source')
        .leftJoinAndSelect('article.topics', 'topics')
        .where('article.id IN (:...ids)', { ids: articleIds })
        .getMany();

      // Maintain search order
      const orderedArticles = articleIds
        .map(id => articles.find(a => a.id === id))
        .filter(Boolean);

      return {
        items: orderedArticles,
        page,
        limit,
        total: searchResult.total,
        hasNext: page * limit < searchResult.total,
        totalHits: searchResult.total,
        tookMs: searchResult.tookMs,
      };
    } catch (error) {
      this.logger.warn('OpenSearch failed, falling back to database search:', error);
      
      // Fallback to database search
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
        tookMs: 0,
      };
    }
  }

  /**
   * Process new article through NLP pipeline
   */
  async processNewArticle(article: Article): Promise<Article> {
    try {
      // Step 1: Deduplication
      const cluster = await this.deduplicationService.processArticleForDuplication(article);
      if (cluster) {
        article.clusterId = cluster.id;
      }

      // Step 2: Classification
      const classifications = await this.classificationService.classifyArticle(article);
      
      // Associate with topics
      if (classifications.length > 0) {
        const topics = [];
        for (const classification of classifications) {
          const topic = await this.classificationService.getOrCreateTopic(
            classification.topicCode
          );
          topics.push(topic);
        }
        article.topics = topics;
      }

      // Step 3: Save article with associations
      const savedArticle = await this.articlesRepository.save(article);

      // Step 4: Index in search engine
      await this.searchService.indexArticle(savedArticle);

      this.logger.log(`Processed new article: ${savedArticle.id}`);
      return savedArticle;
    } catch (error) {
      this.logger.error(`Error processing article ${article.id}:`, error);
      throw error;
    }
  }
}