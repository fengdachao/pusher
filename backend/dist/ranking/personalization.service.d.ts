import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Interaction } from '../articles/interaction.entity';
import { Subscription } from '../subscriptions/subscription.entity';
export interface UserProfile {
    userId: string;
    topicPreferences: Record<string, {
        score: number;
        weight: number;
    }>;
    sourcePreferences: Record<string, {
        score: number;
        weight: number;
    }>;
    languagePreference: string;
    avgReadingTime: number;
    activeHours: number[];
    lastUpdated: Date;
}
export declare class PersonalizationService {
    private userRepository;
    private interactionRepository;
    private subscriptionRepository;
    private readonly logger;
    private userProfileCache;
    private cacheExpiration;
    constructor(userRepository: Repository<User>, interactionRepository: Repository<Interaction>, subscriptionRepository: Repository<Subscription>);
    getUserProfile(userId: string): Promise<UserProfile>;
    private buildUserProfile;
    private buildTopicPreferences;
    private buildSourcePreferences;
    private getInteractionWeight;
    private calculateAverageReadingTime;
    private analyzeActiveHours;
    private getDefaultProfile;
    updateUserPreferences(userId: string, interaction: Interaction): Promise<void>;
    clearCache(userId?: string): void;
    getCacheStats(): any;
}
