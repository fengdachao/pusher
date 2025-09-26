import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Interaction } from '../articles/interaction.entity';
import { Subscription } from '../subscriptions/subscription.entity';

export interface UserProfile {
  userId: string;
  topicPreferences: Record<string, { score: number; weight: number }>;
  sourcePreferences: Record<string, { score: number; weight: number }>;
  languagePreference: string;
  avgReadingTime: number;
  activeHours: number[];
  lastUpdated: Date;
}

@Injectable()
export class PersonalizationService {
  private readonly logger = new Logger(PersonalizationService.name);
  private userProfileCache = new Map<string, UserProfile>();
  private cacheExpiration = 1000 * 60 * 30; // 30 minutes

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Interaction)
    private interactionRepository: Repository<Interaction>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  /**
   * Get user profile with preferences and behavior patterns
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    // Check cache first
    const cached = this.userProfileCache.get(userId);
    if (cached && Date.now() - cached.lastUpdated.getTime() < this.cacheExpiration) {
      return cached;
    }

    try {
      const profile = await this.buildUserProfile(userId);
      this.userProfileCache.set(userId, profile);
      return profile;
    } catch (error) {
      this.logger.error(`Error building profile for user ${userId}:`, error);
      return this.getDefaultProfile(userId);
    }
  }

  /**
   * Build comprehensive user profile from interactions and subscriptions
   */
  private async buildUserProfile(userId: string): Promise<UserProfile> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Get user interactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const interactions = await this.interactionRepository
      .createQueryBuilder('interaction')
      .leftJoinAndSelect('interaction.article', 'article')
      .leftJoinAndSelect('article.source', 'source')
      .leftJoinAndSelect('article.topics', 'topics')
      .where('interaction.userId = :userId', { userId })
      .andWhere('interaction.createdAt >= :date', { date: thirtyDaysAgo })
      .getMany();

    // Get user subscriptions
    const subscriptions = await this.subscriptionRepository.find({
      where: { userId },
    });

    // Build topic preferences
    const topicPreferences = this.buildTopicPreferences(interactions, subscriptions);
    
    // Build source preferences
    const sourcePreferences = this.buildSourcePreferences(interactions, subscriptions);
    
    // Analyze behavior patterns
    const avgReadingTime = this.calculateAverageReadingTime(interactions);
    const activeHours = this.analyzeActiveHours(interactions);

    return {
      userId,
      topicPreferences,
      sourcePreferences,
      languagePreference: user.lang || 'zh',
      avgReadingTime,
      activeHours,
      lastUpdated: new Date(),
    };
  }

  /**
   * Build topic preferences based on interactions and subscriptions
   */
  private buildTopicPreferences(
    interactions: Interaction[],
    subscriptions: Subscription[],
  ): Record<string, { score: number; weight: number }> {
    const preferences: Record<string, { score: number; weight: number; totalInteractions: number }> = {};

    // Analyze interactions
    for (const interaction of interactions) {
      if (!interaction.article?.topics) continue;

      const weight = this.getInteractionWeight(interaction.type);
      
      for (const topic of interaction.article.topics) {
        if (!preferences[topic.code]) {
          preferences[topic.code] = { score: 0, weight: 0, totalInteractions: 0 };
        }
        
        preferences[topic.code].score += weight;
        preferences[topic.code].totalInteractions += 1;
      }
    }

    // Factor in explicit subscriptions
    for (const subscription of subscriptions) {
      for (const topicCode of subscription.topicCodes || []) {
        if (!preferences[topicCode]) {
          preferences[topicCode] = { score: 0, weight: 0, totalInteractions: 0 };
        }
        
        // Explicit subscription adds base score
        preferences[topicCode].score += subscription.priority * 0.2;
      }
    }

    // Normalize scores and calculate final weights
    const result: Record<string, { score: number; weight: number }> = {};
    const maxScore = Math.max(...Object.values(preferences).map(p => p.score));
    
    for (const [topicCode, pref] of Object.entries(preferences)) {
      const normalizedScore = maxScore > 0 ? pref.score / maxScore : 0.5;
      const weight = Math.min(1.0, pref.totalInteractions / 10); // Higher weight for more interactions
      
      result[topicCode] = {
        score: normalizedScore,
        weight: Math.max(0.1, weight), // Minimum weight
      };
    }

    return result;
  }

  /**
   * Build source preferences based on interactions and subscriptions
   */
  private buildSourcePreferences(
    interactions: Interaction[],
    subscriptions: Subscription[],
  ): Record<string, { score: number; weight: number }> {
    const preferences: Record<string, { score: number; weight: number; totalInteractions: number }> = {};

    // Analyze interactions
    for (const interaction of interactions) {
      if (!interaction.article?.source) continue;

      const sourceCode = interaction.article.source.code;
      const weight = this.getInteractionWeight(interaction.type);
      
      if (!preferences[sourceCode]) {
        preferences[sourceCode] = { score: 0, weight: 0, totalInteractions: 0 };
      }
      
      preferences[sourceCode].score += weight;
      preferences[sourceCode].totalInteractions += 1;
    }

    // Factor in explicit subscriptions
    for (const subscription of subscriptions) {
      for (const sourceCode of subscription.sourceCodes || []) {
        if (!preferences[sourceCode]) {
          preferences[sourceCode] = { score: 0, weight: 0, totalInteractions: 0 };
        }
        
        preferences[sourceCode].score += subscription.priority * 0.2;
      }
    }

    // Normalize scores
    const result: Record<string, { score: number; weight: number }> = {};
    const maxScore = Math.max(...Object.values(preferences).map(p => p.score));
    
    for (const [sourceCode, pref] of Object.entries(preferences)) {
      const normalizedScore = maxScore > 0 ? pref.score / maxScore : 0.5;
      const weight = Math.min(1.0, pref.totalInteractions / 20);
      
      result[sourceCode] = {
        score: normalizedScore,
        weight: Math.max(0.1, weight),
      };
    }

    return result;
  }

  /**
   * Get weight for different interaction types
   */
  private getInteractionWeight(interactionType: string): number {
    const weights: Record<string, number> = {
      'click': 0.3,
      'read': 0.7,
      'like': 1.0,
      'share': 1.2,
      'open_push': 0.5,
      'dislike': -0.8,
    };

    return weights[interactionType] || 0.1;
  }

  /**
   * Calculate average reading time for user
   */
  private calculateAverageReadingTime(interactions: Interaction[]): number {
    const readInteractions = interactions.filter(
      i => i.type === 'read' && i.readTimeSec && i.readTimeSec > 0
    );

    if (readInteractions.length === 0) return 60; // Default 1 minute

    const totalTime = readInteractions.reduce((sum, i) => sum + (i.readTimeSec || 0), 0);
    return totalTime / readInteractions.length;
  }

  /**
   * Analyze user's active hours based on interaction patterns
   */
  private analyzeActiveHours(interactions: Interaction[]): number[] {
    const hourCounts: Record<number, number> = {};
    
    for (const interaction of interactions) {
      const hour = new Date(interaction.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }

    // Find hours with above-average activity
    const hours = Object.keys(hourCounts).map(Number);
    const avgActivity = Object.values(hourCounts).reduce((a, b) => a + b, 0) / 24;
    
    return hours.filter(hour => hourCounts[hour] > avgActivity * 1.2);
  }

  /**
   * Get default profile for new users
   */
  private getDefaultProfile(userId: string): UserProfile {
    return {
      userId,
      topicPreferences: {
        'tech': { score: 0.7, weight: 0.5 },
        'business': { score: 0.6, weight: 0.5 },
        'science': { score: 0.5, weight: 0.3 },
      },
      sourcePreferences: {},
      languagePreference: 'zh',
      avgReadingTime: 60,
      activeHours: [7, 8, 9, 18, 19, 20, 21], // Common morning and evening hours
      lastUpdated: new Date(),
    };
  }

  /**
   * Update user preferences based on new interaction
   */
  async updateUserPreferences(userId: string, interaction: Interaction): Promise<void> {
    try {
      // Invalidate cache to force rebuild on next request
      this.userProfileCache.delete(userId);
      
      this.logger.log(`Updated preferences for user ${userId} based on ${interaction.type} interaction`);
    } catch (error) {
      this.logger.error(`Error updating preferences for user ${userId}:`, error);
    }
  }

  /**
   * Clear user profile cache
   */
  clearCache(userId?: string): void {
    if (userId) {
      this.userProfileCache.delete(userId);
    } else {
      this.userProfileCache.clear();
    }
  }

  /**
   * Get profile cache statistics
   */
  getCacheStats(): any {
    return {
      size: this.userProfileCache.size,
      users: Array.from(this.userProfileCache.keys()),
    };
  }
}