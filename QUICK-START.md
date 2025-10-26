# ⚡ 快速启动指南

## 🚀 一键启动

```bash
./start-unified.sh
```

然后选择 **`2) 分阶段启动`** （最推荐）

---

## 📊 服务访问

| 服务 | 地址 | 认证 |
|------|------|------|
| **前端** | http://localhost:3000 | - |
| **后端** | http://localhost:3001 | - |
| **API 文档** | http://localhost:3001/api/docs | - |
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3002 | admin/admin |
| **Redis 管理** | http://localhost:8081 | admin/admin |

---

## 🔧 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看资源使用
docker stats
```

---

## ⚠️ 注意事项

1. **首次启动需要 5-8 分钟**（包含构建时间）
2. **确保有足够内存**（建议 4GB+）
3. **使用分阶段启动最稳定**
4. **遇到问题查看日志**: `docker-compose logs -f [service]`

---

## 🎯 启动模式选择

- **开发测试**: 选择 `2) 分阶段启动`
- **快速验证**: 选择 `1) 快速启动`
- **调试特定服务**: 选择 `3/4/5`

---

**🎉 就是这么简单！**
