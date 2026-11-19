
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.task import (
    create_task,
    get_tasks,
    get_task_by_id,
    update_task,
    delete_task
)
from app.schemas.TaskSchema import TaskSchema, TaskUpdateSchema
from app.middlewares.auth import get_current_user


task_router = APIRouter()


@task_router.get(
    "/tasks",
    summary="Get all tasks",
    description="Retrieve all tasks belonging to the authenticated user."
)
def get_tasks_route(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = 1
):
    return get_tasks(user, db, page)


@task_router.post(
    "/tasks",
    summary="Create a new task",
    description="Create a new task for the authenticated user."
)
def create_task_route(
    body: TaskSchema,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_task(body, user, db)


@task_router.get(
    "/tasks/{id}",
    summary="Get task by ID",
    description="Retrieve a specific task using its ID."
)
def get_one_task_route(
    id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return get_task_by_id(id, db, user)


@task_router.put(
    "/tasks/{id}",
    summary="Update a task",
    description="Update an existing task belonging to the authenticated user."
)
def update_task_route(
    id: str,
    body: TaskUpdateSchema,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return update_task(id, body, db, user)


@task_router.delete(
    "/tasks/{id}",
    summary="Delete a task",
    description="Delete an existing task using its ID."
)
def delete_task_route(
    id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return delete_task(id, db, user)
