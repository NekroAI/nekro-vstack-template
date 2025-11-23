# 数据库迁移指南

详细说明 Nekro VStack 的数据库迁移工作流程。

---

## 📋 命令概览

| 命令               | 说明             | 对应的 Aerich 命令   |
| ------------------ | ---------------- | -------------------- |
| `pnpm db:init`     | 初始化 Aerich    | `aerich init -t ...` |
| `pnpm db:init-db`  | 创建初始数据库表 | `aerich init-db`     |
| `pnpm db:generate` | 生成迁移文件     | `aerich migrate`     |
| `pnpm db:migrate`  | 应用迁移到数据库 | `aerich upgrade`     |
| `pnpm db:rollback` | 回滚上一次迁移   | `aerich downgrade`   |
| `pnpm db:history`  | 查看迁移历史     | `aerich history`     |

---

## 🔄 命名语义

### 为什么使用 `db:generate` 和 `db:migrate`？

这套命名遵循业界常见的迁移工具习惯：

**`db:generate`** - 生成迁移文件

- 对比模型变化，生成迁移脚本
- 生成的文件存储在 `migrations/` 目录
- 类似工具：Prisma 的 `prisma migrate dev`、TypeORM 的 `migration:generate`

**`db:migrate`** - 应用迁移

- 将迁移文件应用到数据库
- 更新数据库结构
- 类似工具：Django 的 `migrate`、Rails 的 `db:migrate`

**`db:rollback`** - 回滚迁移

- 撤销上一次迁移
- 恢复到之前的状态
- 更清晰的语义（相比 `downgrade`）

---

## 🚀 完整工作流

### 1. 首次初始化

```bash
# 创建数据目录
mkdir -p data

# 初始化 Aerich（配置迁移工具）
pnpm db:init

# 创建初始数据库表
pnpm db:init-db
```

**执行后**：

- 创建 `migrations/` 目录
- 生成初始迁移文件
- 创建数据库表结构

---

### 2. 修改模型后生成迁移

```bash
# 1. 编辑模型文件
# 例如：src/features/user/backend/models.py

# 2. 生成迁移文件（带描述）
pnpm db:generate --name "add_user_avatar_field"

# 3. 查看生成的迁移
ls migrations/models/

# 4. 应用到数据库
pnpm db:migrate
```

**工作流程**：

```
修改 models.py
    ↓
pnpm db:generate (检测变化)
    ↓
生成 migrations/models/xxx.py
    ↓
pnpm db:migrate (应用到数据库)
    ↓
数据库结构更新完成
```

---

### 3. 回滚迁移

```bash
# 查看当前迁移历史
pnpm db:history

# 回滚上一次迁移
pnpm db:rollback

# 如需重新应用
pnpm db:migrate
```

---

## 📝 实际示例

### 示例 1：为用户添加头像字段

**步骤 1**: 修改模型

```python
# src/features/user/backend/models.py
class User(models.Model):
    id = fields.IntField(pk=True)
    username = fields.CharField(max_length=50, unique=True)
    email = fields.CharField(max_length=100, unique=True)
    avatar = fields.CharField(max_length=500, null=True)  # ✨ 新增
    created_at = fields.DatetimeField(auto_now_add=True)
```

**步骤 2**: 生成迁移

```bash
pnpm db:generate --name "add_user_avatar"
```

输出示例：

```
Success generate migrate file migrations/models/1_20240120120000_add_user_avatar.py
```

**步骤 3**: 查看生成的迁移文件

```python
# migrations/models/1_20240120120000_add_user_avatar.py
from tortoise import BaseDBAsyncClient

async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "users" ADD "avatar" VARCHAR(500);
    """

async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "users" DROP COLUMN "avatar";
    """
```

**步骤 4**: 应用迁移

```bash
pnpm db:migrate
```

输出示例：

```
Success upgrade 1_20240120120000_add_user_avatar.py
```

**步骤 5**: 更新前端类型

```bash
pnpm generate:types
```

---

### 示例 2：创建新的 Post 模型

**步骤 1**: 创建模型文件

```python
# src/features/blog/backend/models.py
from tortoise import fields, models

class Post(models.Model):
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=200)
    content = fields.TextField()
    author_id = fields.IntField()
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "blog_posts"
```

**步骤 2**: 注册模型

```python
# src/backend/config/database.py
TORTOISE_ORM = {
    "apps": {
        "models": {
            "models": [
                "src.features.user.backend.models",
                "src.features.blog.backend.models",  # ✨ 新增
                "aerich.models",
            ],
        }
    }
}
```

