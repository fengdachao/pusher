# 📊 监控系统增强计划

## 📋 当前监控状态评估

### ✅ 已实现的监控

#### Backend
1. **Prometheus 基础指标**
   - ✅ HTTP请求计数和延迟
   - ✅ 内存使用情况
   - ✅ 活跃连接数
   - ✅ Node.js 默认指标

2. **健康检查 API**
   - ✅ `/api/v1/health`
   - ✅ 数据库健康检查
   - ✅ 内存和磁盘检查

3. **日志系统**
   - ✅ Winston 日志（error.log, combined.log）

4. **Grafana 仪表板**
   - ✅ 基础系统监控面板
   - ✅ Prometheus 数据源配置

#### Frontend
- ❌ **完全缺失**

---

## 🎯 需要补充的监控

### 优先级 P0（立即实施）

#### 1. Backend 爬虫详细监控
**问题**: 爬虫是核心功能，但缺少详细监控
- ❌ 爬虫成功/失败率
- ❌ 每个源的爬取统计
- ❌ 爬取耗时
- ❌ 新文章数量

**实施内容**:
- 添加爬虫专用 Prometheus 指标
- 增强 `MonitoringService.getCrawlerStats()`
- 创建爬虫专用 Grafana 仪表板

#### 2. Backend API 详细监控
**问题**: 只有基础HTTP指标，缺少业务维度
- ❌ 每个端点的成功率
- ❌ 错误率按类型统计
- ❌ 慢查询监控

**实施内容**:
- 添加端点级别的指标
- 错误分类统计
- 响应时间P99监控

#### 3. Frontend 基础监控
**问题**: 前端完全没有监控
- ❌ 错误追踪
- ❌ 性能监控
- ❌ 用户行为

**实施内容**:
- 添加 Web Vitals 监控
- React Error Boundary
- 自定义性能打点
- API调用监控

---

### 优先级 P1（短期实施）

#### 4. 数据库性能监控
**问题**: 只有连接数，没有查询性能
- ❌ 查询耗时统计
- ❌ 慢查询日志
- ❌ 连接池使用率

**实施内容**:
- TypeORM 查询日志分析
- 数据库查询指标
- 连接池监控

#### 5. 缓存监控
**问题**: Redis 没有详细监控
- ❌ 缓存命中率
- ❌ 缓存大小
- ❌ Key 统计

**实施内容**:
- Redis 指标采集
- 缓存使用分析

#### 6. 业务指标监控
**问题**: 缺少业务层面的监控
- ❌ 用户注册/登录统计
- ❌ 文章发布统计
- ❌ 订阅创建统计
- ❌ 用户活跃度

**实施内容**:
- 业务事件埋点
- 用户行为统计
- 核心指标仪表板

---

### 优先级 P2（中期实施）

#### 7. 告警系统
**问题**: 没有主动告警
- ❌ 错误率告警
- ❌ 性能下降告警
- ❌ 服务down告警

**实施内容**:
- Prometheus AlertManager
- 告警规则配置
- 通知渠道（邮件/Webhook）

#### 8. 日志聚合和分析
**问题**: 只有文件日志，难以分析
- ❌ 日志搜索
- ❌ 日志聚合
- ❌ 日志可视化

**实施内容**:
- ELK Stack (可选)
- 日志查询界面
- 错误日志分析

#### 9. 分布式追踪
**问题**: 跨服务调用没有追踪
- ❌ 请求链路追踪
- ❌ 性能瓶颈定位

**实施内容**:
- Jaeger/Zipkin (可选)
- OpenTelemetry 集成

---

## 🚀 实施计划

### 第一阶段：P0 优先级（本周完成）

#### Day 1-2: Backend 爬虫监控增强

**文件修改**:
1. `backend/src/crawler/crawler.service.ts`
   - 添加指标记录

2. `backend/src/metrics/metrics.service.ts`
   - 新增爬虫相关指标

