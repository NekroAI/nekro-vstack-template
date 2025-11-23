#!/bin/bash
# 启动后端开发服务器

cd "$(dirname "$0")/.."

# 从 .env 读取端口配置，默认 9871
BACKEND_PORT="${PORT:-9871}"
BACKEND_HOST="${HOST:-0.0.0.0}"

echo "🚀 启动 Nekro VStack 后端开发服务器..."
echo ""
echo "🌐 服务器地址: http://localhost:${BACKEND_PORT}"
echo "📖 API 文档: http://localhost:${BACKEND_PORT}/docs"
echo "💡 提示: 修改后端代码后，OpenAPI 规范和类型会自动更新"
echo ""

uv run uvicorn src.backend.main:app --reload --host "$BACKEND_HOST" --port "$BACKEND_PORT"
