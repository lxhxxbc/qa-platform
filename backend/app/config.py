"""
应用配置模块
-----------
使用 Pydantic 的 BaseSettings 管理所有配置项。
配置优先级：环境变量 > .env 文件 > 代码默认值。
这样在不同环境（开发/生产）切换时，只需要改环境变量，不用改代码。
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置类 — 所有配置项集中管理"""

    # 数据库配置
    database_url: str = "postgresql+asyncpg://postgres:password@localhost:5432/qa_platform"

    # JWT 配置
    secret_key: str = "change-me-to-a-random-secret-key"
    access_token_expire_minutes: int = 30

    # 应用配置
    app_name: str = "QA Platform API"
    debug: bool = True

    # 端口配置（Railway 通过 PORT 环境变量指定）
    port: int = 8000

    # 告诉 Pydantic 从 .env 文件读取环境变量
    # env_file = ".env" 表示自动寻找并读取同级目录的 .env 文件
    model_config = {"env_file": ".env", "extra": "ignore"}


# 创建全局单例配置对象 — 其他模块 import 这个对象即可获取配置
settings = Settings()
