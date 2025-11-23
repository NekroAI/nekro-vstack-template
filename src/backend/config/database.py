"""
数据库配置（Tortoise-ORM）
"""

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


async def init_db():
    """
    初始化数据库连接
    在应用启动时调用
    """
    await Tortoise.init(config=TORTOISE_ORM)
    # 开发环境自动生成表（生产环境使用迁移）
    if settings.ENVIRONMENT == "development":
        await Tortoise.generate_schemas()


async def close_db():
    """
    关闭数据库连接
    在应用关闭时调用
    """
    await Tortoise.close_connections()
