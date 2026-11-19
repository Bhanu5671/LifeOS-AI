
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.habit import Habit, HabitLogs
from app.schemas.HabitSchema import HabitSchema, HabitUpdateSchema, HabitLogsSchema


def create_habit(body: HabitSchema, user, db: Session):
    """
    Create a new habit for the authenticated user.
    """
    try:
        new_habit = Habit(
            user_id=user.id,
            title=body.title,
            description=body.description,
            frequency=body.frequency,
            target_count=body.target_count,
            is_active=body.is_active,
            start_date=body.start_date,
            end_date=body.end_date
        )

        db.add(new_habit)
        db.commit()
        db.refresh(new_habit)

        return {
            "message": "Habit created successfully.",
            "habit": new_habit
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create habit: {str(error)}"
        )


def get_all_habits(user, db: Session):
    """
    Retrieve all habits belonging to the authenticated user.
    """
    try:
        all_habits = (
            db.query(Habit)
            .filter(Habit.user_id == user.id)
            .all()
        )

        return {
            "message": "Habits retrieved successfully.",
            "habits": all_habits
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve habits: {str(error)}"
        )


def get_habit_by_id(id: str, user, db: Session):
    """
    Retrieve a specific habit by its ID.
    """
    try:
        habit = (
            db.query(Habit)
            .filter(
                Habit.user_id == user.id,
                Habit.id == id
            )
            .first()
        )

        return {
            "message": "Habit retrieved successfully.",
            "habit": habit
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve habit: {str(error)}"
        )


def update_habit(id: str, body: HabitUpdateSchema, user, db: Session):
    """
    Update an existing habit belonging to the authenticated user.
    """
    try:
        habit = (
            db.query(Habit)
            .filter(
                Habit.user_id == user.id,
                Habit.id == id
            )
            .first()
        )

        if not habit:
            raise HTTPException(
                status_code=404,
                detail="Habit not found."
            )

        update_info = body.model_dump(exclude_unset=True)

        for key, value in update_info.items():
            setattr(habit, key, value)

        db.commit()
        db.refresh(habit)

        return {
            "message": "Habit updated successfully.",
            "habit": habit
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update habit: {str(error)}"
        )


def delete_habit(id: str, user, db: Session):
    """
    Delete an existing habit belonging to the authenticated user.
    """
    try:
        habit = (
            db.query(Habit)
            .filter(
                Habit.user_id == user.id,
                Habit.id == id
            )
            .first()
        )
        
        if not habit:
            raise HTTPException(
                status_code=404,
                detail="Habit not found."
            )

        db.delete(habit)
        db.commit()

        return {
            "message": "Habit deleted successfully."
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete habit: {str(error)}"
        )


# ==============================
# Habit Logs
# ==============================


def create_habit_log(habit_id: str, body: HabitLogsSchema ,user, db: Session):
    """
    Create or update a habit completion log for the authenticated user.
    """
    try:
        existing_log = (
            db.query(HabitLogs)
            .filter(
                HabitLogs.user_id == user.id,
                HabitLogs.habit_id == habit_id
            )
            .first()
        )

        if not existing_log:
            existing_log = HabitLogs(
                habit_id=habit_id,
                user_id=user.id,
                completion_count=1,
                completed_date=body.completed_date
            )

            db.add(existing_log)

            message = "Habit log created successfully."

        else:
            existing_log.completion_count += 1

            message = "Habit completion count updated successfully."

        db.commit()
        db.refresh(existing_log)

        return {
            "message": message,
            "habit_log": existing_log
        }

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to create habit log: {str(error)}"
        )


def get_habit_log(id: str, user, db: Session):
    """
    Retrieve a habit log belonging to the authenticated user.
    """
    try:
        habit_log = (
            db.query(HabitLogs)
            .filter(
                HabitLogs.id == id,
                HabitLogs.user_id == user.id
            )
            .all()
        )

        return {
            "message": "Habit log retrieved successfully.",
            "habit_log": habit_log
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve habit log: {str(error)}"
        )
