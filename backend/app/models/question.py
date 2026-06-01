"""
问题模型
--------
用户发布的问题，包含标题、Markdown 正文、标签、浏览量和投票数。
"""
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.tag import question_tags  # 导入中间表


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    # body 用 Text 类型（不限制长度），适合 Markdown 长文本
    body: Mapped[str] = mapped_column(Text, nullable=False)
    # author_id: 外键关联到 users 表
    author_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    vote_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # ---- 关系 ----
    # 一个问题属于一个作者
    author: Mapped["User"] = relationship("User", back_populates="questions")
    # 一个问题有多个回答
    # lazy="dynamic": 不立即加载，返回一个可查询的对象（避免 N+1 问题）
    answers: Mapped[list["Answer"]] = relationship(
        "Answer", back_populates="question", cascade="all, delete-orphan",
        lazy="dynamic"
    )
    # 多对多标签
    tags: Mapped[list["Tag"]] = relationship(
        "Tag", secondary=question_tags, back_populates="questions", lazy="joined"
    )
    # 投票
    votes: Mapped[list["Vote"]] = relationship(
        "Vote", back_populates="question",
        primaryjoin="and_(Vote.target_type == 'question', Vote.target_id == Question.id)",
        foreign_keys="[Vote.target_id]",
        cascade="all, delete-orphan",
    )
