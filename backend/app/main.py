"""
FastAPI 应用入口
----------------
FastAPI 是一个现代、高性能的 Python Web 框架。
核心概念：
- app = FastAPI(): 创建应用实例
- @app.get("/path"): 装饰器定义 GET 路由
- uvicorn.run(): ASGI 服务器运行应用
"""
from fastapi import FastAPI
# CORSMiddleware: 处理跨域请求 — 前后端分离时，前端(5173端口)请求后端(8000端口)算跨域
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings

# 创建 FastAPI 应用实例
# title: API 文档标题
# version: 版本号
app = FastAPI(title=settings.app_name, version="0.1.0")

# ---- CORS 配置 ----
# 前后端分离时，浏览器出于安全考虑会阻止跨域请求。
# CORS（跨域资源共享）告诉浏览器"这些来源的请求是允许的"。
app.add_middleware(
    CORSMiddleware,
    # allow_origins: 允许哪些前端地址访问后端
    # 开发时 React 开发服务器在 localhost:5173
    # 上线后替换为实际域名
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,       # 允许携带 Cookie
    allow_methods=["*"],          # 允许所有 HTTP 方法（GET, POST, PUT, DELETE...）
    allow_headers=["*"],          # 允许所有请求头
)


# ---- 根路由 ----
@app.get("/")
async def root():
    """API 根路径 — 用于健康检查"""
    return {"message": f"欢迎使用 {settings.app_name}"}
