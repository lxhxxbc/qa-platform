"""标签相关 API 路由"""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.tag import Tag
from app.schemas.question import TagResponse

router = APIRouter(prefix="/api/tags", tags=["标签"])


@router.get("", response_model=list[TagResponse])
async def list_tags(db: AsyncSession = Depends(get_db)):
    """获取所有标签（用于输入提示和标签云）"""
    result = await db.execute(select(Tag).order_by(Tag.name))
    return result.scalars().all()
