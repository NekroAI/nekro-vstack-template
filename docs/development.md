# 开发指南

本文档介绍如何在 Nekro VStack 中开发新功能。

---

## 架构概览

### 垂直切分（Feature-First）

```
src/features/[功能名]/
├── frontend/          # 前端代码
│   ├── pages/         # 页面组件
│   ├── api.ts         # API 调用
│   └── index.ts       # 导出
└── backend/           # 后端代码
    ├── models.py      # 数据模型
    ├── schemas.py     # 验证模型
    └── router.py      # API 路由
```

### 依赖规则

```
features/  → 业务功能（最高层）
    ↓
shared/    → 共享业务逻辑
    ↓
core/      → 技术基础设施
    ↓
utils/     → 纯工具函数（最底层）
```

**禁止**：

- ❌ Feature 之间直接导入
- ❌ 使用相对路径（必须用 `@/` 别名）
- ❌ 在 core/ 中放业务逻辑

---

## 添加新功能

### 完整流程

```bash
# 1. 创建目录
mkdir -p src/features/blog/{frontend/pages,backend}

# 2. 后端开发
# - models.py: 数据模型
# - schemas.py: 验证模型
# - router.py: API 路由

# 3. 注册路由 (src/backend/main.py)
from src.features.blog.backend.router import router as blog_router
app.include_router(blog_router, prefix="/api/blog", tags=["博客"])

# 4. 注册模型 (src/backend/config/database.py)
"models": ["src.features.blog.backend.models", ...]

# 5. 生成迁移
pnpm db:generate --name "add_blog"
pnpm db:migrate

# 6. 前端开发
# - api.ts: API 调用
# - pages/BlogPage.tsx: 页面
# - index.ts: 导出

# 7. 注册前端路由 (src/frontend/core/router/index.tsx)

# 8. 类型自动更新 (使用 pnpm dev:all 时自动完成)
# 或手动生成: pnpm generate:types
```

### 代码模板

#### 后端 Model

```python
# src/features/blog/backend/models.py
from tortoise import fields, models

class Post(models.Model):
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=200)
    content = fields.TextField()
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "blog_posts"
```

#### 后端 Schema

```python
# src/features/blog/backend/schemas.py
from pydantic import BaseModel

class PostCreate(BaseModel):
    title: str
    content: str

class PostResponse(BaseModel):
    id: int
    title: str
    content: str

    class Config:
        from_attributes = True
```

#### 后端 Router

```python
# src/features/blog/backend/router.py
from fastapi import APIRouter
from .models import Post
from .schemas import PostCreate, PostResponse

router = APIRouter(prefix="/blog", tags=["博客"])

@router.get("/", response_model=list[PostResponse])
async def list_posts():
    return await Post.all()

@router.post("/", response_model=PostResponse)
async def create_post(data: PostCreate):
    post = await Post.create(**data.dict())
    return post
```

#### 前端 API

```typescript
// src/features/blog/frontend/api.ts
import { httpClient } from '@/frontend/core/http'
import type { PostResponse, PostCreate } from '@/frontend/core/types'

export const blogAPI = {
  async getPosts() {
    const { data } = await httpClient.get<PostResponse[]>('/blog/')
    return data
  },

  async createPost(post: PostCreate) {
    const { data } = await httpClient.post<PostResponse>('/blog/', post)
    return data
  },
}
```

#### 前端页面

```typescript
// src/features/blog/frontend/pages/BlogPage.tsx
import { useEffect, useState } from 'react'
import { blogAPI } from '@/features/blog/frontend'

export default function BlogPage() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    blogAPI.getPosts().then(setPosts)
  }, [])

  return <div>{/* 渲染列表 */}</div>
}
```

---

## 开发规范

### 路径别名

```typescript
// ✅ 正确
import { httpClient } from '@/frontend/core/http'
import { userAPI } from '@/features/user/frontend'
import type { User } from '@/frontend/core/types'

// ❌ 禁止
import { httpClient } from '../../../../frontend/core/http'
```

### 类型使用

```typescript
// ✅ 使用生成的类型
import type { User, LoginRequest } from '@/frontend/core/types'

// ❌ 禁止重复定义
interface User { ... }  // generated.ts 中已有
```

### 错误处理

**后端**：

```python
from src.backend.core.exceptions import APIError

raise APIError(
    code="NOT_FOUND",
    message="资源不存在",
    status_code=404
)
```

**前端**：

```typescript
// HTTP 拦截器自动处理错误
try {
  await api.doSomething()
} catch (error) {
  // 用户已看到提示，这里做清理
  console.error(error)
}
```

### 文件命名

| 类型         | 规范       | 示例              |
| ------------ | ---------- | ----------------- |
| Feature 目录 | kebab-case | `user-profile/`   |
| React 组件   | PascalCase | `UserProfile.tsx` |
| TypeScript   | camelCase  | `api.ts`          |
| Python 文件  | snake_case | `user_service.py` |

---

## 类型自动生成

### 🚀 开发模式（推荐）

使用 `pnpm dev:all` 启动项目时，类型会自动生成和更新：

```bash
pnpm dev:all
```

**工作原理**：

1. 后端启动时自动生成 `openapi.json`
2. 文件监听脚本检测到 `openapi.json` 变化
3. 自动运行类型生成，更新 `generated.ts`
4. **修改后端代码 → uvicorn reload → OpenAPI 更新 → 类型自动更新** ✨

**优势**：

- ✅ 无需手动运行命令
- ✅ 后端代码变化后类型自动同步
- ✅ 开发体验流畅

### 手动生成

```bash
# 从本地 OpenAPI 规范生成
pnpm generate:types

# 从运行中的服务器生成
pnpm generate:types:server
```

---

## 数据库操作

### 修改模型

```bash
# 1. 编辑 models.py
# 2. 生成迁移
pnpm db:generate --name "add_field"
# 3. 应用迁移
pnpm db:migrate
# 4. 类型自动更新 (使用 pnpm dev:all 时自动完成)
```

详细说明见 [数据库迁移指南](./database.md)。

---

## 添加共享组件

```typescript
// 1. 创建组件
// src/frontend/shared/components/MyComponent.tsx
export default function MyComponent() { ... }

// 2. 导出
// src/frontend/shared/components/index.ts
export { default as MyComponent } from './MyComponent'

// 3. 使用
import { MyComponent } from '@/frontend/shared'
```

---

## 工作流程

### 日常开发

```bash
pnpm dev:all                    # 启动服务
# 修改代码，热重载生效
pnpm type-check && pnpm lint    # 提交前检查
```

### 添加新功能

```bash
# 创建 feature → 后端开发 → 前端开发 → 类型自动更新
```

💡 **提示**：使用 `pnpm dev:all` 启动项目时，后端代码变化会自动更新类型文件，无需手动运行命令。

### 修改数据模型

```bash
# 修改 models.py → 生成迁移 → 应用 → 类型自动更新
```

---

## 参考示例

项目包含两个示例 feature：

- `src/features/user/` - 用户认证
- `src/features/dashboard/` - 仪表盘

参考这些示例学习最佳实践。

---

## 相关文档

- [数据库迁移](./database.md)
- [配置指南](./configuration.md)
- [命令参考](./commands.md)
