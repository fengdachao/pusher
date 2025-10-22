import { Article } from '../articles/article.entity';
export declare enum SourceType {
    RSS = "rss",
    API = "api",
    LIST = "list"
}
export declare class Source {
    id: string;
    code: string;
    name: string;
    type: SourceType;
    homepageUrl?: string;
    feedUrl?: string;
    lang?: string;
    region?: string;
    enabled: boolean;
    fetchIntervalSec: number;
    healthStatus: string;
    createdAt: Date;
    updatedAt: Date;
    articles: Article[];
}
