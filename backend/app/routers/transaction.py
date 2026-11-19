
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.services.transaction import (
    create_transaction,
    get_all_transactions,
    get_transaction_by_id,
    update_transaction,
    delete_transaction
)
from app.db.database import get_db
from app.middlewares.auth import get_current_user
from app.schemas.TransactionSchema import (
    TransactionSchema,
    TransactionUpdatedSchema
)


transaction_router = APIRouter()


@transaction_router.post(
    "/expenses",
    summary="Create a new transaction",
    description="Create a new expense or income transaction for the authenticated user."
)
def create_transaction_route(
    body: TransactionSchema,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_transaction(body, user, db)


@transaction_router.get(
    "/expenses",
    summary="Get all transactions",
    description="Retrieve all transactions belonging to the authenticated user."
)
def get_all_transactions_route(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_all_transactions(user, db)


@transaction_router.get(
    "/expenses/{id}",
    summary="Get transaction by ID",
    description="Retrieve a specific transaction using its ID."
)
def get_transaction_by_id_route(
    id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_transaction_by_id(id, user, db)


@transaction_router.put(
    "/expenses/{id}",
    summary="Update a transaction",
    description="Update an existing transaction belonging to the authenticated user."
)
def update_transaction_route(
    id: str,
    body: TransactionUpdatedSchema,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_transaction(id, body, user, db)


@transaction_router.delete(
    "/expenses/{id}",
    summary="Delete a transaction",
    description="Delete an existing transaction using its ID."
)
def delete_transaction_route(
    id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return delete_transaction(id, user, db)
