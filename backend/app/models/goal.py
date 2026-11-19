
from sqlalchemy import Integer,String,func,DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base
from datetime import datetime
import uuid
from app.enums.statusforgoal import StatusForGoal
from app.enums.category import Category
from sqlalchemy import Enum as SQLAlchemyEnum



class Goal(Base):
    
    __tablename__="goals"
    
    id:Mapped[str]=mapped_column(String(36),primary_key=True,default=lambda:uuid.uuid4())
    user_id:Mapped[str]=mapped_column(String(36), ForeignKey("users.id"),nullable=False)
    title:Mapped[str]=mapped_column(String(300),nullable=False)
    description:Mapped[str]=mapped_column(String(500))
    category:Mapped[Category]=mapped_column(SQLAlchemyEnum(Category), default=Category.PERSONAL)
    target_date:Mapped[datetime]=mapped_column(DateTime,nullable=False)
    status:Mapped[StatusForGoal]=mapped_column(SQLAlchemyEnum(StatusForGoal),default=StatusForGoal.NOT_STARTED)
    progress:Mapped[int]=mapped_column(Integer,default=0)
    created_at:Mapped[datetime]=mapped_column(DateTime,server_default=func.now())
    updated_at:Mapped[datetime]=mapped_column(DateTime,server_default=func.now())