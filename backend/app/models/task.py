from datetime import datetime
import uuid
from app.db.database import Base
from sqlalchemy import String,func,ForeignKey,DateTime
from sqlalchemy.orm import mapped_column,Mapped
from app.enums.priority import Priority
from app.enums.status import Status
from sqlalchemy import Enum as SQLAlchemyEnum


class Task(Base):
    
    __tablename__="tasks"
    
    id:Mapped[str]=mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id:Mapped[str]=mapped_column(String(36),ForeignKey("users.id"),nullable=False)
    title:Mapped[str]=mapped_column(String(300),nullable=False)
    description:Mapped[str]=mapped_column(String(500))
    priority:Mapped[Priority]=mapped_column(SQLAlchemyEnum(Priority),default=Priority.MEDIUM,nullable=False)
    status:Mapped[Status]=mapped_column(SQLAlchemyEnum(Status),default=Status.PENDING,nullable=False)
    due_date:Mapped[datetime | None]=mapped_column(DateTime(timezone=True),nullable=True)
    category_id: Mapped[str] = mapped_column(String(36), ForeignKey("categories.id"), nullable=True)
    created_at:Mapped[datetime]=mapped_column(DateTime,server_default=func.now())
    updated_at:Mapped[datetime]=mapped_column(DateTime,server_default=func.now())
    completed_at:Mapped[datetime | None]=mapped_column(DateTime(timezone=True), nullable=True)