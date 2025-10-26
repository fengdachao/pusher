# 新闻订阅系统 (News Subscription System)

一个基于 React + NestJS 的个性化新闻订阅与聚合平台，支持多来源新闻采集、智能分类、个性化推荐和多渠道推送。

## ✨ 核心特性

### 📰 新闻聚合
- **多源采集**: 支持 RSS、API、热榜等多种新闻源
- **自动去重**: 基于 URL 和内容相似度的智能去重
- **智能分类**: 自动识别新闻主题和标签
- **热度计算**: 基于来源权威度和传播热度评分

### 🎯 个性化订阅
- **灵活订阅**: 支持关键词、主题、来源、地区等多维度订阅
- **优先级管理**: 可设置订阅优先级和每日限额
- **静音时段**: 支持设置免打扰时间段
- **Boolean表达式**: 支持 AND/OR 逻辑的关键词组合

### 🔔 智能推送
- **定时摘要**: 早晚两档定时推送个性化新闻摘要
- **突发推送**: 重要新闻实时推送
- **多渠道支持**: 邮件、移动推送、Web Push
- **推送模板**: 可自定义推送内容和格式

### 📱 现代化界面
- **响应式设计**: 完美适配桌面和移动设备
- **实时搜索**: 支持全文检索和高级筛选
- **交互反馈**: 点赞、收藏、阅读时长等行为记录
- **PWA支持**: 可安装到桌面，支持离线访问

## 🏗️ 技术架构

### 后端技术栈
- **框架**: NestJS + TypeScript
- **数据库**: PostgreSQL + Redis
- **搜索引擎**: OpenSearch/Elasticsearch
- **任务调度**: 基于 Cron 的定时任务
- **API文档**: Swagger/OpenAPI 3.0

### 前端技术栈
- **框架**: React 18 + TypeScript
- **状态管理**: React Query + Context API
- **UI组件**: Styled Components
- **路由**: React Router v6
- **表单**: React Hook Form + Yup

### 基础设施
- **容器化**: Docker + Docker Compose
- **代理缓存**: Redis 分布式缓存
- **监控日志**: 内置健康检查和日志记录
- **CI/CD**: 支持 GitHub Actions

## 🚀 快速开始

### 环境要求
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### 安装部署

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd news-subscription-system
   ```

2. **环境配置**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，配置数据库和其他服务
   ```

3. **Docker 部署（推荐）**
   ```bash
   # 启动所有服务
   docker-compose up -d
   
   # 初始化数据库和种子数据
   docker-compose exec backend npm run db:migrate
   docker-compose exec backend npm run seed
   ```

4. **本地开发部署**
   ```bash
   # 安装依赖
   npm run setup
   
   # 启动数据库服务
   docker-compose up -d postgres redis opensearch
   
   # 初始化数据库
   cd backend && npm run migration:run && npm run seed
   
   # 启动开发服务
   npm run dev
   ```

5. **访问应用**
   - 前端界面: http://localhost:3000
   - 后端API: http://localhost:3001
   - API文档: http://localhost:3001/api/docs

### 初始数据

系统会自动创建以下新闻源：
- **TechCrunch**: 国际科技资讯
- **The Verge**: 科技产品评测
- **36氪**: 中文创投资讯  
- **IT之家**: 中文科技新闻

以及常用主题标签：科技、商业、AI、创业、金融等。

## 📖 使用指南

### 用户注册登录
1. 访问系统首页，点击"立即注册"
2. 输入邮箱、密码完成注册
3. 登录后进入个性化新闻订阅界面

### 创建订阅
1. 进入"订阅管理"页面
2. 点击"新建订阅"
3. 设置订阅名称、关键词、主题、来源等
4. 配置优先级和每日限额
5. 保存订阅配置

### 个性化设置
1. 进入"设置"页面
2. 配置个人信息（姓名、语言、时区）
3. 设置通知偏好（推送时间、渠道选择）
4. 保存设置

### 新闻浏览
1. 在首页浏览个性化新闻流
2. 使用搜索和筛选功能查找特定内容
3. 点击文章标题或"阅读"按钮查看原文
4. 系统会记录阅读行为优化推荐

## 🔧 开发指南

