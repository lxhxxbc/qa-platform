"""
投票模型
--------
用户对问题或回答的投票（赞成 +1 或反对 -1）。
使用多态关联：一条 Vote 记录既可以属于 Question，也可以属于 Answer。
通过 target_type 字段区分投票目标类型。
"""
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Vote(Base):
    __tablename__ = "votes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    # target_type: 区分目标类型 — "question" 或 "answer"
    target_type: Mapped[str] = mapped_column(
        String(10), nullable=False
    )
    # target_id: 目标记录的主键 ID
    target_id: Mapped[int] = mapped_column(Integer, nullable=False)
    # value: +1 赞成，-1 反对
    value: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # 投票人
    user: Mapped["User"] = relationship("User")
    # 多态关系 — 根据 target_type 自动关联到对应模型
    question: Mapped["Question"] = relationship(
        "Question",
        primaryjoin="and_(Vote.target_type == 'question', Vote.target_id == Question.id)",
        foreign_keys=[target_id],
        overlaps="votes",  # overlaps: 告诉 SQLAlchemy 这个关系列有多个关联
        viewonly=True,  # viewonly: 通过 Vote 只读访问 Question，不修改
    )
    answer: Mapped["Answer"] = relationship(
        "Answer",
        primaryjoin="and_(Vote.target_type == 'answer', Vote.target_id == Answer.id)",
        foreign_keys=[target_id],
        overlaps="votes",
        viewonly=True,
    )

    # ---- 约束 ----
    # 确保同一用户对同一目标只能投一次票
    # 在数据库层面强制唯一性
    __table_args__ = (
        UniqueConstraint(
            "user_id", "target_type", "target_id",
            name="uq_user_vote",  # 约束名
        ),
    )
