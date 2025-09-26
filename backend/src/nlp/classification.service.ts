import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Topic } from '../articles/topic.entity';
import { Article } from '../articles/article.entity';

interface ClassificationResult {
  topicCode: string;
  confidence: number;
}

@Injectable()
export class ClassificationService {
  private readonly logger = new Logger(ClassificationService.name);
  private readonly confidenceThreshold: number;
  private topicKeywords: Map<string, string[]> = new Map();

  constructor(
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    private configService: ConfigService,
  ) {
    this.confidenceThreshold = this.configService.get<number>('CLASSIFICATION_CONFIDENCE_THRESHOLD', 0.6);
    this.initializeTopicKeywords();
  }

  /**
   * Initialize topic keywords for classification
   */
  private initializeTopicKeywords() {
    // Define keyword patterns for different topics
    this.topicKeywords.set('tech', [
      'ai', 'artificial intelligence', '人工智能', '机器学习', 'machine learning',
      'blockchain', '区块链', 'cryptocurrency', '加密货币', 'bitcoin', '比特币',
      'cloud', '云计算', 'big data', '大数据', 'iot', '物联网',
      'cybersecurity', '网络安全', '5g', 'quantum', '量子',
      'software', '软件', 'hardware', '硬件', 'chip', '芯片',
      'programming', '编程', 'developer', '开发者', 'github', 'microsoft', 'google', 'apple'
    ]);

    this.topicKeywords.set('business', [
      'startup', '创业', 'venture', '风投', 'investment', '投资',
      'ipo', '上市', 'merger', '并购', 'acquisition', '收购',
      'revenue', '营收', 'profit', '利润', 'market', '市场',
      'ceo', 'cfo', '首席', 'strategy', '战略', 'business model', '商业模式',
      'financing', '融资', 'valuation', '估值', 'stock', '股票',
      'economy', '经济', 'finance', '金融', 'bank', '银行'
    ]);

    this.topicKeywords.set('science', [
      'research', '研究', 'study', '学习', 'university', '大学',
      'medicine', '医学', 'health', '健康', 'drug', '药物',
      'climate', '气候', 'environment', '环境', 'energy', '能源',
      'space', '太空', 'nasa', '宇航', 'satellite', '卫星',
      'biology', '生物学', 'chemistry', '化学', 'physics', '物理',
      'vaccine', '疫苗', 'pandemic', '疫情', 'virus', '病毒'
    ]);

    this.topicKeywords.set('politics', [
      'government', '政府', 'policy', '政策', 'election', '选举',
      'president', '总统', 'minister', '部长', 'congress', '国会',
      'law', '法律', 'regulation', '法规', 'court', '法院',
      'diplomacy', '外交', 'trade', '贸易', 'sanction', '制裁',
      'democracy', '民主', 'vote', '投票', 'campaign', '竞选'
    ]);

    this.topicKeywords.set('entertainment', [
      'movie', '电影', 'film', '影片', 'actor', '演员',
      'music', '音乐', 'singer', '歌手', 'album', '专辑',
      'game', '游戏', 'gaming', '游戏', 'esports', '电竞',
      'tv', '电视', 'streaming', '流媒体', 'netflix', 'disney',
      'celebrity', '明星', 'fashion', '时尚', 'sport', '体育'
    ]);

    this.topicKeywords.set('education', [
      'school', '学校', 'student', '学生', 'teacher', '老师',
      'education', '教育', 'learning', '学习', 'course', '课程',
      'university', '大学', 'college', '学院', 'degree', '学位',
      'online', '在线', 'mooc', '网课', 'curriculum', '课程'
    ]);
  }

  /**
   * Classify article content into topics
   */
  async classifyArticle(article: Article): Promise<ClassificationResult[]> {
    try {
      const content = `${article.title} ${article.summary || ''}`.toLowerCase();
      const results: ClassificationResult[] = [];

      // Score each topic based on keyword matches
      for (const [topicCode, keywords] of this.topicKeywords) {
        const score = this.calculateTopicScore(content, keywords);
        
        if (score >= this.confidenceThreshold) {
          results.push({
            topicCode,
            confidence: score,
          });
        }
      }

      // Sort by confidence and return top results
      results.sort((a, b) => b.confidence - a.confidence);
      
      // Limit to top 3 topics to avoid over-tagging
      const topResults = results.slice(0, 3);
      
      if (topResults.length > 0) {
        this.logger.log(`Classified article ${article.id} with topics: ${topResults.map(r => `${r.topicCode}(${r.confidence.toFixed(2)})`).join(', ')}`);
      } else {
        this.logger.log(`No topics found for article ${article.id} above threshold ${this.confidenceThreshold}`);
      }

      return topResults;
    } catch (error) {
      this.logger.error(`Error classifying article ${article.id}:`, error);
      return [];
    }
  }

