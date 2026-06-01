"""回答相关的请求和响应 Schema"""
from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.auth import UserResponse


# ===== 请求 =====

class AnswerCreate(BaseModel):
    """提交回答请求"""
    body: str = Field(..., min_length=1, description="回答正文（Markdown）")


class AnswerUpdate(BaseModel):
    """编辑回答请求"""
    body: str = Field(..., min_length=1)


class VoteCreate(BaseModel):
    """投票请求"""
    value: int = Field(
        ...,  # 必填
        ge=-1,  # 大于等于 -1
        le=1,   # 小于等于 1
        description="投票值：1 赞成，-1 反对",
    )


# ===== 响应 =====

class AnswerResponse(BaseModel):
    """回答响应体"""
    id: int
    body: str
    question_id: int
    author: UserResponse
    is_accepted: bool
    vote_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
