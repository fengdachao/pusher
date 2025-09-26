#!/bin/bash

echo "🚀 启动新闻订阅系统..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 复制环境变量文件
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件，请根据需要修改配置"
fi

# 启动服务
echo "🐳 启动 Docker 服务..."
docker-compose up -d

# 等待数据库启动
echo "⏳ 等待数据库启动..."
sleep 10

# 初始化数据库和种子数据
echo "📊 初始化数据库..."
docker-compose exec -T backend npm run seed

echo "✅ 系统启动完成！"
echo ""
echo "🌐 访问地址："
echo "  前端界面: http://localhost:3000"
echo "  后端API:  http://localhost:3001"
echo "  API文档:  http://localhost:3001/api/docs"
echo ""
echo "📖 使用说明："
echo "  1. 访问 http://localhost:3000 注册账号"
echo "  2. 创建个人订阅配置"
echo "  3. 系统会自动爬取新闻并推送"
echo ""
echo "🛑 停止系统: docker-compose down"