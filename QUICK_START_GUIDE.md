# 🚀 新闻订阅系统 - 快速启动指南

## 📋 前提条件

确保您的系统已安装以下软件：

- **Node.js** 20+ 
- **Docker** 和 **Docker Compose**
- **Git**

## ⚡ 一键启动

### 方式一：使用启动脚本（推荐）

```bash
# 1. 克隆项目
git clone <项目地址>
cd news-subscription-system

# 2. 一键启动
chmod +x start-unified.sh
./start-unified.sh
```

### 方式二：手动启动

```bash
# 1. 克隆项目
git clone <项目地址>
cd news-subscription-system

# 2. 配置环境变量
cp .env.example .env
# 根据需要编辑 .env 文件

# 3. 启动服务
docker-compose up -d

# 4. 等待服务启动（约30秒）
docker-compose logs -f

# 5. 初始化数据
docker-compose exec backend npm run migration:run
docker-compose exec backend npm run seed
```

## 🌐 访问应用

启动成功后，您可以访问：

- **前端界面**: http://localhost:3000
- **后端API**: http://localhost:3001  
- **API文档**: http://localhost:3001/api/docs

## 👤 演示账号

系统会自动创建演示账号供您测试：

```
邮箱：demo@example.com
密码：demo123
```

## 📊 验证部署

### 1. 检查服务状态
```bash
docker-compose ps
```
所有服务应显示为 "Up" 状态。

### 2. 测试 API
```bash
# 获取新闻源列表
curl http://localhost:3001/api/v1/sources

# 健康检查
curl http://localhost:3001/api/v1/health
```

### 3. 检查数据库
```bash
# 连接数据库
docker-compose exec postgres psql -U postgres -d news_subscription

# 查看表结构
\dt
```

## 🛠️ 开发模式

如果您想进行开发，可以使用本地开发模式：

```bash
# 1. 安装依赖
npm run setup

# 2. 启动基础服务（数据库、缓存、搜索）
docker-compose up -d postgres redis opensearch

# 3. 初始化数据库
cd backend && npm run migration:run && npm run seed

# 4. 启动开发服务
npm run dev
```

开发模式下：
- 后端：http://localhost:3001（热重载）
- 前端：http://localhost:3000（热重载）

## 📝 配置说明

### 环境变量

主要配置项（在 `.env` 文件中）：

```bash
# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=news_subscription

# JWT 密钥（生产环境请更换）
JWT_SECRET=your-super-secret-jwt-key

# 邮件配置（可选，用于通知功能）
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Web Push 配置（可选）
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

### 端口配置

如果默认端口被占用，可以修改 `docker-compose.yml`：

```yaml
services:
  backend:
    ports:
      - "3002:3001"  # 改为 3002 端口
  frontend:
    ports:
      - "3001:3000"  # 改为 3001 端口
```

## 🔧 常见问题

### Q: 端口被占用怎么办？

A: 修改 `docker-compose.yml` 中的端口映射，或者停止占用端口的服务。

### Q: 数据库连接失败？

A: 1. 确保 PostgreSQL 服务正常启动
   2. 检查 `.env` 中的数据库配置
   3. 重启服务：`docker-compose restart`

### Q: 前端无法访问后端？

A: 1. 检查 `REACT_APP_API_URL` 环境变量
   2. 确保后端服务正常运行
   3. 检查防火墙设置

### Q: 如何添加新的新闻源？

A: 1. 访问 API 文档：http://localhost:3001/api/docs
   2. 使用 `/sources` 接口添加新源
   3. 或直接在数据库中添加

### Q: 如何查看系统日志？

A: ```bash
   # 查看所有服务日志
   docker-compose logs
   
   # 查看特定服务日志
   docker-compose logs backend
   ```

## 📊 系统监控

### 健康检查
```bash
# API 健康检查
curl http://localhost:3001/api/v1/health

# 数据库连接检查
docker-compose exec backend npm run db:ping

# Redis 连接检查
docker-compose exec redis redis-cli ping
```

### 性能监控
```bash
# 查看容器资源使用
docker-compose top

# 查看容器状态
docker-compose ps
```

## 🎯 功能测试

### 1. 注册和登录
1. 访问 http://localhost:3000
2. 点击"注册"创建账号
3. 或使用演示账号登录

### 2. 创建订阅
1. 登录后进入"订阅管理"
2. 点击"新建订阅"
3. 设置关键词、主题、来源等
4. 保存订阅

### 3. 浏览新闻
1. 在首页查看个性化新闻流
2. 使用搜索功能
3. 尝试筛选和排序
4. 点赞、收藏文章

### 4. 通知设置
1. 进入"设置"页面
2. 配置推送时间和渠道
3. 测试推送功能

## 🚀 生产部署

生产环境部署建议：

```bash
# 1. 生成安全的 JWT 密钥
openssl rand -base64 32

# 2. 配置生产环境变量
NODE_ENV=production
JWT_SECRET=<生成的安全密钥>

# 3. 配置邮件服务
EMAIL_HOST=your-smtp-server
EMAIL_USER=your-email
EMAIL_PASS=your-password

# 4. 启用 HTTPS
# 配置 Nginx 或 CloudFlare 等反向代理

# 5. 数据备份
docker-compose exec postgres pg_dump -U postgres news_subscription > backup.sql
```

## 📞 技术支持

如遇到问题，请：

1. 查看本文档的常见问题部分
2. 检查 Docker 容器日志
3. 查看项目 README.md 文件
4. 查看 API 文档了解接口详情

---

**祝您使用愉快！** 🎉

如果您觉得这个项目有用，欢迎 Star 和分享！