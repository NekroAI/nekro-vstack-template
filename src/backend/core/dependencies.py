"""
FastAPI依赖注入
提供全局依赖函数
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.backend.core.security import decode_access_token

security = HTTPBearer()


async def get_current_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
) -> int:
    """
    获取当前用户ID（从JWT令牌中解析）

    这是一个简化版本，实际项目中应该：
    1. 验证令牌有效性
    2. 从数据库查询用户信息
    3. 检查用户状态（是否禁用等）
    """
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭证",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的令牌",
        )

    return int(user_id)


# 类型别名，方便使用
CurrentUserId = Annotated[int, Depends(get_current_user_id)]
