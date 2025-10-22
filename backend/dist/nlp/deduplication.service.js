"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DeduplicationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeduplicationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const article_cluster_entity_1 = require("../articles/article-cluster.entity");
const crypto = require("crypto");
let DeduplicationService = DeduplicationService_1 = class DeduplicationService {
    constructor(clusterRepository, configService) {
        this.clusterRepository = clusterRepository;
        this.configService = configService;
        this.logger = new common_1.Logger(DeduplicationService_1.name);
        this.similarityThreshold = this.configService.get('DEDUP_SIMILARITY_THRESHOLD', 0.8);
        this.maxClusterSize = this.configService.get('MAX_ARTICLES_PER_CLUSTER', 10);
    }
    generateSimHash(text) {
        const hash = crypto.createHash('sha256').update(text.toLowerCase()).digest('hex');
        return BigInt('0x' + hash.slice(0, 16));
    }
    hammingDistance(hash1, hash2) {
        const xor = hash1 ^ hash2;
        let distance = 0;
        let temp = xor;
        while (temp > 0n) {
            if (temp & 1n)
                distance++;
            temp >>= 1n;
        }
        return distance;
    }
    normalizeTitle(title) {
        return title
            .toLowerCase()
            .replace(/[^\w\s\u4e00-\u9fff]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
    normalizeUrl(url) {
        try {
            const urlObj = new URL(url);
            const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
            trackingParams.forEach(param => urlObj.searchParams.delete(param));
            return urlObj.toString();
        }
        catch {
            return url;
        }
    }
    calculateSimilarity(article1, article2) {
        const normalizedTitle1 = this.normalizeTitle(article1.title);
        const normalizedTitle2 = this.normalizeTitle(article2.title);
        const titleSimilarity = this.calculateTextSimilarity(normalizedTitle1, normalizedTitle2);
        const normalizedUrl1 = this.normalizeUrl(article1.url);
        const normalizedUrl2 = this.normalizeUrl(article2.url);
        const urlSimilarity = normalizedUrl1 === normalizedUrl2 ? 1.0 : 0.0;
        const content1 = `${article1.title} ${article1.summary || ''}`.slice(0, 1000);
        const content2 = `${article2.title} ${article2.summary || ''}`.slice(0, 1000);
        const hash1 = this.generateSimHash(content1);
        const hash2 = this.generateSimHash(content2);
        const hammingDist = this.hammingDistance(hash1, hash2);
        const contentSimilarity = Math.max(0, 1 - hammingDist / 64);
        return titleSimilarity * 0.4 + urlSimilarity * 0.3 + contentSimilarity * 0.3;
    }
    calculateTextSimilarity(text1, text2) {
        const words1 = new Set(text1.split(/\s+/));
        const words2 = new Set(text2.split(/\s+/));
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        return union.size > 0 ? intersection.size / union.size : 0;
    }
    async processArticleForDuplication(article) {
        try {
            const content = `${article.title} ${article.summary || ''}`.slice(0, 1000);
            const simhash = this.generateSimHash(content);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const recentClusters = await this.clusterRepository
                .createQueryBuilder('cluster')
                .leftJoinAndSelect('cluster.articles', 'article')
                .leftJoinAndSelect('article.source', 'source')
                .where('cluster.created_at >= :date', { date: sevenDaysAgo })
                .getMany();
            for (const cluster of recentClusters) {
                if (cluster.articles && cluster.articles.length > 0) {
                    const representativeArticle = cluster.articles[0];
                    const similarity = this.calculateSimilarity(article, representativeArticle);
                    if (similarity >= this.similarityThreshold) {
                        if (cluster.articles.length < this.maxClusterSize) {
                            this.logger.log(`Added article ${article.id} to existing cluster ${cluster.id} (similarity: ${similarity.toFixed(3)})`);
                            return cluster;
                        }
                        else {
                            this.logger.log(`Cluster ${cluster.id} is full, creating new cluster for article ${article.id}`);
                            break;
                        }
                    }
                }
            }
            const newCluster = this.clusterRepository.create({
                simhash: simhash.toString(),
                representativeArticleId: article.id,
            });
            const savedCluster = await this.clusterRepository.save(newCluster);
            this.logger.log(`Created new cluster ${savedCluster.id} for article ${article.id}`);
            return savedCluster;
        }
        catch (error) {
            this.logger.error(`Error processing article ${article.id} for deduplication:`, error);
            return null;
        }
    }
    async getDuplicates(articleId) {
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
        }
        catch (error) {
            this.logger.error(`Error getting duplicates for article ${articleId}:`, error);
            return [];
        }
    }
    async getClusterStats() {
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
        }
        catch (error) {
            this.logger.error('Error getting cluster stats:', error);
            return null;
        }
    }
};
exports.DeduplicationService = DeduplicationService;
exports.DeduplicationService = DeduplicationService = DeduplicationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(article_cluster_entity_1.ArticleCluster)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], DeduplicationService);
//# sourceMappingURL=deduplication.service.js.map