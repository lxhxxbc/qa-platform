"""
数据库连接管理模块
------------------
使用 SQLAlchemy 2.0 的异步引擎（async engine）连接 PostgreSQL。
核心概念：
- Engine: 数据库连接池，管理所有数据库连接
- AsyncSession: 异步会话，每次数据库操作通过 session 进行
- sessionmaker: 工厂函数，用来创建 session 实例
- Base: 所有 ORM 模型的基类，定义了模型的通用行为
"""
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# ---- 创建数据库引擎 ----
# create_async_engine: 创建异步数据库引擎
# echo=True: 打印 SQL 语句（开发调试用，生产关闭）
# pool_size: 连接池大小（默认5，保持的连接数）
# max_overflow: 超出 pool_size 时额外允许的连接数
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_size=10,
    max_overflow=20,
)

# ---- 创建 Session 工厂 ----
# async_sessionmaker: 用来创建异步 session 的工厂
# expire_on_commit=False: 提交后不使对象过期（避免提交后访问属性报错）
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ---- ORM 模型基类 ----
# 所有数据表模型都继承这个 Base 类
# DeclarativeBase: SQLAlchemy 2.0 的声明式基类
class Base(DeclarativeBase):
    pass


# ---- FastAPI 依赖：获取数据库 Session ----
# 这是一个 FastAPI 依赖函数，在路由中使用 Depends(get_db) 即可获取 db session
# async with: 确保 session 在使用完毕后正确关闭（即使发生异常也能关闭）
async def get_db() -> AsyncSession:
    """
    获取数据库会话的 FastAPI 依赖。

    用法示例：
        @app.get("/users")
        async def get_users(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(User))
            return result.scalars().all()
    """
    async with async_session() as session:
        try:
            yield session
            # yield: 把 session 交给路由函数使用
            # 路由函数执行完后，代码回到这里
        finally:
            # finally: 无论是否发生异常，都会关闭 session
            await session.close()
