

from pydantic_settings import BaseSettings,SettingsConfigDict



class Settings(BaseSettings):
    model_config=SettingsConfigDict(env_file=".env", extra="ignore")
    DATABASE_URL:str
    APP_NAME:str
    SECRET_KEY:str
    JWT_ALGORITHM:str
    JWT_EXPIRATION_MINUTES:int
    JWT_SECRET_KEY:str
    JWT_REFRESH_EXPIRATION_DAYS:int
    
    
setting=Settings()