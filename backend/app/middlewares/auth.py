
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import jwt

from app.models.user import User
from app.db.database import get_db
from app.core.config import setting


bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        decoded_token = jwt.decode(
            token,
            setting.JWT_SECRET_KEY,
            algorithms=[setting.JWT_ALGORITHM]
        )

        user_id = decoded_token.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token."
            )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found."
        )

    return user
