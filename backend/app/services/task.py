
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.schemas.TaskSchema import TaskSchema, TaskUpdateSchema
from app.models.task import Task


def create_task(body: TaskSchema, user, db: Session):
    """
    Create a new task for the authenticated user.
    """
    try:
        new_task = Task(
            user_id=user.id,
            title=body.title,
            description=body.description,
            priority=body.priority,
            status=body.status,
            due_date=body.due_date,
            category_id=body.category_id,
            completed_at=body.completed_at
        )

        db.add(new_task)
        db.commit()
        db.refresh(new_task)

        return {
            "message": "Task created successfully.",
            "task": new_task
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create task: {str(error)}"
        )


def get_tasks(user, db: Session, page: str):
    """
    Retrieve all tasks belonging to the authenticated user.
    """
    try:
        all_tasks = (
            db.query(Task)
            .filter(Task.user_id == user.id)
            .all()
        )

        return {
            "message": "Tasks retrieved successfully.",
            "tasks": all_tasks
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve tasks: {str(error)}"
        )


def get_task_by_id(id: str, db: Session, user):
    """
    Retrieve a specific task by its ID.
    """
    try:
        task = (
            db.query(Task)
            .filter(
                Task.id == id,
                Task.user_id == user.id
            )
            .first()
        )

        return {
            "message": "Task retrieved successfully.",
            "task": task
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve task: {str(error)}"
        )


def update_task(id: str, body: TaskUpdateSchema, db: Session, user):
    """
    Update an existing task belonging to the authenticated user.
    """
    try:
        task = (
            db.query(Task)
            .filter(
                Task.id == id,
                Task.user_id == user.id
            )
            .first()
        )
        
        if not task:
            raise HTTPException(
                status_code=404,
                detail="Task not found."
            )

        update_info = body.model_dump(exclude_unset=True)

        for key, value in update_info.items():
            setattr(task, key, value)

        db.commit()
        db.refresh(task)

        return {
            "message": "Task updated successfully.",
            "task": task
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update task: {str(error)}"
        )


def delete_task(id: str, db: Session, user):
    """
    Delete an existing task belonging to the authenticated user.
    """
    try:
        task = (
            db.query(Task)
            .filter(
                Task.id == id,
                Task.user_id == user.id
            )
            .first()
        )
        
        if not task:
            raise HTTPException(
                status_code=404,
                detail="Task not found."
            )

        db.delete(task)
        db.commit()

        return {
            "message": "Task deleted successfully."
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete task: {str(error)}"
        )
