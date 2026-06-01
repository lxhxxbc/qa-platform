# Dockerfile — 部署用，放在项目根目录
FROM python:3.12-slim

WORKDIR /app

# 复制依赖文件（相对于项目根目录）
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制整个 backend 目录
COPY backend/ .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
