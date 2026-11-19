
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.middlewares.auth import get_current_user
from app.services.dashboard import (
    get_overview,
    get_expenses,
    get_goals,
    get_habits,
    get_tasks
)
from app.db.database import get_db


dashboard_router = APIRouter()


@dashboard_router.get(
    "/overview",
    summary="Get dashboard overview",
    description="Retrieve complete dashboard statistics for the authenticated user, including tasks, expenses, habits, and goals."
)
def get_overview_route(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_overview(user, db)


@dashboard_router.get(
    "/tasks",
    summary="Get task analytics",
    description="Retrieve task statistics for the authenticated user, including total tasks, completed tasks, and today's tasks."
)
def get_tasks_route(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_tasks(user, db)


@dashboard_router.get(
    "/expenses",
    summary="Get expense analytics",
    description="Retrieve financial statistics for the authenticated user, including total income, total expenses, balance, and category-wise expense breakdown."
)
def get_expenses_route(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_expenses(user, db)


@dashboard_router.get(
    "/habits",
    summary="Get habit analytics",
    description="Retrieve habit statistics for the authenticated user, including active habits, today's habit completions, and habit completion counts."
)
def get_habits_route(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_habits(user, db)


@dashboard_router.get(
    "/goals",
    summary="Get goal analytics",
    description="Retrieve goal statistics for the authenticated user, including active goals and average goal progress."
)
def get_goals_route(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_goals(user, db)
