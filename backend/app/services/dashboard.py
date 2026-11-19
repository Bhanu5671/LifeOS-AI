
from fastapi import HTTPException
from sqlalchemy import func
from datetime import date
from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.goal import Goal
from app.models.habit import Habit, HabitLogs
from app.models.category import Category
from app.models.transaction import Transaction


def get_overview(user, db: Session):
    try:
        total_tasks = (
            db.query(Task)
            .filter(Task.user_id == user.id)
            .count()
        )

        completed_tasks = (
            db.query(Task)
            .filter(
                Task.user_id == user.id,
                Task.status == "Completed"
            )
            .count()
        )

        active_goals = (
            db.query(Goal)
            .filter(
                Goal.user_id == user.id,
                Goal.status.in_(["Not Started", "In Progress"])
            )
            .count()
        )

        average_goal_progress = (
            db.query(func.coalesce(func.avg(Goal.progress), 0))
            .filter(Goal.user_id == user.id)
            .scalar()
        )

        active_habits = (
            db.query(Habit)
            .filter(
                Habit.user_id == user.id,
                Habit.is_active == "Active"
            )
            .count()
        )

        today_habit_completions = (
            db.query(HabitLogs)
            .filter(
                HabitLogs.user_id == user.id,
                func.date(HabitLogs.completed_date) == date.today()
            )
            .count()
        )

        total_income = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0))
            .filter(
                Transaction.user_id == user.id,
                Transaction.type == "Income"
            )
            .scalar()
        )

        total_expense = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0))
            .filter(
                Transaction.user_id == user.id,
                Transaction.type == "Expense"
            )
            .scalar()
        )

        expense_breakdown = (
            db.query(
                Category.name.label("category"),
                func.sum(Transaction.amount).label("total_amount")
            )
            .join(Category, Transaction.category_id == Category.id)
            .filter(
                Transaction.user_id == user.id,
                Transaction.type == "Expense"
            )
            .group_by(Category.id, Category.name)
            .all()
        )

        return {
            "message": "Overview data retrieved successfully",
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "active_goals": active_goals,
            "average_goal_progress": round(float(average_goal_progress), 2),
            "active_habits": active_habits,
            "today_habit_completions": today_habit_completions,
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": total_income - total_expense,
            "expense_breakdown": [
                {
                    "category": item.category,
                    "total_amount": item.total_amount
                }
                for item in expense_breakdown
            ]
        }

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve overview: {str(error)}"
        )


def get_tasks(user, db: Session):
    try:
        today = date.today()

        total_tasks = (
            db.query(Task)
            .filter(Task.user_id == user.id)
            .count()
        )

        completed_tasks = (
            db.query(Task)
            .filter(
                Task.user_id == user.id,
                Task.status == "Completed"
            )
            .count()
        )

        today_tasks = (
            db.query(Task)
            .filter(
                Task.user_id == user.id,
                func.date(Task.due_date) == today
            )
            .all()
        )

        return {
            "message": "Tasks data retrieved successfully",
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "today_tasks": today_tasks
        }

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve tasks: {str(error)}"
        )


def get_expenses(user, db: Session):
    try:
        total_income = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0))
            .filter(
                Transaction.user_id == user.id,
                Transaction.type == "Income"
            )
            .scalar()
        )

        total_expense = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0))
            .filter(
                Transaction.user_id == user.id,
                Transaction.type == "Expense"
            )
            .scalar()
        )

        expense_breakdown = (
            db.query(
                Category.name.label("category"),
                func.sum(Transaction.amount).label("total_amount")
            )
            .join(Category, Transaction.category_id == Category.id)
            .filter(
                Transaction.user_id == user.id,
                Transaction.type == "Expense"
            )
            .group_by(Category.id, Category.name)
            .all()
        )

        return {
            "message": "Expense data retrieved successfully",
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": total_income - total_expense,
            "expense_breakdown": [
                {
                    "category": item.category,
                    "total_amount": item.total_amount
                }
                for item in expense_breakdown
                
            ]
        }

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve expenses: {str(error)}"
        )


def get_habits(user, db: Session):
    try:
        active_habits = (
            db.query(Habit)
            .filter(
                Habit.user_id == user.id,
                Habit.is_active == "Active"
            )
            .all()
        )

        today_habit_completions = (
            db.query(HabitLogs)
            .filter(
                HabitLogs.user_id == user.id,
                func.date(HabitLogs.completed_date) == date.today()
            )
            .all()
        )

        habit_completion_counts = (
            db.query(
                Habit.id,
                func.count(HabitLogs.id).label("total_completions")
            )
            .join(
                HabitLogs,
                Habit.id == HabitLogs.habit_id
            )
            .filter(
                Habit.user_id == user.id,
                Habit.is_active == "Active"
            )
            .group_by(Habit.id)
            .all()
        )

        return {
            "message": "Habits data retrieved successfully",
            "active_habits": active_habits,
            "today_habit_completions": today_habit_completions,
            "habit_completion_counts": [
                {
                    "habit_id": item.id,
                    "total_completions": item.total_completions
                }
                for item in habit_completion_counts
            ]
        }

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve habits: {str(error)}"
        )


def get_goals(user, db: Session):
    try:
        active_goals = (
            db.query(Goal)
            .filter(
                Goal.user_id == user.id,
                Goal.status.in_(["Not Started", "In Progress"])
            )
            .all()
        )

        average_goal_progress = (
            db.query(func.coalesce(func.avg(Goal.progress), 0))
            .filter(Goal.user_id == user.id)
            .scalar()
        )

        return {
            "message": "Goals data retrieved successfully",
            "active_goals": active_goals,
            "average_goal_progress": round(float(average_goal_progress), 2)
        }

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve goals: {str(error)}"
        )
