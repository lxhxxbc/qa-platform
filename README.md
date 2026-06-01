# 技术问答社区

全栈学习项目 — Python FastAPI + React + PostgreSQL

## 本地开发

### 后端
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

### 前端
cd frontend
npm install
npm run dev
