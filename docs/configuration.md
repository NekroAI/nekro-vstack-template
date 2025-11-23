# 配置指南

本文档说明如何配置 Nekro VStack 项目。

---

## 快速配置

### 1. 复制配置文件

```bash
# 项目已包含 .env 文件，可直接使用
# 如需重新配置：
cp .env.example .env
```

### 2. 修改关键配置（可选）

编辑 `.env`:

```bash
APP_NAME="你的项目名称 API"
SECRET_KEY="$(openssl rand -hex 32)"
DATABASE_URL="sqlite://./data/db.sqlite3"
```

---

## 端口配置

默认端口：

- 前端：`5173` (可通过 `VITE_PORT` 修改)
- 后端：`9871` (可通过 `PORT` 修改)

详细端口配置说明：[端口配置指南](./ports.md)

---

## 后端配置 (.env)

### 应用信息

```bash
APP_NAME="Nekro VStack API"
APP_DESCRIPTION="垂直切分的 AI 友好全栈开发模板"
VERSION="0.1.0"
ENVIRONMENT="development"  # development | production | test
DEBUG=false
```

### 数据库

**SQLite (开发)**:

```bash
DATABASE_URL="sqlite://./data/db.sqlite3"
```

**PostgreSQL (生产)**:

```bash
DATABASE_URL="postgres://user:pass@localhost:5432/dbname"
```

**MySQL**:

```bash
DATABASE_URL="mysql://user:pass@localhost:3306/dbname"
```

### 安全

```bash
# JWT 密钥（必须修改！）
SECRET_KEY="your-secret-key-32-bytes-hex"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7天
```

生成密钥：

```bash
openssl rand -hex 32
```

### CORS

```bash
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

---

## 前端配置 (.env.local)

### 应用信息

```bash
VITE_APP_NAME="Nekro VStack"
VITE_APP_VERSION="0.1.0"
VITE_APP_DESCRIPTION="垂直切分的 AI 友好全栈开发模板"
```

### API

```bash
# 开发环境（通过 Vite proxy）
VITE_API_BASE_URL="/api"

# 生产环境
# VITE_API_BASE_URL="https://api.yourdomain.com"
```

### 功能开关

```bash
VITE_ENABLE_MOCK=false     # Mock 数据
VITE_ENABLE_DEBUG=false    # 调试模式
```

---

## 项目定制

### 修改包名

**package.json**:

```json
{
  "name": "your-project-name",
  "version": "1.0.0"
}
```

**pyproject.toml**:

```toml
[project]
name = "your-project-name"
version = "1.0.0"
description = "你的项目描述"
```

### 修改显示名称

只需修改环境变量，代码会自动读取：

- 后端：`.env` 中的 `APP_NAME`
- 前端：`.env.local` 中的 `VITE_APP_NAME`
- HTML 标题：自动从 `VITE_APP_NAME` 读取

---

## 生产环境

### 检查清单

- [ ] 修改 `SECRET_KEY` 为随机值
- [ ] 设置 `DEBUG=false`
- [ ] 使用 PostgreSQL 或 MySQL
- [ ] 配置正确的 `CORS_ORIGINS`
- [ ] 确保 `.env` 不提交到 git

### Docker 部署

```bash
# .env.production
APP_NAME="Production API"
ENVIRONMENT="production"
DEBUG=false
DATABASE_URL="postgres://user:pass@db:5432/prod_db"
SECRET_KEY="production-secret-key-32-bytes"
CORS_ORIGINS=["https://yourdomain.com"]
```

### 云平台部署

在平台环境变量中设置：

```
VITE_APP_NAME=Your App
VITE_API_BASE_URL=https://api.yourdomain.com
```

---

## 配置优先级

1. 环境变量（最高）
2. `.env` 文件
3. 代码默认值（最低）

示例：

```bash
# 临时覆盖
APP_NAME="Test" pnpm dev:backend
```

---

## 常见问题

### Q: 前端不显示自定义名称？

A: 检查 `.env.local` 文件和 `VITE_APP_NAME`，重启开发服务器。

### Q: 数据库连接失败？

A: 检查 `DATABASE_URL` 格式、数据库服务状态、目录权限。

### Q: CORS 错误？

A: 确保 `CORS_ORIGINS` 包含前端地址，JSON 数组格式正确。

---

## 相关文档

- [快速开始](./getting-started.md)
- [数据库配置](./database.md)