**步骤 3**: 生成并应用迁移

```bash
pnpm db:generate --name "create_blog_posts"
pnpm db:migrate
pnpm generate:types
```

---

## ⚠️ 常见问题

### Q1: 迁移文件已生成但数据库没变化？

**原因**: 只生成了迁移文件，没有应用。

**解决**:

```bash
pnpm db:migrate
```

---

### Q2: 修改了模型但生成迁移提示 "No changes"？

**可能原因**:

1. 模型未注册到 `database.py`
2. 模型文件语法错误
3. 虚拟环境未激活

**解决**:

```bash
# 检查模型是否注册
cat src/backend/config/database.py

# 检查 Python 语法
uv run python -c "from src.features.user.backend.models import User"

# 重新同步环境
uv sync
```

---

### Q3: 迁移出错，如何回滚？

```bash
# 回滚上一次迁移
pnpm db:rollback

# 如果需要完全重置（开发环境）
rm -rf migrations/ data/db.sqlite3
pnpm db:init
pnpm db:init-db
```

---

### Q4: 如何删除字段或表？

**安全方式**:

1. 修改模型（删除字段）
2. 生成迁移：`pnpm db:generate --name "remove_old_field"`
3. **检查生成的迁移文件**
4. 备份数据（生产环境）
5. 应用迁移：`pnpm db:migrate`

**危险操作**（仅限开发环境）:

```bash
# 完全重置数据库
rm -rf migrations/ data/db.sqlite3
pnpm db:init
pnpm db:init-db
```

---

## 🔒 生产环境最佳实践

### 1. 版本控制

```bash
# 迁移文件必须提交到 Git
git add migrations/
git commit -m "chore: add user avatar field migration"
```

### 2. 数据备份

```bash
# 应用迁移前备份数据库
# PostgreSQL
pg_dump -U user -d dbname > backup.sql

# SQLite
cp data/db.sqlite3 data/db.sqlite3.backup
```

### 3. 测试迁移

```bash
# 在测试环境先执行
DATABASE_URL="sqlite://./test.db" pnpm db:migrate

# 验证成功后再在生产环境执行
```

### 4. 不可逆操作

对于删除字段或表的操作，考虑：

1. 先标记为废弃（`deprecated`）
2. 在后续版本中删除
3. 保留数据备份

---

## 📊 迁移历史管理

### 查看迁移历史

```bash
pnpm db:history
```

输出示例：

```
┌──────────┬───────────────────────────────┬─────────────────────┐
│ Version  │ Name                          │ Applied At          │
├──────────┼───────────────────────────────┼─────────────────────┤
│ 0        │ init                          │ 2024-01-01 10:00:00 │
│ 1        │ add_user_avatar               │ 2024-01-15 14:30:00 │
│ 2        │ create_blog_posts             │ 2024-01-20 16:45:00 │
└──────────┴───────────────────────────────┴─────────────────────┘
```

### 迁移文件命名规范

格式：`{version}_{timestamp}_{description}.py`

示例：

- `0_20240101100000_init.py`
- `1_20240115143000_add_user_avatar.py`
- `2_20240120164500_create_blog_posts.py`

---

## 🔄 与其他工具对比

| 工具             | 生成迁移                          | 应用迁移               |
| ---------------- | --------------------------------- | ---------------------- |
| **Nekro VStack** | `pnpm db:generate`                | `pnpm db:migrate`      |
| Prisma           | `prisma migrate dev`              | (自动应用)             |
| TypeORM          | `migration:generate`              | `migration:run`        |
| Django           | `makemigrations`                  | `migrate`              |
| Rails            | `rails g migration`               | `rails db:migrate`     |
| Alembic          | `alembic revision --autogenerate` | `alembic upgrade head` |

**优势**：命令简洁统一，语义清晰。

---

## 📖 相关资源

- **Aerich 官方文档**: https://github.com/tortoise/aerich
- **Tortoise-ORM 文档**: https://tortoise.github.io/
- **项目配置文档**: [configuration.md](./configuration.md)
- **命令速查表**: [commands.md](./commands.md)

---

**快速参考**:

```bash
pnpm db:generate --name "描述"    # 生成迁移
pnpm db:migrate                   # 应用迁移
pnpm db:rollback                  # 回滚迁移
pnpm db:history                   # 查看历史
```
