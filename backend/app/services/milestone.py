
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.schemas.MilestoneSchema import (
    MilestoneSchema,
    MilestoneUpdateSchema
)
from app.models.milestone import Milestone
from app.models.goal import Goal

from app.services.goal import calculate_goal_progress


def create_milestone(
    goal_id: str,
    body: MilestoneSchema,
    db: Session
):
    """
    Create a new milestone and recalculate the associated goal progress.
    """
    try:
        new_milestone = Milestone(
            goal_id=goal_id,
            title=body.title,
            description=body.description,
            status=body.status,
            target_date=body.target_date,
            completed_at=body.completed_at
        )

        db.add(new_milestone)
        db.commit()
        db.refresh(new_milestone)

        goal = (
            db.query(Goal)
            .filter(Goal.id == goal_id)
            .first()
        )

        if goal:
            goal.progress = calculate_goal_progress(goal_id, db)

            db.commit()
            db.refresh(goal)

        return {
            "message": "Milestone created successfully.",
            "milestone": new_milestone
        }

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to create milestone: {str(error)}"
        )


def update_milestone(
    id: str,
    body: MilestoneUpdateSchema,
    db: Session
):
    """
    Update an existing milestone and recalculate goal progress.
    """
    try:
        milestone = (
            db.query(Milestone)
            .filter(Milestone.id == id)
            .first()
        )

        if not milestone:
            raise HTTPException(
                status_code=404,
                detail="Milestone not found."
            )

        update_info = body.model_dump(exclude_unset=True)

        for key, value in update_info.items():
            setattr(milestone, key, value)

        db.commit()
        db.refresh(milestone)

        goal = (
            db.query(Goal)
            .filter(Goal.id == milestone.goal_id)
            .first()
        )

        if goal:
            goal.progress = calculate_goal_progress(
                milestone.goal_id,
                db
            )

            db.commit()
            db.refresh(goal)

        return {
            "message": "Milestone updated successfully.",
            "milestone": milestone
        }

    except HTTPException:
        raise

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to update milestone: {str(error)}"
        )


def delete_milestone(id: str, db: Session):
    """
    Delete an existing milestone and recalculate goal progress.
    """
    try:
        milestone = (
            db.query(Milestone)
            .filter(Milestone.id == id)
            .first()
        )

        if not milestone:
            raise HTTPException(
                status_code=404,
                detail="Milestone not found."
            )

        goal_id = milestone.goal_id

        db.delete(milestone)
        db.commit()

        goal = (
            db.query(Goal)
            .filter(Goal.id == goal_id)
            .first()
        )

        if goal:
            goal.progress = calculate_goal_progress(goal_id, db)

            db.commit()

        return {
            "message": "Milestone deleted successfully."
        }

    except HTTPException:
        raise

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete milestone: {str(error)}"
        )
