# 📊 P0 监控增强实施计划 - 详细版

## 🎯 总览

**实施范围**: P0 优先级监控功能  
**预计时间**: 5 个工作日  
**团队成员**: 1 人  
**开始日期**: 2025-10-26

---

## 📋 P0 任务列表

| 任务 | 预计时间 | 依赖 | 状态 |
|------|---------|------|------|
| 1. Backend 爬虫监控 | 2 天 | 无 | 🔴 待开始 |
| 2. Frontend 基础监控 | 2 天 | 无 | 🔴 待开始 |
| 3. Backend API 详细监控 | 1 天 | 任务1 | 🔴 待开始 |

---

## 📝 任务 1: Backend 爬虫监控

### 🎯 目标
为爬虫系统添加完整的监控指标，能够实时追踪爬虫运行状态、性能和问题。

### 📊 需要监控的指标

#### Counter（计数器）
- `crawler_runs_total{source, status}` - 爬虫运行总次数
- `crawler_articles_scraped_total{source}` - 爬取文章总数
- `crawler_errors_total{source, error_type}` - 错误总数

#### Histogram（直方图）
- `crawler_duration_seconds{source}` - 爬取耗时分布
- `crawler_articles_per_run{source}` - 每次爬取文章数分布

#### Gauge（仪表）
- `crawler_last_run_timestamp{source}` - 最后运行时间戳
- `crawler_active_sources` - 当前活跃源数量
- `crawler_last_run_articles{source}` - 最后一次爬取的文章数

---

### 📁 需要修改的文件

#### 1. `backend/src/metrics/metrics.service.ts`

**修改内容**: 添加爬虫相关指标

```typescript
// 在类中添加新的指标属性
private readonly crawlerRunsTotal: Counter<string>;
private readonly crawlerArticlesScraped: Counter<string>;
private readonly crawlerErrors: Counter<string>;
private readonly crawlerDuration: Histogram<string>;
private readonly crawlerArticlesPerRun: Histogram<string>;
private readonly crawlerLastRunTimestamp: Gauge<string>;
private readonly crawlerActiveSources: Gauge<string>;
private readonly crawlerLastRunArticles: Gauge<string>;

// 在 constructor 中初始化
this.crawlerRunsTotal = new Counter({
  name: 'crawler_runs_total',
  help: 'Total number of crawler runs',
  labelNames: ['source', 'status'],
});

this.crawlerArticlesScraped = new Counter({
  name: 'crawler_articles_scraped_total',
  help: 'Total number of articles scraped',
  labelNames: ['source'],
});

this.crawlerErrors = new Counter({
  name: 'crawler_errors_total',
  help: 'Total number of crawler errors',
  labelNames: ['source', 'error_type'],
});

this.crawlerDuration = new Histogram({
  name: 'crawler_duration_seconds',
  help: 'Crawler execution duration in seconds',
  labelNames: ['source'],
  buckets: [1, 5, 10, 30, 60, 120, 300],
});

this.crawlerArticlesPerRun = new Histogram({
  name: 'crawler_articles_per_run',
  help: 'Number of articles scraped per run',
  labelNames: ['source'],
  buckets: [0, 1, 5, 10, 20, 50, 100, 200],
});

this.crawlerLastRunTimestamp = new Gauge({
  name: 'crawler_last_run_timestamp',
  help: 'Timestamp of last crawler run',
  labelNames: ['source'],
});

this.crawlerActiveSources = new Gauge({
  name: 'crawler_active_sources',
  help: 'Number of active crawler sources',
});

this.crawlerLastRunArticles = new Gauge({
  name: 'crawler_last_run_articles',
  help: 'Number of articles from last run',
  labelNames: ['source'],
});

// 注册所有指标
register.registerMetric(this.crawlerRunsTotal);
register.registerMetric(this.crawlerArticlesScraped);
register.registerMetric(this.crawlerErrors);
register.registerMetric(this.crawlerDuration);
register.registerMetric(this.crawlerArticlesPerRun);
register.registerMetric(this.crawlerLastRunTimestamp);
register.registerMetric(this.crawlerActiveSources);
register.registerMetric(this.crawlerLastRunArticles);

// 添加记录方法
recordCrawlerRun(source: string, status: 'success' | 'failure', duration: number, articlesCount: number) {
  this.crawlerRunsTotal.labels(source, status).inc();
  this.crawlerDuration.labels(source).observe(duration);
  this.crawlerArticlesPerRun.labels(source).observe(articlesCount);
  this.crawlerLastRunTimestamp.labels(source).set(Date.now() / 1000);
  this.crawlerLastRunArticles.labels(source).set(articlesCount);
  
  if (status === 'success') {
    this.crawlerArticlesScraped.labels(source).inc(articlesCount);
  }
}

recordCrawlerError(source: string, errorType: string) {
  this.crawlerErrors.labels(source, errorType).inc();
}

setActiveSources(count: number) {
  this.crawlerActiveSources.set(count);
}
```

**验收标准**:
- ✅ 所有8个指标定义正确
- ✅ 标签（labels）设置合理
- ✅ Buckets 范围适合业务场景
- ✅ 编译无错误

