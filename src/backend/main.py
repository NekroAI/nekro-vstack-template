"""
FastAPI应用入口
"""

import asyncio
import json
import signal
from contextlib import asynccontextmanager, suppress
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from src.backend.config.database import close_db, init_db
from src.backend.config.settings import settings
from src.backend.core.exceptions import (
    APIError,
    global_exception_handler,
    validation_exception_handler,
)
from src.backend.core.logger import logger
from src.backend.core.sse import log_stream_manager
from src.features.dashboard.backend.router import router as dashboard_router
from src.features.monitor.backend.router import router as monitor_router
from src.features.user.backend.router import router as auth_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """应用生命周期管理"""
    # 设置 LogStreamManager 的事件循环
    loop = asyncio.get_running_loop()
    log_stream_manager.set_loop(loop)

    # Hack: 注册信号处理器以在 Uvicorn 重载/退出时强制关闭 SSE 连接
    # Uvicorn 在 reload 时会发送 SIGINT 或 SIGTERM 信号。
    # 默认情况下 Uvicorn 会等待所有连接关闭，而 SSE 是长连接，导致 reload 卡死。
    # 我们需要拦截信号，主动断开 SSE 连接。
    original_sigint = signal.getsignal(signal.SIGINT)
    original_sigterm = signal.getsignal(signal.SIGTERM)

    def force_shutdown_sse(signum, frame):
        # 在信号处理器中，我们不能直接 await，但可以调度任务到 loop
        # 使用 call_soon_threadsafe 确保线程安全
        if loop.is_running():
            loop.call_soon_threadsafe(
                lambda: asyncio.create_task(log_stream_manager.shutdown())
            )

        # 调用原始处理器（如果有）以确保 Uvicorn 也能收到信号
        if signum == signal.SIGINT and callable(original_sigint):
            original_sigint(signum, frame)
        elif signum == signal.SIGTERM and callable(original_sigterm):
            original_sigterm(signum, frame)

    # 使用 signal.signal 替换处理器，这样可以确保覆盖 Uvicorn 可能的设置
    # (注意：如果 Uvicorn 使用 loop.add_signal_handler，这可能需要在 loop 层面处理，但 signal.signal 是底层的)
    try:
        signal.signal(signal.SIGINT, force_shutdown_sse)
        signal.signal(signal.SIGTERM, force_shutdown_sse)
    except ValueError:
        # 如果不是在主线程运行，signal.signal 会抛出 ValueError
        pass

    logger.info(f"🚀 启动 {settings.APP_NAME}...")

    # 生成 OpenAPI 规范（开发模式）
    if settings.ENVIRONMENT == "development":
        from src.backend.core.openapi import generate_openapi_json

        generate_openapi_json(_app)

    # 初始化数据库
    await init_db()
    logger.info("✅ 数据库连接成功")

    # 创建默认管理员用户（仅在首次启动时）
    from src.backend.core.security import get_password_hash
    from src.features.user.backend.models import User

    admin_user = await User.filter(username="admin").first()
    if not admin_user:
        await User.create(
            username="admin",
            hashed_password=get_password_hash("admin"),
            email="admin@example.com",
            nickname="Administrator",
            role="admin",
        )
        logger.info("✅ 创建默认管理员账号: admin/admin")

    yield

    # 清理资源
    logger.info(f"👋 关闭 {settings.APP_NAME}...")
    await log_stream_manager.shutdown()  # 关闭 SSE 连接
    await close_db()
    logger.info("✅ 数据库连接已关闭")


app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.VERSION,
    lifespan=lifespan,
)

# 保存settings到app.state，供异常处理器使用
app.state.settings = settings

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 异常处理器
async def api_error_handler(_request: Request, exc: APIError):
    """APIError异常处理器"""
    from fastapi.responses import JSONResponse

    return JSONResponse(
        status_code=exc.status_code,
        content=exc.detail,
    )


# 注册异常处理器
app.add_exception_handler(APIError, api_error_handler)  # type: ignore
app.add_exception_handler(RequestValidationError, validation_exception_handler)  # type: ignore
app.add_exception_handler(Exception, global_exception_handler)  # type: ignore

# 注册路由（按功能模块组织）
app.include_router(auth_router, prefix="/api/auth", tags=["认证"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["仪表盘"])
app.include_router(monitor_router, prefix="/api/monitor", tags=["系统监控"])


@app.get("/")
async def root():
    """根路径"""
    return {
        "message": settings.APP_NAME,
        "version": settings.VERSION,
        "description": settings.APP_DESCRIPTION,
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "version": settings.VERSION}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "src.backend.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )
