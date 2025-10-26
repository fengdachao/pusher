import { Injectable } from '@nestjs/common';
import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly httpRequestDuration: Histogram<string>;
  private readonly httpRequestTotal: Counter<string>;
  private readonly activeConnections: Gauge<string>;
  private readonly databaseConnections: Gauge<string>;

  // 爬虫指标
  private readonly crawlerRunsTotal: Counter<string>;
  private readonly crawlerArticlesScraped: Counter<string>;
  private readonly crawlerErrors: Counter<string>;
  private readonly crawlerDuration: Histogram<string>;
  private readonly crawlerArticlesPerRun: Histogram<string>;
  private readonly crawlerLastRunTimestamp: Gauge<string>;
  private readonly crawlerActiveSources: Gauge<string>;
  private readonly crawlerLastRunArticles: Gauge<string>;

  constructor() {
    // 收集默认指标
    collectDefaultMetrics({ register });

    // HTTP 请求指标
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    });

    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    // 连接指标
    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
    });

    this.databaseConnections = new Gauge({
      name: 'database_connections_active',
      help: 'Number of active database connections',
    });

    // 爬虫指标
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
    register.registerMetric(this.httpRequestDuration);
    register.registerMetric(this.httpRequestTotal);
    register.registerMetric(this.activeConnections);
    register.registerMetric(this.databaseConnections);
    
    // 注册爬虫指标
    register.registerMetric(this.crawlerRunsTotal);
    register.registerMetric(this.crawlerArticlesScraped);
    register.registerMetric(this.crawlerErrors);
    register.registerMetric(this.crawlerDuration);
    register.registerMetric(this.crawlerArticlesPerRun);
    register.registerMetric(this.crawlerLastRunTimestamp);
    register.registerMetric(this.crawlerActiveSources);
    register.registerMetric(this.crawlerLastRunArticles);
  }

  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration);
    
    this.httpRequestTotal
      .labels(method, route, statusCode.toString())
      .inc();
  }

  setActiveConnections(count: number) {
    this.activeConnections.set(count);
  }

  setDatabaseConnections(count: number) {
    this.databaseConnections.set(count);
  }

  // 爬虫指标记录方法
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
}
