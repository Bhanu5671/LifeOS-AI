from pydantic import BaseModel
from app.enums.statusforgoal import StatusForGoal
from datetime import datetime

class MilestoneSchema(BaseModel):
    goal_id:str
    title:str
    description:str
    status:StatusForGoal
    target_date:datetime
    completed_at:datetime
    
    
class MilestoneUpdateSchema(BaseModel):
    goal_id:str | None = None
    title:str | None = None
    description:str | None = None
    status:StatusForGoal | None = None
    target_date:datetime | None = None
    completed_at:datetime | None = None