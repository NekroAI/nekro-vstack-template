"""
数据库配置（Tortoise-ORM）
"""

import contextlib
import sys
from pathlib import Path

from aerich import Command
from loguru import logger
from tortoise import Tortoise

from .settings import settings

# Tortoise-ORM配置
TORTOISE_ORM = {
    "connections": {"default": settings.DATABASE_URL},
    "apps": {
        "models": {
            "models": [
                "src.features.user.backend.models",
                # 在此添加其他功能模块的models
                "aerich.models",  # Aerich迁移管理
            ],
            "default_connection": "default",
        },
    },
}


async def run_migrations():
    """
    运行 Aerich 数据库迁移
    仅在 Windows 桌面应用环境 (frozen) 且使用 SQLite 时调用

    注意：此函数失败会抛出异常，阻止应用启动。
    严禁在此处掩盖错误或进行降级处理。
    """
    # 1. 确定 migrations 目录位置
    if getattr(sys, "frozen", False):
        # 打包环境: 尝试多个可能的位置
        # PyInstaller onedir 模式下，datas 可能在 root 或 _internal
        base_dir = Path(sys.executable).parent
        possible_paths = [
            base_dir / "migrations",
            base_dir / "_internal" / "migrations",
        ]
        migrations_dir = next((p for p in possible_paths if p.exists()), None)
    else:
        # 开发环境: 项目根目录/migrations
        migrations_dir = Path("migrations")

    # 严禁掩盖问题：如果生产环境找不到迁移文件，必须报错
    if not migrations_dir:
        error_msg = f"❌ CRITICAL: Migrations directory NOT found. Searched in: {possible_paths}"
        logger.critical(error_msg)
        raise RuntimeError(error_msg)

    logger.info(f"🔄 Running migrations from {migrations_dir}...")

    try:
        # 2. 初始化 Aerich Command
        command = Command(tortoise_config=TORTOISE_ORM, location=str(migrations_dir))

        # 3. 初始化数据库连接 (Aerich 需要)
        await command.init()

        # 4. 尝试初始化 aerich 表 (如果不存在)
        # safe=True 保证如果表已存在不报错
        # 注意：在某些版本 aerich 中，init_db 即使 safe=True 也会尝试创建迁移文件而报错
        # 我们这里只需要确保 aerich 表存在即可
        with contextlib.suppress(FileExistsError):
            await command.init_db(safe=True)

        # 5. 执行升级
        # run_in_transaction=True 保证原子性
        await command.upgrade(run_in_transaction=True)

        logger.success("✅ Database migrations applied successfully.")

    except Exception as e:
        # 严禁掩盖问题：迁移失败必须抛出异常
        logger.critical(f"❌ Database migration FAILED: {e}")
        raise


async def init_db():
    """
    初始化数据库连接
    在应用启动时调用
    """
    await Tortoise.init(config=TORTOISE_ORM)

    # 策略：
    # 1. 开发环境：总是尝试生成表结构 (快速开发)
    # 2. 生产环境且使用 SQLite（桌面版场景）：必须且只能使用 Aerich 迁移系统
    # 3. 生产环境且使用服务器数据库：应手动使用 Aerich 迁移工具

    is_sqlite = settings.DATABASE_URL.startswith("sqlite://")
    is_frozen = getattr(sys, "frozen", False)

    if settings.ENVIRONMENT == "development" and not is_frozen:
        # 开发环境：自动建表 (如果不使用 aerich)
        # safe=True: 如果表已存在则忽略
        logger.info("🔧 Development mode: Generating schemas...")
        await Tortoise.generate_schemas(safe=True)

    elif is_sqlite and is_frozen:
        # 桌面版生产环境：自动迁移
        # 如果失败，直接崩溃，绝不使用 generate_schemas 兜底
        await run_migrations()


async def close_db():
    """
    关闭数据库连接
    在应用关闭时调用
    """
    await Tortoise.close_connections()
