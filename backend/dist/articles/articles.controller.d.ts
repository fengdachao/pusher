import { ArticlesService } from './articles.service';
import { InteractionType } from './interaction.entity';
export declare class ArticlesController {
    private articlesService;
    constructor(articlesService: ArticlesService);
    getFeed(page?: number, limit?: number, sort?: 'recency' | 'trend' | 'personal', topic?: string, source?: string, lang?: string, from?: string, to?: string): Promise<{
        items: import("./article.entity").Article[];
        page: number;
        limit: number;
        total: number;
        hasNext: boolean;
    }>;
    getArticle(id: string): Promise<import("./article.entity").Article>;
    getTopics(): Promise<import("./topic.entity").Topic[]>;
    recordInteraction(req: any, body: {
        articleId: string;
        type: InteractionType;
        metadata?: {
            readTimeSec?: number;
            channel?: string;
        };
    }): Promise<{
        success: boolean;
    }>;
    search(query: string, page?: number, limit?: number, topic?: string, source?: string, lang?: string, from?: string, to?: string): Promise<{
        items: import("./article.entity").Article[];
        page: number;
        limit: number;
        total: number;
        hasNext: boolean;
        totalHits: number;
        tookMs: number;
    }>;
}
