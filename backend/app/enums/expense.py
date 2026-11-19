
from enum import Enum


class ExpenseType(str,Enum):
    INCOME = "Income"
    EXPENSE = "Expense"