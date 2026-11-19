from pydantic import BaseModel
from app.enums.expense import ExpenseType

class CategorySchema(BaseModel):

    name:str
    type:ExpenseType
    

class CategoryUpdateSchema(BaseModel):

    name:str|None = None
    type:ExpenseType|None = None