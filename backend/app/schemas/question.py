"""问题相关的请求和响应 Schema"""
from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.auth import UserResponse


# ===== 请求 =====

class QuestionCreate(BaseModel):
    """发布问题请求"""
    title: str = Field(..., min_length=5, max_length=200, description="问题标题")
    body: str = Field(..., min_length=20, description="问题正文（Markdown）")
    tag_names: list[str] = Field(
        default_factory=list,  # 默认空列表
        max_length=5,  # 最多5个标签
        description="标签名称列表",
    )


class QuestionUpdate(BaseModel):
    """编辑问题请求"""
    title: str | None = Field(None, min_length=5, max_length=200)
    body: str | None = Field(None, min_length=20)


# ===== 响应 =====

class TagResponse(BaseModel):
    """标签信息"""
    id: int
    name: str
    description: str | None = None

    model_config = {"from_attributes": True}


class QuestionBrief(BaseModel):
    """问题摘要（用于列表展示，不含完整正文）"""
    id: int
    title: str
    # body[:200] 截取前200字作为摘要
    body_preview: str
    author: UserResponse
    tags: list[TagResponse]
    vote_count: int
    answer_count: int
    view_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class QuestionDetail(BaseModel):
    """问题详情（含完整正文和所有回答）"""
    id: int
    title: str
    body: str
    author: UserResponse
    tags: list[TagResponse]
    vote_count: int
    view_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class QuestionListResponse(BaseModel):
    """分页问题列表响应"""
    items: list[QuestionBrief]  # 当前页的问题列表
    total: int  # 总问题数
    page: int  # 当前页码
    size: int  # 每页数量
    pages: int  # 总页数
