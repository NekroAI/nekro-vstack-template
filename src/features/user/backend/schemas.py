"""
认证相关的Pydantic模型
定义请求和响应的数据结构
"""
from pydantic import BaseModel


class LoginRequest(BaseModel):
    """登录请求"""

    username: str
    password: str


class UserResponse(BaseModel):
    """用户响应"""

    id: int
    username: str
    email: str | None = None
    nickname: str | None = None
    role: str = "user"

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    """登录响应"""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse

