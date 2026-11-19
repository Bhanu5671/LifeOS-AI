
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.middlewares.auth import get_current_user
from app.schemas.MilestoneSchema import (
    MilestoneSchema,
    MilestoneUpdateSchema
)
from app.services.milestone import (
    create_milestone,
    update_milestone,
    delete_milestone
)


milestone_router = APIRouter()


@milestone_router.post(
    "/goals/{id}/milestones",
    summary="Create a new milestone",
    description="Create a milestone under a specific goal."
)
def create_milestone_route(
    id: str,
    body: MilestoneSchema,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_milestone(id, body, db)


@milestone_router.put(
    "/milestones/{id}",
    summary="Update a milestone",
    description="Update an existing milestone using its ID."
)
def update_milestone_route(
    id: str,
    body: MilestoneUpdateSchema,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_milestone(id, body, db)


@milestone_router.delete(
    "/milestones/{id}",
    summary="Delete a milestone",
    description="Delete an existing milestone using its ID."
)
def delete_milestone_route(
    id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return delete_milestone(id, db)
