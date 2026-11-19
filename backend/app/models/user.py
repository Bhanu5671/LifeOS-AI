from datetime import datetime
import uuid
from app.db.database import Base
from sqlalchemy import Integer,String,DateTime,Boolean,func
from sqlalchemy.orm import Mapped,mapped_column


class User(Base):
    
    __tablename__="users"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name:Mapped[str]=mapped_column(String(100),nullable=False)
    email:Mapped[str]=mapped_column(String(100),nullable=False,unique=True)
    password:Mapped[str]=mapped_column(String(100),nullable=False)
    role:Mapped[str]=mapped_column(String(100),nullable=False)
    # profile_image:Mapped[str]=mapped_column(String(255))
    is_active:Mapped[bool]=mapped_column(default=True)
    is_verified:Mapped[bool]=mapped_column(default=True)
    created_at:Mapped[datetime]=mapped_column(DateTime,server_default=func.now())
    updated_at:Mapped[datetime]=mapped_column(DateTime,server_default=func.now())
    last_login:Mapped[datetime]=mapped_column(DateTime,server_default=func.now())
    timezone:Mapped[str]=mapped_column(String(50),default="Asia/Kolkata")