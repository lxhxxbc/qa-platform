"""
标签模型
--------
问题可以被打上多个标签（如 "python", "fastapi", "react"）。
Question 与 Tag 是多对多关系：一个问题可以有多个标签，一个标签可以属于多个问题。
多对多关系需要一个中间表（QuestionTag）来维护。
"""
from sqlalchemy import Column, ForeignKey, Integer, String, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

# ---- 多对多中间表 ----
# Table 不是 ORM 模型类，但它也是数据库表
# 专门用来维护 Question 和 Tag 的多对多关系
# 只有两列：question_id 和 tag_id，都是外键
question_tags = Table(
    "question_tags",  # 表名
    Base.metadata,  # 表注册到 SQLAlchemy 的元数据中
    # Column 是低级 API，用于 Table 定义（mapped_column 是 ORM 高级 API）
    Column("question_id", Integer, ForeignKey("questions.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
)


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(
        String(30), unique=True, nullable=False
    )
    description: Mapped[str | None] = mapped_column(String(200), nullable=True)

    # secondary=question_tags: 告诉 SQLAlchemy 多对多关系通过哪个中间表
    # back_populates: 和 Question.tags 形成双向关联
    questions: Mapped[list["Question"]] = relationship(
        "Question",
        secondary=question_tags,  # ← 关键参数：指定中间表
        back_populates="tags",
    )