---

#### 2. `backend/src/crawler/crawler.service.ts`

**修改内容**: 集成指标记录

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Source, SourceType } from '../sources/source.entity';
import { RssCrawlerService } from './rss-crawler.service';
import { MetricsService } from '../metrics/metrics.service'; // 新增

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  constructor(
    @InjectRepository(Source)
    private sourcesRepository: Repository<Source>,
    private rssCrawlerService: RssCrawlerService,
    private metricsService: MetricsService, // 新增注入
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async crawlAllSources() {
    this.logger.log('Starting scheduled crawl of all sources');
    const startTime = Date.now();

    const sources = await this.sourcesRepository.find({
      where: { enabled: true },
    });

    // 记录活跃源数量
    this.metricsService.setActiveSources(sources.length);

    let totalNewArticles = 0;

    for (const source of sources) {
      const sourceStartTime = Date.now();
      
      try {
        let newArticles = 0;

        switch (source.type) {
          case SourceType.RSS:
            newArticles = await this.rssCrawlerService.crawlRssSource(source);
            break;
          case SourceType.API:
            this.logger.log(`API crawler not implemented for ${source.code}`);
            break;
          case SourceType.LIST:
            this.logger.log(`List crawler not implemented for ${source.code}`);
            break;
        }

        totalNewArticles += newArticles;

        // 记录成功的爬取
        const duration = (Date.now() - sourceStartTime) / 1000;
        this.metricsService.recordCrawlerRun(
          source.code,
          'success',
          duration,
          newArticles
        );

      } catch (error) {
        this.logger.error(`Error crawling source ${source.code}:`, error);
        
        // 记录失败的爬取
        const duration = (Date.now() - sourceStartTime) / 1000;
        this.metricsService.recordCrawlerRun(
          source.code,
          'failure',
          duration,
          0
        );
        
        // 记录错误类型
        const errorType = error.name || 'UnknownError';
        this.metricsService.recordCrawlerError(source.code, errorType);
      }
    }

    this.logger.log(`Crawl completed. Total new articles: ${totalNewArticles}`);
  }

  async crawlSource(sourceCode: string): Promise<number> {
    const startTime = Date.now();
    
    const source = await this.sourcesRepository.findOne({
      where: { code: sourceCode, enabled: true },
    });

    if (!source) {
      throw new Error(`Source ${sourceCode} not found or disabled`);
    }

    try {
      let newArticles = 0;
      
      switch (source.type) {
        case SourceType.RSS:
          newArticles = await this.rssCrawlerService.crawlRssSource(source);
          break;
        default:
          throw new Error(`Crawler not implemented for source type ${source.type}`);
      }

      // 记录成功
      const duration = (Date.now() - startTime) / 1000;
      this.metricsService.recordCrawlerRun(
        source.code,
        'success',
        duration,
        newArticles
      );

      return newArticles;
    } catch (error) {
      // 记录失败
      const duration = (Date.now() - startTime) / 1000;
      this.metricsService.recordCrawlerRun(
        source.code,
        'failure',
        duration,
        0
      );
      
      const errorType = error.name || 'UnknownError';
      this.metricsService.recordCrawlerError(source.code, errorType);
      
      throw error;
    }
  }
}
```

**验收标准**:
- ✅ MetricsService 正确注入
- ✅ 成功和失败都有记录
- ✅ 耗时计算准确
- ✅ 错误类型捕获正确
- ✅ 编译无错误

---

#### 3. `backend/src/monitoring/monitoring.service.ts`

**修改内容**: 增强 getCrawlerStats()

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Source } from '../sources/source.entity';
import { Article } from '../articles/article.entity';

@Injectable()
export class MonitoringService {
  constructor(
    @InjectRepository(Source)
    private sourceRepository: Repository<Source>,
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
  ) {}

  async getSystemStats() {
    // ... 保持原有代码 ...
  }

  async getDatabaseStats() {
    // 增强实现
    const articleCount = await this.articleRepository.count();
    const sourceCount = await this.sourceRepository.count();
    const enabledSourceCount = await this.sourceRepository.count({
      where: { enabled: true }
    });

    // 获取最近24小时的文章
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const recentArticles = await this.articleRepository.count({
      where: {
        fetchedAt: { $gte: yesterday } as any
      }
    });

    return {
      database: {
        status: 'connected',
        articles: {
          total: articleCount,
          last24h: recentArticles,
        },
        sources: {
          total: sourceCount,
          enabled: enabledSourceCount,
        },
        timestamp: new Date().toISOString(),
      },
    };
  }

  async getCrawlerStats() {
    // 完全重写，提供详细统计
    const sources = await this.sourceRepository.find({
      where: { enabled: true }
    });

    const sourceStats = await Promise.all(
      sources.map(async (source) => {
        // 获取该源的文章总数
        const totalArticles = await this.articleRepository.count({
          where: { sourceId: source.id }
        });

        // 获取最近24小时的文章
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const recentArticles = await this.articleRepository.count({
          where: {
            sourceId: source.id,
            fetchedAt: { $gte: yesterday } as any
          }
        });

        // 获取最新文章时间
        const latestArticle = await this.articleRepository.findOne({
          where: { sourceId: source.id },
          order: { fetchedAt: 'DESC' }
        });

        return {
          code: source.code,
          name: source.name,
          type: source.type,
          enabled: source.enabled,
          articles: {
            total: totalArticles,
            last24h: recentArticles,
          },
          lastFetch: latestArticle?.fetchedAt || null,
          feedUrl: source.feedUrl,
        };
      })
    );

    // 计算汇总统计
    const totalArticles = sourceStats.reduce((sum, s) => sum + s.articles.total, 0);
    const totalLast24h = sourceStats.reduce((sum, s) => sum + s.articles.last24h, 0);

    return {
      crawler: {
        status: 'running',
        sources: {
          total: sources.length,
          active: sources.filter(s => s.enabled).length,
        },
        articles: {
          total: totalArticles,
          last24h: totalLast24h,
        },
        sourceDetails: sourceStats,
        timestamp: new Date().toISOString(),
      },
    };
  }

  async getUserStats() {
    // ... 保持原有代码 ...
  }
}
```

