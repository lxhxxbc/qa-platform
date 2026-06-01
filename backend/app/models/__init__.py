"""
数据模型包
---------
这里导入所有模型，确保 SQLAlchemy 能发现它们。
如果模型没被 import，Base.metadata.create_all() 会忽略它。
"""
from app.models.user import User
from app.models.tag import Tag
from app.models.question import Question
from app.models.answer import Answer
from app.models.vote import Vote
