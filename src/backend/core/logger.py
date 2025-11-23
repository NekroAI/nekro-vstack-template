"""
日志配置（Loguru）
统一的日志管理
"""

import sys
from pathlib import Path

from loguru import logger

from src.backend.config.settings import settings
from src.backend.core.sse import log_stream_manager

# 移除默认的 handler
logger.remove()

# 控制台输出配置
logger.add(
    sys.stdout,
    colorize=True,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="DEBUG" if settings.DEBUG else "INFO",
)

# SSE 流式日志 (JSON 格式)
logger.add(
    log_stream_manager.emit,
    serialize=True,
    level="DEBUG" if settings.DEBUG else "INFO",
    # 避免循环调用
    filter=lambda record: "sse" not in str(record["name"]),
)

# 文件日志配置
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

# 普通日志
logger.add(
    log_dir / "app.log",
    rotation="500 MB",
    retention="10 days",
    compression="zip",
    level="INFO",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
)

# 错误日志
logger.add(
    log_dir / "error.log",
    rotation="500 MB",
    retention="30 days",
    compression="zip",
    level="ERROR",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
    backtrace=True,
    diagnose=True,
)


def get_logger(name: str = __name__):
    """
    获取logger实例

    Args:
        name: logger名称，通常传入 __name__

    Returns:
        logger实例
    """
    return logger.bind(name=name)
