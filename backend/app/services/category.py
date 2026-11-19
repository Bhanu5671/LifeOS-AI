
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.schemas.CategorySchema import CategorySchema, CategoryUpdateSchema
from app.models.category import Category


def create_category(body: CategorySchema, user, db: Session):
    """
    Create a new category for the authenticated user.
    """
    try:
        new_category = Category(
            user_id=user.id,
            name=body.name,
            type=body.type
        )

        db.add(new_category)
        db.commit()
        db.refresh(new_category)

        return {
            "message": "Category created successfully.",
            "category": new_category
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create category: {str(error)}"
        )


def get_categories(user, db: Session):
    """
    Retrieve all categories belonging to the authenticated user.
    """
    try:
        categories = (
            db.query(Category)
            .filter(Category.user_id == user.id)
            .all()
        )

        return {
            "message": "Categories retrieved successfully.",
            "categories": categories
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve categories: {str(error)}"
        )


def get_category_by_id(id: str, user, db: Session):
    """
    Retrieve a specific category by its ID.
    """
    try:
        one_category = (
            db.query(Category)
            .filter(
                Category.id == id,
                Category.user_id == user.id
            )
            .first()
        )

        return {
            "message": "Category retrieved successfully.",
            "category": one_category
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve category: {str(error)}"
        )


def update_category(
    body: CategoryUpdateSchema,
    id: str,
    user,
    db: Session
):
    """
    Update an existing category belonging to the authenticated user.
    """
    try:
        category = (
            db.query(Category)
            .filter(
                Category.id == id,
                Category.user_id == user.id
            )
            .first()
        )
        
        if not category:
            raise HTTPException(
                status_code=404,
                detail="Category not found."
            )

        updated_info = body.model_dump(exclude_unset=True)

        for key, value in updated_info.items():
            setattr(category, key, value)

        db.commit()
        db.refresh(category)

        return {
            "message": "Category updated successfully.",
            "category": category
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update category: {str(error)}"
        )


def delete_category(id: str, user, db: Session):
    """
    Delete an existing category belonging to the authenticated user.
    """
    try:
        category = (
            db.query(Category)
            .filter(
                Category.id == id,
                Category.user_id == user.id
            )
            .first()
        )
        
        if not category:
            raise HTTPException(
                status_code=404,
                detail="Category not found."
            )

        db.delete(category)
        db.commit()

        return {
            "message": "Category deleted successfully."
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete category: {str(error)}"
        )
