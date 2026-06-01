"""
认证相关 API 路由
-----------------
提供用户注册、登录、Token 刷新、个人信息查询。
所有路由前缀为 /api/auth。
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.auth import (
    TokenRefresh,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)
from app.services.auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)

# APIRouter 用于组织路由，prefix 给这个模块所有路由加前缀
router = APIRouter(prefix="/api/auth", tags=["认证"])


# ---- 注册 ----
# response_model: FastAPI 自动将返回值转换为 UserResponse 格式
# status_code: 201 Created（资源创建成功）
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    body: UserRegister,  # FastAPI 自动根据 Pydantic Schema 验证请求体
    db: AsyncSession = Depends(get_db),
):
    """用户注册：创建新账号"""
    # 检查用户名是否已存在
    result = await db.execute(select(User).where(User.username == body.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="用户名已被注册",
        )

    # 检查邮箱是否已存在
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="邮箱已被注册",
        )

    # 创建用户
    user = User(
        username=body.username,
        email=body.email,
        password_hash=hash_password(body.password),  # 密码加密存储！
    )
    db.add(user)       # add: 标记为"待插入"
    await db.commit()  # commit: 真正写入数据库
    await db.refresh(user)  # refresh: 从数据库读取最新值（获取 id、created_at 等）

    return user


# ---- 登录 ----
@router.post("/login", response_model=TokenResponse)
async def login(
    body: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    """用户登录：验证邮箱和密码，返回 JWT Token"""
    # 查找用户
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    # 用户不存在 或 密码错误 → 统一返回"邮箱或密码错误"（安全考虑，不透露具体原因）
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码错误",
        )

    # 生成 Token 对
    token_data = {"sub": str(user.id)}  # sub 是 JWT 标准字段，代表"主体"（Subject）
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )


# ---- Token 刷新 ----
@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    body: TokenRefresh,
    db: AsyncSession = Depends(get_db),
):
    """
    使用 Refresh Token 换取新的 Access Token。

    为什么需要？
    - Access Token 有效期短（30分钟），降低泄露风险
    - Refresh Token 有效期长（7天），避免频繁登录
    - Access Token 过期后，前端自动用 Refresh Token 换一个新的
    """
    # 解码 Refresh Token
    try:
        payload = decode_token(body.refresh_token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh Token 无效或已过期",
        )

    # 确认是 refresh 类型
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="请使用 Refresh Token",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token 无效")

    # 确认用户仍存在
    result = await db.execute(select(User).where(User.id == int(user_id)))
    if not result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在",
        )

    # 生成新的 Token 对
    token_data = {"sub": user_id}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )


# ---- 获取当前用户信息 ----
@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),  # 需要登录
):
    """获取当前登录用户的个人信息"""
    return current_user
