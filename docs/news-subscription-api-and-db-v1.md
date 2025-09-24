### 工程栈选型（MVP）
- 后端：Node.js 20 + NestJS + TypeScript，OpenAPI(Swagger) v3，JWT + OAuth2
- 数据库：PostgreSQL 15（主从读写分离预留），Redis 7（缓存/分布式锁/限频）
- 搜索与检索：OpenSearch/Elasticsearch 8（文章检索与排序特征）
- 消息队列：Kafka（抓取流水、去重/分类/索引、推送编排）
- 对象存储：S3 兼容（封面图）
- 推送/邮件：FCM/APNs/厂商通道、Web Push、AWS SES/SendGrid
- 部署：Docker + K8s，CI/CD（GitHub Actions），可观测（Prometheus + Grafana + OpenTelemetry）

---

### API 设计（REST，v1）
- 基础
  - Base URL: `https://api.example.com/v1`
  - 认证：`Authorization: Bearer <JWT>`；匿名允许浏览公开 Feed 的部分接口（限流）
  - 分页：`?page=1&limit=20`，响应含 `page`,`limit`,`total`,`hasNext`
  - 排序：`?sort=recency|trend|personal`
  - 过滤：`?source=...&topic=...&lang=...&from=...&to=...`
  - 错误格式：
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Subscription not found",
    "requestId": "7f9c..."
  }
}
```

#### 1) 认证与用户
- POST `/auth/register`
  - body: `{ "email": "string", "password": "string", "name": "string" }`
  - 201: `{ "userId": "uuid", "token": "jwt", "refreshToken": "jwt" }`
- POST `/auth/login`
  - body: `{ "email": "string", "password": "string" }`
  - 200: `{ "userId": "uuid", "token": "jwt", "refreshToken": "jwt" }`
- POST `/auth/token/refresh`
  - body: `{ "refreshToken": "jwt" }`
  - 200: `{ "token": "jwt", "refreshToken": "jwt" }`
- POST `/auth/logout` 204
- GET `/me`
  - 200: `{ "userId","email","name","lang","region","createdAt" }`
- PATCH `/me`
  - body 可选: `{ "name","lang","region","timezone" }`
- POST `/me/devices`
  - body: `{ "platform":"ios|android|web", "token":"string", "webPush": {"endpoint","p256dh","auth"} }`
  - 201: `{ "deviceId":"uuid" }`
- DELETE `/me/devices/{deviceId}` 204

#### 2) 订阅管理
- GET `/subscriptions`
  - 200: `{ "items":[{ "id","name","keywords","topics","sources","lang","region","priority","dailyLimit","muteTimeRange" }], "page","limit","total" }`
- POST `/subscriptions`
  - body:
```json
{
  "name": "科技热点",
  "keywords": ["AI","芯片"],
  "keywordsOp": "OR",
  "topics": ["tech","business"],
  "sources": ["theverge","36kr"],
  "lang": ["zh","en"],
  "region": ["CN","US"],
  "priority": 5,
  "dailyLimit": 30,
  "muteTimeRange": { "start": "22:00", "end": "07:00" }
}
```
  - 201: `{ "id":"uuid" }`
- GET `/subscriptions/{id}` 200
- PATCH `/subscriptions/{id}` 200
- DELETE `/subscriptions/{id}` 204

#### 3) 推送与摘要设置
- GET `/notification-settings`
  - 200: `{ "morningTime":"07:30","eveningTime":"19:30","channels":{"email":true,"push":true,"webPush":true},"breakingEnabled":true,"maxItemsPerDigest":20 }`
- PATCH `/notification-settings` 200
- POST `/digests/trigger`（admin 或自触发）202: `{ "jobId":"uuid" }`
- GET `/digests/jobs?status=pending|running|done`（admin）200

#### 4) Feed 与文章
- GET `/feed`
  - query: `page,limit,sort,topic,source,lang,from,to,diversity=true|false`
  - 200:
```json
{
  "items":[
    {
      "id":"uuid","title":"string","summary":"string","url":"string","sourceId":"uuid","sourceName":"string","lang":"zh",
      "topics":["tech","ai"],"publishedAt":"2025-09-24T07:00:00Z","popularity":0.73,"clusterId":"uuid",
      "imageUrl":"https://...","read":false,"bookmarked":false
    }
  ],
  "page":1,"limit":20,"total":234,"hasNext":true
}
```
- GET `/articles/{id}` 200: 详情（含相似文章 `related`）
- GET `/articles/{id}/related?limit=5` 200
- GET `/sources` 200: 来源目录
- GET `/topics` 200: 可订阅主题目录

#### 5) 搜索
- GET `/search`
  - query: `q="ai AND (芯片 OR nvidia) -传闻"`, `topic`, `source`, `lang`, `from`, `to`, `page`, `limit`
  - 200: 与 `feed` 相同结构，附 `tookMs` 和 `totalHits`

#### 6) 互动与行为
- POST `/interactions`
  - body:
```json
{
  "articleId": "uuid",
  "type": "click|like|dislike|read|share|open_push",
  "metadata": { "readTimeSec": 35, "channel": "email" }
}
```
  - 201
- POST `/bookmarks` body: `{ "articleId":"uuid" }` 201
- DELETE `/bookmarks/{articleId}` 204
- GET `/bookmarks?page=1&limit=20` 200
- POST `/read/{articleId}` 204（便捷标记已读）

#### 7) 管理后台（受控）
- POST `/admin/sources`（新增/启停/抓取频率）
- PATCH `/admin/sources/{id}`
- GET `/admin/sources/health`
- POST `/admin/topics`（新增/合并/权重）
- GET `/admin/metrics`（抓取成功率、去重率、推送送达/打开）
- POST `/admin/push/test`（模板预览与 A/B）

---

### OpenAPI 片段（示例）
```yaml
openapi: 3.0.3
info:
  title: News Subscription API
  version: 1.0.0
