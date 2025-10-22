import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ArticleCluster } from '../articles/article-cluster.entity';
import { Article } from '../articles/article.entity';
export declare class DeduplicationService {
    private clusterRepository;
    private configService;
    private readonly logger;
    private readonly similarityThreshold;
    private readonly maxClusterSize;
    constructor(clusterRepository: Repository<ArticleCluster>, configService: ConfigService);
    private generateSimHash;
    private hammingDistance;
    private normalizeTitle;
    private normalizeUrl;
    private calculateSimilarity;
    private calculateTextSimilarity;
    processArticleForDuplication(article: Article): Promise<ArticleCluster | null>;
    getDuplicates(articleId: string): Promise<Article[]>;
    getClusterStats(): Promise<any>;
}
