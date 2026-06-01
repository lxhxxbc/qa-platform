# Dockerfile — 告诉 Railway 如何构建和运行你的应用
# FROM: 基础镜像（Python 3.12 官方镜像的精简版）
# slim 版本体积小，适合部署
FROM python:3.12-slim

# WORKDIR: 设置容器内的工作目录
WORKDIR /app

# 先复制依赖文件（利用 Docker 层缓存，后续构建更快）
COPY requirements.txt .
# RUN: 在容器内执行命令
# --no-cache-dir: 不缓存 pip 下载文件（减小镜像体积）
RUN pip install --no-cache-dir -r requirements.txt

# 复制所有项目文件
COPY . .

# EXPOSE: 声明容器监听的端口（Railway 通过此端口连接）
EXPOSE 8000

# CMD: 容器启动时执行的命令
# --host 0.0.0.0: 允许外部访问（容器内 localhost 只允许内部访问）
# --port: 使用 Railway 提供的 PORT 环境变量，默认 8000
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
