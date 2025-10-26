# 🐳 Docker Compose 配置合并与优化

## 📋 配置文件概览

我已经为您创建了多个优化的 Docker Compose 配置文件，解决网络超时问题：

### 🗂️ 配置文件列表

| 文件名 | 用途 | 特点 | 推荐场景 |
|--------|------|------|----------|
| `docker-compose.yml` | 原始完整配置 | 包含所有服务 | 网络环境良好时 |
| `docker-compose-simple.yml` | 简化配置 | 基础服务 + 应用 | 快速启动 |
| `docker-compose-optimized.yml` | 优化配置 | 网络优化 + 健康检查 | 生产环境 |
| `docker-compose-quick.yml` | 快速配置 | 最小化服务 | 开发测试 |

---

## 🚀 启动方式

### **方式一：统一启动脚本（推荐）**
```bash
./start.sh
```
**特点**：
- 交互式选择启动模式
- 自动处理网络问题
- 分阶段启动服务

### **方式二：直接启动**
```bash
# 快速模式（推荐）
docker-compose -f docker-compose-quick.yml up -d

# 完整模式
docker-compose -f docker-compose-optimized.yml up -d

# 分阶段启动
./start-optimized.sh
```

---

## 🔧 配置优化说明

### **网络优化**
```yaml
networks:
  app-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### **健康检查优化**
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 10s
  timeout: 5s
  retries: 3
  start_period: 30s
```

### **资源限制**
```yaml
environment:
  - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
```

### **重启策略**
```yaml
restart: unless-stopped
```

---

## 📊 服务配置对比

### **基础服务**
| 服务 | 端口 | 健康检查 | 依赖关系 |
|------|------|----------|----------|
| PostgreSQL | 5432 | ✅ | 无 |
| Redis | 6379 | ✅ | 无 |
| OpenSearch | 9200 | ✅ | 无 |

### **应用服务**
| 服务 | 端口 | 健康检查 | 依赖关系 |
|------|------|----------|----------|
| Backend | 3001 | ✅ | 数据库服务 |
| Frontend | 3000 | ❌ | Backend |

### **监控服务**
| 服务 | 端口 | 健康检查 | 依赖关系 |
|------|------|----------|----------|
| Prometheus | 9090 | ✅ | 无 |
| Grafana | 3002 | ✅ | Prometheus |
| Redis Commander | 8081 | ✅ | Redis |

---

## 🛠️ 启动模式详解

### **1. 快速模式**
```bash
docker-compose -f docker-compose-quick.yml up -d
```
**包含服务**：
- ✅ PostgreSQL + Redis + OpenSearch
- ✅ Backend + Frontend
- ✅ Prometheus + Redis Commander
- ❌ Grafana

**适用场景**：开发测试、快速验证

### **2. 完整模式**
```bash
docker-compose -f docker-compose-optimized.yml up -d
```
**包含服务**：
- ✅ 所有基础服务
- ✅ 所有应用服务
- ✅ 所有监控服务
- ✅ 网络优化配置

**适用场景**：生产环境、完整监控

### **3. 分阶段启动**
```bash
./start-optimized.sh
```
**启动顺序**：
1. 基础服务（数据库、缓存、搜索）
2. 监控服务（Prometheus、Grafana）
3. 应用服务（后端、前端）

**适用场景**：网络环境不稳定、解决超时问题

---

## 🔍 故障排除

### **网络超时问题**
```bash
# 设置更长的超时时间
export COMPOSE_HTTP_TIMEOUT=300

# 清理网络
docker network prune -f

# 分阶段启动
./start-optimized.sh
```

### **服务启动失败**
```bash
# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs [service_name]

# 重启特定服务
docker-compose restart [service_name]
```

### **端口冲突**
```bash
# 检查端口占用
lsof -i :3000,3001,5432,6379,9090

# 停止冲突服务
docker-compose down
```

---

## 📈 性能优化建议

### **内存优化**
```yaml
# OpenSearch 内存限制
environment:
  - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
```

### **存储优化**
```yaml
volumes:
  postgres_data:
    driver: local
  prometheus_data:
    driver: local
```

### **网络优化**
```yaml
networks:
  app-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

---

## 🎯 推荐使用方式

### **开发环境**
```bash
# 使用快速模式
docker-compose -f docker-compose-quick.yml up -d
```

### **测试环境**
```bash
# 使用分阶段启动
./start-optimized.sh
```

### **生产环境**
```bash
# 使用完整优化配置
docker-compose -f docker-compose-optimized.yml up -d
```

---

## 📝 常用命令

### **服务管理**
```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### **数据管理**
```bash
# 备份数据
docker-compose exec postgres pg_dump -U postgres news_subscription > backup.sql

# 清理数据
docker-compose down -v
```

---

## 🎉 总结

通过合并和优化 Docker Compose 配置，我们解决了：

- ✅ **网络超时问题** - 分阶段启动
- ✅ **资源优化** - 内存限制和健康检查
- ✅ **服务依赖** - 合理的启动顺序
- ✅ **故障恢复** - 自动重启策略
- ✅ **监控集成** - 完整的监控栈

**现在您可以根据需要选择合适的启动方式！** 🚀
