
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.HabitSchema import HabitSchema, HabitUpdateSchema, HabitLogsSchema
from app.db.database import get_db
from app.middlewares.auth import get_current_user
from app.services.habit import (
    create_habit,
    get_all_habits,
    get_habit_by_id,
    update_habit,
    delete_habit,
    create_habit_log,
    get_habit_log
)


habit_router = APIRouter()


@habit_router.post(
    "/habits",
    summary="Create a new habit",
    description="Create a new habit for the authenticated user."
)
def create_habit_route(
    body: HabitSchema,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_habit(body, user, db)


@habit_router.get(
    "/habits",
    summary="Get all habits",
    description="Retrieve all habits belonging to the authenticated user."
)
def get_all_habits_route(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_all_habits(user, db)


@habit_router.get(
    "/habits/{id}",
    summary="Get habit by ID",
    description="Retrieve a specific habit using its ID."
)
def get_habit_by_id_route(
    id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_habit_by_id(id, user, db)


@habit_router.put(
    "/habits/{id}",
    summary="Update a habit",
    description="Update an existing habit belonging to the authenticated user."
)
def update_habit_route(
    id: str,
    body: HabitUpdateSchema,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_habit(id, body, user, db)


@habit_router.delete(
    "/habits/{id}",
    summary="Delete a habit",
    description="Delete an existing habit using its ID."
)
def delete_habit_route(
    id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return delete_habit(id, user, db)


@habit_router.post(
    "/habits/{id}/logs",
    summary="Complete a habit",
    description="Record a completion for the specified habit."
)
def create_habit_log_route(
    id: str,
    body: HabitLogsSchema,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_habit_log(id, body, user, db)


@habit_router.get(
    "/habits/{id}/logs",
    summary="Get habit completion logs",
    description="Retrieve completion logs for the specified habit."
)
def get_habit_logs_route(
    id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_habit_log(id, user, db)
