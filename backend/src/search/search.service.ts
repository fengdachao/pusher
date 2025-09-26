import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';

export interface SearchQuery {
  query: string;
  filters?: {
    topics?: string[];
    sources?: string[];
    lang?: string[];
    dateFrom?: Date;
    dateTo?: Date;
  };
  sort?: 'recency' | 'relevance' | 'popularity';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  summary: string;
  url: string;
  sourceId: string;
  sourceCode: string;
  sourceName: string;
  topics: string[];
  publishedAt: Date;
  popularity: number;
  score: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  tookMs: number;
}

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private client: Client;
  private readonly indexName = 'news_articles';

  constructor(private configService: ConfigService) {
    const opensearchUrl = this.configService.get<string>('OPENSEARCH_URL');
    
    this.client = new Client({
      node: opensearchUrl,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  async onModuleInit() {
    try {
      await this.createIndexIfNotExists();
      this.logger.log('OpenSearch connection established');
    } catch (error) {
      this.logger.error('Failed to connect to OpenSearch:', error);
    }
  }

  private async createIndexIfNotExists() {
    const exists = await this.client.indices.exists({
      index: this.indexName,
    });

    if (!exists.body) {
      await this.client.indices.create({
        index: this.indexName,
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              title: { 
                type: 'text',
                analyzer: 'smartcn',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              summary: { 
                type: 'text',
                analyzer: 'smartcn'
              },
              content: { 
                type: 'text',
                analyzer: 'smartcn'
              },
              url: { type: 'keyword' },
              sourceId: { type: 'keyword' },
              sourceCode: { type: 'keyword' },
              sourceName: { type: 'keyword' },
              topics: { type: 'keyword' },
              lang: { type: 'keyword' },
              publishedAt: { type: 'date' },
              popularity: { type: 'float' },
              clusterId: { type: 'keyword' },
            },
          },
          settings: {
            analysis: {
              analyzer: {
                smartcn: {
                  type: 'smartcn',
                },
              },
            },
            number_of_shards: 1,
            number_of_replicas: 0,
          },
        },
      });

      this.logger.log(`Created index: ${this.indexName}`);
    }
  }

  async indexArticle(article: any): Promise<void> {
    try {
      await this.client.index({
        index: this.indexName,
        id: article.id,
        body: {
          id: article.id,
          title: article.title,
          summary: article.summary,
          content: article.content,
          url: article.url,
          sourceId: article.source?.id,
          sourceCode: article.source?.code,
          sourceName: article.source?.name,
          topics: article.topics?.map(t => t.code) || [],
          lang: article.lang,
          publishedAt: article.publishedAt,
          popularity: article.popularity,
          clusterId: article.clusterId,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to index article ${article.id}:`, error);
    }
  }

  async search(searchQuery: SearchQuery): Promise<SearchResponse> {
    const { query, filters = {}, sort = 'relevance', page = 1, limit = 20 } = searchQuery;
    
    const must: any[] = [];
    const filter: any[] = [];

    // Text search
    if (query && query.trim()) {
      must.push({
        multi_match: {
          query: query.trim(),
          fields: ['title^3', 'summary^2', 'content'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    } else {
      must.push({ match_all: {} });
    }

    // Filters
    if (filters.topics?.length) {
      filter.push({ terms: { topics: filters.topics } });
    }

    if (filters.sources?.length) {
      filter.push({ terms: { sourceCode: filters.sources } });
    }

    if (filters.lang?.length) {
      filter.push({ terms: { lang: filters.lang } });
    }

    if (filters.dateFrom || filters.dateTo) {
      const dateRange: any = {};
      if (filters.dateFrom) dateRange.gte = filters.dateFrom.toISOString();
      if (filters.dateTo) dateRange.lte = filters.dateTo.toISOString();
      filter.push({ range: { publishedAt: dateRange } });
    }

    // Sorting
    const sortOptions = [];
    switch (sort) {
      case 'recency':
        sortOptions.push({ publishedAt: { order: 'desc' } });
        break;
      case 'popularity':
        sortOptions.push({ popularity: { order: 'desc' } });
        sortOptions.push({ publishedAt: { order: 'desc' } });
        break;
      case 'relevance':
      default:
        sortOptions.push({ _score: { order: 'desc' } });
        sortOptions.push({ publishedAt: { order: 'desc' } });
        break;
    }

    const searchBody = {
      query: {
        bool: {
          must,
          filter,
        },
      },
      sort: sortOptions,
      from: (page - 1) * limit,
      size: limit,
      _source: [
        'id', 'title', 'summary', 'url', 'sourceId', 'sourceCode', 
        'sourceName', 'topics', 'publishedAt', 'popularity'
      ],
    };

    try {
      const response = await this.client.search({
        index: this.indexName,
        body: searchBody,
      });

      const hits = response.body.hits;
      const results: SearchResult[] = hits.hits.map((hit: any) => ({
        ...hit._source,
        score: hit._score,
        publishedAt: new Date(hit._source.publishedAt),
      }));

      return {
        results,
        total: hits.total.value,
        page,
        limit,
        tookMs: response.body.took,
      };
    } catch (error) {
      this.logger.error('Search query failed:', error);
      throw new Error('Search failed');
    }
  }

  async deleteArticle(articleId: string): Promise<void> {
    try {
      await this.client.delete({
        index: this.indexName,
        id: articleId,
      });
    } catch (error) {
      if (error.meta?.statusCode !== 404) {
        this.logger.error(`Failed to delete article ${articleId}:`, error);
      }
    }
  }

  async bulkIndex(articles: any[]): Promise<void> {
    if (!articles.length) return;

    const body = articles.flatMap(article => [
      { index: { _index: this.indexName, _id: article.id } },
      {
        id: article.id,
        title: article.title,
        summary: article.summary,
        content: article.content,
        url: article.url,
        sourceId: article.source?.id,
        sourceCode: article.source?.code,
        sourceName: article.source?.name,
        topics: article.topics?.map(t => t.code) || [],
        lang: article.lang,
        publishedAt: article.publishedAt,
        popularity: article.popularity,
        clusterId: article.clusterId,
      },
    ]);

    try {
      const response = await this.client.bulk({ body });
      
      if (response.body.errors) {
        const errorCount = response.body.items.filter(item => 
          item.index?.error || item.create?.error
        ).length;
        
        this.logger.warn(`Bulk index completed with ${errorCount} errors`);
      } else {
        this.logger.log(`Bulk indexed ${articles.length} articles`);
      }
    } catch (error) {
      this.logger.error('Bulk index failed:', error);
    }
  }

  async getHealthStatus(): Promise<any> {
    try {
      const health = await this.client.cluster.health({
        index: this.indexName,
      });
      return health.body;
    } catch (error) {
      this.logger.error('Failed to get search health:', error);
      return { status: 'red', error: error.message };
    }
  }
}