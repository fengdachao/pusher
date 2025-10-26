# 监控系统快速参考

## 🎯 当前状态

**总进度:** 40% (2/5 阶段完成)

```
✅ 阶段一: 基础监控设施 (100%)
✅ 阶段二: Backend 爬虫监控 (100%)
📋 阶段三: Frontend 监控 (0%)
📋 阶段四: 告警规则 (0%)
📋 阶段五: 综合仪表板 (0%)
```

---

## 🔗 快速访问

| 服务 | 地址 | 凭证 |
|------|------|------|
| 前端应用 | http://localhost:3000 | demo / demo123 |
| Backend API | http://localhost:3001 | - |
| API 文档 | http://localhost:3001/api/docs | - |
| Prometheus | http://localhost:9090 | - |
| Grafana | http://localhost:3002 | admin / admin |
| Redis 管理 | http://localhost:8081 | - |

---

## 📊 已实现的监控指标

### Backend 系统指标
- `http_request_duration_seconds` - HTTP请求耗时
- `http_requests_total` - HTTP请求总数
- `active_connections` - 活跃连接数
- `database_connections_active` - 数据库连接数

### 爬虫指标
- `crawler_runs_total` - 爬虫运行次数
- `crawler_articles_scraped_total` - 爬取文章数
- `crawler_errors_total` - 错误统计
- `crawler_duration_seconds` - 执行耗时
- `crawler_articles_per_run` - 每次爬取数量
- `crawler_last_run_timestamp` - 最后运行时间
- `crawler_active_sources` - 活跃源数量
- `crawler_last_run_articles` - 最后运行文章数

---

## 🔍 常用监控 API

### 健康检查
```bash
curl http://localhost:3001/api/v1/health
```

### 系统指标
```bash
curl http://localhost:3001/api/v1/metrics
```

### 爬虫统计
```bash
curl http://localhost:3001/api/v1/monitoring/crawler-stats | jq .
```

### 数据库统计
```bash
curl http://localhost:3001/api/v1/monitoring/database-stats | jq .
```

### 系统统计
```bash
curl http://localhost:3001/api/v1/monitoring/stats | jq .
```

---

## 📈 Grafana 仪表板

### 已创建
1. **系统监控仪表板** (system-dashboard)
   - 系统健康状态
   - HTTP 请求监控
   - 响应时间分布
   - 数据库连接

2. **爬虫监控仪表板** (crawler-monitoring)
   - 爬虫运行状态
   - 成功率统计
   - 文章爬取量
   - 错误监控
   - 性能分布

---

## 📋 下一步计划

### 🎯 优先级 P0 - Frontend 监控（1-2天）

**实施内容:**
1. Web Vitals 指标采集 (LCP, FID, CLS, FCP, TTFB)
2. React Error Boundary
3. API 错误监控
4. 前端性能仪表板

**关键产出:**
- `frontend/src/utils/metrics.ts` - 指标采集器
- `frontend/src/components/ErrorBoundary.tsx` - 错误边界
- `POST /api/v1/metrics/web-vitals` - 指标上报API
- 前端性能 Grafana 仪表板

### 🎯 优先级 P1 - 告警规则（1天）

**实施内容:**
1. Prometheus 告警规则配置
2. AlertManager 部署
3. 通知渠道配置（Email/Slack）
4. 告警分级和静默规则

**关键产出:**
- `monitoring/prometheus/alerts.yml` - 告警规则
- `monitoring/alertmanager/config.yml` - 告警配置
- 至少 15 条告警规则

### 🎯 优先级 P2 - 综合仪表板（1天）

**实施内容:**
1. 综合监控大屏
2. 用户行为分析仪表板
3. 内容分析仪表板
4. 业务指标可视化

**关键产出:**
- `overview-dashboard.json` - 综合仪表板
- `user-analytics-dashboard.json` - 用户分析
- `content-analytics-dashboard.json` - 内容分析

---

## 🚀 快速启动

### 启动所有服务
```bash
# 给脚本添加执行权限
chmod +x start-unified.sh

# 一键启动
./start-unified.sh
```

### 启动监控服务
```bash
# 单独启动监控相关服务
docker-compose up -d prometheus grafana
```

### 查看服务状态
```bash
docker-compose ps
```

### 查看日志
```bash
# 查看所有日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f prometheus
docker-compose logs -f grafana
```

---

## 🔧 故障排查

### Prometheus 无法采集指标
```bash
# 检查 Prometheus 配置
curl http://localhost:9090/api/v1/targets

# 检查 Backend 指标端点
curl http://localhost:3001/api/v1/metrics
```

### Grafana 无法连接 Prometheus
```bash
# 检查数据源配置
# Grafana UI: Configuration > Data Sources > Prometheus
# URL 应该是: http://prometheus:9090
```

### 爬虫指标未生成
```bash
# 检查爬虫是否运行
docker-compose logs backend | grep -i crawl

# 手动触发爬虫（需要登录）
# 爬虫每10分钟自动运行一次
```

---

## 📊 监控数据示例

### 当前数据（2025-10-26）
- **总文章数:** 206篇
- **活跃源:** 5个
- **最近24小时新增:** 206篇
- **爬虫运行状态:** 正常
- **后端服务:** 健康
- **数据库连接:** 正常

### 数据源信息
1. TechCrunch - 20篇
2. The Verge - 10篇
3. 36氪 - 38篇
4. IT之家 - 68篇
5. BBC Technology - 69篇

---

## 📚 相关文档

| 文档 | 用途 |
|------|------|
| `MONITORING_PROGRESS.md` | 详细进度和实施计划 |
| `README-MONITORING.md` | 监控系统完整文档 |
| `DEPLOYMENT.md` | 部署指南 |
| `QUICK_START_GUIDE.md` | 快速启动指南 |
| `README.md` | 项目主文档 |

---

## 🎯 关键成功指标（KPI）

### 系统可用性
- **目标:** 99.9% uptime
- **当前:** 监控中

### API 性能
- **P95 响应时间:** < 500ms
- **错误率:** < 1%
- **当前:** 监控中

### 爬虫性能
- **成功率:** > 95%
- **每日文章数:** > 100篇
- **当前:** 100% 成功率，206篇/天

### 前端性能（待实施）
- **LCP:** < 2.5s (75th percentile)
- **FID:** < 100ms (75th percentile)
- **CLS:** < 0.1 (75th percentile)

---

## 💡 实用 PromQL 查询

### 爬虫成功率（最近1小时）
```promql
sum(rate(crawler_runs_total{status="success"}[1h])) / sum(rate(crawler_runs_total[1h])) * 100
```

### 每分钟爬取文章数
```promql
sum(rate(crawler_articles_scraped_total[5m])) * 60
```

### API P95 响应时间
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### HTTP 错误率
```promql
sum(rate(http_requests_total{status_code=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100
```

### 数据库连接使用率
```promql
database_connections_active / 100 * 100
```

---

## 🔔 需要帮助？

1. **查看完整文档:** `MONITORING_PROGRESS.md`
2. **查看日志:** `docker-compose logs -f [service]`
3. **检查健康状态:** `curl http://localhost:3001/api/v1/health`
4. **访问 Grafana:** http://localhost:3002 (admin/admin)

---

**最后更新:** 2025-10-26  
**维护者:** 开发团队

