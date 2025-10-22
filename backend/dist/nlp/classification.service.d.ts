import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Topic } from '../articles/topic.entity';
import { Article } from '../articles/article.entity';
interface ClassificationResult {
    topicCode: string;
    confidence: number;
}
export declare class ClassificationService {
    private topicRepository;
    private configService;
    private readonly logger;
    private readonly confidenceThreshold;
    private topicKeywords;
    constructor(topicRepository: Repository<Topic>, configService: ConfigService);
    private initializeTopicKeywords;
    classifyArticle(article: Article): Promise<ClassificationResult[]>;
    private calculateTopicScore;
    getOrCreateTopic(code: string, name?: string): Promise<Topic>;
    private formatTopicName;
    updateTopicWeights(): Promise<void>;
    getClassificationStats(): Promise<any>;
}
export {};
