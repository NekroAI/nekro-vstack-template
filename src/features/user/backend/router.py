"""
认证API路由
提供登录、登出、获取用户信息等接口
"""

from fastapi import APIRouter

from src.backend.core.dependencies import CurrentUserId
from src.backend.core.exceptions import AuthenticationError, ResourceAlreadyExistsError
from src.backend.core.logger import logger
from src.backend.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
)

from .models import User
from .schemas import LoginRequest, LoginResponse, UserResponse

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest):
    """
    用户登录

    Args:
        data: 登录请求数据（用户名、密码）

    Returns:
        LoginResponse: 包含访问令牌和用户信息

    Raises:
        AuthenticationError: 用户名或密码错误
    """
    # 查询用户
    user = await User.filter(username=data.username, is_active=True).first()

    if not user:
        logger.warning(f"登录失败：用户不存在 - {data.username}")
        raise AuthenticationError("用户名或密码错误")

    # 验证密码
    if not verify_password(data.password, user.hashed_password):
        logger.warning(f"登录失败：密码错误 - {data.username}")
        raise AuthenticationError("用户名或密码错误")

    # 创建token
    token = create_access_token(data={"sub": str(user.id)})

    logger.info(f"用户登录成功: {user.username} (ID: {user.id})")

    # 返回响应
    return LoginResponse(
        access_token=token,
        user=UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            nickname=user.nickname or user.username,
            role=user.role,
        ),
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user(user_id: CurrentUserId):
    """
    获取当前用户信息

    Args:
        user_id: 当前用户ID（从JWT中解析）

    Returns:
        UserResponse: 用户信息

    Raises:
        AuthenticationError: 用户不存在或已被禁用
    """
    user = await User.filter(id=user_id, is_active=True).first()

    if not user:
        logger.warning(f"获取用户信息失败：用户不存在或已禁用 - ID: {user_id}")
        raise AuthenticationError("用户不存在或已被禁用")

    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        nickname=user.nickname or user.username,
        role=user.role,
    )


@router.post("/logout")
async def logout():
    """
    用户登出

    JWT是无状态的，客户端删除token即可
    如需黑名单机制，可以在这里实现
    """
    return {"success": True, "message": "登出成功"}


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(data: LoginRequest):
    """
    用户注册

    Args:
        data: 注册数据（用户名、密码）

    Returns:
        UserResponse: 新创建的用户信息

    Raises:
        ResourceAlreadyExistsError: 用户名已存在
    """
    # 检查用户是否已存在
    existing_user = await User.filter(username=data.username).first()
    if existing_user:
        logger.warning(f"注册失败：用户名已存在 - {data.username}")
        raise ResourceAlreadyExistsError("用户", "用户名已存在")

    # 创建用户
    hashed_password = get_password_hash(data.password)
    user = await User.create(
        username=data.username,
        hashed_password=hashed_password,
        email=f"{data.username}@example.com",  # 临时邮箱，实际项目应要求用户提供
        nickname=data.username,
        role="user",
    )

    logger.info(f"新用户注册成功: {user.username} (ID: {user.id})")

    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        nickname=user.nickname or user.username,
        role=user.role,
    )
