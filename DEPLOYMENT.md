# 部署指南

## 快速启动

### 方式一：一键启动（推荐）
```bash
./start-unified.sh
```

### 方式二：手动启动
```bash
# 1. 配置环境变量
cp .env.example .env

# 2. 启动服务
docker-compose up -d

# 3. 等待服务启动（约30秒）
docker-compose logs -f

# 4. 初始化数据
docker-compose exec backend npm run seed
```

## 访问地址

- **前端界面**: http://localhost:3000
- **后端API**: http://localhost:3001  
- **API文档**: http://localhost:3001/api/docs
- **数据库**: localhost:5432 (postgres/password)
- **Redis**: localhost:6379
- **OpenSearch**: http://localhost:9200

## 验证部署

### 1. 检查服务状态
```bash
docker-compose ps
```

所有服务应显示为 "Up" 状态。

### 2. 查看日志
```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs backend
docker-compose logs frontend
```

### 3. 测试API
```bash
# 健康检查
curl http://localhost:3001/api/v1/sources

# 应返回新闻源列表
```

## 常见问题

### 端口冲突
如果端口被占用，修改 `docker-compose.yml` 中的端口映射：
```yaml
ports:
  - "3001:3001"  # 改为 "3002:3001"
```

### 数据库连接失败
1. 确保 PostgreSQL 服务正常启动
2. 检查 `.env` 中的数据库配置
3. 重启服务：`docker-compose restart`

### 前端无法访问后端
1. 检查 `REACT_APP_API_URL` 环境变量
2. 确保后端服务正常运行
3. 检查防火墙设置

## 生产环境部署

### 1. 安全配置
```bash
# 生成安全的JWT密钥
openssl rand -base64 32

# 修改默认密码
# 在 .env 中更新数据库密码
```

### 2. 性能优化
- 启用Redis持久化
- 配置数据库连接池
- 设置适当的内存限制
- 配置Nginx反向代理

### 3. 监控配置
- 配置日志收集
- 设置健康检查
- 监控资源使用情况

## 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷（谨慎使用）
docker-compose down -v
```

## 数据备份

```bash
# 备份数据库
docker-compose exec postgres pg_dump -U postgres news_subscription > backup.sql

# 恢复数据库
docker-compose exec -T postgres psql -U postgres news_subscription < backup.sql
```