import jwt
from datetime import datetime, timedelta, timezone
from app.core.config import setting

def create_access_token(existing_user):
    now=datetime.now(timezone.utc)
    
    jwtToken=jwt.encode({"sub":existing_user.id,"role":existing_user.role,"type":"access","exp":now + timedelta(minutes=setting.JWT_EXPIRATION_MINUTES),"iat":now},setting.JWT_SECRET_KEY,algorithm=setting.JWT_ALGORITHM)
        
    return jwtToken


def create_refresh_token(existing_user):
    now=datetime.now(timezone.utc)
    
    jwtRefreshToken=jwt.encode({"sub":existing_user.id,"role":existing_user.role,"type": "refresh","exp":now + timedelta(days=setting.JWT_REFRESH_EXPIRATION_DAYS),"iat":now},setting.JWT_SECRET_KEY,algorithm=setting.JWT_ALGORITHM)
    
    return jwtRefreshToken