**验收标准**:
- ✅ 返回每个源的详细统计
- ✅ 包含最近24小时数据
- ✅ 汇总统计正确
- ✅ API 响应时间 < 1秒
- ✅ 编译无错误

---

#### 4. `backend/src/monitoring/monitoring.module.ts`

**修改内容**: 导入必要的实体

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { Source } from '../sources/source.entity';
import { Article } from '../articles/article.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Source, Article]),
  ],
  controllers: [MonitoringController],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
```

---

#### 5. `backend/src/crawler/crawler.module.ts`

**修改内容**: 导入 MetricsModule

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrawlerService } from './crawler.service';
import { RssCrawlerService } from './rss-crawler.service';
import { CrawlerController } from './crawler.controller';
import { Article } from '../articles/article.entity';
import { Source } from '../sources/source.entity';
import { Topic } from '../articles/topic.entity';
import { SourcesModule } from '../sources/sources.module';
import { MetricsModule } from '../metrics/metrics.module'; // 新增

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Source, Topic]),
    SourcesModule,
    MetricsModule, // 新增
  ],
  controllers: [CrawlerController],
  providers: [CrawlerService, RssCrawlerService],
  exports: [CrawlerService],
})
export class CrawlerModule {}
```

---

#### 6. 新增 `monitoring/grafana/provisioning/dashboards/crawler-dashboard.json`

**创建内容**: 完整的爬虫监控仪表板

