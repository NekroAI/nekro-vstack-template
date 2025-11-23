# Nekro VStack

**垂直切分的 AI 友好全栈开发模板**

Vertical-Split Full-Stack Template for AI-Powered Development

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.6+-blue.svg)](https://www.typescriptlang.org)

---

## ✨ 核心特性

- **🏗️ 功能垂直切分** - 前后端代码按功能聚合，优化 AI 理解和检索效率
- **🔄 类型自动同步** - 后端 OpenAPI → 前端 TypeScript，端到端类型安全
- **📦 开箱即用** - 数据库、认证、日志、错误处理全配置
- **🤖 AI 协作优先** - 完整的 AI 开发规范和项目结构设计
- **⚙️ 灵活配置** - 所有项目信息可通过环境变量定制

---

## 🚀 快速开始

```bash
# 一键初始化
./scripts/init-project.sh

# 启动项目
pnpm dev:all

# 访问应用
# 前端: http://localhost:5173
# API文档: http://localhost:9871/docs
# 默认账号: admin / admin
```

详细说明：[快速开始指南](./docs/getting-started.md)

---

## 📚 文档导航

### 入门指南

- **[快速开始](./docs/getting-started.md)** - 5 分钟上手 ⭐
- **[命令参考](./docs/commands.md)** - 所有可用命令
- **[配置指南](./docs/configuration.md)** - 自定义项目配置

### 深入学习

- **[开发指南](./docs/development.md)** - 如何开发新功能
- **[数据库迁移](./docs/database.md)** - 数据库操作详解
- **[架构说明](./docs/architecture.md)** - 设计理念和技术选型

### AI 开发

- **[AI 协作规范](./.cursor/rules/global.mdc)** - Cursor AI 开发指南

---

## 🎯 技术栈

**后端**: FastAPI + Pydantic v2 + Tortoise-ORM + Aerich + Loguru  
**前端**: React 18 + TypeScript 5.6 + Zustand + MUI + React Router v7  
**工具链**: uv (Python) + pnpm (Node.js) + Vite + openapi-typescript

---

## 📁 项目结构

```
src/
├── features/          # 功能模块（垂直切分）
│   └── user/
│       ├── frontend/  # 前端：页面 + API
│       └── backend/   # 后端：路由 + 模型
├── backend/core/      # 后端核心（安全、日志）
└── frontend/
    ├── core/          # 技术基础设施
    ├── shared/        # 共享业务逻辑
    └── utils/         # 工具函数
```

详细说明：[架构文档](./docs/architecture.md)

---

## 🎓 为什么选择 Nekro VStack？

### 解决的痛点

**传统架构**:

- ❌ 功能代码散落各处，维护困难
- ❌ 类型需手动同步，易出错
- ❌ AI 难以理解跨目录关联

**Nekro VStack**:

- ✅ 功能自包含，代码聚合
- ✅ 类型自动生成，端到端安全
- ✅ AI 友好设计，高效协作

### 适用场景

- 🚀 快速构建 MVP 产品
- 🤖 AI 辅助开发的中小型项目
- 🔒 需要类型安全的企业应用
- 👥 团队协作的标准化模板
- 📚 学习全栈开发的参考项目

---

## 📝 开发规范

### 路径别名（必须使用）

```typescript
// ✅ 正确
import { userAPI } from '@/features/user/frontend'
import type { User } from '@/frontend/core/types'

// ❌ 禁止相对路径
import { userAPI } from '../../user/frontend'
```

### 文件命名

| 类型         | 规范       | 示例              |
| ------------ | ---------- | ----------------- |
| Feature 目录 | kebab-case | `user-profile/`   |
| React 组件   | PascalCase | `UserProfile.tsx` |
| TypeScript   | camelCase  | `api.ts`          |
| Python 文件  | snake_case | `user_service.py` |

完整规范：[开发指南](./docs/development.md)

---

## 🚢 部署

### 生产环境检查清单

- [ ] 修改 `SECRET_KEY` 为随机值
- [ ] 设置 `DEBUG=false`
- [ ] 使用 PostgreSQL 或 MySQL
- [ ] 配置正确的 `CORS_ORIGINS`
- [ ] 运行 `pnpm type-check` 通过
- [ ] 运行 `pnpm lint:backend` 无错误

详细说明：[配置指南](./docs/configuration.md#生产环境)

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

提交前请确保：

1. 运行 `pnpm type-check` 通过
2. 运行 `pnpm lint:backend` 无错误
3. 遵循开发规范
4. 添加必要的文档

---

## 📄 License

MIT License - 自由使用、修改和分发

---

## 🙏 致谢

本模板设计灵感来源于：

- 垂直切分架构（Feature-Sliced Design）
- AI 协作开发最佳实践
- 现代全栈工程化经验

---

**Nekro VStack** - 让 AI 成为你的全栈开发伙伴 🤖✨

**快速开始**: `./scripts/init-project.sh`
