"""
认证中间件
----------
提供 FastAPI 的 Depends 函数，用于保护需要登录的路由。
在路由中使用：current_user: User = Depends(get_current_user)
如果用户未登录或 Token 无效，自动返回 401 错误。
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.services.auth import decode_token

# ---- HTTPBearer 安全方案 ----
# bearer_scheme 定义认证方式为 Bearer Token
# 客户端在请求头中发送：Authorization: Bearer eyJhbGci...
# auto_error=True（默认）：没有 Bearer Token 时自动返回 403
bearer_scheme = HTTPBearer()


async def get_current_user(
    # Depends 是 FastAPI 的依赖注入机制
    # credentials: 从请求头提取的 Bearer Token
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    从请求的 Bearer Token 中提取当前登录用户。

    工作流程：
    1. FastAPI 从请求头提取 Bearer Token
    2. 解码 Token 获取 user_id
    3. 从数据库查询用户
    4. 返回 User 对象（注入到路由参数中）

    如果任何步骤失败，返回 401 Unauthorized。
    """
    token = credentials.credentials  # 提取 Token 字符串

    # 第一步：解码 Token
    try:
        payload = decode_token(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token 无效或已过期，请重新登录",
        )

    # 第二步：确认 Token 类型是 access（不是 refresh）
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="请使用 Access Token，而不是 Refresh Token",
        )

    # 第三步：提取用户 ID
    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token 中不包含用户信息",
        )

    # 第四步：从数据库查询用户
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在或已被删除",
        )

    return user
