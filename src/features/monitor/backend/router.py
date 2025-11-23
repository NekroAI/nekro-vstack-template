"""
监控模块 API 路由
提供实时日志流等
"""

from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse

from src.backend.core.dependencies import CurrentUserId
from src.backend.core.sse import log_stream_manager

router = APIRouter()


@router.get("/logs/live")
async def live_logs(request: Request, _user: CurrentUserId):
    """
    获取实时日志流 (SSE)
    需要鉴权
    """
    return EventSourceResponse(log_stream_manager.stream())
