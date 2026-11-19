from enum import Enum

class StatusForGoal(str, Enum):
    NOT_STARTED="Not Started"
    IN_PROGRESS="In Progress" 
    COMPLETED="Completed"
    CANCELLED="Cancelled"