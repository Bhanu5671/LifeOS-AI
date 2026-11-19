
from pydantic import BaseModel
from datetime import datetime
from app.enums.status import Status
from app.enums.priority import Priority


class TaskSchema(BaseModel):
    title:str
    description:str
    priority:Priority
    status:Status
    due_date:datetime
    category_id:str
    completed_at:datetime | None

class TaskUpdateSchema(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: Priority | None = None
    status: Status | None = None
    due_date: datetime | None = None
    category_id: str | None = None
    completed_at:datetime | None=None