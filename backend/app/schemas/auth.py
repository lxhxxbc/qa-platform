"""
认证相关的请求和响应 Schema
----------------------------
Pydantic 模型在这里用于：
1. 定义 API 的请求体格式（客户端发什么数据）
2. 定义 API 的响应体格式（服务端返回什么数据）
3. 自动验证数据类型和格式

核心概念：
- BaseModel: Pydantic 的基类，所有 Schema 都继承它
- Field: 用于添加验证规则和文档说明
- ConfigDict.from_attributes = True: 允许从 ORM 模型对象直接构建 Pydantic 对象
  例如：UserResponse.model_validate(user_orm_object)
"""
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ===== 请求 Schema（客户端 → 服务端） =====

class UserRegister(BaseModel):
    """用户注册请求体"""
    username: str = Field(
        ...,  # ... 表示必填
        min_length=3,
        max_length=50,
        description="用户名，3-50 个字符",  # 会在 Swagger 文档中展示
    )
    email: EmailStr = Field(
        ...,  # EmailStr 会自动验证邮箱格式
        description="邮箱地址",
    )
    password: str = Field(
        ...,
        min_length=6,
        max_length=100,
        description="密码，6-100 个字符",
    )


class UserLogin(BaseModel):
    """用户登录请求体"""
    # 可以用邮箱或用户名登录，这里用邮箱（简单明确）
    email: EmailStr = Field(..., description="注册邮箱")
    password: str = Field(..., description="密码")


class TokenRefresh(BaseModel):
    """刷新 Token 的请求体"""
    refresh_token: str = Field(..., description="刷新令牌")


# ===== 响应 Schema（服务端 → 客户端） =====

class TokenResponse(BaseModel):
    """登录成功后返回的 Token"""
    access_token: str = Field(..., description="访问令牌（短期有效，如30分钟）")
    refresh_token: str = Field(..., description="刷新令牌（长期有效，如7天）")
    token_type: str = Field(default="bearer", description="令牌类型")


class UserResponse(BaseModel):
    """用户信息响应（不含密码等敏感字段）"""
    id: int
    username: str
    email: str
    avatar_url: str | None = None
    reputation: int
    created_at: datetime

    # model_config 是 Pydantic v2 的配置方式
    # from_attributes=True 替代了 v1 的 orm_mode=True
    # 作用：允许 Pydantic 从 ORM 对象（如 SQLAlchemy 模型）的属性直接读取值
    model_config = {"from_attributes": True}
