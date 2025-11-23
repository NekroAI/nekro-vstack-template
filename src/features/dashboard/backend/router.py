"""
仪表盘API路由
提供统计信息等接口
"""

import platform
from datetime import datetime
from pathlib import Path

import psutil
from fastapi import APIRouter, Request
from tortoise import Tortoise

from src.backend.core.dependencies import CurrentUserId

from .schemas import AppOverviewResponse, SystemInfoResponse, SystemResource

router = APIRouter()


def get_size_str(bytes_value: int) -> str:
    """将字节转换为可读字符串"""
    num = float(bytes_value)
    for unit in ["B", "KB", "MB", "GB", "TB"]:
        if num < 1024:
            return f"{num:.1f} {unit}"
        num /= 1024
    return f"{num:.1f} PB"


@router.get("/overview", response_model=AppOverviewResponse)
async def get_app_overview(_user_id: CurrentUserId, request: Request):
    """
    获取应用概览信息 (真实元数据)
    """
    # 1. 获取 API 路由数量
    # 过滤掉 OPTIONS 请求和自动生成的文档路由
    routes = [
        r
        for r in request.app.routes
        if getattr(r, "methods", None) and "OPTIONS" not in r.methods
    ]
    api_count = len(routes)

    # 2. 获取 Features 数量
    features_dir = Path("src/features")
    feature_count = 0
    if features_dir.exists():
        feature_count = len(
            [
                d
                for d in features_dir.iterdir()
                if d.is_dir() and not d.name.startswith("__")
            ],
        )

    # 3. 检查数据库连接
    try:
        conn = Tortoise.get_connection("default")
        await conn.execute_query("SELECT 1")
        db_status = "Connected"
    except Exception:
        db_status = "Disconnected"

    # 4. 环境
    # 简单判断 debug 模式
    env = "Development"  # 可以从配置中读取，这里作为模板默认显示 Dev

    return AppOverviewResponse(
        api_count=api_count,
        feature_count=feature_count,
        db_status=db_status,
        environment=env,
    )


@router.get("/system", response_model=SystemInfoResponse)
async def get_system_info(_user_id: CurrentUserId):
    """
    获取系统状态信息 (真实数据)
    """
    # CPU
    cpu_percent = psutil.cpu_percent(interval=None)
    cpu_count = psutil.cpu_count(logical=True)
    cpu_freq = psutil.cpu_freq()
    cpu_freq_current = f"{cpu_freq.current / 1000:.1f} GHz" if cpu_freq else "N/A"

    # Memory
    vm = psutil.virtual_memory()

    # Disk
    disk = psutil.disk_usage("/")

    # Uptime
    boot_time_timestamp = psutil.boot_time()
    boot_time = datetime.fromtimestamp(boot_time_timestamp)
    uptime_delta = datetime.now() - boot_time
    uptime_seconds = uptime_delta.total_seconds()

    days = uptime_delta.days
    hours, remainder = divmod(uptime_delta.seconds, 3600)
    minutes, _ = divmod(remainder, 60)

    uptime_str = (
        f"{days}天 {hours}小时 {minutes}分钟"
        if days > 0
        else f"{hours}小时 {minutes}分钟"
    )

    return SystemInfoResponse(
        cpu=SystemResource(
            name=platform.processor() or "Generic CPU",
            usage=cpu_percent,
            total=f"{cpu_count} Cores",
            used=cpu_freq_current,
        ),
        memory=SystemResource(
            name="System Memory",
            usage=vm.percent,
            total=get_size_str(vm.total),
            used=get_size_str(vm.used),
        ),
        disk=SystemResource(
            name="Root Partition",
            usage=disk.percent,
            total=get_size_str(disk.total),
            used=get_size_str(disk.used),
        ),
        uptime=uptime_str,
        uptime_seconds=uptime_seconds,
        version="v1.0.0",
        os=f"{platform.system()} {platform.release()}",
    )
