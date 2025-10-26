# 监控系统实施进度与计划

## 📅 文档更新时间
2025-10-26

## 📊 整体进度概览

```
总进度: ████████░░░░░░░░░░ 40%

✅ 已完成: 基础监控 + Backend 爬虫监控
🚧 进行中: 无
📋 待实施: Frontend 监控 + 告警系统 + 综合仪表板
```

---

## ✅ 阶段一：基础监控设施（已完成）

### 完成时间
2025-10-25

### 实施内容

#### 1. Prometheus 指标采集
- ✅ 部署 Prometheus 服务
- ✅ 配置监控目标（backend, postgres, redis, opensearch）
- ✅ 基础系统指标采集
- ✅ HTTP 请求指标
- ✅ 数据库连接池指标

#### 2. Grafana 可视化
- ✅ 部署 Grafana 服务
- ✅ 配置 Prometheus 数据源
- ✅ 创建系统监控仪表板
- ✅ 基础面板（CPU、内存、HTTP请求、响应时间）

#### 3. Health Check API
- ✅ `/api/v1/health` - 服务健康检查
- ✅ `/api/v1/metrics` - Prometheus 指标端点

#### 4. 基础设施
- ✅ Docker Compose 配置
- ✅ 服务发现和注册
- ✅ 日志收集（combined.log, error.log）

### 访问地址
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3002 (admin/admin)
- Backend API: http://localhost:3001
- Metrics: http://localhost:3001/api/v1/metrics

---

## ✅ 阶段二：Backend 爬虫监控（已完成）

### 完成时间
2025-10-26

### 实施内容

#### 1. Prometheus 爬虫指标
- ✅ `crawler_runs_total` - 爬虫运行总数（按源和状态）
- ✅ `crawler_articles_scraped_total` - 爬取文章总数
- ✅ `crawler_errors_total` - 错误统计（按源和错误类型）
- ✅ `crawler_duration_seconds` - 执行耗时分布（histogram）
- ✅ `crawler_articles_per_run` - 每次爬取文章数分布
- ✅ `crawler_last_run_timestamp` - 最后运行时间戳
- ✅ `crawler_active_sources` - 活跃源数量
- ✅ `crawler_last_run_articles` - 最后运行文章数

#### 2. 代码实现
- ✅ `backend/src/metrics/metrics.service.ts` - 指标定义和记录方法
- ✅ `backend/src/crawler/crawler.service.ts` - 爬虫服务集成指标记录
- ✅ `backend/src/monitoring/monitoring.service.ts` - 增强统计API
- ✅ `backend/src/monitoring/monitoring.module.ts` - 模块依赖配置

#### 3. API 增强
- ✅ `/api/v1/monitoring/crawler-stats` - 详细的爬虫统计
  - 源级别详细信息
  - 文章数统计（总数、最近24小时）
  - 最后爬取时间
  - 汇总统计
- ✅ `/api/v1/monitoring/database-stats` - 数据库统计增强

#### 4. Grafana 仪表板
- ✅ 创建专业的爬虫监控仪表板
- ✅ 10个监控面板：
  1. 爬虫运行状态
  2. 爬取成功率（最近1小时）
  3. 总爬取文章数（最近24小时）
  4. 错误总数（最近24小时）
  5. 每个源的爬取成功率
  6. 爬取速率（请求/分钟）
  7. 爬取耗时分布（P50, P95, P99）
  8. 每次爬取文章数分布
  9. 错误类型分布
  10. 最后爬取时间表

### 验证结果
```bash
# Prometheus 采集验证
curl -s "http://localhost:9090/api/v1/query?query=crawler_runs_total" 
# ✅ 5个源的指标正常采集

# API 验证
curl -s http://localhost:3001/api/v1/monitoring/crawler-stats
# ✅ 返回完整的统计信息

# 当前数据
- 总文章数: 206篇
- 活跃源: 5个（techcrunch, theverge, 36kr, ithome, bbc-tech）
- 最近24小时: 206篇
```

### 相关文件
- `monitoring/grafana/provisioning/dashboards/crawler-dashboard.json`
- `backend/src/metrics/metrics.service.ts`
- `backend/src/crawler/crawler.service.ts`
- `backend/src/monitoring/monitoring.service.ts`

---

## 🚧 阶段三：Frontend Web Vitals 监控（待实施）

### 预计时间
1-2天

### 实施计划

