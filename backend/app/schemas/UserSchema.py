
from pydantic import BaseModel


class UserRegisterSchema(BaseModel):
    full_name:str
    email:str
    password:str
    # profile_image:str
    is_active:bool
    role:str
    is_verified:bool
    
    
class UserLoginSchema(BaseModel):
    email:str
    password:str