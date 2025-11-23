"""
应用配置管理
使用pydantic-settings管理环境变量
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置"""

    # 基础配置
    APP_NAME: str = "Nekro VStack API"
    APP_DESCRIPTION: str = "垂直切分的 AI 友好全栈开发模板"
    ENVIRONMENT: str = "development"  # development, production, test
    DEBUG: bool = False
    VERSION: str = "0.1.0"

    # 服务器配置
    HOST: str = "0.0.0.0"
    PORT: int = 9871

    # 数据库配置
    DATABASE_URL: str = "sqlite://./data/db.sqlite3"
    # PostgreSQL示例: postgresql://user:password@localhost:5432/dbname

    # 安全配置
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7天

    # 监控配置
    LOG_BUFFER_SIZE: int = 500  # 实时日志缓存条数

    # CORS配置
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore",  # 忽略额外的环境变量
    }


settings = Settings()
