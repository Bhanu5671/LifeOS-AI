
import bcrypt
import jwt

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import setting
from app.core.security import create_refresh_token, create_access_token
from app.models.user import User
from app.schemas.UserSchema import UserRegisterSchema, UserLoginSchema


def generate_hashed_password(password: str):
    """
    Generate a secure hashed password using bcrypt.
    """
    salt = bcrypt.gensalt(12)

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        salt
    )

    return hashed_password


def register_user(body: UserRegisterSchema, db: Session):
    """
    Register a new user after checking email availability.
    """
    existing_user = (
        db.query(User)
        .filter(User.email == body.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=401,
            detail="Email is already registered."
        )

    new_user = User(
        full_name=body.full_name,
        email=body.email,
        password=generate_hashed_password(body.password),
        role=body.role,
        # profile_image=body.profile_image,
        is_active=body.is_active,
        is_verified=body.is_verified
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def login_user(body: UserLoginSchema, db: Session):
    """
    Authenticate a user and generate access and refresh tokens.
    """
    existing_user = (
        db.query(User)
        .filter(User.email == body.email)
        .first()
    )

    if not existing_user:
        raise HTTPException(
            status_code=404,
            detail="Email is not registered."
        )

    verify_password = bcrypt.checkpw(
        body.password.encode("utf-8"),
        existing_user.password.encode("utf-8")
    )

    if not verify_password:
        raise HTTPException(
            status_code=401,
            detail="Invalid password."
        )

    access_token = create_access_token(existing_user)
    refresh_token = create_refresh_token(existing_user)

    return {
        "token": access_token,
        "refresh_token": refresh_token
    }


def refresh_access_token(refresh_token: str):
    """
    Validate a refresh token and generate a new access token.
    """
    try:
        payload = jwt.decode(
            refresh_token,
            setting.JWT_SECRET_KEY,
            algorithms=setting.JWT_ALGORITHM
        )

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token."
            )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token."
            )

    except:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired refresh token."
        )

    new_access_token = create_access_token(user_id)

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }
