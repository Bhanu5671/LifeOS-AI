
from pydantic import BaseModel
from app.enums.frequency import Frequency
from app.enums.is_active import IsActive
from datetime import datetime

class HabitSchema(BaseModel):
    title: str
    description: str
    frequency:Frequency
    target_count:int
    is_active:IsActive
    start_date:datetime | None
    end_date:datetime | None
    
    

class HabitUpdateSchema(BaseModel):
    title: str | None = None
    description: str | None = None
    frequency:Frequency | None = None
    target_count:int | None = None
    is_active:IsActive | None = None
    start_date:datetime | None = None
    end_date:datetime | None = None
    
    
class HabitLogsSchema(BaseModel):
    completed_date:datetime