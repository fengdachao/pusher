#!/bin/bash

echo "🚀 启动优化的新闻订阅系统 - 分阶段部署"
echo "=========================================="

# 设置环境变量
export COMPOSE_HTTP_TIMEOUT=300
export DOCKER_BUILDKIT=1

# 清理旧容器和网络
echo "🧹 清理旧容器和网络..."
docker-compose -f docker-compose-optimized.yml down --remove-orphans
docker network prune -f

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p monitoring/grafana/provisioning/dashboards
mkdir -p monitoring/grafana/provisioning/datasources
mkdir -p backend/logs

# 第一阶段：启动基础服务
echo "📊 第一阶段：启动基础服务（数据库、缓存、搜索）..."
docker-compose -f docker-compose-optimized.yml up -d postgres redis opensearch

echo "⏳ 等待基础服务启动..."
sleep 30

# 检查基础服务状态
echo "🔍 检查基础服务状态..."
docker-compose -f docker-compose-optimized.yml ps postgres redis opensearch

# 第二阶段：启动监控服务
echo "📈 第二阶段：启动监控服务（Prometheus、Grafana、Redis Commander）..."
docker-compose -f docker-compose-optimized.yml up -d prometheus grafana redis-commander

echo "⏳ 等待监控服务启动..."
sleep 30

# 第三阶段：启动应用服务
echo "🎯 第三阶段：启动应用服务（后端、前端）..."
docker-compose -f docker-compose-optimized.yml up -d backend frontend

echo "⏳ 等待应用服务启动..."
sleep 30

# 检查所有服务状态
echo "🔍 检查所有服务状态..."
docker-compose -f docker-compose-optimized.yml ps

echo ""
echo "🎉 所有服务已启动！"
echo ""
echo "📊 服务访问地址："
echo "  • 前端应用: http://localhost:3000"
echo "  • 后端 API: http://localhost:3001"
echo "  • API 文档: http://localhost:3001/api/docs"
echo "  • 健康检查: http://localhost:3001/api/v1/health"
echo "  • 系统指标: http://localhost:3001/api/v1/metrics"
echo "  • 系统统计: http://localhost:3001/api/v1/monitoring/stats"
echo ""
echo "🔧 管理工具："
echo "  • Prometheus: http://localhost:9090"
echo "  • Grafana: http://localhost:3002 (admin/admin)"
echo "  • Redis 管理: http://localhost:8081"
echo ""
echo "📝 数据库服务："
echo "  • PostgreSQL: localhost:5432"
echo "  • Redis: localhost:6379"
echo "  • OpenSearch: localhost:9200"
echo ""
echo "🛑 停止服务: docker-compose -f docker-compose-optimized.yml down"
echo "🔄 重启服务: docker-compose -f docker-compose-optimized.yml restart"
echo "📋 查看日志: docker-compose -f docker-compose-optimized.yml logs -f"
echo ""
echo "✨ 优化版监控系统部署完成！"
