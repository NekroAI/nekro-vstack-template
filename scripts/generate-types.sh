#!/bin/bash
# 一键生成 OpenAPI 和 TypeScript 类型

set -e  # 遇到错误立即退出

echo "🚀 开始生成类型..."

# 1. 生成 OpenAPI JSON
echo "📝 步骤 1/2: 生成 OpenAPI 规范..."
uv run python scripts/generate-openapi.py

# 2. 从 OpenAPI 生成 TypeScript 类型
echo "📝 步骤 2/2: 生成 TypeScript 类型..."
pnpm exec openapi-typescript openapi.json -o src/frontend/core/types/generated.ts

echo ""
echo "✅ 类型生成完成！"
echo "📁 生成文件："
echo "   - openapi.json"
echo "   - src/frontend/core/types/generated.ts"
echo ""
echo "💡 提示：可以运行 'pnpm type-check' 验证类型"

