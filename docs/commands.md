# 命令参考

所有可用命令的快速参考。

---

## 开发服务器

```bash
pnpm dev:all          # 同时启动前后端 ⭐
pnpm dev:backend      # 仅后端
pnpm dev:frontend     # 仅前端
```

**访问**:

- 前端: http://localhost:5173
- 后端 API: http://localhost:9871/docs

---

## 数据库

```bash
pnpm db:init                    # 初始化 Aerich
pnpm db:init-db                 # 创建数据库表
pnpm db:generate --name "说明"  # 生成迁移
pnpm db:migrate                 # 应用迁移
pnpm db:rollback                # 回滚迁移
pnpm db:history                 # 查看历史
```

**完整流程**:

```bash
mkdir -p data && pnpm db:init && pnpm db:init-db
```

**修改模型后**:

```bash
pnpm db:generate --name "update" && pnpm db:migrate
```

---

## 类型生成

💡 **使用 `pnpm dev:all` 时无需手动生成，类型会自动更新！**

```bash
pnpm dev:watch                # 监听 OpenAPI 变化
pnpm generate:types           # 手动生成类型
pnpm generate:types:server    # 从运行的服务器
```

---

## 代码检查

```bash
# 前端
pnpm type-check        # TypeScript 检查
pnpm lint              # ESLint
pnpm format            # Prettier

# 后端
pnpm lint:backend      # Ruff 检查
pnpm format:backend    # Ruff 格式化
```

---

## 依赖管理

### Python (uv)

```bash
uv add <package>           # 添加依赖
uv add --dev <package>     # 开发依赖
uv remove <package>        # 移除
uv sync                    # 同步
```

⚠️ 禁止使用 `pip install`

### Node.js (pnpm)

```bash
pnpm add <package>         # 添加依赖
pnpm add -D <package>      # 开发依赖
pnpm remove <package>      # 移除
pnpm install               # 安装全部
```

---

## 构建

```bash
pnpm build             # 构建前端
pnpm preview           # 预览构建
```

---

## 初始化

```bash
./scripts/init-project.sh   # 自动初始化 ⭐
```

---

## 快速工作流

### 日常开发

```bash
pnpm dev:all
# 修改代码...
pnpm type-check && pnpm lint
```

### 添加功能

```bash
mkdir -p src/features/blog/{frontend/pages,backend}
# 编写代码...
pnpm db:generate --name "add_blog"
pnpm db:migrate
# 类型会自动更新（使用 dev:all 时）
```

### 修改模型

```bash
# 编辑 models.py
pnpm db:generate --name "update"
pnpm db:migrate
# 类型会自动更新（使用 dev:all 时）
```

---

## 常见操作

### 端口冲突

```bash
# 查看占用
lsof -ti:9871 | xargs kill -9

# 修改端口
pnpm dev:backend -- --port 8000
```

### 重置数据库

```bash
rm -rf migrations/ data/db.sqlite3
pnpm db:init && pnpm db:init-db
```

### 清理缓存

```bash
rm -rf dist/ node_modules/.vite/
```

---

## 详细说明

完整的命令说明见各专题文档：

- [数据库命令](./database.md#命令概览)
- [开发工作流](./development.md#工作流程)
