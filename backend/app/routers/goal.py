
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.middlewares.auth import get_current_user
from app.schemas.GoalSchema import GoalSchema, GoalUpdateSchema
from app.services.goal import (
    create_goal,
    get_all_goals,
    get_goal_by_id,
    update_goal,
    delete_goal
)


goal_router = APIRouter()


@goal_router.post(
    "/goals",
    summary="Create a new goal",
    description="Create a new goal for the authenticated user."
)
def create_goal_route(
    body: GoalSchema,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_goal(body, user, db)


@goal_router.get(
    "/goals",
    summary="Get all goals",
    description="Retrieve all goals belonging to the authenticated user."
)
def get_all_goals_route(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_all_goals(user, db)


@goal_router.get(
    "/goals/{id}",
    summary="Get goal by ID",
    description="Retrieve a specific goal using its ID."
)
def get_goal_by_id_route(
    id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_goal_by_id(id, user, db)


@goal_router.put(
    "/goals/{id}",
    summary="Update a goal",
    description="Update an existing goal belonging to the authenticated user."
)
def update_goal_route(
    id: str,
    body: GoalUpdateSchema,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_goal(id, body, user, db)


@goal_router.delete(
    "/goals/{id}",
    summary="Delete a goal",
    description="Delete an existing goal using its ID."
)
def delete_goal_route(
    id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return delete_goal(id, user, db)
