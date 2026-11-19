from pydantic import BaseModel
from app.enums.category import Category
from app.enums.statusforgoal import StatusForGoal
from datetime import datetime

class GoalSchema(BaseModel):
    title:str
    description:str
    category:Category
    target_date:datetime
    status:StatusForGoal
    progress:int
    
    
class GoalUpdateSchema(BaseModel):
    title:str | None = None
    description:str | None = None
    category:Category | None = None
    target_date:datetime | None = None
    status:StatusForGoal | None = None
    progress:int | None = None