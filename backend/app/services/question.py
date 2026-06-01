"""问题业务逻辑"""
import math

from sqlalchemy import func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from app.models.answer import Answer
from app.models.question import Question
from app.models.tag import Tag
from app.schemas.question import QuestionCreate
from app.schemas.question import QuestionListResponse, QuestionBrief


async def get_questions(
    db: AsyncSession,
    page: int = 1,
    size: int = 10,
    q: str | None = None,
    tag: str | None = None,
) -> QuestionListResponse:
    """
    获取问题列表，支持分页、关键词搜索、标签筛选。

    参数:
        page: 页码（从1开始）
        size: 每页数量
        q: 搜索关键词（匹配标题）
        tag: 按标签名筛选
    """
    # ---- 构建查询 ----
    # 使用 selectinload 预加载关联数据（避免 N+1 查询问题）
    # N+1 问题：查询 N 个问题后，每个问题再查一次作者 → 总共 N+1 次查询
    # selectinload 用 IN 子查询一次性加载所有关联数据 → 只需 2-3 次查询
    query = select(Question).options(
        selectinload(Question.author),  # 预加载作者
        selectinload(Question.tags),    # 预加载标签
    )

    # 关键词搜索 — 用 LIKE 进行模糊匹配
    if q:
        query = query.where(Question.title.ilike(f"%{q}%"))  # ilike 不区分大小写

    # 标签筛选 — 通过多对多关系筛选
    if tag:
        query = query.where(Question.tags.any(Tag.name == tag))

    # 按创建时间倒序排列（最新的在前）
    query = query.order_by(Question.created_at.desc())

    # ---- 获取总数 ----
    # 先查总记录数（用于计算总页数）
    count_query = select(func.count()).select_from(Question)
    if q:
        count_query = count_query.where(Question.title.ilike(f"%{q}%"))
    if tag:
        count_query = count_query.where(Question.tags.any(Tag.name == tag))
    total = (await db.execute(count_query)).scalar()

    # ---- 分页 ----
    # offset: 跳过前面 (page-1)*size 条记录
    # limit: 只取 size 条
    query = query.offset((page - 1) * size).limit(size)
    result = await db.execute(query)
    questions = result.unique().scalars().all()  # unique() 去重（因为使用了 joined eager loading）

    # ---- 构建响应 ----
    items = []
    for question in questions:
        # 统计回答数 — 使用 relationship 的 dynamic lazy loading
        answer_count = await db.scalar(
            select(func.count(Answer.id)).where(Answer.question_id == question.id)
        )
        items.append(QuestionBrief(
            id=question.id,
            title=question.title,
            body_preview=question.body[:200],
            author=question.author,
            tags=question.tags,
            vote_count=question.vote_count,
            answer_count=answer_count,
            view_count=question.view_count,
            created_at=question.created_at,
            updated_at=question.updated_at,
        ))

    return QuestionListResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=max(1, math.ceil(total / size)),  # 向上取整
    )


async def get_question_detail(db: AsyncSession, question_id: int) -> Question | None:
    """获取问题详情（含完整正文和回答）"""
    result = await db.execute(
        select(Question)
        .options(
            selectinload(Question.author),
            selectinload(Question.tags),
            selectinload(Question.answers).selectinload(Answer.author),  # 预加载回答和回答者
        )
        .where(Question.id == question_id)
    )
    return result.unique().scalar_one_or_none()


async def create_question(
    db: AsyncSession,
    data: QuestionCreate,
    author_id: int,
) -> Question:
    """创建新问题"""
    # 处理标签 — 如果标签不存在则自动创建
    tags = []
    for tag_name in data.tag_names:
        result = await db.execute(select(Tag).where(Tag.name == tag_name))
        tag = result.scalar_one_or_none()
        if not tag:
            tag = Tag(name=tag_name)
            db.add(tag)
        tags.append(tag)

    question = Question(
        title=data.title,
        body=data.body,
        author_id=author_id,
        tags=tags,
    )
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return question


async def update_question(
    db: AsyncSession,
    question: Question,
    data: dict,
) -> Question:
    """更新问题"""
    for key, value in data.items():
        if value is not None:
            setattr(question, key, value)
    await db.commit()
    await db.refresh(question)
    return question


async def delete_question(db: AsyncSession, question: Question) -> None:
    """删除问题"""
    await db.delete(question)
    await db.commit()
