"""回答和投票业务逻辑"""
from fastapi import HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.answer import Answer
from app.models.question import Question
from app.models.vote import Vote


async def create_answer(
    db: AsyncSession,
    question_id: int,
    body: str,
    author_id: int,
) -> Answer:
    """为指定问题创建回答"""
    # 检查问题是否存在
    question = await db.get(Question, question_id)
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="问题不存在")

    answer = Answer(
        body=body,
        question_id=question_id,
        author_id=author_id,
    )
    db.add(answer)
    await db.commit()
    await db.refresh(answer)

    # 重新查询以加载关联数据（author）
    result = await db.execute(
        select(Answer)
        .options(selectinload(Answer.author), selectinload(Answer.question))
        .where(Answer.id == answer.id)
    )
    return result.scalar_one()


async def get_answer(db: AsyncSession, answer_id: int) -> Answer | None:
    """获取单个回答"""
    result = await db.execute(
        select(Answer)
        .options(selectinload(Answer.author))
        .where(Answer.id == answer_id)
    )
    return result.scalar_one_or_none()


async def update_answer(db: AsyncSession, answer: Answer, body: str) -> Answer:
    """编辑回答"""
    answer.body = body
    await db.commit()
    await db.refresh(answer)
    return answer


async def delete_answer(db: AsyncSession, answer: Answer) -> None:
    """删除回答"""
    await db.delete(answer)
    await db.commit()


async def accept_answer(db: AsyncSession, answer: Answer, question: Question) -> Answer:
    """采纳回答为最佳答案（只能采纳一个）"""
    # 取消之前采纳的回答（如果有的话）
    result = await db.execute(
        select(Answer).where(
            and_(Answer.question_id == question.id, Answer.is_accepted == True)
        )
    )
    previous_accepted = result.scalar_one_or_none()
    if previous_accepted:
        previous_accepted.is_accepted = False

    answer.is_accepted = True
    await db.commit()
    await db.refresh(answer)
    return answer


async def vote_target(
    db: AsyncSession,
    user_id: int,
    target_type: str,
    target_id: int,
    value: int,
) -> Vote | None:
    """
    对目标（问题或回答）投票。

    逻辑：
    - 如果用户已投过相同票，取消投票（toggle）
    - 如果用户已投不同票，更新（从赞成改为反对，反之亦然）
    - 如果未投过，创建新投票
    """
    # 获取目标记录
    if target_type == "question":
        target = await db.get(Question, target_id)
    else:
        target = await db.get(Answer, target_id)

    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{target_type} 不存在")

    # 查找已有投票记录
    result = await db.execute(
        select(Vote).where(
            and_(
                Vote.user_id == user_id,
                Vote.target_type == target_type,
                Vote.target_id == target_id,
            )
        )
    )
    existing_vote = result.scalar_one_or_none()

    if existing_vote:
        if existing_vote.value == value:
            # 相同投票 → 取消投票
            target.vote_count -= value  # 撤销之前的票
            await db.delete(existing_vote)
            await db.commit()
            return None  # 返回 None 表示已取消
        else:
            # 不同方向 → 更新投票
            target.vote_count -= existing_vote.value  # 先撤销旧票
            target.vote_count += value               # 再加新票
            existing_vote.value = value
            await db.commit()
            return existing_vote
    else:
        # 新投票
        vote = Vote(
            user_id=user_id,
            target_type=target_type,
            target_id=target_id,
            value=value,
        )
        target.vote_count += value
        db.add(vote)
        await db.commit()
        await db.refresh(vote)
        return vote
