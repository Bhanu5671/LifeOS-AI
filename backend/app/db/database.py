
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,declarative_base
from app.core.config import setting

Base=declarative_base()

engine=create_engine(url=setting.DATABASE_URL, pool_pre_ping=True, pool_recycle=300)

LocalSession=sessionmaker(bind=engine)

def get_db():
    session=LocalSession()
    try:
        yield session
    finally:
        session.close()