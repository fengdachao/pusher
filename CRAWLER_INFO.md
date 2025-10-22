# 🕷️ 爬虫配置和数据源信息

## ⏰ 爬虫启动时间

### 自动启动
爬虫在**后端服务启动后自动运行**，采用定时任务模式。

**调度配置**:
```typescript
@Cron(CronExpression.EVERY_10_MINUTES)  // 每10分钟执行一次
async crawlAllSources() {
  // 自动抓取所有已启用的新闻源
}
```

### 运行频率
- **定时间隔**: 每10分钟
- **首次运行**: 后端服务启动后立即执行第一次
- **持续运行**: 只要后端服务在运行，爬虫就会持续工作

## 📰 当前数据源配置

### 已启用的新闻源 (6个)

| 代码 | 名称 | 语言 | 地区 | RSS地址 | 抓取间隔 |
|------|------|------|------|---------|----------|
| **techcrunch** | TechCrunch | 英文 | 美国 | https://techcrunch.com/feed/ | 10分钟 |
| **theverge** | The Verge | 英文 | 美国 | https://www.theverge.com/rss/index.xml | 10分钟 |
| **hackernews** | Hacker News | 英文 | 美国 | https://news.ycombinator.com/rss | 10分钟 |
| **36kr** | 36氪 | 中文 | 中国 | https://36kr.com/feed | 10分钟 |
| **ithome** | IT之家 | 中文 | 中国 | https://www.ithome.com/rss/ | 10分钟 |
| **bbc-tech** | BBC Technology | 英文 | 英国 | http://feeds.bbci.co.uk/news/technology/rss.xml | 10分钟 |

### 数据源分类

**按语言分类**:
- 🇨🇳 中文: 2个 (36氪, IT之家)
- 🇬🇧 英文: 4个 (TechCrunch, The Verge, Hacker News, BBC)

**按地区分类**:
- 🇺🇸 美国: 3个 (TechCrunch, The Verge, Hacker News)
- 🇨🇳 中国: 2个 (36氪, IT之家)
- 🇬🇧 英国: 1个 (BBC Technology)

**按类型分类**:
- RSS源: 6个 (全部)

## 📊 当前抓取统计

### 文章数量统计 (截至最新)

| 新闻源 | 文章数量 | 最新文章时间 | 占比 |
|--------|----------|--------------|------|
| **BBC Technology** | 79篇 | 2025-10-21 16:29 | 34.1% |
| **IT之家** | 63篇 | 2025-10-21 20:43 | 27.2% |
| **36氪** | 40篇 | 2025-10-21 20:56 | 17.2% |
| **TechCrunch** | 30篇 | 2025-10-21 20:56 | 12.9% |
| **The Verge** | 20篇 | 2025-10-21 20:40 | 8.6% |
| **总计** | **232篇** | - | 100% |

### 抓取活跃度

✅ **所有源都在正常工作**
- 所有新闻源状态: `healthy`
- 最新文章时间: 今天 (2025-10-21)
- 爬虫运行状态: 正常

## 🔧 爬虫技术细节

### 工作流程

```
1. 后端服务启动
   ↓
2. 爬虫定时任务初始化
   ↓
3. 每10分钟执行一次:
   ├─ 获取所有已启用的数据源
   ├─ 逐个访问RSS Feed
   ├─ 解析新文章
   ├─ 检查重复 (基于URL hash)
   ├─ 保存到数据库
   ├─ NLP处理 (主题分类、去重)
   └─ 记录日志
```

### 核心功能

1. **RSS抓取** (`rss-crawler.service.ts`)
   - 解析RSS/Atom feed
   - 提取文章标题、摘要、内容
   - 处理文章时间戳

2. **去重机制**
   - URL hash去重
   - SimHash相似度检测
   - 聚类分组

3. **内容处理**
   - 自动主题分类
   - 语言检测
   - 关键词提取

## 📋 爬虫配置文件

### 数据源配置位置
```
backend/src/database/seeds/index.ts  - 初始数据源定义
数据库表: sources                     - 运行时配置
```

### 添加新数据源

在数据库中插入新记录：

```sql
INSERT INTO sources (
  code, name, type, homepage_url, feed_url, 
  lang, region, enabled, fetch_interval_sec, health_status
) VALUES (
  'example',              -- 唯一代码
  '示例新闻',             -- 显示名称
  'rss',                  -- 类型: rss/api/list
  'https://example.com',  -- 网站首页
  'https://example.com/feed.xml',  -- RSS地址
  'zh',                   -- 语言
  'CN',                   -- 地区
  true,                   -- 是否启用
  600,                    -- 抓取间隔(秒)
  'healthy'               -- 健康状态
);
```

## 📈 监控和日志

### 查看爬虫日志

后端服务日志会显示：
```
[CrawlerService] Starting scheduled crawl of all sources
[RssCrawlerService] Crawling RSS source: techcrunch
[RssCrawlerService] Fetched 10 new articles from techcrunch
[CrawlerService] Crawl completed. Total new articles: 50
```

### 检查爬虫状态

```bash
# 查看最近的文章
curl "http://localhost:3001/api/v1/feed?page=1&limit=10"

# 查看数据库统计
docker exec -i pusher_postgres_1 psql -U postgres -d news_subscription -c "
  SELECT 
    s.name, 
    COUNT(a.id) as article_count,
    MAX(a.published_at) as latest_article
  FROM sources s
  LEFT JOIN articles a ON s.id = a.source_id
  WHERE s.enabled = true
  GROUP BY s.name;
"
```

## 🎯 优化建议

### 当前配置分析

✅ **优势**:
- 数据源多样化（中英文混合）
- 覆盖主流科技媒体
- 自动定时更新
- 去重和分类自动化

⚠️ **可改进**:
- 可以添加更多数据源
- 可以调整抓取频率
- 可以添加内容过滤规则

### 推荐添加的数据源

**中文**:
- 虎嗅 (huxiu.com)
- 雷锋网 (leiphone.com)
- 少数派 (sspai.com)
- 爱范儿 (ifanr.com)

**英文**:
- Hacker News (news.ycombinator.com)
- Ars Technica (arstechnica.com)
- Wired (wired.com)
- The Next Web (thenextweb.com)

## 🔧 手动触发爬虫

虽然爬虫自动运行，但如果需要手动触发：

### 方法1: 重启后端服务
```bash
# 爬虫会在启动后立即执行一次
cd backend
npm run start:dev
```

### 方法2: 等待下一个周期
爬虫每10分钟自动运行一次

### 方法3: 添加手动触发API (待实现)
可以在 `crawler.controller.ts` 中添加手动触发端点

## 📊 实时统计

运行以下命令查看最新统计：

```bash
cd /Users/dachaofeng/pusher
docker exec -i pusher_postgres_1 psql -U postgres -d news_subscription -c "
  SELECT 
    '总文章数' as metric, 
    COUNT(*)::text as value 
  FROM articles WHERE deleted = false
  UNION ALL
  SELECT 
    '今日新增', 
    COUNT(*)::text 
  FROM articles 
  WHERE deleted = false 
    AND fetched_at::date = CURRENT_DATE
  UNION ALL
  SELECT 
    '活跃源数', 
    COUNT(*)::text 
  FROM sources 
  WHERE enabled = true;
"
```

---

## 🎉 总结

- ⏰ **启动**: 后端服务启动时自动运行
- 🔄 **频率**: 每10分钟自动抓取
- 📰 **数据源**: 5个主流科技媒体
- 📊 **当前**: 已抓取232篇文章
- ✅ **状态**: 所有源健康运行中

