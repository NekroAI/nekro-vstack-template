# 更新日志

## [0.1.17] - 2025-12-07

### 🚀 新增

- **核心架构**
  - 后端：FastAPI + Tortoise-ORM + Aerich + Loguru
  - 前端：React 18 + React Router v7 + Vite + MUI v6 + Framer Motion
  - 数据库：SQLite (内嵌支持)
  - 状态管理：Zustand
- **功能模块**
  - 用户认证系统 (JWT, 登录/注册)
  - 仪表盘概览页面
  - 系统监控模块 (支持 SSE 实时日志推送)
- **部署与构建**
  - Docker 容器化部署 (支持 linux/amd64, linux/arm64)
  - Windows 桌面端原生应用 (基于 PyInstaller)
  - 全自动 GitHub Actions 发布工作流
  - 自动数据库迁移系统
