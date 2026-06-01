"""
认证服务模块
-------------
包含密码哈希（bcrypt）和 JWT 令牌的生成与验证。
密码哈希是不可逆的 — 存入数据库的是哈希值，原始密码无法被还原。
JWT（JSON Web Token）是无状态的 — 服务端不需要存 session，Token 自带用户信息。
"""
from datetime import datetime, timedelta, timezone

import bcrypt  # 直接使用 bcrypt 库进行密码哈希
from jose import JWTError, jwt  # JWT 编码/解码库

from app.config import settings


def hash_password(password: str) -> str:
    """
    对明文密码进行 bcrypt 哈希加密。

    bcrypt 哈希的特点：
    - 相同的密码每次哈希结果不同（因为嵌入随机盐值 salt）
    - 不可逆 — 无法从哈希值还原出原始密码
    - 验证时用 verify_password(明文, 哈希值) 对比
    """
    # bcrypt.hashpw 需要 bytes，返回 bytes
    # gensalt() 生成随机盐值
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    验证明文密码是否与哈希值匹配。
    返回 True 表示密码正确，False 表示密码错误。
    """
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


# ---- JWT 令牌 ----

def create_access_token(data: dict) -> str:
    """
    生成访问令牌（Access Token）。

    Access Token 用于验证用户身份，有效期短（默认30分钟）。
    需要嵌入在 HTTP 请求头中：Authorization: Bearer <token>

    参数:
        data: 要编码进 Token 的数据字典，通常包含 {"sub": user_id}
    """
    to_encode = data.copy()
    # 设置过期时间
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    to_encode.update({"exp": expire, "type": "access"})  # type 区分 token 类型
    # 用 SECRET_KEY 签名生成 Token
    return jwt.encode(to_encode, settings.secret_key, algorithm="HS256")


def create_refresh_token(data: dict) -> str:
    """
    生成刷新令牌（Refresh Token）。

    Refresh Token 用于在 Access Token 过期后获取新的 Access Token，
    不需要用户重新登录。有效期更长（默认7天）。
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)  # 7天有效
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.secret_key, algorithm="HS256")


def decode_token(token: str) -> dict:
    """
    解码并验证 JWT Token。
    如果 Token 无效或过期，抛出 JWTError 异常。
    返回 Token 中编码的原始数据字典。
    """
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        return payload
    except JWTError as e:
        # Token 过期、签名错误、格式错误都会抛出 JWTError
        raise JWTError(f"Token 解析失败: {e}")
