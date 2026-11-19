
from sqlalchemy import String,func,DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base
from datetime import datetime
import uuid
from app.enums.statusforgoal import StatusForGoal
from sqlalchemy import Enum as SQLAlchemyEnum



class Milestone(Base):
    
    __tablename__="milestones"
    
    id:Mapped[str]=mapped_column(String(36),primary_key=True,default=lambda:uuid.uuid4())
    goal_id:Mapped[str]=mapped_column(String(36), ForeignKey("goals.id"),nullable=False)
    title:Mapped[str]=mapped_column(String(300),nullable=False)
    description:Mapped[str]=mapped_column(String(500))
    status:Mapped[StatusForGoal]=mapped_column(SQLAlchemyEnum(StatusForGoal),default=StatusForGoal.NOT_STARTED)
    target_date:Mapped[datetime]=mapped_column(DateTime,nullable=False)
    completed_at:Mapped[datetime]=mapped_column(DateTime)
    created_at:Mapped[datetime]=mapped_column(DateTime,server_default=func.now())
    updated_at:Mapped[datetime]=mapped_column(DateTime,server_default=func.now())