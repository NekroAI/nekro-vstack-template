"""
统一异常处理
定义标准的API错误响应格式
"""

from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse

from src.backend.core.logger import logger


class APIError(HTTPException):
    """
    API统一错误基类
    所有业务错误都应继承此类
    """

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: dict | None = None,
    ):
        super().__init__(
            status_code=status_code,
            detail={
                "success": False,
                "code": code,
                "message": message,
                "details": details or {},
            },
        )


# 认证相关异常
class AuthenticationError(APIError):
    """认证失败"""

    def __init__(self, message: str = "认证失败"):
        super().__init__(
            code="AUTH_FAILED",
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class InvalidTokenError(AuthenticationError):
    """无效的令牌"""

    def __init__(self, message: str = "无效的令牌"):
        super().__init__(message=message)


class TokenExpiredError(AuthenticationError):
    """令牌已过期"""

    def __init__(self, message: str = "令牌已过期"):
        super().__init__(message=message)


class PermissionDeniedError(APIError):
    """权限不足"""

    def __init__(self, message: str = "权限不足"):
        super().__init__(
            code="PERMISSION_DENIED",
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
        )


# 资源相关异常
class ResourceNotFoundError(APIError):
    """资源未找到"""

    def __init__(self, resource: str = "资源", message: str | None = None):
        super().__init__(
            code="RESOURCE_NOT_FOUND",
            message=message or f"{resource}未找到",
            status_code=status.HTTP_404_NOT_FOUND,
        )


class ResourceAlreadyExistsError(APIError):
    """资源已存在"""

    def __init__(self, resource: str = "资源", message: str | None = None):
        super().__init__(
            code="RESOURCE_ALREADY_EXISTS",
            message=message or f"{resource}已存在",
            status_code=status.HTTP_409_CONFLICT,
        )


# 数据验证异常
class ValidationError(APIError):
    """数据验证失败"""

    def __init__(self, message: str = "数据验证失败", details: dict | None = None):
        super().__init__(
            code="VALIDATION_ERROR",
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details,
        )


# 业务逻辑异常
class BusinessError(APIError):
    """业务逻辑错误"""

    def __init__(self, code: str, message: str, details: dict | None = None):
        super().__init__(
            code=code,
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details,
        )


# 全局异常处理器（在 main.py 中注册）
async def validation_exception_handler(
    _request: Request,
    exc: Exception,
) -> JSONResponse:
    """
    Pydantic验证错误处理器
    """
    logger.error(f"验证错误: {exc!r}")

    # 获取错误详情
    if hasattr(exc, "errors") and callable(exc.errors):  # type: ignore
        error_details = exc.errors()  # type: ignore
    else:
        error_details = [str(exc)]

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "code": "VALIDATION_ERROR",
            "message": "请求数据验证失败",
            "details": {"errors": error_details},
        },
    )


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    全局异常处理器
    捕获所有未处理的异常
    """
    # 记录异常日志
    logger.exception(f"未处理的异常: {type(exc).__name__!r}: {exc!r}")

    # 生产环境不暴露详细错误信息
    details: dict = {}
    if hasattr(request.app.state, "settings") and request.app.state.settings.DEBUG:
        details = {"error": str(exc), "type": type(exc).__name__}

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "code": "INTERNAL_ERROR",
            "message": "服务器内部错误",
            "details": details,
        },
    )
