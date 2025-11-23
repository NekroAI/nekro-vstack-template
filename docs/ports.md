# 端口配置指南

本文档说明如何配置和修改 Nekro VStack 的服务端口。

---

## 默认端口

| 服务            | 默认端口 | 配置变量    |
| --------------- | -------- | ----------- |
| 前端开发服务器  | 5173     | `VITE_PORT` |
| 后端 API 服务器 | 9871     | `PORT`      |

---

## 修改端口

### 方法一：修改 .env 文件（推荐）

编辑项目根目录的 `.env` 文件：

```bash
# 修改后端端口
PORT=8000

# 修改后端 URL（前端 proxy 使用）
VITE_BACKEND_URL="http://127.0.0.1:8000"

# 修改前端端口
VITE_PORT=3000

# 更新 CORS 配置（允许新的前端端口）
CORS_ORIGINS=["http://localhost:3000"]
```

### 方法二：使用环境变量

临时修改端口（不修改文件）：

```bash
# 修改后端端口
PORT=8000 pnpm dev:backend

# 修改前端端口
VITE_PORT=3000 pnpm dev:frontend

# 同时修改（需要分别指定）
PORT=8000 VITE_PORT=3000 pnpm dev:all
```

---

## 端口冲突解决

### 场景一：后端端口被占用

**问题**：`9871` 端口已被其他程序使用

**解决方案**：

1. 修改 `.env` 文件：

```bash
PORT=8000
VITE_BACKEND_URL="http://127.0.0.1:8000"
```

2. 重启服务：

```bash
pnpm dev:all
```

### 场景二：前端端口被占用

**问题**：`5173` 端口已被其他程序使用

**解决方案**：

1. 修改 `.env` 文件：

```bash
VITE_PORT=3000
CORS_ORIGINS=["http://localhost:3000"]
```

2. 重启服务：

```bash
pnpm dev:all
```

### 场景三：同时修改多个端口

**示例**：改为后端 `8080`，前端 `3000`

```bash
# 后端配置
HOST="0.0.0.0"
PORT=8080
VITE_BACKEND_URL="http://127.0.0.1:8080"

# 前端配置
VITE_HOST="localhost"
VITE_PORT=3000

# CORS 配置（允许新的前端端口）
CORS_ORIGINS=["http://localhost:3000"]
```

---

## 配置详解

### 后端端口配置

#### HOST

- **默认值**: `0.0.0.0`
- **说明**: 监听地址
  - `0.0.0.0` - 允许外部访问（推荐开发/生产环境）
  - `127.0.0.1` - 仅本地访问
  - `localhost` - 仅本地访问

#### PORT

- **默认值**: `9871`
- **说明**: 后端 API 服务器端口
- **范围**: 1024-65535（建议使用 8000-9999）

#### VITE_BACKEND_URL

- **默认值**: `http://127.0.0.1:9871`
- **说明**: Vite 开发服务器的 proxy 目标地址
- **重要**: 修改 `PORT` 时必须同步修改此配置

### 前端端口配置

#### VITE_HOST

- **默认值**: `localhost`
- **说明**: 前端开发服务器监听地址
- **可选值**: `localhost`, `0.0.0.0`, 具体IP

#### VITE_PORT

- **默认值**: `5173`
- **说明**: 前端开发服务器端口
- **范围**: 1024-65535

### CORS 配置

#### CORS_ORIGINS

- **默认值**: `["http://localhost:5173","http://localhost:3000"]`
- **说明**: 允许跨域访问的源
- **重要**: 修改前端端口时必须同步修改

**示例**：

```bash
# 单个源
CORS_ORIGINS=["http://localhost:3000"]

# 多个源
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173","http://192.168.1.100:3000"]

# 生产环境
CORS_ORIGINS=["https://yourdomain.com","https://www.yourdomain.com"]
```

---

## 常见配置示例

### 示例一：使用常见端口

```bash
# 后端使用 8000，前端使用 3000
PORT=8000
VITE_PORT=3000
VITE_BACKEND_URL="http://127.0.0.1:8000"
CORS_ORIGINS=["http://localhost:3000"]
```

### 示例二：允许局域网访问

```bash
# 后端允许外部访问
HOST="0.0.0.0"
PORT=9871

# 前端允许外部访问
VITE_HOST="0.0.0.0"
VITE_PORT=5173

# CORS 允许局域网 IP
CORS_ORIGINS=["http://localhost:5173","http://192.168.1.100:5173"]
```

### 示例三：生产环境配置

```bash
# 后端使用标准端口
HOST="0.0.0.0"
PORT=8000

# 前端构建后不使用开发服务器
# CORS 配置生产域名
CORS_ORIGINS=["https://yourdomain.com"]
```

---

## 验证配置

### 检查端口是否被占用

**Linux/Mac**：

```bash
# 检查后端端口
lsof -i :9871

# 检查前端端口
lsof -i :5173
```

**Windows**：

```powershell
# 检查后端端口
netstat -ano | findstr :9871

# 检查前端端口
netstat -ano | findstr :5173
```

### 测试服务是否正常

```bash
# 启动服务
pnpm dev:all

# 测试后端 API
curl http://localhost:9871/health

# 访问前端
# 浏览器打开: http://localhost:5173

# 访问 API 文档
# 浏览器打开: http://localhost:9871/docs
```

---

## 注意事项

### 配置同步

修改端口时，需要同步更新以下配置：

| 修改项      | 需要同步更新       |
| ----------- | ------------------ |
| `PORT`      | `VITE_BACKEND_URL` |
| `VITE_PORT` | `CORS_ORIGINS`     |

### 防火墙配置

生产环境部署时，确保防火墙允许配置的端口：

```bash
# Ubuntu/Debian
sudo ufw allow 9871/tcp
sudo ufw allow 5173/tcp

# CentOS/RHEL
sudo firewall-cmd --add-port=9871/tcp --permanent
sudo firewall-cmd --reload
```

### 反向代理

使用 Nginx 等反向代理时，通常配置为：

```nginx
# 前端（标准 HTTP 端口）
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5173;
    }

    location /api {
        proxy_pass http://localhost:9871;
    }
}
```

---

## 故障排查

### 问题：启动时报端口被占用

**错误信息**：

```
Error: listen EADDRINUSE: address already in use :::9871
```

**解决方案**：

1. 找到占用端口的进程：`lsof -i :9871`
2. 停止该进程或修改配置使用其他端口

### 问题：前端无法访问后端 API

**可能原因**：

1. `VITE_BACKEND_URL` 配置错误
2. CORS 配置不正确
3. 后端服务未启动

**检查步骤**：

1. 确认后端服务运行：`curl http://localhost:9871/health`
2. 检查 `.env` 中的 `VITE_BACKEND_URL`
3. 检查 `CORS_ORIGINS` 是否包含前端地址

### 问题：生产环境端口配置

生产环境通常：

- 后端：使用标准端口（80/443）或自定义端口（8000-9999）
- 前端：构建后通过 Nginx 等服务器提供静态文件
- 不需要 Vite 开发服务器

---

## 相关文档

- [配置指南](./configuration.md) - 完整配置说明
- [快速开始](./getting-started.md) - 项目启动指南
- [部署文档](./deployment.md) - 生产环境部署

---

**提示**：修改端口后，记得重启服务才能生效！
