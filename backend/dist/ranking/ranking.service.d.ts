import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Article } from '../articles/article.entity';
import { Interaction } from '../articles/interaction.entity';
import { PersonalizationService } from './personalization.service';
export interface RankingOptions {
    userId?: string;
    sort?: 'personal' | 'recency' | 'popularity' | 'trending';
    diversityEnabled?: boolean;
    explorationRate?: number;
}
export interface ScoredArticle {
    article: Article;
    score: number;
    reasons: string[];
}
export declare class RankingService {
    private articleRepository;
    private interactionRepository;
    private personalizationService;
    private configService;
    private readonly logger;
    constructor(articleRepository: Repository<Article>, interactionRepository: Repository<Interaction>, personalizationService: PersonalizationService, configService: ConfigService);
    rankArticlesForUser(articles: Article[], userId: string, options?: RankingOptions): Promise<ScoredArticle[]>;
    private calculateArticleScore;
    private calculatePersonalizedScore;
    private calculateTopicMatchScore;
    private calculateSourcePreferenceScore;
    private calculateRecencyScore;
    private calculatePopularityScore;
    private calculateTrendingScore;
    private calculateBehaviorScore;
    private calculateReadingTimeScore;
    private calculateTimePreferenceScore;
    private calculateLanguageScore;
    private applyDiversityConstraint;
    private applyExploration;
    private generateScoreReasons;
}