3. `backend/src/monitoring/monitoring.service.ts`
   - 增强 getCrawlerStats() 实现

**新增文件**:
- `monitoring/grafana/provisioning/dashboards/crawler-dashboard.json`

**验收标准**:
- ✅ 爬虫成功率指标可查询
- ✅ 每个源的统计数据准确
- ✅ Grafana 显示爬虫仪表板

---

#### Day 3-4: Frontend 基础监控

**文件修改**:
1. `frontend/package.json`
   - 添加 web-vitals 依赖

2. `frontend/src/index.tsx`
   - 集成 Web Vitals

3. 新增文件:
   - `frontend/src/utils/monitoring.ts` - 监控工具
   - `frontend/src/components/ErrorBoundary.tsx` - 错误边界

**验收标准**:
- ✅ Web Vitals 数据上报
- ✅ 错误被捕获和上报
- ✅ API调用监控工作

---

#### Day 5: Backend API 详细监控

**文件修改**:
1. `backend/src/metrics/metrics.service.ts`
   - 添加端点级别指标
   - 添加错误分类

2. 创建中间件:
   - `backend/src/middleware/metrics.middleware.ts`

**验收标准**:
- ✅ 每个API端点有独立指标
- ✅ 错误率按类型统计
- ✅ P99延迟监控

---

### 第二阶段：P1 优先级（下周完成）

#### Week 2: 数据库、缓存、业务指标

**目标**:
1. 数据库查询性能监控
2. Redis 缓存监控
3. 核心业务指标统计

**产出**:
- 数据库性能仪表板
- 缓存监控仪表板
- 业务指标仪表板

---

### 第三阶段：P2 优先级（按需实施）

#### Future: 告警、日志、追踪

根据实际需求和资源情况决定是否实施

---

## 📊 新增 Grafana 仪表板列表

### 1. 爬虫监控仪表板
**指标**:
- 爬虫运行状态
- 每个源的爬取成功率
- 爬取耗时分布
- 新文章数量趋势
- 爬虫错误Top 10

### 2. API 性能仪表板
**指标**:
- 请求总量和趋势
- 响应时间P50/P95/P99
- 错误率（按状态码）
- 慢请求Top 10
- 端点性能对比

### 3. 数据库监控仪表板
**指标**:
- 连接池使用率
- 查询耗时分布
- 慢查询列表
- 表大小统计
- 索引使用情况

### 4. 业务指标仪表板
**指标**:
- 用户注册/活跃趋势
- 文章发布趋势
- 订阅创建统计
- Top 10 热门文章
- Top 10 活跃用户

### 5. Frontend 性能仪表板
**指标**:
- Web Vitals (FCP, LCP, CLS, FID, TTFB)
- 页面加载时间
- API调用成功率
- 错误发生率
- 用户会话统计

---

## 🛠️ 技术栈补充

### Backend 新增依赖
```json
{
  "@opentelemetry/api": "^1.4.0",  // 可选，用于追踪
  "@opentelemetry/sdk-node": "^0.38.0"  // 可选，用于追踪
}
```

### Frontend 新增依赖
```json
{
  "web-vitals": "^3.3.0",  // Web性能监控
  "@sentry/react": "^7.0.0",  // 可选，错误追踪平台
  "@sentry/tracing": "^7.0.0"  // 可选，性能追踪
}
```

---

## 📈 监控指标定义

### Backend 爬虫指标

#### Counter 计数器
- `crawler_runs_total{source, status}` - 爬虫运行次数
- `crawler_articles_scraped_total{source}` - 爬取文章总数
- `crawler_errors_total{source, error_type}` - 爬虫错误数

#### Histogram 直方图
- `crawler_duration_seconds{source}` - 爬取耗时
- `crawler_articles_per_run{source}` - 每次爬取文章数

#### Gauge 仪表
- `crawler_last_run_timestamp{source}` - 最后运行时间
- `crawler_active_sources` - 活跃源数量

### Backend API 指标

