"""
FastAPI 应用入口
----------------
FastAPI 提供 lifespan 事件机制，让我们在应用启动/关闭时执行代码。
这里在启动时自动创建数据库表（仅开发环境方便使用，生产环境应该用 Alembic 迁移）。
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
# 导入所有模型，确保 SQLAlchemy 在 create_all 时能发现它们
import app.models  # noqa: F401 — 不直接使用但必须导入
from app.routers import answers
from app.routers import auth
from app.routers import questions
from app.routers import tags


# ---- Lifespan 事件 ----
# asynccontextmanager 装饰器：将一个异步生成器函数转为上下文管理器
# 这个函数在 FastAPI 启动时执行（yield 之前）和关闭时执行（yield 之后）
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时：创建所有数据库表（如果表不存在的话）
    # Base.metadata.create_all 会扫描所有继承 Base 的模型，自动建表
    # 注意：生产环境应使用 Alembic 迁移，这里仅图方便
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("数据库表已就绪")
    yield  # 应用运行期间在此暂停
    # 关闭时：释放数据库引擎资源
    await engine.dispose()


# ---- 创建应用 ----
app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,  # 注册 lifespan 事件
)

# ---- CORS 配置 ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",                    # 本地开发
        "https://qa-platform.vercel.app",          # Vercel 部署域名（上线后获取实际域名）
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由 — include_router 把各个模块的路由挂载到主应用
app.include_router(auth.router)
app.include_router(questions.router)
app.include_router(answers.router)
app.include_router(tags.router)


@app.get("/")
async def root():
    """API 根路径 — 用于健康检查"""
    return {"message": f"欢迎使用 {settings.app_name}"}
