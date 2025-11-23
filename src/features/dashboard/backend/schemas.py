"""
仪表盘相关的Pydantic模型
定义请求和响应的数据结构
"""

from pydantic import BaseModel


class AppOverviewResponse(BaseModel):
    """应用概览信息响应"""

    api_count: int
    feature_count: int
    db_status: str  # "Connected" | "Disconnected"
    environment: str


class SystemResource(BaseModel):
    """系统资源使用情况"""

    name: str
    usage: float  # 百分比 0-100
    total: str
    used: str


class SystemInfoResponse(BaseModel):
    """系统信息响应"""

    cpu: SystemResource
    memory: SystemResource
    disk: SystemResource
    uptime: str
    uptime_seconds: float  # 新增：秒数，方便前端格式化
    version: str
    os: str
