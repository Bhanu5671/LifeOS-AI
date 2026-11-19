
from app.db.database import Base
from decimal import Decimal
from datetime import datetime
from sqlalchemy import Integer,String,DECIMAL,DateTime,ForeignKey,func,Numeric
from app.enums.expense import ExpenseType
from sqlalchemy import Enum as SQLAlchemyEnum
import uuid
from sqlalchemy.orm import mapped_column,Mapped

class Transaction(Base):
    
    __tablename__="transactions"
    
    id:Mapped[str]=mapped_column(String(36),primary_key=True,default=lambda:uuid.uuid4())
    user_id:Mapped[str]=mapped_column(String(36),ForeignKey("users.id"),nullable=False)
    category_id:Mapped[str]=mapped_column(String(36),ForeignKey("categories.id"),nullable=False)
    title:Mapped[str]=mapped_column(String(300),nullable=False)
    amount:Mapped[Decimal]=mapped_column(Numeric(10,2),nullable=False)
    type:Mapped[ExpenseType]=mapped_column(SQLAlchemyEnum(ExpenseType),default=ExpenseType.EXPENSE,nullable=False)
    description:Mapped[str]=mapped_column(String(300),nullable=False)
    transaction_date:Mapped[datetime]=mapped_column(DateTime,server_default=func.now())
    created_at:Mapped[datetime]=mapped_column(DateTime,server_default=func.now())
    updated_at:Mapped[datetime]=mapped_column(DateTime,server_default=func.now())