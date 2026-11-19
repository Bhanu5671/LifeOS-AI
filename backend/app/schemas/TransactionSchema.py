
from pydantic import BaseModel
from decimal import Decimal
from app.enums.expense import ExpenseType

class TransactionSchema(BaseModel):
    category_id:str
    title:str
    amount:Decimal
    type:ExpenseType
    description:str
    
    
class TransactionUpdatedSchema(BaseModel):
    category_id:str | None = None
    title:str | None = None
    amount:Decimal | None = None
    type:ExpenseType | None = None
    description:str | None = None