```json
{
  "dashboard": {
    "id": null,
    "uid": "crawler-monitoring",
    "title": "爬虫监控仪表板",
    "tags": ["crawler", "monitoring"],
    "style": "dark",
    "timezone": "browser",
    "editable": true,
    "graphTooltip": 1,
    "panels": [
      {
        "id": 1,
        "title": "爬虫运行状态",
        "type": "stat",
        "targets": [
          {
            "expr": "crawler_active_sources",
            "legendFormat": "活跃源数量"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "short",
            "color": {
              "mode": "thresholds"
            },
            "thresholds": {
              "steps": [
                {"color": "red", "value": 0},
                {"color": "yellow", "value": 1},
                {"color": "green", "value": 3}
              ]
            }
          }
        },
        "gridPos": {"h": 6, "w": 4, "x": 0, "y": 0}
      },
      {
        "id": 2,
        "title": "爬取成功率（最近1小时）",
        "type": "gauge",
        "targets": [
          {
            "expr": "sum(rate(crawler_runs_total{status=\"success\"}[1h])) / sum(rate(crawler_runs_total[1h])) * 100",
            "legendFormat": "成功率"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "min": 0,
            "max": 100,
            "thresholds": {
              "steps": [
                {"color": "red", "value": 0},
                {"color": "yellow", "value": 80},
                {"color": "green", "value": 95}
              ]
            }
          }
        },
        "gridPos": {"h": 6, "w": 4, "x": 4, "y": 0}
      },
      {
        "id": 3,
        "title": "总爬取文章数（最近24小时）",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(increase(crawler_articles_scraped_total[24h]))",
            "legendFormat": "文章总数"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "short",
            "color": {
              "mode": "thresholds"
            },
            "thresholds": {
              "steps": [
                {"color": "red", "value": 0},
                {"color": "yellow", "value": 50},
                {"color": "green", "value": 100}
              ]
            }
          }
        },
        "gridPos": {"h": 6, "w": 4, "x": 8, "y": 0}
      },
      {
        "id": 4,
        "title": "错误总数（最近24小时）",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(increase(crawler_errors_total[24h]))",
            "legendFormat": "错误数"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "short",
            "color": {
              "mode": "thresholds"
            },
            "thresholds": {
              "steps": [
                {"color": "green", "value": 0},
                {"color": "yellow", "value": 5},
                {"color": "red", "value": 20}
              ]
            }
          }
        },
        "gridPos": {"h": 6, "w": 4, "x": 12, "y": 0}
      },
      {
        "id": 5,
        "title": "每个源的爬取成功率",
        "type": "bargauge",
        "targets": [
          {
            "expr": "sum by (source) (rate(crawler_runs_total{status=\"success\"}[1h])) / sum by (source) (rate(crawler_runs_total[1h])) * 100",
            "legendFormat": "{{source}}"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "min": 0,
            "max": 100,
            "thresholds": {
              "steps": [
                {"color": "red", "value": 0},
                {"color": "yellow", "value": 80},
                {"color": "green", "value": 95}
              ]
            }
          }
        },
        "options": {
          "orientation": "horizontal",
          "displayMode": "gradient"
        },
        "gridPos": {"h": 8, "w": 8, "x": 0, "y": 6}
      },
      {
        "id": 6,
        "title": "爬取速率（请求/分钟）",
        "type": "graph",
        "targets": [
          {
            "expr": "sum by (source) (rate(crawler_runs_total[5m])) * 60",
            "legendFormat": "{{source}}"
          }
        ],
        "yAxes": [
          {
            "label": "请求/分钟",
            "min": 0
          }
        ],
        "gridPos": {"h": 8, "w": 8, "x": 8, "y": 6}
      },
      {
        "id": 7,
        "title": "爬取耗时分布（P50, P95, P99）",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, sum by (source, le) (rate(crawler_duration_seconds_bucket[5m])))",
            "legendFormat": "{{source}} P50"
          },
          {
            "expr": "histogram_quantile(0.95, sum by (source, le) (rate(crawler_duration_seconds_bucket[5m])))",
            "legendFormat": "{{source}} P95"
          },
          {
            "expr": "histogram_quantile(0.99, sum by (source, le) (rate(crawler_duration_seconds_bucket[5m])))",
            "legendFormat": "{{source}} P99"
          }
        ],
        "yAxes": [
          {
            "label": "秒",
            "min": 0
          }
        ],
        "gridPos": {"h": 8, "w": 16, "x": 0, "y": 14}
      },
      {
        "id": 8,
        "title": "每次爬取文章数分布",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, sum by (source, le) (rate(crawler_articles_per_run_bucket[5m])))",
            "legendFormat": "{{source}} P50"
          },
          {
            "expr": "histogram_quantile(0.95, sum by (source, le) (rate(crawler_articles_per_run_bucket[5m])))",
            "legendFormat": "{{source}} P95"
          }
        ],
        "yAxes": [
          {
            "label": "文章数",
            "min": 0
          }
        ],
        "gridPos": {"h": 8, "w": 16, "x": 0, "y": 22}
      },
      {
        "id": 9,
        "title": "错误类型分布（最近24小时）",
        "type": "piechart",
        "targets": [
          {
            "expr": "sum by (error_type) (increase(crawler_errors_total[24h]))",
            "legendFormat": "{{error_type}}"
          }
        ],
        "options": {
          "legend": {
            "displayMode": "table",
            "placement": "right"
          },
          "pieType": "pie"
        },
        "gridPos": {"h": 8, "w": 8, "x": 16, "y": 14}
      },
      {
        "id": 10,
        "title": "最后爬取时间",
        "type": "table",
        "targets": [
          {
            "expr": "crawler_last_run_timestamp",
            "format": "table",
            "instant": true
          }
        ],
        "transformations": [
          {
            "id": "organize",
            "options": {
              "excludeByName": {
                "__name__": true,
                "instance": true,
                "job": true
              },
              "renameByName": {
                "source": "新闻源",
                "Value": "最后运行时间"
              }
            }
          }
        ],
        "fieldConfig": {
          "overrides": [
            {
              "matcher": {"id": "byName", "options": "最后运行时间"},
              "properties": [
                {
                  "id": "unit",
                  "value": "dateTimeFromNow"
                }
              ]
            }
          ]
        },
        "gridPos": {"h": 8, "w": 8, "x": 16, "y": 22}
      }
    ],
    "time": {
      "from": "now-24h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
```

**验收标准**:
- ✅ JSON 格式正确
- ✅ 所有查询语句可用
- ✅ 面板布局合理
- ✅ 颜色阈值设置合适

---

### ✅ 任务 1 验收标准

#### 功能验收
1. **指标采集**
   - [ ] 访问 `http://localhost:3001/api/v1/metrics`
   - [ ] 能看到所有8个爬虫指标
   - [ ] 标签（labels）正确

2. **Prometheus 查询**
   - [ ] 打开 `http://localhost:9090`
   - [ ] 查询 `crawler_runs_total` 有数据
   - [ ] 查询 `crawler_articles_scraped_total` 有数据
   - [ ] 查询 `crawler_duration_seconds` 有数据

3. **Grafana 仪表板**
   - [ ] 打开 `http://localhost:3002`
   - [ ] 能看到"爬虫监控仪表板"
   - [ ] 所有10个面板都有数据显示
   - [ ] 刷新能看到实时更新

4. **监控 API**
   - [ ] 访问 `http://localhost:3001/api/v1/monitoring/crawler-stats`
   - [ ] 返回所有源的详细统计
   - [ ] 响应时间 < 1秒

