import { Article } from './article.entity';
export declare class ArticleCluster {
    id: string;
    simhash?: string;
    representativeArticleId?: string;
    createdAt: Date;
    articles: Article[];
}
