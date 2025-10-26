#!/bin/bash

echo "🚀 启动新闻订阅系统 - 完整监控版本"
echo "=================================="

# 创建必要的目录
mkdir -p monitoring/grafana/provisioning/dashboards
mkdir -p monitoring/grafana/provisioning/datasources
mkdir -p backend/logs

echo "📦 构建并启动所有服务..."
docker-compose up --build -d

echo ""
echo "⏳ 等待服务启动..."
sleep 10

echo ""
echo "🎉 所有服务已启动！"
echo ""
echo "📊 监控面板访问地址："
echo "  • 主应用: http://localhost:3000"
echo "  • API 文档: http://localhost:3001/api/docs"
echo "  • 健康检查: http://localhost:3001/api/v1/health"
echo "  • 系统指标: http://localhost:3001/api/v1/metrics"
echo "  • 系统统计: http://localhost:3001/api/v1/monitoring/stats"
echo ""
echo "🔧 管理工具："
echo "  • Redis 管理: http://localhost:8081"
echo ""
echo "📈 监控工具："
echo "  • Prometheus: http://localhost:9090"
echo "  • Grafana: http://localhost:3002"
echo "    - 用户名: admin"
echo "    - 密码: admin"
echo ""
echo "📝 日志文件位置："
echo "  • 应用日志: backend/logs/"
echo "  • Docker 日志: docker-compose logs -f"
echo ""
echo "🛑 停止服务: docker-compose down"
echo "🔄 重启服务: docker-compose restart"
echo ""
echo "✨ 监控系统部署完成！"
