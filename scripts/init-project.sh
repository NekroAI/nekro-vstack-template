#!/bin/bash

# =============================================
# Nekro VStack 项目初始化脚本
# =============================================
# 用于快速初始化一个新的 Nekro VStack 项目

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印函数
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 获取项目根目录
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Nekro VStack 项目初始化                  ║${NC}"
echo -e "${GREEN}║   垂直切分的 AI 友好全栈开发模板          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

# =============================================
# 1. 检查依赖
# =============================================
print_step "检查系统依赖..."

# 检查 Python
if ! command -v python3 &> /dev/null; then
    print_error "未找到 Python 3，请先安装 Python 3.11+"
    exit 1
fi
print_success "Python: $(python3 --version)"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    print_error "未找到 Node.js，请先安装 Node.js 18+"
    exit 1
fi
print_success "Node.js: $(node --version)"

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    print_warning "未找到 pnpm"
    echo -n "是否安装 pnpm? (y/n) "
    read -r install_pnpm
    if [ "$install_pnpm" = "y" ]; then
        npm install -g pnpm
        print_success "pnpm 安装成功"
    else
        print_error "请先安装 pnpm: npm install -g pnpm"
        exit 1
    fi
fi
print_success "pnpm: $(pnpm --version)"

# 检查 uv
if ! command -v uv &> /dev/null; then
    print_warning "未找到 uv (Python 包管理器)"
    echo -n "是否安装 uv? (y/n) "
    read -r install_uv
    if [ "$install_uv" = "y" ]; then
        curl -LsSf https://astral.sh/uv/install.sh | sh
        print_success "uv 安装成功，请重新运行此脚本"
        exit 0
    else
        print_error "请先安装 uv: curl -LsSf https://astral.sh/uv/install.sh | sh"
        exit 1
    fi
fi
print_success "uv: $(uv --version)"

echo ""

# =============================================
# 2. 配置项目信息
# =============================================
print_step "配置项目信息..."

echo ""
echo "请输入项目信息（按 Enter 使用默认值）："
echo ""

# 读取项目名称
echo -n "项目名称 [Nekro VStack]: "
read -r project_name
project_name=${project_name:-"Nekro VStack"}

# 读取项目描述
echo -n "项目描述 [垂直切分的 AI 友好全栈开发模板]: "
read -r project_description
project_description=${project_description:-"垂直切分的 AI 友好全栈开发模板"}

# 读取项目版本
echo -n "项目版本 [0.1.0]: "
read -r project_version
project_version=${project_version:-"0.1.0"}

echo ""
print_success "项目名称: $project_name"
print_success "项目描述: $project_description"
print_success "项目版本: $project_version"
echo ""

# =============================================
# 3. 创建配置文件
# =============================================
print_step "创建配置文件..."

# 创建后端 .env 文件
if [ -f ".env" ]; then
    print_warning ".env 已存在，跳过创建"
else
    cp env.backend.example .env
    
    # 生成随机密钥
    if command -v openssl &> /dev/null; then
        secret_key=$(openssl rand -hex 32)
        # macOS 和 Linux 的 sed 语法不同
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/your-secret-key-change-in-production-use-openssl-rand-hex-32/$secret_key/" .env
        else
            sed -i "s/your-secret-key-change-in-production-use-openssl-rand-hex-32/$secret_key/" .env
        fi
        print_success "已生成随机 SECRET_KEY"
    else
        print_warning "未找到 openssl，请手动设置 SECRET_KEY"
    fi
    
    # 更新项目信息
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/APP_NAME=\"Nekro VStack API\"/APP_NAME=\"$project_name API\"/" .env
        sed -i '' "s/APP_DESCRIPTION=\"垂直切分的 AI 友好全栈开发模板\"/APP_DESCRIPTION=\"$project_description\"/" .env
        sed -i '' "s/VERSION=\"0.1.0\"/VERSION=\"$project_version\"/" .env
    else
        sed -i "s/APP_NAME=\"Nekro VStack API\"/APP_NAME=\"$project_name API\"/" .env
        sed -i "s/APP_DESCRIPTION=\"垂直切分的 AI 友好全栈开发模板\"/APP_DESCRIPTION=\"$project_description\"/" .env
        sed -i "s/VERSION=\"0.1.0\"/VERSION=\"$project_version\"/" .env
    fi
    
    print_success "创建 .env 文件"
