"""回答和投票相关 API 路由"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.answer import Answer
from app.models.question import Question
from app.models.user import User
from app.schemas.answer import AnswerCreate, AnswerResponse, AnswerUpdate, VoteCreate
from app.services.answer import (
    accept_answer,
    create_answer,
    delete_answer,
    get_answer,
    update_answer,
    vote_target,
)

router = APIRouter(tags=["回答与投票"])


# ---- 回答 ----

@router.post(
    "/api/questions/{question_id}/answers",
    response_model=AnswerResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_answer_route(
    question_id: int,
    body: AnswerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """提交回答"""
    answer = await create_answer(db, question_id, body.body, current_user.id)
    return AnswerResponse.model_validate(answer)


@router.put("/api/answers/{answer_id}", response_model=AnswerResponse)
async def update_answer_route(
    answer_id: int,
    body: AnswerUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """编辑回答"""
    answer = await get_answer(db, answer_id)
    if not answer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="回答不存在")
    if answer.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="只能编辑自己的回答")
    answer = await update_answer(db, answer, body.body)
    return AnswerResponse.model_validate(answer)


@router.delete("/api/answers/{answer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_answer_route(
    answer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """删除回答"""
    answer = await get_answer(db, answer_id)
    if not answer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="回答不存在")
    if answer.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="只能删除自己的回答")
    await delete_answer(db, answer)


# ---- 采纳 ----

@router.post("/api/answers/{answer_id}/accept", response_model=AnswerResponse)
async def accept_answer_route(
    answer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """采纳回答为最佳答案（仅提问者可以操作）"""
    answer = await get_answer(db, answer_id)
    if not answer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="回答不存在")

    # 加载问题
    question = await db.get(Question, answer.question_id)
    if question.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="只有提问者可以采纳回答")

    answer = await accept_answer(db, answer, question)
    return AnswerResponse.model_validate(answer)


# ---- 投票 ----

@router.post("/api/answers/{answer_id}/vote")
async def vote_answer(
    answer_id: int,
    body: VoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """对回答投票"""
    result = await vote_target(db, current_user.id, "answer", answer_id, body.value)
    if result is None:
        return {"message": "已取消投票"}
    return {"message": "投票成功", "value": result.value}


@router.post("/api/questions/{question_id}/vote")
async def vote_question(
    question_id: int,
    body: VoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """对问题投票"""
    result = await vote_target(db, current_user.id, "question", question_id, body.value)
    if result is None:
        return {"message": "已取消投票"}
    return {"message": "投票成功", "value": result.value}
