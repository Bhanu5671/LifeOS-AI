
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.schemas.GoalSchema import GoalSchema, GoalUpdateSchema
from app.models.goal import Goal


from app.models.milestone import Milestone


def calculate_goal_progress(goal_id: str, db: Session):
    total_milestones = (
        db.query(Milestone)
        .filter(Milestone.goal_id == goal_id)
        .count()
    )

    if total_milestones == 0:
        return 0

    completed_milestones = (
        db.query(Milestone)
        .filter(
            Milestone.goal_id == goal_id,
            Milestone.status == "Completed"
        )
        .count()
    )

    return round((completed_milestones / total_milestones) * 100)


def create_goal(body: GoalSchema, user, db: Session):
    """
    Create a new goal for the authenticated user.
    """
    try:
        new_goal = Goal(
            user_id=user.id,
            title=body.title,
            description=body.description,
            category=body.category,
            target_date=body.target_date,
            status=body.status,
            progress=0
        )

        db.add(new_goal)
        db.commit()
        db.refresh(new_goal)

        return {
            "message": "Goal created successfully.",
            "goal": new_goal
        }

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to create goal: {str(error)}"
        )


def get_all_goals(user, db: Session):
    """
    Retrieve all goals belonging to the authenticated user.
    """
    try:
        goals = (
            db.query(Goal)
            .filter(Goal.user_id == user.id)
            .all()
        )

        return {
            "message": "Goals retrieved successfully.",
            "goals": goals
        }

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve goals: {str(error)}"
        )


def get_goal_by_id(id: str, user, db: Session):
    """
    Retrieve a specific goal by its ID.
    """
    try:
        goal = (
            db.query(Goal)
            .filter(
                Goal.user_id == user.id,
                Goal.id == id
            )
            .first()
        )

        return {
            "message": "Goal retrieved successfully.",
            "goal": goal
        }

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve goal: {str(error)}"
        )


def update_goal(
    id: str,
    body: GoalUpdateSchema,
    user,
    db: Session
):
    """
    Update an existing goal belonging to the authenticated user.
    """
    try:
        goal = (
            db.query(Goal)
            .filter(
                Goal.user_id == user.id,
                Goal.id == id
            )
            .first()
        )
        
        if not goal:
            raise HTTPException(
                status_code=404,
                detail="Goal not found."
            )

        update_info = body.model_dump(exclude_unset=True)

        for key, value in update_info.items():
            setattr(goal, key, value)

        db.commit()
        db.refresh(goal)

        return {
            "message": "Goal updated successfully.",
            "goal": goal
        }

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to update goal: {str(error)}"
        )


def delete_goal(id: str, user, db: Session):
    """
    Delete an existing goal belonging to the authenticated user.
    """
    try:
        goal = (
            db.query(Goal)
            .filter(
                Goal.user_id == user.id,
                Goal.id == id
            )
            .first()
        )
        
        if not goal:
            raise HTTPException(
                status_code=404,
                detail="Goal not found."
            )

        db.delete(goal)
        db.commit()

        return {
            "message": "Goal deleted successfully."
        }

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete goal: {str(error)}"
        )
