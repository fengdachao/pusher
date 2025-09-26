import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Article } from '../articles/article.entity';
import { User } from '../users/user.entity';
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

@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);

  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @InjectRepository(Interaction)
    private interactionRepository: Repository<Interaction>,
    private personalizationService: PersonalizationService,
    private configService: ConfigService,
  ) {}

  /**
   * Rank articles for a user based on personalization and other factors
   */
  async rankArticlesForUser(
    articles: Article[],
    userId: string,
    options: RankingOptions = {},
  ): Promise<ScoredArticle[]> {
    try {
      const {
        sort = 'personal',
        diversityEnabled = true,
        explorationRate = 0.1,
      } = options;

      // Get user preferences
      const userProfile = await this.personalizationService.getUserProfile(userId);
      
      // Score each article
      const scoredArticles: ScoredArticle[] = [];
      
      for (const article of articles) {
        const score = await this.calculateArticleScore(article, userId, userProfile, sort);
        const reasons = this.generateScoreReasons(article, userProfile, sort);
        
        scoredArticles.push({
          article,
          score,
          reasons,
        });
      }

      // Sort by score
      let rankedArticles = scoredArticles.sort((a, b) => b.score - a.score);

      // Apply diversity constraint if enabled
      if (diversityEnabled) {
        rankedArticles = this.applyDiversityConstraint(rankedArticles);
      }

      // Apply exploration (ε-greedy) if enabled
      if (explorationRate > 0) {
        rankedArticles = this.applyExploration(rankedArticles, explorationRate);
      }

      this.logger.log(`Ranked ${articles.length} articles for user ${userId} using ${sort} strategy`);
      return rankedArticles;
    } catch (error) {
      this.logger.error(`Error ranking articles for user ${userId}:`, error);
      // Fallback to recency sorting
      return articles.map(article => ({
        article,
        score: this.calculateRecencyScore(article),
        reasons: ['Fallback: Recency'],
      })).sort((a, b) => b.score - a.score);
    }
  }

  /**
   * Calculate comprehensive score for an article
   */
  private async calculateArticleScore(
    article: Article,
    userId: string,
    userProfile: any,
    sort: string,
  ): Promise<number> {
    let score = 0;

    switch (sort) {
      case 'personal':
        score = await this.calculatePersonalizedScore(article, userId, userProfile);
        break;
      case 'recency':
        score = this.calculateRecencyScore(article);
        break;
      case 'popularity':
        score = this.calculatePopularityScore(article);
        break;
      case 'trending':
        score = await this.calculateTrendingScore(article);
        break;
      default:
        score = await this.calculatePersonalizedScore(article, userId, userProfile);
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate personalized score based on user preferences and behavior
   */
  private async calculatePersonalizedScore(
    article: Article,
    userId: string,
    userProfile: any,
  ): Promise<number> {
    let score = 0;
    const weights = {
      topicMatch: 0.3,
      sourcePreference: 0.2,
      recency: 0.2,
      popularity: 0.15,
      behaviorPattern: 0.15,
    };

    // Topic preference matching
    const topicScore = this.calculateTopicMatchScore(article, userProfile.topicPreferences);
    score += topicScore * weights.topicMatch;

    // Source preference
    const sourceScore = this.calculateSourcePreferenceScore(article, userProfile.sourcePreferences);
    score += sourceScore * weights.sourcePreference;

    // Recency factor
    const recencyScore = this.calculateRecencyScore(article);
    score += recencyScore * weights.recency;

    // Popularity factor
    const popularityScore = this.calculatePopularityScore(article);
    score += popularityScore * weights.popularity;

    // Behavior pattern matching
    const behaviorScore = await this.calculateBehaviorScore(article, userId, userProfile);
    score += behaviorScore * weights.behaviorPattern;

    return score;
  }

  /**
   * Calculate topic matching score
   */
  private calculateTopicMatchScore(article: Article, topicPreferences: any): number {
    if (!article.topics || !topicPreferences) return 0.5;

    let score = 0;
    let totalWeight = 0;

    for (const articleTopic of article.topics) {
      const preference = topicPreferences[articleTopic.code];
      if (preference) {
        score += preference.score * preference.weight;
        totalWeight += preference.weight;
      }
    }

    return totalWeight > 0 ? score / totalWeight : 0.3;
  }

  /**
   * Calculate source preference score
   */
  private calculateSourcePreferenceScore(article: Article, sourcePreferences: any): number {
    if (!sourcePreferences || !article.source) return 0.5;

    const preference = sourcePreferences[article.source.code];
    return preference ? preference.score : 0.3;
  }

  /**
   * Calculate recency score (newer articles get higher scores)
   */
  private calculateRecencyScore(article: Article): number {
    if (!article.publishedAt) return 0.1;

    const now = new Date();
    const publishTime = new Date(article.publishedAt);
    const hoursAgo = (now.getTime() - publishTime.getTime()) / (1000 * 60 * 60);

    // Score decreases exponentially with age
    // Recent articles (< 6 hours) get highest score
    if (hoursAgo < 6) return 1.0;
    if (hoursAgo < 24) return 0.8;
    if (hoursAgo < 72) return 0.6;
    if (hoursAgo < 168) return 0.4; // 1 week
    return 0.2;
  }

  /**
   * Calculate popularity score based on engagement
   */
  private calculatePopularityScore(article: Article): number {
    // Use the article's popularity field if available
    if (article.popularity !== undefined) {
      return article.popularity;
    }

    // Fallback to source authority
    if (article.source) {
      const authorityMap: Record<string, number> = {
        'techcrunch': 0.9,
        'theverge': 0.8,
        '36kr': 0.7,
        'ithome': 0.6,
      };
      return authorityMap[article.source.code] || 0.5;
    }

    return 0.5;
  }

  /**
   * Calculate trending score based on recent engagement
   */
  private async calculateTrendingScore(article: Article): Promise<number> {
    try {
      // Count recent interactions (last 24 hours)
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);

      const interactionCount = await this.interactionRepository.count({
        where: {
          articleId: article.id,
          createdAt: { $gte: dayAgo } as any,
        },
      });

      // Normalize by log scale
      return Math.min(1.0, Math.log(interactionCount + 1) / 10);
    } catch (error) {
      return this.calculatePopularityScore(article);
    }
  }

  /**
   * Calculate behavior-based score
   */
  private async calculateBehaviorScore(
    article: Article,
    userId: string,
    userProfile: any,
  ): Promise<number> {
    try {
      // Check reading time patterns
      const readingTimeScore = this.calculateReadingTimeScore(article, userProfile.avgReadingTime);
      
      // Check time-of-day preferences
      const timePreferenceScore = this.calculateTimePreferenceScore(userProfile.activeHours);
      
      // Check language preference
      const langScore = this.calculateLanguageScore(article, userProfile.languagePreference);

      return (readingTimeScore + timePreferenceScore + langScore) / 3;
    } catch (error) {
      return 0.5;
    }
  }

  /**
   * Calculate reading time compatibility score
   */
  private calculateReadingTimeScore(article: Article, avgReadingTime: number): number {
    if (!avgReadingTime) return 0.5;

    // Estimate article reading time based on content length
    const contentLength = (article.title?.length || 0) + (article.summary?.length || 0);
    const estimatedReadTime = Math.max(1, contentLength / 200); // ~200 chars per minute

    // Prefer articles that match user's typical reading time
    const ratio = Math.min(estimatedReadTime, avgReadingTime) / Math.max(estimatedReadTime, avgReadingTime);
    return ratio;
  }

  /**
   * Calculate time preference score
   */
  private calculateTimePreferenceScore(activeHours: number[]): number {
    if (!activeHours || activeHours.length === 0) return 0.5;

    const currentHour = new Date().getHours();
    return activeHours.includes(currentHour) ? 1.0 : 0.3;
  }

  /**
   * Calculate language preference score
   */
  private calculateLanguageScore(article: Article, languagePreference: string): number {
    if (!languagePreference || !article.lang) return 0.5;
    return article.lang === languagePreference ? 1.0 : 0.3;
  }

  /**
   * Apply diversity constraint to avoid filter bubbles
   */
  private applyDiversityConstraint(scoredArticles: ScoredArticle[]): ScoredArticle[] {
    const diversified: ScoredArticle[] = [];
    const usedSources = new Set<string>();
    const usedTopics = new Set<string>();

    // First pass: select top articles with diversity constraints
    for (const item of scoredArticles) {
      const article = item.article;
      const sourceCode = article.source?.code;
      const topicCodes = article.topics?.map(t => t.code) || [];

      // Check diversity constraints
      const sourceUsed = sourceCode && usedSources.has(sourceCode);
      const topicOverlap = topicCodes.some(code => usedTopics.has(code));

      // Allow article if it adds diversity or has very high score
      if (!sourceUsed && !topicOverlap || item.score > 0.9) {
        diversified.push(item);
        
        if (sourceCode) usedSources.add(sourceCode);
        topicCodes.forEach(code => usedTopics.add(code));
        
        // Limit diversity constraint to top 20 articles
        if (diversified.length >= 20) break;
      }
    }

    // Second pass: fill remaining slots with best remaining articles
    const remaining = scoredArticles.filter(item => !diversified.includes(item));
    diversified.push(...remaining);

    return diversified;
  }

  /**
   * Apply exploration strategy (ε-greedy)
   */
  private applyExploration(
    scoredArticles: ScoredArticle[],
    explorationRate: number,
  ): ScoredArticle[] {
    if (Math.random() > explorationRate) {
      return scoredArticles; // Exploit: return ranked results
    }

    // Explore: inject some random articles in top positions
    const result = [...scoredArticles];
    const explorationCount = Math.min(3, Math.floor(result.length * 0.1));
    
    for (let i = 0; i < explorationCount; i++) {
      const randomIndex = Math.floor(Math.random() * result.length);
      const randomItem = result.splice(randomIndex, 1)[0];
      
      if (randomItem) {
        randomItem.reasons.push('Exploration');
        result.splice(i * 3, 0, randomItem); // Insert at strategic positions
      }
    }

    return result;
  }

  /**
   * Generate human-readable reasons for the score
   */
  private generateScoreReasons(article: Article, userProfile: any, sort: string): string[] {
    const reasons: string[] = [];

    if (sort === 'personal') {
      if (article.topics?.some(t => userProfile.topicPreferences?.[t.code])) {
        reasons.push('Matches your interests');
      }
      
      if (article.source && userProfile.sourcePreferences?.[article.source.code]) {
        reasons.push('From preferred source');
      }
      
      if (this.calculateRecencyScore(article) > 0.8) {
        reasons.push('Recent news');
      }
      
      if (this.calculatePopularityScore(article) > 0.7) {
        reasons.push('Popular article');
      }
    } else {
      reasons.push(`Sorted by ${sort}`);
    }

    return reasons.length > 0 ? reasons : ['Recommended for you'];
  }
}