#### 1. Web Vitals 指标采集
**目标指标：**
- LCP (Largest Contentful Paint) - 最大内容绘制
- FID (First Input Delay) - 首次输入延迟
- CLS (Cumulative Layout Shift) - 累积布局偏移
- FCP (First Contentful Paint) - 首次内容绘制
- TTFB (Time to First Byte) - 首字节时间

**实施步骤：**
1. 安装 `web-vitals` 库（frontend已有）
2. 创建 `frontend/src/utils/metrics.ts` - Web Vitals 采集器
3. 在 `frontend/src/index.tsx` 中集成
4. 发送指标到 Backend API

#### 2. Backend API 支持
**新增端点：**
```typescript
POST /api/v1/metrics/web-vitals
{
  "metric": "LCP",
  "value": 2500,
  "path": "/feed",
  "userId": "optional",
  "timestamp": "2025-10-26T10:00:00.000Z"
}
```

**实施文件：**
- `backend/src/metrics/metrics.controller.ts` - 添加 web-vitals 接口
- `backend/src/metrics/metrics.service.ts` - 添加前端指标定义
- `backend/src/metrics/metrics.module.ts` - 配置

#### 3. Prometheus 指标设计
```promql
# LCP 分布
web_vitals_lcp_seconds{path="/feed"}

# FID 分布
web_vitals_fid_seconds{path="/feed"}

# CLS 分布
web_vitals_cls{path="/feed"}

# 按路由统计
web_vitals_total{metric="LCP",path="/feed"}
```

#### 4. Grafana 仪表板
**面板设计：**
1. Core Web Vitals 概览（LCP, FID, CLS）
2. 性能评分（Good/Needs Improvement/Poor 分布）
3. 按页面路由的性能对比
4. 性能趋势图（24小时/7天）
5. 用户体验评分
6. 慢页面 Top 10
7. 浏览器性能对比
8. 设备类型性能对比

#### 5. 错误和异常监控
**React Error Boundary：**
- 创建 `frontend/src/components/ErrorBoundary.tsx`
- 捕获 React 错误并上报
- 显示友好的错误页面

**API 错误监控：**
- Axios 拦截器统计 API 错误率
- 记录失败的请求（状态码、URL、错误信息）
- 超时监控

**指标：**
```promql
frontend_errors_total{type="react|api|network"}
frontend_api_errors_total{status_code="4xx|5xx"}
frontend_api_response_time_seconds
```

---

## 📋 阶段四：告警规则配置（待实施）

### 预计时间
1天

### 实施计划

#### 1. Prometheus 告警规则
**文件：** `monitoring/prometheus/alerts.yml`

**告警规则设计：**

##### 爬虫告警
```yaml
# 爬虫失败率过高
- alert: CrawlerHighFailureRate
  expr: rate(crawler_runs_total{status="failure"}[5m]) / rate(crawler_runs_total[5m]) > 0.5
  for: 10m
  severity: warning
  
# 爬虫长时间未运行
- alert: CrawlerNotRunning
  expr: time() - crawler_last_run_timestamp > 1200  # 20分钟
  for: 5m
  severity: critical

# 爬取文章数异常
- alert: CrawlerLowArticleCount
  expr: rate(crawler_articles_scraped_total[1h]) < 5
  for: 30m
  severity: warning
```

##### 系统告警
```yaml
# CPU 使用率过高
- alert: HighCPUUsage
  expr: process_cpu_seconds_total > 80
  for: 5m
  severity: warning

# 内存使用率过高
- alert: HighMemoryUsage
  expr: process_resident_memory_bytes / 1024 / 1024 / 1024 > 2
  for: 5m
  severity: warning

# 数据库连接池耗尽
- alert: DatabaseConnectionPoolExhausted
  expr: database_connections_active > 90
  for: 5m
  severity: critical
```

##### API 告警
```yaml
# HTTP 错误率过高
- alert: HighHTTPErrorRate
  expr: rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
  for: 5m
  severity: critical

# API 响应时间过长
- alert: SlowAPIResponse
  expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
  for: 10m
  severity: warning
```

##### 前端告警
```yaml
# LCP 性能降级
- alert: HighLCP
  expr: histogram_quantile(0.75, rate(web_vitals_lcp_seconds_bucket[10m])) > 2.5
  for: 15m
  severity: warning

# 前端错误率过高
- alert: HighFrontendErrorRate
  expr: rate(frontend_errors_total[5m]) > 10
  for: 5m
  severity: warning
```