  /**
   * Calculate topic score based on keyword matches
   */
  private calculateTopicScore(content: string, keywords: string[]): number {
    let matches = 0;
    let totalWeight = 0;

    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matchCount = (content.match(regex) || []).length;
      
      if (matchCount > 0) {
        // Weight longer keywords more heavily
        const weight = Math.min(keyword.length / 5, 2);
        matches += matchCount * weight;
        totalWeight += weight;
      }
    }

    // Normalize score by content length and keyword coverage
    const contentWords = content.split(/\s+/).length;
    const coverage = totalWeight / keywords.length;
    const density = matches / Math.max(contentWords, 1);

    // Combine coverage and density for final score
    return Math.min((coverage * 0.6 + density * 50 * 0.4), 1.0);
  }

  /**
   * Get or create topic by code
   */
  async getOrCreateTopic(code: string, name?: string): Promise<Topic> {
    let topic = await this.topicRepository.findOne({ where: { code } });
    
    if (!topic) {
      topic = this.topicRepository.create({
        code,
        name: name || this.formatTopicName(code),
        weight: 0,
      });
      topic = await this.topicRepository.save(topic);
      this.logger.log(`Created new topic: ${code}`);
    }
    
    return topic;
  }

  /**
   * Format topic code into display name
   */
  private formatTopicName(code: string): string {
    const nameMap: Record<string, string> = {
      'tech': '科技',
      'business': '商业',
      'science': '科学',
      'politics': '政治',
      'entertainment': '娱乐',
      'education': '教育',
      'sports': '体育',
      'health': '健康',
      'finance': '金融',
      'ai': '人工智能',
    };

    return nameMap[code] || code.charAt(0).toUpperCase() + code.slice(1);
  }

  /**
   * Update topic weights based on user interactions
   */
  async updateTopicWeights(): Promise<void> {
    try {
      // This would typically analyze user interactions to adjust topic weights
      // For now, we'll implement a simple weight update based on article count
      
      const topicStats = await this.topicRepository
        .createQueryBuilder('topic')
        .leftJoin('topic.articles', 'article')
        .select('topic.code')
        .addSelect('COUNT(article.id)', 'articleCount')
        .groupBy('topic.code')
        .getRawMany();

      for (const stat of topicStats) {
        const weight = Math.min(parseInt(stat.articleCount) / 10, 100);
        await this.topicRepository.update(
          { code: stat.topic_code },
          { weight: Math.round(weight) }
        );
      }

      this.logger.log('Updated topic weights based on article counts');
    } catch (error) {
      this.logger.error('Error updating topic weights:', error);
    }
  }

  /**
   * Get classification statistics
   */
  async getClassificationStats(): Promise<any> {
    try {
      const totalTopics = await this.topicRepository.count();
      
      const topicDistribution = await this.topicRepository
        .createQueryBuilder('topic')
        .leftJoin('topic.articles', 'article')
        .select('topic.code', 'code')
        .addSelect('topic.name', 'name')
        .addSelect('COUNT(article.id)', 'articleCount')
        .groupBy('topic.code, topic.name')
        .orderBy('COUNT(article.id)', 'DESC')
        .getRawMany();

      const totalClassified = topicDistribution.reduce(
        (sum, topic) => sum + parseInt(topic.articleCount), 0
      );

      return {
        totalTopics,
        totalClassified,
        topicDistribution: topicDistribution.slice(0, 10), // Top 10 topics
        coverageRate: totalClassified > 0 ? 1.0 : 0.0, // Simplified for now
      };
    } catch (error) {
      this.logger.error('Error getting classification stats:', error);
      return null;
    }
  }
}