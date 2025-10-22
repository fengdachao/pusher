import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { ArticlesService } from '../articles/articles.service';
import { RankingService } from '../ranking/ranking.service';
export declare class SubscriptionsController {
    private subscriptionsService;
    private articlesService;
    private rankingService;
    constructor(subscriptionsService: SubscriptionsService, articlesService: ArticlesService, rankingService: RankingService);
    findAll(req: any): Promise<{
        items: import("./subscription.entity").Subscription[];
        page: number;
        limit: number;
        total: number;
    }>;
    create(req: any, createSubscriptionDto: CreateSubscriptionDto): Promise<import("./subscription.entity").Subscription>;
    findOne(req: any, id: string): Promise<import("./subscription.entity").Subscription>;
    update(req: any, id: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<import("./subscription.entity").Subscription>;
    delete(req: any, id: string): Promise<void>;
    getInstantRecommendations(req: any): Promise<{
        items: import("../articles/article.entity").Article[];
        page: number;
        limit: number;
        total: number;
        hasNext: boolean;
    } | {
        items: any[];
        page: number;
        limit: number;
        total: number;
    }>;
    private refreshUserRecommendations;
    private getPersonalizedFeed;
}
