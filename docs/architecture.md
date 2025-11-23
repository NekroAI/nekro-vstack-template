# 架构说明

Nekro VStack 的架构设计和技术选型。

---

## 设计理念

### 垂直切分（Feature-First）

**传统架构问题**:

- 前后端代码分离，功能代码散落
- AI 难以理解跨目录的功能关联
- 维护困难，修改一个功能需要跨多个目录

**Nekro VStack 解决方案**:

```
src/features/user/
├── frontend/     # 用户相关的前端代码
└── backend/      # 用户相关的后端代码
```

**优势**:

- ✅ 功能自包含，易于理解
- ✅ AI 友好，相关代码物理聚合
- ✅ 降低耦合，features 独立演化

---

## 目录结构

```
src/
├── features/              # 业务功能（垂直切分）
│   ├── user/              # 用户功能
│   │   ├── frontend/
│   │   │   ├── pages/     # React 页面
│   │   │   ├── api.ts     # API 调用
│   │   │   └── index.ts   # 统一导出
│   │   └── backend/
│   │       ├── models.py  # Tortoise 模型
│   │       ├── schemas.py # Pydantic Schema
│   │       └── router.py  # FastAPI 路由
│   └── dashboard/         # 其他功能...
│
├── backend/               # 后端核心（不含业务）
│   ├── core/              # 核心功能
│   │   ├── security.py    # JWT/密码处理
│   │   ├── exceptions.py  # 异常处理
│   │   └── logger.py      # 日志系统
│   ├── config/            # 配置管理
│   │   ├── settings.py    # 环境变量
│   │   └── database.py    # ORM 配置
│   └── main.py            # 应用入口
│
├── frontend/              # 前端核心（不含业务）
│   ├── core/              # 技术基础设施
│   │   ├── http/          # Axios 封装
│   │   ├── router/        # React Router
│   │   └── types/         # 类型定义
│   ├── shared/            # 共享资源
│   │   ├── components/    # 通用组件
│   │   ├── hooks/         # 通用 Hooks
│   │   ├── layouts/       # 布局
│   │   └── stores/        # Zustand 状态
│   └── utils/             # 纯函数
│
└── config/
    └── env.ts             # 前端环境变量
```

---

## 层次划分

```
层次         │ 目录           │ 职责
────────────┼────────────────┼────────────────
业务层       │ features/      │ 具体业务功能
────────────┼────────────────┼────────────────
共享层       │ shared/        │ 可复用业务逻辑
────────────┼────────────────┼────────────────
基础设施层   │ core/          │ 技术基础设施
────────────┼────────────────┼────────────────
工具层       │ utils/         │ 纯函数工具
```

**依赖规则**:

- ✅ 高层可依赖低层
- ❌ 同层禁止相互依赖
- ❌ 低层禁止依赖高层

---

## 技术选型

### 后端技术栈

| 技术         | 用途       | 选型理由                   |
| ------------ | ---------- | -------------------------- |
| FastAPI      | Web 框架   | 高性能、自动文档、类型支持 |
| Pydantic v2  | 数据验证   | 强类型、自动生成 OpenAPI   |
| Tortoise-ORM | 数据库 ORM | 异步、类 Django ORM、易用  |
| Aerich       | 数据库迁移 | Tortoise 官方工具          |
| python-jose  | JWT        | 标准 JWT 实现              |
| bcrypt       | 密码哈希   | 安全的密码存储             |
| Loguru       | 日志       | 简单易用、功能强大         |
| uv           | 包管理     | Rust 实现、极速            |

### 前端技术栈

| 技术               | 用途        | 选型理由              |
| ------------------ | ----------- | --------------------- |
| React 18           | UI 框架     | 生态成熟、并发特性    |
| TypeScript 5.6     | 类型系统    | 类型安全、开发体验    |
| React Router v7    | 路由        | 最新版本、类型安全    |
| Zustand            | 状态管理    | 简单、无样板代码      |
| MUI                | 组件库      | Material Design、完整 |
| Axios              | HTTP 客户端 | 拦截器、类型支持      |
| Vite               | 构建工具    | 快速、开发体验好      |
| openapi-typescript | 类型生成    | 自动生成 API 类型     |
| pnpm               | 包管理      | 快速、节省空间        |

---

## 核心流程

### 类型同步流程

```
1. 定义 Pydantic Schema (后端)
   ↓
2. FastAPI 自动生成 OpenAPI 规范
   ↓
3. openapi-typescript 生成 TypeScript 类型
   ↓
4. 前端导入使用类型
```

**命令**:

```bash
pnpm generate:types
```

### 请求流程

```
前端组件
   ↓ (调用 API)
features/*/frontend/api.ts
   ↓ (使用 HTTP 客户端)
frontend/core/http/client.ts
   ↓ (拦截器处理)
frontend/core/http/interceptors.ts
   ↓ (HTTP 请求)
FastAPI 后端
   ↓ (路由处理)
features/*/backend/router.py
   ↓ (业务逻辑)
features/*/backend/models.py
   ↓ (数据库)
Tortoise-ORM
```

### 错误处理流程

**后端**:

```python
# 抛出业务异常
raise APIError(code="NOT_FOUND", message="资源不存在", status_code=404)
   ↓
# 全局异常处理器捕获
app.add_exception_handler(APIError, api_error_handler)
   ↓
# 返回标准格式
{"code": "NOT_FOUND", "message": "资源不存在"}
```

**前端**:

```typescript
// HTTP 拦截器捕获
http.interceptors.response.use(onSuccess, onError)
   ↓
// 显示通知给用户
enqueueSnackbar(message, { variant: 'error' })
   ↓
// 组件可选择性处理
try { await api() } catch (error) { /* 清理 */ }
```

---

## 安全设计

### 认证流程

```
1. 用户登录 (username + password)
   ↓
2. 后端验证凭据
   ↓
3. 生成 JWT Token (python-jose)
   ↓
4. 前端存储 Token (localStorage)
   ↓
5. 后续请求携带 Token (Authorization: Bearer ...)
   ↓
6. 后端验证 Token (dependencies.py)
```

### 密码安全

- bcrypt 哈希存储
- 密钥轮换支持
- Token 过期机制

---

## 数据库设计

### 迁移管理

使用 Aerich 管理数据库迁移：

```bash
pnpm db:generate  # 检测模型变化，生成迁移
pnpm db:migrate   # 应用迁移到数据库
pnpm db:rollback  # 回滚迁移
```

### 模型组织

- 每个 feature 的模型独立定义
- 在 `database.py` 中统一注册
- 支持关联查询和事务

---

## 扩展性

### 添加新 Feature

1. 创建目录结构
2. 实现前后端代码
3. 注册路由和模型
4. 生成迁移和类型

**完全解耦**，不影响其他 feature。

### 技术栈替换

| 组件         | 可替换为              |
| ------------ | --------------------- |
| Tortoise-ORM | SQLAlchemy, Prisma    |
| MUI          | Ant Design, Chakra UI |
| Zustand      | Redux, Jotai          |
| FastAPI      | Flask, Django         |

核心架构设计（垂直切分）不变。

---

## 性能考虑

### 前端优化

- Vite 快速构建
- 代码分割（动态导入）
- MUI Tree Shaking

### 后端优化

- FastAPI 异步处理
- Tortoise-ORM 查询优化
- uv 快速依赖安装

---

## 相关文档

- [开发指南](./development.md) - 实践架构理念
- [为什么选择 Nekro VStack](../README.md#为什么选择-nekro-vstack)
