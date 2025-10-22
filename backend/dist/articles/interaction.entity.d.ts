import { User } from '../users/user.entity';
import { Article } from './article.entity';
export declare enum InteractionType {
    CLICK = "click",
    LIKE = "like",
    DISLIKE = "dislike",
    READ = "read",
    SHARE = "share",
    OPEN_PUSH = "open_push"
}
export declare class Interaction {
    id: number;
    userId: string;
    articleId: string;
    type: InteractionType;
    readTimeSec?: number;
    channel?: string;
    createdAt: Date;
    user: User;
    article: Article;
}
