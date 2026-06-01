"""种子数据脚本 — 插入示例数据到数据库"""
import asyncio
from app.database import async_session
from app.models.user import User
from app.models.question import Question
from app.models.tag import Tag
from app.models.answer import Answer
from app.services.auth import hash_password


async def seed():
    async with async_session() as db:
        # 创建示例用户
        admin = User(
            username="admin",
            email="admin@example.com",
            password_hash=hash_password("123456"),
        )
        db.add(admin)
        await db.flush()

        # 创建标签
        tag_names = ["python", "fastapi", "react", "typescript", "postgresql"]
        tags = {}
        for name in tag_names:
            tag = Tag(name=name)
            db.add(tag)
            tags[name] = tag
        await db.flush()

        # 创建示例问题
        q = Question(
            title="如何在 FastAPI 中使用异步 SQLAlchemy？",
            body=(
                "我正在学习 FastAPI，想用异步方式操作数据库，但不确定正确的 session 管理模式。\n\n"
                "```python\n"
                "from sqlalchemy.ext.asyncio import create_async_engine\n"
                "engine = create_async_engine(url)\n"
                "```\n\n"
                "请问应该如何配合 FastAPI 的 Depends 依赖注入来管理数据库会话？"
            ),
            author_id=admin.id,
            tags=[tags["python"], tags["fastapi"]],
        )
        db.add(q)
        await db.flush()

        # 创建示例回答
        a = Answer(
            body=(
                "推荐使用 `async_sessionmaker` + `Depends` 的模式：\n\n"
                "```python\n"
                "from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession\n\n"
                "async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)\n\n"
                "async def get_db():\n"
                "    async with async_session() as session:\n"
                "        yield session\n"
                "```\n\n"
                "然后在路由中使用 `db: AsyncSession = Depends(get_db)` 即可。"
            ),
            question_id=q.id,
            author_id=admin.id,
        )
        db.add(a)
        await db.commit()

        print("种子数据创建完成！")
        print("  用户: admin@example.com / 123456")
        print(f"  问题 ID: {q.id}")
        print(f"  回答 ID: {a.id}")


if __name__ == "__main__":
    asyncio.run(seed())
