
from fastapi import FastAPI
from app.db.database import Base,engine
from app.routers.user import user_router
from app.routers.task import task_router
from app.routers.transaction import transaction_router
from app.routers.category import categories_router
from app.routers.habit import habit_router
from app.routers.goal import goal_router
from app.routers.dashboard import dashboard_router

from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(engine)

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, prefix="/api/v1/user",tags=["Users"])

app.include_router(task_router,prefix="/api/v1/task",tags=["tasks"])

app.include_router(transaction_router,prefix="/api/v1/transaction",tags=["transactions"])

app.include_router(categories_router,prefix="/api/v1/category",tags=["categories"])

app.include_router(habit_router,prefix="/api/v1/habit",tags=["habites"])

app.include_router(goal_router,prefix="/api/v1/goal", tags=["goals"])

app.include_router(dashboard_router, prefix="/api/v1/dashboard", tags=["dashboards"])

@app.get("/")
def read_root():
    return {"Hello": "World"}