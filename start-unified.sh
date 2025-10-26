#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 标题
echo "════════════════════════════════════════════════════════"
echo "🚀 新闻订阅系统 - 统一启动脚本"
echo "════════════════════════════════════════════════════════"
echo ""

# 设置环境变量以解决超时问题
export COMPOSE_HTTP_TIMEOUT=300
export DOCKER_CLIENT_TIMEOUT=300
export COMPOSE_PROJECT_NAME=pusher
print_info "已设置 Docker 超时时间: 300秒"

# 创建必要的目录
print_info "创建必要的目录..."
mkdir -p monitoring/grafana/provisioning/dashboards
mkdir -p monitoring/grafana/provisioning/datasources  
mkdir -p backend/logs
print_success "目录创建完成"

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    print_error "Docker 未运行，请先启动 Docker"
    exit 1
fi
print_success "Docker 运行正常"

# 询问启动模式
echo ""
echo "请选择启动模式:"
echo "  1) 快速启动 (一次性启动所有服务)"
echo "  2) 分阶段启动 (推荐，更稳定)"
echo "  3) 仅启动基础服务 (数据库、缓存、搜索)"
echo "  4) 仅启动应用服务 (需要先启动基础服务)"
echo "  5) 仅启动监控服务 (需要先启动基础服务)"
echo ""
read -p "请选择 (1-5): " choice

case $choice in
    1)
        print_info "快速启动模式 - 一次性启动所有服务"
        print_warning "注意: 可能需要 3-5 分钟，请耐心等待..."
        docker-compose up -d
        ;;
    2)
        print_info "分阶段启动模式 - 更稳定的启动方式"
        
        # 第一阶段: 数据存储层
        print_info "【阶段 1/4】启动数据存储层..."
        docker-compose up -d postgres redis opensearch
        print_info "等待数据存储服务就绪 (60秒)..."
        sleep 60
        docker-compose ps postgres redis opensearch
        
        # 第二阶段: 监控层
        print_info "【阶段 2/4】启动监控层..."
        docker-compose up -d prometheus grafana redis-commander
        print_info "等待监控服务就绪 (30秒)..."
        sleep 30
        docker-compose ps prometheus grafana redis-commander
        
        # 第三阶段: 后端
        print_info "【阶段 3/4】启动后端服务..."
        docker-compose up -d --build backend
        print_info "等待后端服务就绪 (60秒)..."
        sleep 60
        docker-compose ps backend
        
        # 第四阶段: 前端
        print_info "【阶段 4/4】启动前端服务..."
        docker-compose up -d --build frontend
        print_info "等待前端服务就绪 (30秒)..."
        sleep 30
        docker-compose ps frontend
        ;;
    3)
        print_info "启动基础服务: PostgreSQL + Redis + OpenSearch"
        docker-compose up -d postgres redis opensearch
        print_info "等待服务就绪 (60秒)..."
        sleep 60
        ;;
    4)
        print_info "启动应用服务: Backend + Frontend"
        docker-compose up -d --build backend frontend
        print_info "等待服务就绪 (60秒)..."
        sleep 60
        ;;
    5)
        print_info "启动监控服务: Prometheus + Grafana + Redis Commander"
        docker-compose up -d prometheus grafana redis-commander
        print_info "等待服务就绪 (30秒)..."
        sleep 30
        ;;
    *)
        print_error "无效选择"
        exit 1
        ;;
esac

# 显示服务状态
echo ""
print_info "检查服务状态..."
docker-compose ps

# 检查健康状态
echo ""
print_info "检查服务健康状态..."
unhealthy=$(docker-compose ps | grep -i "unhealthy" || true)
if [ -n "$unhealthy" ]; then
    print_warning "发现不健康的服务:"
    echo "$unhealthy"
else
    print_success "所有服务状态正常"
fi

# 显示访问信息
echo ""
echo "════════════════════════════════════════════════════════"
print_success "启动完成！"
echo "════════════════════════════════════════════════════════"
echo ""
echo "📊 服务访问地址:"
echo "  • 前端应用:      http://localhost:3000"
echo "  • 后端 API:      http://localhost:3001"
echo "  • API 文档:      http://localhost:3001/api/docs"
echo "  • 健康检查:      http://localhost:3001/api/v1/health"
echo "  • 系统指标:      http://localhost:3001/api/v1/metrics"
echo ""
echo "🔧 管理工具:"
echo "  • Prometheus:    http://localhost:9090"
echo "  • Grafana:       http://localhost:3002 (admin/admin)"
echo "  • Redis 管理:    http://localhost:8081 (admin/admin)"
echo ""
echo "💾 数据库服务:"
echo "  • PostgreSQL:    localhost:5432"
echo "  • Redis:         localhost:6379"
echo "  • OpenSearch:    localhost:9200"
echo ""
echo "🔍 常用命令:"
echo "  • 查看日志:      docker-compose logs -f"
echo "  • 查看状态:      docker-compose ps"
echo "  • 停止服务:      docker-compose down"
echo "  • 重启服务:      docker-compose restart"
echo "  • 查看资源:      docker stats"
echo ""
echo "════════════════════════════════════════════════════════"