### 项目结构
```
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── auth/           # 认证模块
│   │   ├── users/          # 用户管理
│   │   ├── articles/       # 文章管理
│   │   ├── sources/        # 新闻源管理
│   │   ├── subscriptions/  # 订阅管理
│   │   ├── notifications/  # 通知推送
│   │   ├── crawler/        # 新闻爬虫
│   │   └── database/       # 数据库配置
│   └── ...
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # 通用组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API服务
│   │   ├── contexts/       # React Context
│   │   └── types/          # TypeScript类型
│   └── ...
├── docs/                   # 文档目录
├── docker-compose.yml      # Docker编排配置
└── README.md
```

### API接口文档

启动服务后访问 http://localhost:3001/api/docs 查看完整的 API 文档。

主要接口包括：
- `POST /auth/login` - 用户登录
- `POST /auth/register` - 用户注册
- `GET /feed` - 获取个性化新闻流
- `GET /search` - 搜索新闻
- `GET /subscriptions` - 获取订阅列表
- `POST /subscriptions` - 创建订阅
- `GET /notification-settings` - 获取通知设置

### 数据库设计

核心实体关系：
- **users** ←→ **subscriptions** (一对多)
- **sources** ←→ **articles** (一对多)  
- **articles** ←→ **topics** (多对多)
- **users** ←→ **interactions** (一对多)

详细数据库设计参见 `backend/src/database/init.sql`。

### 新闻源配置

在 `backend/src/database/seeds/index.ts` 中可以添加新的新闻源：

```typescript
{
  code: 'source_code',
  name: '新闻源名称', 
  type: SourceType.RSS,
  feedUrl: 'https://example.com/rss',
  lang: 'zh',
  region: 'CN'
}
```

### 爬虫调度

系统每10分钟自动爬取一次所有启用的新闻源。可在 `CrawlerService` 中调整爬取频率：

```typescript
@Cron(CronExpression.EVERY_10_MINUTES) // 修改这里
async crawlAllSources() {
  // 爬取逻辑
}
```

## 🛠️ 运维管理

### 监控指标

本项目实现了完整的监控体系：

**监控服务访问：**
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3002 (admin/admin)

**API 端点：**
- 系统健康检查：`GET /api/v1/health`
- Prometheus 指标：`GET /api/v1/metrics`
- 爬虫统计：`GET /api/v1/monitoring/crawler-stats`
- 数据库统计：`GET /api/v1/monitoring/database-stats`

**已实现监控：**
- ✅ 基础系统监控（CPU、内存、HTTP请求）
- ✅ 爬虫监控（运行状态、成功率、文章数、错误统计）
- ✅ 数据库监控（连接数、查询性能）
- ✅ Grafana 可视化仪表板（2个专业仪表板）

**业务指标：**
- 新闻采集成功率
- 去重率和覆盖率  
- 用户活跃度和留存率
- 推送送达率和打开率

**详细文档：**
- 📖 [监控系统完整文档](README-MONITORING.md)
- 📊 [监控进度与计划](MONITORING_PROGRESS.md)
- ⚡ [监控快速参考](MONITORING_QUICK_REFERENCE.md)

### 日志管理
- 应用日志：`/app/logs/`
- 数据库日志：通过 PostgreSQL 配置
- 爬虫日志：包含采集状态和错误信息

### 性能优化
- Redis缓存热点数据
- 数据库连接池优化
- 静态资源CDN加速
- 图片压缩和懒加载

## 🔒 安全特性

- JWT Token 认证
- 密码 BCrypt 加密
- SQL注入防护
- XSS攻击防护
- CORS跨域配置
- 接口访问频率限制

## 📈 扩展规划

### V1.1 规划
- [ ] 智能摘要生成
- [ ] 多语言内容翻译
- [ ] 社交分享功能
- [ ] 离线阅读支持
- [ ] 机器学习推荐算法

### V2.0 规划  
- [ ] 移动端 App (Flutter)
- [ ] 实时消息推送
- [ ] 多租户支持
- [ ] 企业版功能
- [ ] 开放平台 API

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交变更 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

## 📄 开源协议

本项目采用 MIT 协议 - 详见 [LICENSE](LICENSE) 文件。

## 📞 技术支持

如有问题或建议，请：
- 提交 [GitHub Issues](https://github.com/your-repo/issues)
- 发送邮件至：support@example.com
- 加入技术交流群：[群号]

---

**新闻订阅系统** - 让获取资讯更智能、更高效！ 🚀