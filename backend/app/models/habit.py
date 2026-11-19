
from app.db.database import Base
from datetime import datetime
import uuid
from sqlalchemy.orm import Mapped,mapped_column
from sqlalchemy import Integer,DateTime,func,ForeignKey,String
from app.enums.frequency import Frequency
from app.enums.is_active import IsActive
from sqlalchemy import Enum as SQLAlchemyEnum

class Habit(Base):
    
    __tablename__="habits"
    
    id:Mapped[str]=mapped_column(String(36),primary_key=True,default=lambda:str(uuid.uuid4()))
    user_id:Mapped[str]=mapped_column(String(36),ForeignKey("users.id"),nullable=False)
    title:Mapped[str]=mapped_column(String(300),nullable=False)
    description:Mapped[str]=mapped_column(String(300),nullable=False)
    frequency:Mapped[Frequency]=mapped_column(SQLAlchemyEnum(Frequency),nullable=False,default=Frequency.DAILY)
    target_count:Mapped[int]=mapped_column(Integer)
    is_active:Mapped[IsActive]=mapped_column(SQLAlchemyEnum(IsActive),nullable=False,default=IsActive.ACTIVE)
    start_date:Mapped[datetime | None]=mapped_column(DateTime)
    end_date:Mapped[datetime | None]=mapped_column(DateTime)
    created_at:Mapped[datetime]=mapped_column(DateTime,server_default=func.now())
    updated_at:Mapped[datetime]=mapped_column(DateTime,server_default=func.now())
    
    

class HabitLogs(Base):
    
    __tablename__="habit_logs"
    
    id:Mapped[str]=mapped_column(String(36),primary_key=True,default=lambda:str(uuid.uuid4()))
    habit_id:Mapped[str]=mapped_column(String(36),ForeignKey("habits.id",ondelete="CASCADE"),nullable=False)
    user_id:Mapped[str]=mapped_column(String(36),ForeignKey("users.id"),nullable=False)
    completed_date:Mapped[datetime]=mapped_column(DateTime,nullable=False)
    completion_count:Mapped[int]=mapped_column(Integer)
    created_at:Mapped[datetime]=mapped_column(DateTime,server_default=func.now())

