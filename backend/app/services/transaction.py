
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.schemas.TransactionSchema import (
    TransactionSchema,
    TransactionUpdatedSchema
)
from app.models.transaction import Transaction


def create_transaction(body: TransactionSchema, user, db: Session):
    """
    Create a new transaction for the authenticated user.
    """
    try:
        new_transaction = Transaction(
            user_id=user.id,
            category_id=body.category_id,
            title=body.title,
            amount=body.amount,
            type=body.type,
            description=body.description
        )

        db.add(new_transaction)
        db.commit()
        db.refresh(new_transaction)

        return {
            "message": "Transaction created successfully.",
            "transaction": new_transaction
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create transaction: {str(error)}"
        )


def get_all_transactions(user, db: Session):
    """
    Retrieve all transactions belonging to the authenticated user.
    """
    try:
        all_transactions = (
            db.query(Transaction)
            .filter(Transaction.user_id == user.id)
            .all()
        )

        return {
            "message": "Transactions retrieved successfully.",
            "transactions": all_transactions
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve transactions: {str(error)}"
        )


def get_transaction_by_id(id: str, user, db: Session):
    """
    Retrieve a specific transaction by its ID.
    """
    try:
        transaction = (
            db.query(Transaction)
            .filter(
                Transaction.id == id,
                Transaction.user_id == user.id
            )
            .first()
        )

        return {
            "message": "Transaction retrieved successfully.",
            "transaction": transaction
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve transaction: {str(error)}"
        )


def update_transaction(
    id: str,
    body: TransactionUpdatedSchema,
    user,
    db: Session
):
    """
    Update an existing transaction belonging to the authenticated user.
    """
    try:
        transaction = (
            db.query(Transaction)
            .filter(
                Transaction.id == id,
                Transaction.user_id == user.id
            )
            .first()
        )
        
        if not transaction:
            raise HTTPException(
                status_code=404,
                detail="Transaction not found."
            )

        update_info = body.model_dump(exclude_unset=True)

        for key, value in update_info.items():
            setattr(transaction, key, value)

        db.commit()
        db.refresh(transaction)

        return {
            "message": "Transaction updated successfully.",
            "transaction": transaction
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update transaction: {str(error)}"
        )


def delete_transaction(id: str, user, db: Session):
    """
    Delete an existing transaction belonging to the authenticated user.
    """
    try:
        transaction = (
            db.query(Transaction)
            .filter(
                Transaction.id == id,
                Transaction.user_id == user.id
            )
            .first()
        )
        
        if not transaction:
            raise HTTPException(
                status_code=404,
                detail="Transaction not found."
            )

        db.delete(transaction)
        db.commit()

        return {
            "message": "Transaction deleted successfully."
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete transaction: {str(error)}"
        )