#### 代码质量验收
- [ ] 所有文件编译无错误
- [ ] TypeScript 类型正确
- [ ] 没有 ESLint 警告
- [ ] 日志输出正常

#### 测试验收
```bash
# 1. 手动触发爬虫
curl -X POST http://localhost:3001/api/v1/crawler/trigger \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. 等待30秒

# 3. 查看指标
curl http://localhost:3001/api/v1/metrics | grep crawler

# 4. 查看统计
curl http://localhost:3001/api/v1/monitoring/crawler-stats

# 5. 检查 Grafana
# 打开浏览器访问 http://localhost:3002
# 查看"爬虫监控仪表板"
```

---

## 📝 任务 2: Frontend 基础监控

### 🎯 目标
为前端添加性能监控、错误追踪和用户行为监控。

### 📊 需要监控的指标

#### Web Vitals
- **FCP** (First Contentful Paint) - 首次内容绘制
- **LCP** (Largest Contentful Paint) - 最大内容绘制
- **CLS** (Cumulative Layout Shift) - 累积布局偏移
- **FID** (First Input Delay) - 首次输入延迟
- **TTFB** (Time to First Byte) - 首字节时间

#### 自定义指标
- 前端错误统计
- API 调用成功率
- 页面加载时间
- 用户交互统计

---

### 📁 需要修改/创建的文件

#### 1. `frontend/package.json`

**修改内容**: 添加依赖

```json
{
  "dependencies": {
    "web-vitals": "^3.3.0"
  }
}
```

**执行命令**:
```bash
cd frontend
npm install web-vitals
```

---

#### 2. 新增 `frontend/src/utils/monitoring.ts`

**创建内容**: 监控工具类

```typescript
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

// 监控数据上报接口
interface MonitoringData {
  type: 'web-vital' | 'error' | 'api' | 'page-view' | 'custom';
  name: string;
  value: number | string;
  metadata?: Record<string, any>;
  timestamp: number;
}

class MonitoringService {
  private endpoint = '/api/v1/monitoring/frontend';
  private buffer: MonitoringData[] = [];
  private flushInterval = 10000; // 10秒上报一次
  private maxBufferSize = 50;

  constructor() {
    this.startAutoFlush();
  }

  // 初始化 Web Vitals 监控
  initWebVitals() {
    getCLS(this.handleWebVital.bind(this));
    getFCP(this.handleWebVital.bind(this));
    getFID(this.handleWebVital.bind(this));
    getLCP(this.handleWebVital.bind(this));
    getTTFB(this.handleWebVital.bind(this));
  }

  private handleWebVital(metric: any) {
    this.record({
      type: 'web-vital',
      name: metric.name,
      value: metric.value,
      metadata: {
        id: metric.id,
        rating: metric.rating,
        navigationType: metric.navigationType,
      },
      timestamp: Date.now(),
    });
  }

  // 记录错误
  recordError(error: Error, metadata?: Record<string, any>) {
    this.record({
      type: 'error',
      name: error.name || 'UnknownError',
      value: error.message,
      metadata: {
        stack: error.stack,
        ...metadata,
      },
      timestamp: Date.now(),
    });
  }

  // 记录 API 调用
  recordApiCall(
    endpoint: string,
    method: string,
    status: number,
    duration: number,
    success: boolean
  ) {
    this.record({
      type: 'api',
      name: `${method} ${endpoint}`,
      value: duration,
      metadata: {
        endpoint,
        method,
        status,
        success,
      },
      timestamp: Date.now(),
    });
  }

  // 记录页面浏览
  recordPageView(page: string, metadata?: Record<string, any>) {
    this.record({
      type: 'page-view',
      name: page,
      value: 1,
      metadata,
      timestamp: Date.now(),
    });
  }

  // 记录自定义事件
  recordCustomEvent(name: string, value: number | string, metadata?: Record<string, any>) {
    this.record({
      type: 'custom',
      name,
      value,
      metadata,
      timestamp: Date.now(),
    });
  }

  private record(data: MonitoringData) {
    this.buffer.push(data);

    // 如果缓冲区满了，立即上报
    if (this.buffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  private async flush() {
    if (this.buffer.length === 0) return;

    const data = [...this.buffer];
    this.buffer = [];

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: data }),
      });
    } catch (error) {
      console.error('Failed to send monitoring data:', error);
      // 失败的数据不重试，避免内存泄漏
    }
  }

  private startAutoFlush() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);

    // 页面卸载时上报
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }
}

// 单例
export const monitoring = new MonitoringService();
```

---

#### 3. 新增 `frontend/src/components/ErrorBoundary.tsx`

**创建内容**: React 错误边界

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { monitoring } from '../utils/monitoring';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误到监控系统
    monitoring.recordError(error, {
      componentStack: errorInfo.componentStack,
      type: 'React Error Boundary',
    });

    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '100px auto'
          }}>
            <h1 style={{ color: '#e74c3c', marginBottom: '20px' }}>
              ⚠️ 出错了
            </h1>
            <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
              页面遇到了一个问题，我们已经记录了这个错误。
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              刷新页面
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

