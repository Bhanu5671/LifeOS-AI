from enum import Enum

class Status(str,Enum):
    PENDING="Pending"
    IN_PROGRESS="In Progress"
    COMPLETED="Completed"