#### 2. AlertManager 配置
**文件：** `monitoring/alertmanager/config.yml`

**通知渠道：**
- Email 通知
- Slack/钉钉 Webhook
- PagerDuty（可选）

**告警分级：**
- Critical: 立即通知
- Warning: 累积通知（每15分钟）
- Info: 日报汇总

#### 3. 告警静默规则
- 维护窗口期自动静默
- 非工作时间降级告警
- 告警分组和去重

---

## 📋 阶段五：综合监控仪表板（待实施）

### 预计时间
1天

### 实施计划

#### 1. 综合大屏仪表板
**文件：** `monitoring/grafana/provisioning/dashboards/overview-dashboard.json`

**布局设计（分区）：**

##### 第一行：关键指标卡片（4个）
1. 系统健康状态（绿/黄/红）
2. 活跃用户数
3. 今日新增文章数
4. API 成功率

##### 第二行：服务状态（6个服务）
1. Backend API - 健康状态 + 响应时间
2. PostgreSQL - 连接数 + QPS
3. Redis - 命中率 + 内存使用
4. OpenSearch - 索引数量 + 查询延迟
5. Prometheus - 采集目标数
6. Grafana - 仪表板数量

##### 第三行：业务监控（3个图表）
1. 爬虫活动时间线（显示每次爬取）
2. 用户活跃度趋势（注册、登录、订阅）
3. 文章发布趋势（按主题分类）

##### 第四行：性能监控（2个图表）
1. API 响应时间分布（P50/P90/P95/P99）
2. 前端性能指标（LCP/FID/CLS）

##### 第五行：错误监控（2个图表）
1. 错误率趋势（Backend + Frontend）
2. Top 10 错误类型

##### 第六行：资源使用（4个图表）
1. CPU 使用率（所有服务）
2. 内存使用率（所有服务）
3. 磁盘 I/O
4. 网络流量

#### 2. 用户行为分析仪表板
**面板：**
- 用户注册趋势
- 活跃用户分布（DAU/WAU/MAU）
- 订阅热门主题 Top 10
- 用户留存率
- 阅读时长分布
- 互动行为统计（点赞、收藏、分享）

#### 3. 内容分析仪表板
**面板：**
- 文章来源分布
- 主题分类统计
- 热门文章 Top 20
- 内容发布时间分析
- 重复内容检测统计
- 内容质量评分分布

---

## 📋 阶段六：监控优化与自动化（待实施）

### 预计时间
2-3天

### 实施计划

#### 1. 指标优化
- 添加自定义业务指标
- 优化 Histogram buckets
- 减少不必要的标签（降低基数）
- 实施指标采样（高频数据）

#### 2. 性能优化
- Prometheus 数据保留策略（30天）
- 启用 Prometheus 远程存储（可选）
- Grafana 查询缓存
- 仪表板性能优化

#### 3. 日志聚合
- 部署 Loki（可选）
- 日志收集和索引
- 日志查询和分析
- 日志告警

#### 4. 链路追踪
- 集成 Jaeger/OpenTelemetry（可选）
- API 调用链追踪
- 性能瓶颈分析
- 跨服务调用监控

#### 5. 自动化运维
- 监控配置即代码（GitOps）
- 自动化仪表板备份
- 告警规则测试
- 监控数据备份

---

## 📈 监控指标体系总览

### Backend 指标
```
✅ 已实现:
  - http_request_duration_seconds (HTTP请求耗时)
  - http_requests_total (HTTP请求总数)
  - active_connections (活跃连接数)
  - database_connections_active (数据库连接数)
  - crawler_* (8个爬虫相关指标)

📋 待实现:
  - api_rate_limit_exceeded (API限流)
  - user_operations_total (用户操作统计)
  - subscription_operations_total (订阅操作)
  - notification_sent_total (通知发送统计)
  - cache_hit_rate (缓存命中率)
  - queue_depth (任务队列深度)
```

### Frontend 指标
```
📋 待实现:
  - web_vitals_lcp_seconds (最大内容绘制)
  - web_vitals_fid_seconds (首次输入延迟)
  - web_vitals_cls (累积布局偏移)
  - web_vitals_fcp_seconds (首次内容绘制)
  - web_vitals_ttfb_seconds (首字节时间)
  - frontend_errors_total (前端错误)
  - frontend_api_errors_total (API错误)
  - frontend_api_response_time_seconds (API响应时间)
  - page_views_total (页面浏览量)
  - user_interactions_total (用户交互)
```

