
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.middlewares.auth import get_current_user
from app.services.category import (
    create_category,
    get_categories,
    get_category_by_id,
    update_category,
    delete_category
)
from app.schemas.CategorySchema import CategorySchema, CategoryUpdateSchema
from app.db.database import get_db


categories_router = APIRouter()


@categories_router.post(
    "/categories",
    summary="Create a new category",
    description="Create a new category for the authenticated user."
)
def create_category_route(
    body: CategorySchema,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_category(body, user, db)


@categories_router.get(
    "/categories",
    summary="Get all categories",
    description="Retrieve all categories belonging to the authenticated user."
)
def get_categories_route(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_categories(user, db)


@categories_router.get(
    "/categories/{id}",
    summary="Get category by ID",
    description="Retrieve a specific category using its ID."
)
def get_category_by_id_route(
    id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_category_by_id(id, user, db)


@categories_router.put(
    "/categories/{id}",
    summary="Update a category",
    description="Update an existing category belonging to the authenticated user."
)
def update_category_route(
    id: str,
    body: CategoryUpdateSchema,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_category(body, id, user, db)


@categories_router.delete(
    "/categories/{id}",
    summary="Delete a category",
    description="Delete an existing category using its ID."
)
def delete_category_route(
    id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return delete_category(id, user, db)
