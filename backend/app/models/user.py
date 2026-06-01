"""
用户模型
--------
存储注册用户信息。密码使用 bcrypt 哈希加密存储（不可逆）。
"""
from datetime import datetime

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"  # 表名（PostgreSQL 约定用复数）

    # ---- 字段定义 ----
    # Mapped[int] 是类型注解（给 IDE 和 mypy 用）
    # mapped_column 定义数据库列的细节（主键、唯一、索引等）
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    # password_hash: 存储的是 bcrypt 哈希值（如 $2b$12$...），不是明文密码！
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    # avatar_url: 头像链接，暂时不用，先设默认值
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # reputation: 用户声望分数，发帖回答被赞会增加
    reputation: Mapped[int] = mapped_column(Integer, default=0)
    # created_at: 注册时间，server_default=func.now() 让数据库自动填入当前时间
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # ---- 关系（ORM 核心概念） ----
    # relationship 定义了模型之间的关联，它不是数据库字段，
    # 而是让你通过 user.questions 直接访问该用户的所有问题。
    # back_populates: 双向关联 — Question 模型也有一个 author 属性指向 User
    # cascade="all, delete-orphan": 删除用户时，自动删除他所有的问题和回答
    questions: Mapped[list["Question"]] = relationship(
        "Question", back_populates="author", cascade="all, delete-orphan"
    )
    answers: Mapped[list["Answer"]] = relationship(
        "Answer", back_populates="author", cascade="all, delete-orphan"
    )

    def __repr__(self):
        """对象的字符串表示，调试用"""
        return f"<User(id={self.id}, username='{self.username}')>"
