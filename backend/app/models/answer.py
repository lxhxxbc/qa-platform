"""
回答模型
--------
用户对问题的回答，包含 Markdown 正文、是否被采纳、投票数。
"""
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Answer(Base):
    __tablename__ = "answers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    # 回答关联到哪个问题
    question_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("questions.id"), nullable=False, index=True
    )
    # 回答者
    author_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    # is_accepted: 是否被提问者采纳为最佳答案（默认 False）
    is_accepted: Mapped[bool] = mapped_column(Boolean, default=False)
    vote_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # ---- 关系 ----
    question: Mapped["Question"] = relationship(
        "Question", back_populates="answers"
    )
    author: Mapped["User"] = relationship("User", back_populates="answers")
    votes: Mapped[list["Vote"]] = relationship(
        "Vote", back_populates="answer",
        primaryjoin="and_(Vote.target_type == 'answer', Vote.target_id == Answer.id)",
        foreign_keys="[Vote.target_id]",
        cascade="all, delete-orphan",
    )