fi

# 创建前端 .env.local 文件
if [ -f ".env.local" ]; then
    print_warning ".env.local 已存在，跳过创建"
else
    cp env.frontend.example .env.local
    
    # 更新项目信息
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/VITE_APP_NAME=\"Nekro VStack\"/VITE_APP_NAME=\"$project_name\"/" .env.local
        sed -i '' "s/VITE_APP_DESCRIPTION=\"垂直切分的 AI 友好全栈开发模板\"/VITE_APP_DESCRIPTION=\"$project_description\"/" .env.local
        sed -i '' "s/VITE_APP_VERSION=\"0.1.0\"/VITE_APP_VERSION=\"$project_version\"/" .env.local
    else
        sed -i "s/VITE_APP_NAME=\"Nekro VStack\"/VITE_APP_NAME=\"$project_name\"/" .env.local
        sed -i "s/VITE_APP_DESCRIPTION=\"垂直切分的 AI 友好全栈开发模板\"/VITE_APP_DESCRIPTION=\"$project_description\"/" .env.local
        sed -i "s/VITE_APP_VERSION=\"0.1.0\"/VITE_APP_VERSION=\"$project_version\"/" .env.local
    fi
    
    print_success "创建 .env.local 文件"
fi

echo ""

# =============================================
# 4. 安装依赖
# =============================================
print_step "安装 Python 依赖..."
uv sync
print_success "Python 依赖安装完成"

echo ""

print_step "安装 Node.js 依赖..."
pnpm install
print_success "Node.js 依赖安装完成"

echo ""

# =============================================
# 5. 初始化数据库
# =============================================
print_step "初始化数据库..."

# 创建数据目录
mkdir -p data
print_success "创建数据目录"

# 检查是否已初始化
if [ -d "migrations" ]; then
    print_warning "数据库迁移已存在，跳过初始化"
else
    uv run aerich init -t src.backend.config.database.TORTOISE_ORM
    print_success "初始化 Aerich"
    
    uv run aerich init-db
    print_success "创建数据库表"
fi

echo ""

# =============================================
# 6. 生成前端类型
# =============================================
print_step "生成前端类型定义..."
pnpm generate:types
print_success "类型定义生成完成"

echo ""

# =============================================
# 完成
# =============================================
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   🎉 项目初始化完成！                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo "✨ 下一步："
echo ""
echo "1️⃣  一键启动（推荐）："
echo -e "   ${BLUE}pnpm dev:all${NC}"
echo ""
echo "   或分别启动："
echo -e "   ${BLUE}pnpm dev:backend${NC}    # 后端（终端 1）"
echo -e "   ${BLUE}pnpm dev:frontend${NC}   # 前端（终端 2）"
echo ""
echo "2️⃣  访问应用："
echo -e "   - 前端: ${BLUE}http://localhost:5173${NC}"
echo -e "   - API 文档: ${BLUE}http://localhost:9871/docs${NC}"
echo -e "   - 默认账号: ${YELLOW}admin / admin${NC}"
echo ""
echo "📝 常用命令："
echo -e "   ${BLUE}pnpm dev:all${NC}          # 同时启动前后端"
echo -e "   ${BLUE}pnpm db:migrate${NC}       # 生成数据库迁移"
echo -e "   ${BLUE}pnpm generate:types${NC}   # 生成前端类型"
echo ""
echo "📚 更多信息："
echo "   - 快速指南: QUICKSTART.md"
echo "   - 配置文档: CONFIG.md"
echo "   - AI 开发指南: .cursor/rules/global.mdc"
echo ""
echo -e "${GREEN}祝开发愉快！🚀${NC}"
echo ""

