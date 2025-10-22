import { Article } from './article.entity';
export declare class Topic {
    id: string;
    code: string;
    name: string;
    weight: number;
    createdAt: Date;
    articles: Article[];
}