servers:
  - url: https://api.example.com/v1
paths:
  /feed:
    get:
      security:
        - bearerAuth: []
      parameters:
        - in: query
          name: page
          schema: { type: integer, default: 1, minimum: 1 }
        - in: query
          name: limit
          schema: { type: integer, default: 20, maximum: 100 }
        - in: query
          name: sort
          schema: { type: string, enum: [recency, trend, personal], default: personal }
      responses:
        '200':
          description: Feed list
  /subscriptions:
    post:
      security: [{ bearerAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateSubscription'
      responses:
        '201': { description: Created }
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

---

### 数据库设计（PostgreSQL）

#### 关键实体与关系
- `users(1) — (n) devices`
- `users(1) — (n) subscriptions`
- `sources(1) — (n) articles`
- `articles(n) — (n) topics`（`article_topics`）
- `articles(1) — (n) interactions`
- `users(n) — (n) articles`（`bookmarks`、`read_status`）
- `articles(n) — (1) clusters`（去重聚类）
- `users(1) — (1) notification_settings`

#### DDL（核心表）
```sql
-- 用户
create table users (
  id uuid primary key default gen_random_uuid(),
  email citext unique not null,
  password_hash text not null,
  name varchar(100),
  lang varchar(8) default 'zh',
  region varchar(8),
  timezone varchar(64) default 'Asia/Shanghai',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_users_email on users(email);

-- 设备与推送
create table devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  platform varchar(16) not null check (platform in ('ios','android','web')),
  push_token text,
  webpush_endpoint text,
  webpush_p256dh text,
  webpush_auth text,
  last_active_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_devices_user on devices(user_id);

-- 来源
create table sources (
  id uuid primary key default gen_random_uuid(),
  code varchar(64) unique not null, -- 'theverge','36kr'
  name varchar(128) not null,
  type varchar(16) not null check (type in ('rss','api','list')),
  homepage_url text,
  feed_url text,
  lang varchar(8),
  region varchar(8),
  enabled boolean default true,
  fetch_interval_sec int default 600,
  health_status varchar(32) default 'healthy',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 去重聚类
create table article_clusters (
  id uuid primary key default gen_random_uuid(),
  simhash bigint, -- 可选
  representative_article_id uuid, -- 代表文
  created_at timestamptz default now()
);

-- 文章
create table articles (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sources(id),
  cluster_id uuid references article_clusters(id),
  url text not null,
  url_hash char(40) not null, -- sha1(url)
  title text not null,
  summary text,
  content text,
  lang varchar(8),
  image_url text,
  published_at timestamptz,
  fetched_at timestamptz not null default now(),
  popularity numeric(5,4) default 0, -- 热度
  deleted boolean default false
);
create unique index uq_articles_urlhash on articles(url_hash);
create index idx_articles_source_time on articles(source_id, published_at desc);
create index idx_articles_cluster on articles(cluster_id);
create index idx_articles_lang_time on articles(lang, published_at desc);

-- 主题
create table topics (
  id uuid primary key default gen_random_uuid(),
  code varchar(64) unique not null, -- 'tech','business'
  name varchar(64) not null,
  weight int default 0,
  created_at timestamptz default now()
);

-- 文章-主题
create table article_topics (
  article_id uuid not null references articles(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  score numeric(5,4) default 0,
  primary key(article_id, topic_id)
);
create index idx_article_topics_topic on article_topics(topic_id);

-- 订阅（复合过滤器）
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name varchar(64) not null,
  keywords text[] default '{}',       -- ['AI','芯片']
  keywords_op varchar(3) default 'OR' check (keywords_op in ('AND','OR')),
  topic_codes text[] default '{}',    -- ['tech','ai']
  source_codes text[] default '{}',   -- ['theverge','36kr']
  lang_codes text[] default '{}',     -- ['zh','en']
  region_codes text[] default '{}',   -- ['CN','US']
  priority int default 5,
  daily_limit int default 30,
  mute_start time,
  mute_end time,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_subscriptions_user on subscriptions(user_id);

-- 互动
create table interactions (
  id bigserial primary key,
  user_id uuid not null references users(id) on delete cascade,
  article_id uuid not null references articles(id) on delete cascade,
  type varchar(16) not null check (type in ('click','like','dislike','read','share','open_push')),
  read_time_sec int,
  channel varchar(16), -- email|push|web
  created_at timestamptz not null default now()
);
create index idx_interactions_user_time on interactions(user_id, created_at desc);
create index idx_interactions_article on interactions(article_id);

-- 收藏与已读
create table bookmarks (
  user_id uuid not null references users(id) on delete cascade,
  article_id uuid not null references articles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key(user_id, article_id)
);
create table read_status (
  user_id uuid not null references users(id) on delete cascade,
  article_id uuid not null references articles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key(user_id, article_id)
);

-- 推送/摘要设置
create table notification_settings (
  user_id uuid primary key references users(id) on delete cascade,
  morning_time time default '07:30',
  evening_time time default '19:30',
  channel_email boolean default true,
  channel_push boolean default true,
  channel_webpush boolean default true,
  breaking_enabled boolean default true,
  max_items_per_digest int default 20,
  updated_at timestamptz default now()
);

-- 摘要与通知任务
create table digest_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  type varchar(16) not null check (type in ('morning','evening','breaking','manual')),
  status varchar(16) not null default 'pending' check (status in ('pending','running','done','failed')),
  scheduled_at timestamptz not null,
  started_at timestamptz,
  finished_at timestamptz,
  error text
);
create index idx_digest_jobs_status_time on digest_jobs(status, scheduled_at);

-- 索引建议（搜索相关在 ES）
-- 根据查询特征可增加 GIN 索引用于数组字段
create index idx_subscriptions_topics on subscriptions using gin (topic_codes);
create index idx_subscriptions_sources on subscriptions using gin (source_codes);
```

#### OpenSearch 索引映射（简化）
```json
{
  "mappings": {
    "properties": {
      "id":        { "type": "keyword" },
      "title":     { "type": "text", "analyzer": "smartcn" },
      "summary":   { "type": "text", "analyzer": "smartcn" },
      "content":   { "type": "text", "analyzer": "smartcn" },
      "lang":      { "type": "keyword" },
      "sourceId":  { "type": "keyword" },
      "sourceCode":{ "type": "keyword" },
      "topics":    { "type": "keyword" },
      "publishedAt": { "type": "date" },
      "popularity":  { "type": "float" },
      "clusterId":   { "type": "keyword" }
    }
  },
  "settings": {
    "number_of_shards": 3,
    "analysis": { "analyzer": { "smartcn": { "type": "smartcn" } } }
  }
}
```

---

### 服务划分与实现要点
- `gateway-api`（NestJS）：对外 REST；聚合 `feed/search/subscription/auth`
- `ingestion`：RSS/API 抓取，写入 `articles`，发送队列消息
- `nlp-service`：清洗/去重/分类（调用或内嵌），回写 `article_clusters`、`article_topics`
- `ranking-service`：个性化打分与多样性重排
- `digest-scheduler`：定时任务生成 + 渠道编排（邮件/Push/Web Push）
- `admin-api`：来源/主题/任务/监控

（MVP 可合并为单体服务，内部模块化，预留后续拆分能力）

---

本文档为 API 与数据库设计 V1.0，可直接用于工程实现与评审。

