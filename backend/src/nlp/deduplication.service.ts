import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ArticleCluster } from '../articles/article-cluster.entity';
import { Article } from '../articles/article.entity';
import * as crypto from 'crypto';

@Injectable()
export class DeduplicationService {
  private readonly logger = new Logger(DeduplicationService.name);
  private readonly similarityThreshold: number;
  private readonly maxClusterSize: number;

  constructor(
    @InjectRepository(ArticleCluster)
    private clusterRepository: Repository<ArticleCluster>,
    private configService: ConfigService,
  ) {
    this.similarityThreshold = this.configService.get<number>('DEDUP_SIMILARITY_THRESHOLD', 0.8);
    this.maxClusterSize = this.configService.get<number>('MAX_ARTICLES_PER_CLUSTER', 10);
  }

  /**
   * Generate SimHash for text content
   */
  private generateSimHash(text: string): bigint {
    // Simplified SimHash implementation
    const hash = crypto.createHash('sha256').update(text.toLowerCase()).digest('hex');
    // Convert to bigint for comparison
    return BigInt('0x' + hash.slice(0, 16));
  }

  /**
   * Calculate Hamming distance between two SimHash values
   */
  private hammingDistance(hash1: bigint, hash2: bigint): number {
    const xor = hash1 ^ hash2;
    let distance = 0;
    let temp = xor;
    
    while (temp > 0n) {
      if (temp & 1n) distance++;
      temp >>= 1n;
    }
    
    return distance;
  }

  /**
   * Normalize article title for comparison
   */
  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff]/g, '') // Keep only alphanumeric and Chinese chars
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Normalize URL for comparison
   */
  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove common tracking parameters
      const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
      trackingParams.forEach(param => urlObj.searchParams.delete(param));
      
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  /**
   * Calculate similarity score between two articles
   */
  private calculateSimilarity(article1: Article, article2: Article): number {
    // Title similarity (weighted 40%)
    const normalizedTitle1 = this.normalizeTitle(article1.title);
    const normalizedTitle2 = this.normalizeTitle(article2.title);
    
    const titleSimilarity = this.calculateTextSimilarity(normalizedTitle1, normalizedTitle2);

    // URL similarity (weighted 30%)
    const normalizedUrl1 = this.normalizeUrl(article1.url);
    const normalizedUrl2 = this.normalizeUrl(article2.url);
    const urlSimilarity = normalizedUrl1 === normalizedUrl2 ? 1.0 : 0.0;

    // Content similarity using SimHash (weighted 30%)
    const content1 = `${article1.title} ${article1.summary || ''}`.slice(0, 1000);
    const content2 = `${article2.title} ${article2.summary || ''}`.slice(0, 1000);
    
    const hash1 = this.generateSimHash(content1);
    const hash2 = this.generateSimHash(content2);
    const hammingDist = this.hammingDistance(hash1, hash2);
    const contentSimilarity = Math.max(0, 1 - hammingDist / 64); // 64-bit hash

    // Combined similarity score
    return titleSimilarity * 0.4 + urlSimilarity * 0.3 + contentSimilarity * 0.3;
  }

  /**
   * Calculate text similarity using Jaccard index
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Find or create cluster for an article
   */
  async processArticleForDuplication(article: Article): Promise<ArticleCluster | null> {
    try {
      // Generate content hash for the article
      const content = `${article.title} ${article.summary || ''}`.slice(0, 1000);
      const simhash = this.generateSimHash(content);

      // Find potential clusters within the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentClusters = await this.clusterRepository
        .createQueryBuilder('cluster')
        .leftJoinAndSelect('cluster.articles', 'article')
        .leftJoinAndSelect('article.source', 'source')
        .where('cluster.created_at >= :date', { date: sevenDaysAgo })
        .getMany();

      // Check similarity with existing clusters
      for (const cluster of recentClusters) {
        if (cluster.articles && cluster.articles.length > 0) {
          const representativeArticle = cluster.articles[0];
          const similarity = this.calculateSimilarity(article, representativeArticle);

          if (similarity >= this.similarityThreshold) {
            // Check cluster size limit
            if (cluster.articles.length < this.maxClusterSize) {
              this.logger.log(`Added article ${article.id} to existing cluster ${cluster.id} (similarity: ${similarity.toFixed(3)})`);
              return cluster;
            } else {
              this.logger.log(`Cluster ${cluster.id} is full, creating new cluster for article ${article.id}`);
              break;
            }
          }
        }
      }

      // Create new cluster if no similar cluster found
      const newCluster = this.clusterRepository.create({
        simhash,
        representativeArticleId: article.id,
      });

      const savedCluster = await this.clusterRepository.save(newCluster);
      this.logger.log(`Created new cluster ${savedCluster.id} for article ${article.id}`);
      
      return savedCluster;
    } catch (error) {
      this.logger.error(`Error processing article ${article.id} for deduplication:`, error);
      return null;
    }
  }

  /**
   * Get duplicate articles for a given article
   */
  async getDuplicates(articleId: string): Promise<Article[]> {
    try {
      const cluster = await this.clusterRepository
        .createQueryBuilder('cluster')
        .leftJoinAndSelect('cluster.articles', 'article')
        .leftJoinAndSelect('article.source', 'source')
        .where('article.id = :articleId', { articleId })
        .getOne();

      if (!cluster || !cluster.articles) {
        return [];
      }

      return cluster.articles.filter(article => article.id !== articleId);
    } catch (error) {
      this.logger.error(`Error getting duplicates for article ${articleId}:`, error);
      return [];
    }
  }

  /**
   * Get cluster statistics
   */
  async getClusterStats(): Promise<any> {
    try {
      const totalClusters = await this.clusterRepository.count();
      
      const clusterSizes = await this.clusterRepository
        .createQueryBuilder('cluster')
        .leftJoin('cluster.articles', 'article')
        .select('cluster.id')
        .addSelect('COUNT(article.id)', 'articleCount')
        .groupBy('cluster.id')
        .getRawMany();

      const singletonClusters = clusterSizes.filter(c => parseInt(c.articleCount) === 1).length;
      const duplicateClusters = clusterSizes.filter(c => parseInt(c.articleCount) > 1).length;
      const avgClusterSize = clusterSizes.reduce((sum, c) => sum + parseInt(c.articleCount), 0) / clusterSizes.length;

      return {
        totalClusters,
        singletonClusters,
        duplicateClusters,
        avgClusterSize: Math.round(avgClusterSize * 100) / 100,
        deduplicationRate: duplicateClusters / totalClusters,
      };
    } catch (error) {
      this.logger.error('Error getting cluster stats:', error);
      return null;
    }
  }
}