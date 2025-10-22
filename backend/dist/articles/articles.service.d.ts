import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { Topic } from './topic.entity';
import { Interaction, InteractionType } from './interaction.entity';
import { SearchService } from '../search/search.service';
import { RankingService } from '../ranking/ranking.service';
import { PersonalizationService } from '../ranking/personalization.service';
import { DeduplicationService } from '../nlp/deduplication.service';
import { ClassificationService } from '../nlp/classification.service';
export declare class ArticlesService {
    private articlesRepository;
    private topicsRepository;
    private interactionsRepository;
    private searchService;
    private rankingService;
    private personalizationService;
    private deduplicationService;
    private classificationService;
    private readonly logger;
    constructor(articlesRepository: Repository<Article>, topicsRepository: Repository<Topic>, interactionsRepository: Repository<Interaction>, searchService: SearchService, rankingService: RankingService, personalizationService: PersonalizationService, deduplicationService: DeduplicationService, classificationService: ClassificationService);
    getFeed(options: {
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
    }): Promise<{
        items: Article[];
        page: number;
        limit: number;
        total: number;
        hasNext: boolean;
    }>;
    findById(id: string): Promise<Article | null>;
    getTopics(): Promise<Topic[]>;
    recordInteraction(userId: string, articleId: string, type: InteractionType, metadata?: any): Promise<void>;
    getRelatedArticles(articleId: string, limit?: number): Promise<Article[]>;
    search(query: string, options: {
        page?: number;
        limit?: number;
        topic?: string;
        source?: string;
        lang?: string;
        from?: Date;
        to?: Date;
        sort?: 'relevance' | 'recency' | 'popularity';
    }): Promise<{
        items: Article[];
        page: number;
        limit: number;
        total: number;
        hasNext: boolean;
        totalHits: number;
        tookMs: number;
    }>;
    processNewArticle(article: Article): Promise<Article>;
}