#### 4. `frontend/src/index.tsx`

**修改内容**: 集成监控

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import { monitoring } from './utils/monitoring';

// 初始化 Web Vitals 监控
monitoring.initWebVitals();

// 全局错误监听
window.addEventListener('error', (event) => {
  monitoring.recordError(new Error(event.message), {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  monitoring.recordError(new Error(event.reason), {
    type: 'Unhandled Promise Rejection',
  });
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
            <Toaster position="top-right" />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
```

---

#### 5. `frontend/src/services/api.ts`

**修改内容**: 添加 API 调用监控

```typescript
import axios from 'axios';
import { LoginResponse, User, Article, FeedResponse, Source, Topic, Subscription, NotificationSettings } from '../types';
import { monitoring } from '../utils/monitoring';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // 记录请求开始时间
  config.metadata = { startTime: Date.now() };
  
  return config;
});

// Handle auth errors and monitor API calls
api.interceptors.response.use(
  (response) => {
    // 记录成功的 API 调用
    const duration = Date.now() - (response.config.metadata?.startTime || 0);
    monitoring.recordApiCall(
      response.config.url || '',
      response.config.method?.toUpperCase() || 'GET',
      response.status,
      duration,
      true
    );
    
    return response;
  },
  (error) => {
    // 记录失败的 API 调用
    const duration = Date.now() - (error.config?.metadata?.startTime || 0);
    monitoring.recordApiCall(
      error.config?.url || '',
      error.config?.method?.toUpperCase() || 'GET',
      error.response?.status || 0,
      duration,
      false
    );
    
    // 记录错误
    if (error.response?.status !== 401 && error.response?.status !== 404) {
      monitoring.recordError(error, {
        url: error.config?.url,
        status: error.response?.status,
      });
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// ... 保持其他代码不变 ...
```

---

#### 6. `frontend/src/App.tsx`

**修改内容**: 添加页面浏览监控

```typescript
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedPage from './pages/FeedPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import SettingsPage from './pages/SettingsPage';
import { useAuth } from './contexts/AuthContext';
import { monitoring } from './utils/monitoring';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

function App() {
  const location = useLocation();
  
  // 监控页面浏览
  useEffect(() => {
    monitoring.recordPageView(location.pathname, {
      search: location.search,
      referrer: document.referrer,
    });
  }, [location]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <FeedPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscriptions"
        element={
          <ProtectedRoute>
            <SubscriptionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
```

---

#### 7. 新增 Backend 端点: `backend/src/monitoring/monitoring.controller.ts`

**修改内容**: 添加前端监控数据接收端点

```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';
import { Logger } from '@nestjs/common';

@ApiTags('Monitoring')
@Controller('monitoring')
export class MonitoringController {
  private readonly logger = new Logger(MonitoringController.name);
  
  constructor(private readonly monitoringService: MonitoringService) {}

  // ... 保持原有端点 ...

  @Post('frontend')
  @ApiOperation({ summary: 'Receive frontend monitoring data' })
  @ApiResponse({ status: 200, description: 'Data received successfully' })
  async receiveFrontendData(@Body() data: { events: any[] }) {
    // 记录前端监控数据
    this.logger.log(`Received ${data.events.length} frontend monitoring events`);
    
    // 可以选择：
    // 1. 存储到数据库
    // 2. 转发到其他监控服务
    // 3. 聚合后存储
    
    // 这里简单记录日志，实际项目中可以存储到数据库或时序数据库
    for (const event of data.events) {
      this.logger.debug(`Frontend Event: ${event.type} - ${event.name} = ${event.value}`);
    }
    
    return { success: true, received: data.events.length };
  }
}
```

---

#### 8. 新增 `monitoring/grafana/provisioning/dashboards/frontend-dashboard.json`

**创建内容**: Frontend 监控仪表板

```json
{
  "dashboard": {
    "id": null,
    "uid": "frontend-monitoring",
    "title": "前端性能监控",
    "tags": ["frontend", "performance"],
    "style": "dark",
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Core Web Vitals",
        "type": "graph",
        "targets": [
          {
            "expr": "frontend_fcp_seconds",
            "legendFormat": "FCP (First Contentful Paint)"
          },
          {
            "expr": "frontend_lcp_seconds",
            "legendFormat": "LCP (Largest Contentful Paint)"
          },
          {
            "expr": "frontend_fid_milliseconds / 1000",
            "legendFormat": "FID (First Input Delay)"
          },
          {
            "expr": "frontend_ttfb_milliseconds / 1000",
            "legendFormat": "TTFB (Time to First Byte)"
          }
        ],
        "yAxes": [
          {
            "label": "秒",
            "min": 0
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0}
      },
      {
        "id": 2,
        "title": "CLS (Cumulative Layout Shift)",
        "type": "graph",
        "targets": [
          {
            "expr": "frontend_cls_score",
            "legendFormat": "CLS Score"
          }
        ],
        "yAxes": [
          {
            "label": "Score",
            "min": 0,
            "max": 1
          }
        ],
        "gridPos": {"h": 8, "w": 6, "x": 12, "y": 0}
      },
      {
        "id": 3,
        "title": "前端错误率",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(frontend_errors_total[5m])",
            "legendFormat": "{{type}}"
          }
        ],
        "yAxes": [
          {
            "label": "错误/秒",
            "min": 0
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 8}
      },
      {
        "id": 4,
        "title": "API 调用成功率",
        "type": "gauge",
        "targets": [
          {
            "expr": "sum(rate(frontend_api_calls_total{status=~\"2..\"}[5m])) / sum(rate(frontend_api_calls_total[5m])) * 100",
            "legendFormat": "成功率"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "min": 0,
            "max": 100,
            "thresholds": {
              "steps": [
                {"color": "red", "value": 0},
                {"color": "yellow", "value": 90},
                {"color": "green", "value": 98}
              ]
            }
          }
        },
        "gridPos": {"h": 8, "w": 6, "x": 12, "y": 8}
      },
      {
        "id": 5,
        "title": "页面浏览量",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(frontend_page_views_total[5m]) * 60",
            "legendFormat": "{{page}}"
          }
        ],
        "yAxes": [
          {
            "label": "浏览量/分钟",
            "min": 0
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 16}
      }
    ],
    "time": {
      "from": "now-6h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
```

---

### ✅ 任务 2 验收标准

#### 功能验收
1. **Web Vitals 监控**
   - [ ] 打开浏览器开发者工具
   - [ ] 查看 Network 标签
   - [ ] 能看到 `/api/v1/monitoring/frontend` 请求
   - [ ] 请求体包含 Web Vitals 数据

2. **错误捕获**
   - [ ] 故意触发一个前端错误
   - [ ] 错误被 ErrorBoundary 捕获
   - [ ] 显示友好的错误页面
   - [ ] 错误数据上报到后端

3. **API 监控**
   - [ ] 执行任意 API 调用
   - [ ] 查看后端日志
   - [ ] 能看到 API 调用统计
   - [ ] 包含耗时、状态码等信息

4. **页面浏览**
   - [ ] 切换不同页面
   - [ ] 查看后端日志
   - [ ] 能看到页面浏览记录

#### 代码质量验收
- [ ] 编译无错误
- [ ] TypeScript 类型正确
- [ ] 没有 console 警告
- [ ] 监控代码不影响性能

#### 测试验收
```bash
# 1. 前端测试
cd frontend
npm start

# 2. 访问应用
# 打开浏览器: http://localhost:3000

# 3. 打开开发者工具
# 查看 Console 和 Network

# 4. 测试各项功能
# - 登录/注册
# - 浏览页面
# - 触发错误（可选）

# 5. 查看后端日志
cd ../backend
docker-compose logs -f backend | grep "Frontend Event"
```

---

## 📝 任务 3: Backend API 详细监控

### 🎯 目标
为 Backend API 添加端点级别的详细监控，包括成功率、错误分类、慢查询追踪。

### 📊 需要监控的指标

- 每个端点的请求计数
- 每个端点的响应时间分布
- 错误率按错误类型分类
- 慢请求（>1秒）统计
- 4xx/5xx 错误详细统计

---

### 📁 需要修改/创建的文件

#### 1. 新增 `backend/src/middleware/metrics.middleware.ts`

**创建内容**: API 监控中间件

```typescript
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(MetricsMiddleware.name);

  constructor(private metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    
    // 记录原始的 res.end
    const originalEnd = res.end;

    // 重写 res.end 以记录指标
    res.end = function(...args: any[]) {
      const duration = (Date.now() - startTime) / 1000;
      const route = req.route?.path || req.path;
      const method = req.method;
      const statusCode = res.statusCode;

      // 记录指标
      try {
        this.metricsService.recordHttpRequest(
          method,
          route,
          statusCode,
          duration
        );

        // 记录慢请求
        if (duration > 1) {
          this.logger.warn(
            `Slow request: ${method} ${route} took ${duration.toFixed(2)}s`
          );
        }
      } catch (error) {
        this.logger.error('Failed to record metrics:', error);
      }

      // 调用原始的 end
      return originalEnd.apply(res, args);
    }.bind(this);

    next();
  }
}
```

---

#### 2. `backend/src/app.module.ts`

**修改内容**: 注册中间件

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
// ... 其他导入

import { MetricsMiddleware } from './middleware/metrics.middleware';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      // ... 数据库配置
    }),
    ScheduleModule.forRoot(),
    // ... 其他模块
    MetricsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MetricsMiddleware)
      .forRoutes('*'); // 应用到所有路由
  }
}
```

---

#### 3. `backend/src/metrics/metrics.service.ts`

**修改内容**: 添加错误分类指标

```typescript
// 在已有代码基础上添加

private readonly apiErrorsByType: Counter<string>;
private readonly slowRequests: Counter<string>;

constructor() {
  // ... 已有的初始化代码

  // 新增指标
  this.apiErrorsByType = new Counter({
    name: 'api_errors_by_type',
    help: 'API errors classified by type',
    labelNames: ['endpoint', 'error_type', 'status_code'],
  });

  this.slowRequests = new Counter({
    name: 'slow_requests_total',
    help: 'Total number of slow requests (>1s)',
    labelNames: ['method', 'endpoint'],
  });

  register.registerMetric(this.apiErrorsByType);
  register.registerMetric(this.slowRequests);
}

// 增强 recordHttpRequest
recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
  this.httpRequestDuration
    .labels(method, route, statusCode.toString())
    .observe(duration);
  
  this.httpRequestTotal
    .labels(method, route, statusCode.toString())
    .inc();

  // 记录慢请求
  if (duration > 1) {
    this.slowRequests.labels(method, route).inc();
  }

  // 记录错误
  if (statusCode >= 400) {
    const errorType = this.classifyError(statusCode);
    this.apiErrorsByType.labels(route, errorType, statusCode.toString()).inc();
  }
}

private classifyError(statusCode: number): string {
  if (statusCode === 400) return 'BadRequest';
  if (statusCode === 401) return 'Unauthorized';
  if (statusCode === 403) return 'Forbidden';
  if (statusCode === 404) return 'NotFound';
  if (statusCode === 422) return 'ValidationError';
  if (statusCode === 429) return 'RateLimited';
  if (statusCode >= 500) return 'ServerError';
  return 'ClientError';
}
```

---

#### 4. 更新 `monitoring/grafana/provisioning/dashboards/system-dashboard.json`

**修改内容**: 添加 API 详细监控面板

```json
{
  "dashboard": {
    "panels": [
      // ... 保持现有面板

      {
        "id": 11,
        "title": "API 错误率（按端点）",
        "type": "graph",
        "targets": [
          {
            "expr": "sum by (endpoint) (rate(http_requests_total{status_code=~\"4..|5..\"}[5m])) / sum by (endpoint) (rate(http_requests_total[5m])) * 100",
            "legendFormat": "{{endpoint}}"
          }
        ],
        "yAxes": [
          {
            "label": "错误率 %",
            "min": 0,
            "max": 100
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 30}
      },
      {
        "id": 12,
        "title": "慢请求 Top 10",
        "type": "table",
        "targets": [
          {
            "expr": "topk(10, sum by (method, endpoint) (slow_requests_total))",
            "format": "table",
            "instant": true
          }
        ],
        "transformations": [
          {
            "id": "organize",
            "options": {
              "renameByName": {
                "method": "方法",
                "endpoint": "端点",
                "Value": "慢请求数"
              }
            }
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 30}
      },
      {
        "id": 13,
        "title": "错误类型分布",
        "type": "piechart",
        "targets": [
          {
            "expr": "sum by (error_type) (increase(api_errors_by_type[24h]))",
            "legendFormat": "{{error_type}}"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 38}
      }
    ]
  }
}
```

---

### ✅ 任务 3 验收标准

#### 功能验收
1. **中间件工作**
   - [ ] 访问任意 API 端点
   - [ ] 查看 `/api/v1/metrics`
   - [ ] 能看到该端点的指标

2. **错误分类**
   - [ ] 触发不同类型的错误（401, 404, 500）
   - [ ] 查询 `api_errors_by_type`
   - [ ] 错误被正确分类

3. **慢请求**
   - [ ] 触发或等待慢请求
   - [ ] 查询 `slow_requests_total`
   - [ ] 慢请求被记录

4. **Grafana 显示**
   - [ ] 打开系统监控仪表板
   - [ ] 能看到新增的3个面板
   - [ ] 数据显示正确

#### 性能验收
- [ ] 中间件开销 < 1ms
- [ ] 指标查询响应时间 < 100ms
- [ ] 内存增长可控

---

## 📅 实施时间表

| 日期 | 任务 | 交付物 |
|------|------|--------|
| Day 1 | 任务1前半部分 | MetricsService + CrawlerService 修改完成 |
| Day 2 | 任务1后半部分 | Grafana 仪表板 + 验收测试 |
| Day 3 | 任务2前半部分 | Frontend 监控工具 + ErrorBoundary |
| Day 4 | 任务2后半部分 | API 监控 + Grafana 仪表板 |
| Day 5 | 任务3 | API 详细监控 + 全面验收 |

---

## 🎯 总体验收标准

### 功能完整性
- [ ] 所有P0任务完成
- [ ] 所有指标可查询
- [ ] 所有Grafana仪表板可用

### 代码质量
- [ ] 无TypeScript错误
- [ ] 无ESLint警告
- [ ] 测试通过

### 性能要求
- [ ] 监控开销 < 5% CPU
- [ ] 监控开销 < 100MB 内存
- [ ] 指标查询 < 1秒

### 文档完整性
- [ ] 代码注释完整
- [ ] README 更新
- [ ] 验收测试文档

---

## 📚 相关文档

- [Prometheus 查询语法](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana 面板配置](https://grafana.com/docs/grafana/latest/panels/)
- [Web Vitals 文档](https://web.dev/vitals/)
- [NestJS Middleware](https://docs.nestjs.com/middleware)

---

**制定日期**: 2025-10-26  
**预计完成**: 2025-10-31  
**状态**: 🟡 准备开始实施

