import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
export declare class SearchService implements OnModuleInit {
    private configService;
    private readonly logger;
    private client;
    private readonly indexName;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private createIndexIfNotExists;
    indexArticle(article: any): Promise<void>;
    search(searchQuery: SearchQuery): Promise<SearchResponse>;
    deleteArticle(articleId: string): Promise<void>;
    bulkIndex(articles: any[]): Promise<void>;
    getHealthStatus(): Promise<any>;
}
