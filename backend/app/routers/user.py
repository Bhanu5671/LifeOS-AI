
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.UserSchema import UserRegisterSchema, UserLoginSchema
from app.services.user import (
    register_user,
    login_user,
    refresh_access_token
)
from app.middlewares.auth import get_current_user


user_router = APIRouter()


@user_router.post(
    "/create",
    summary="Register a new user",
    description="Create a new user account."
)
def register_user_route(
    body: UserRegisterSchema,
    db: Session = Depends(get_db)
):
    return register_user(body, db)


@user_router.post(
    "/login",
    summary="User login",
    description="Authenticate a user and generate access and refresh tokens."
)
def login_user_route(
    body: UserLoginSchema,
    db: Session = Depends(get_db)
):
    return login_user(body, db)


@user_router.post(
    "/refresh",
    summary="Refresh access token",
    description="Generate a new access token using a refresh token."
)
def refresh_access_token_route(
    refresh_token: str
):
    return refresh_access_token(refresh_token)


@user_router.get(
    "/me",
    summary="Get current user",
    description="Retrieve the authenticated user's details."
)
def get_current_user_route(
    current_user=Depends(get_current_user)
):
    return {
        "message": "User details retrieved successfully.",
        "user": current_user
    }
