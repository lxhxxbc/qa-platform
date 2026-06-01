"""
问题相关 API 路由
-----------------
提供问题的 CRUD：列表、详情、创建、编辑、删除。
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.question import Question
from app.models.user import User
from app.schemas.question import QuestionCreate, QuestionDetail, QuestionListResponse, QuestionUpdate
from app.services.question import (
    create_question,
    delete_question,
    get_question_detail,
    get_questions,
    update_question,
)

router = APIRouter(prefix="/api/questions", tags=["问题"])


@router.get("", response_model=QuestionListResponse)
async def list_questions(
    page: int = Query(1, ge=1, description="页码"),  # Query 定义 URL 查询参数
    size: int = Query(10, ge=1, le=50, description="每页数量（最大50）"),
    q: str | None = Query(None, description="搜索关键词"),
    tag: str | None = Query(None, description="按标签筛选"),
    db: AsyncSession = Depends(get_db),
):
    """获取问题列表 — 支持分页、搜索、标签筛选"""
    return await get_questions(db, page=page, size=size, q=q, tag=tag)


@router.get("/{question_id}", response_model=QuestionDetail)
async def get_question(
    question_id: int,
    db: AsyncSession = Depends(get_db),
):
    """获取问题详情"""
    question = await get_question_detail(db, question_id)
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="问题不存在")

    # 增加浏览量
    question.view_count += 1
    await db.commit()

    return question


@router.post("", response_model=QuestionDetail, status_code=status.HTTP_201_CREATED)
async def create_question_route(
    body: QuestionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),  # 需要登录
):
    """发布新问题"""
    return await create_question(db, body, current_user.id)


@router.put("/{question_id}", response_model=QuestionDetail)
async def update_question_route(
    question_id: int,
    body: QuestionUpdate,  # 所有字段都是可选的（None 表示不修改）
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """编辑问题"""
    question = await get_question_detail(db, question_id)
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="问题不存在")
    # 权限检查：只有作者能编辑
    if question.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="只能编辑自己的问题")
    return await update_question(db, question, body.model_dump(exclude_unset=True))


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question_route(
    question_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """删除问题 — 返回 204 No Content（无响应体）"""
    question = await get_question_detail(db, question_id)
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="问题不存在")
    if question.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="只能删除自己的问题")
    await delete_question(db, question)
    return None  # 204 状态码时 FastAPI 不返回响应体
