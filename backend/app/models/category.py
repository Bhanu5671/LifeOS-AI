
from app.db.database import Base
from datetime import datetime
import uuid
from app.enums.expense import ExpenseType
from sqlalchemy import String,func,ForeignKey,DateTime
from sqlalchemy.orm import mapped_column,Mapped
from sqlalchemy import Enum as SQLAlchemyEnum

class Category(Base):
    __tablename__="categories"
    
    id:Mapped[str]=mapped_column(String(36),primary_key=True,default=lambda:uuid.uuid4())
    user_id:Mapped[str]=mapped_column(String(36),ForeignKey("users.id"),nullable=False)
    name:Mapped[str]=mapped_column(String(300),nullable=False)
    type:Mapped[ExpenseType]=mapped_column(SQLAlchemyEnum(ExpenseType),nullable=False,default=ExpenseType.EXPENSE)
    created_at:Mapped[datetime]=mapped_column(DateTime,server_default=func.now())