#### Counter
- `api_requests_total{method, endpoint, status}` - API请求总数
- `api_errors_total{endpoint, error_type}` - API错误总数

#### Histogram
- `api_duration_seconds{method, endpoint}` - API响应时间
- `api_payload_size_bytes{method, endpoint}` - 请求/响应大小

### Frontend 指标

#### Web Vitals
- `frontend_fcp_seconds` - First Contentful Paint
- `frontend_lcp_seconds` - Largest Contentful Paint
- `frontend_cls_score` - Cumulative Layout Shift
- `frontend_fid_milliseconds` - First Input Delay
- `frontend_ttfb_milliseconds` - Time to First Byte

#### 自定义指标
- `frontend_errors_total{type, page}` - 前端错误数
- `frontend_api_calls_total{endpoint, status}` - API调用统计
- `frontend_page_views_total{page}` - 页面浏览统计

---

## 🎯 成功指标

### 监控覆盖率目标
- ✅ Backend API 覆盖率: 100%
- ✅ 爬虫监控覆盖率: 100%
- ✅ Frontend 核心页面覆盖率: 100%
- ✅ 关键业务指标: 100%

### 性能目标
- ✅ 监控数据采集延迟 < 1分钟
- ✅ Grafana 仪表板加载时间 < 3秒
- ✅ 指标存储空间 < 10GB/月

### 告警目标（P2阶段）
- ✅ 告警响应时间 < 5分钟
- ✅ 误报率 < 5%
- ✅ 告警覆盖率 100%（关键指标）

---

## 📝 实施检查清单

### Phase 1 - Backend 爬虫监控
- [ ] 添加爬虫指标到 MetricsService
- [ ] 修改 CrawlerService 记录指标
- [ ] 增强 MonitoringService.getCrawlerStats()
- [ ] 创建爬虫 Grafana 仪表板
- [ ] 测试指标采集
- [ ] 文档更新

### Phase 2 - Frontend 监控
- [ ] 安装 web-vitals 依赖
- [ ] 创建监控工具模块
- [ ] 实现 ErrorBoundary
- [ ] 集成 Web Vitals
- [ ] 添加 API 调用监控
- [ ] 创建上报端点（Backend）
- [ ] 创建 Frontend Grafana 仪表板
- [ ] 测试监控功能

### Phase 3 - Backend API 监控
- [ ] 添加 API 详细指标
- [ ] 创建 metrics 中间件
- [ ] 集成到所有路由
- [ ] 更新 API 监控仪表板
- [ ] 测试指标准确性

### Phase 4 - 数据库和缓存监控
- [ ] TypeORM 查询日志集成
- [ ] Redis 指标采集
- [ ] 创建数据库仪表板
- [ ] 创建缓存仪表板
- [ ] 测试监控

### Phase 5 - 业务指标
- [ ] 定义核心业务指标
- [ ] 添加业务事件埋点
- [ ] 创建业务指标仪表板
- [ ] 测试数据准确性

---

## 💰 成本估算

### 开发时间
- Phase 1 (爬虫监控): 2 days
- Phase 2 (Frontend监控): 2 days
- Phase 3 (API监控): 1 day
- Phase 4 (数据库/缓存): 2 days
- Phase 5 (业务指标): 2 days

**总计**: ~9 个工作日

### 资源占用
- **存储**: ~5-10 GB/月（指标数据）
- **内存**: +100-200 MB（监控组件）
- **CPU**: +5-10%（指标采集）
- **带宽**: 可忽略不计

---

## 📚 参考文档

- [Prometheus 最佳实践](https://prometheus.io/docs/practices/)
- [Grafana 仪表板设计](https://grafana.com/docs/grafana/latest/dashboards/)
- [Web Vitals](https://web.dev/vitals/)
- [NestJS Metrics](https://docs.nestjs.com/techniques/metrics)

---

**制定日期**: 2025-10-26  
**负责人**: AI Assistant  
**状态**: 待实施