### 业务指标
```
📋 待实现:
  - users_registered_total (注册用户数)
  - users_active_daily (日活跃用户)
  - subscriptions_created_total (创建的订阅)
  - articles_fetched_total (抓取的文章)
  - notifications_delivered_total (推送的通知)
  - user_engagement_score (用户参与度评分)
```

---

## 🎯 关键里程碑

| 阶段 | 名称 | 状态 | 完成度 | 预计时间 |
|------|------|------|--------|---------|
| 1 | 基础监控设施 | ✅ 已完成 | 100% | - |
| 2 | Backend 爬虫监控 | ✅ 已完成 | 100% | - |
| 3 | Frontend 监控 | 📋 待实施 | 0% | 1-2天 |
| 4 | 告警规则配置 | 📋 待实施 | 0% | 1天 |
| 5 | 综合监控仪表板 | 📋 待实施 | 0% | 1天 |
| 6 | 监控优化与自动化 | 📋 待实施 | 0% | 2-3天 |

**总计预计时间:** 5-7天

---

## 🔧 技术栈

### 已部署
- ✅ Prometheus 2.x - 指标采集
- ✅ Grafana 9.x - 可视化
- ✅ Node Exporter - 系统指标
- ✅ prom-client - Node.js 客户端

### 待部署（可选）
- 📋 AlertManager - 告警管理
- 📋 Loki - 日志聚合
- 📋 Jaeger - 链路追踪
- 📋 Promtail - 日志收集

---

## 📚 参考文档

### 已创建
- ✅ `README-MONITORING.md` - 监控系统主文档
- ✅ `DEPLOYMENT.md` - 部署文档
- ✅ `QUICK_START_GUIDE.md` - 快速启动指南

### 待创建
- 📋 `MONITORING_ALERTS.md` - 告警规则文档
- 📋 `MONITORING_TROUBLESHOOTING.md` - 故障排查指南
- 📋 `MONITORING_BEST_PRACTICES.md` - 最佳实践

---

## 🚀 下一步行动

### 立即可执行（优先级 P0）
1. **阶段三：Frontend Web Vitals 监控**
   - 预计时间: 1-2天
   - 产出: 前端性能监控完整实现
   - 价值: 提升用户体验，发现性能瓶颈

2. **阶段四：告警规则配置**
   - 预计时间: 1天
   - 产出: 完整的告警体系
   - 价值: 主动发现问题，减少故障时间

### 中期规划（优先级 P1）
3. **阶段五：综合监控仪表板**
   - 预计时间: 1天
   - 产出: 可视化大屏和业务仪表板
   - 价值: 全局视角，业务洞察

### 长期优化（优先级 P2）
4. **阶段六：监控优化与自动化**
   - 预计时间: 2-3天
   - 产出: 高级监控能力
   - 价值: 提升系统可观测性

---

## 📊 成功标准

### 阶段三成功标准
- [ ] 所有 Core Web Vitals 指标正常采集
- [ ] Grafana 仪表板显示前端性能数据
- [ ] React 错误边界捕获并上报错误
- [ ] API 错误率和响应时间监控生效

### 阶段四成功标准
- [ ] 至少配置 10 条关键告警规则
- [ ] 告警能够正常触发和通知
- [ ] 告警响应时间 < 5分钟
- [ ] 误报率 < 10%

### 阶段五成功标准
- [ ] 综合仪表板显示所有关键指标
- [ ] 可以通过仪表板快速定位问题
- [ ] 业务人员可以理解和使用仪表板
- [ ] 仪表板加载时间 < 3秒

---

## 📝 更新日志

### 2025-10-26
- ✅ 完成阶段二：Backend 爬虫监控
  - 8个新的 Prometheus 指标
  - 爬虫专用 Grafana 仪表板
  - 增强的监控 API
- ✅ 项目清理：删除21个冗余文件
- 📝 创建监控进度和计划文档

### 2025-10-25
- ✅ 完成阶段一：基础监控设施
  - Prometheus 和 Grafana 部署
  - 基础系统监控
  - Health Check API

---

## 🤝 贡献指南

如需添加新的监控指标或仪表板：
1. 在对应的实施阶段添加详细说明
2. 更新指标体系总览
3. 更新关键里程碑
4. 创建对应的任务追踪

---

**文档维护者:** 开发团队  
**最后更新:** 2025-10-26  
**状态:** 🟢 Active

