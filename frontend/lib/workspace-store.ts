'use client'

import useSWR from 'swr'
import { toast } from 'sonner'
import { initialData, type Category, type Goal, type Habit, type Task, type Transaction, type WorkspaceData } from './demo-data'
import { api, apiErrorMessage, isBackendConnected, type ApiCategory, type ApiGoal, type ApiHabit, type ApiTask, type ApiTransaction } from './api'

const emptyData: WorkspaceData = {
  ...initialData,
  tasks: [],
  transactions: [],
  categories: [],
  habits: [],
  goals: [],
  budgets: [],
  conversations: [],
  overview: undefined,
}

function localDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function categoryColor(index: number) {
  return ['purple', 'blue', 'green', 'amber', 'gray'][index % 5]
}

function mapCategories(items: ApiCategory[]): Category[] {
  return items.map((category, index) => ({
    ...category,
    color: categoryColor(index),
    system: false,
  }))
}

function mapTask(task: ApiTask, categories: Category[]): Task {
  const dueDate = task.due_date ?? ''
  const category = categories.find(item => item.id === task.category_id)
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? '',
    priority: task.priority,
    status: task.status,
    category: category?.name ?? 'Unknown category',
    date: dueDate.slice(0, 10),
    time: dueDate.includes('T') ? dueDate.slice(11, 16) : '',
  }
}

function mapTransaction(transaction: ApiTransaction, categories: Category[]): Transaction {
  const category = categories.find(item => item.id === transaction.category_id)
  return {
    id: transaction.id,
    title: transaction.title,
    description: transaction.description ?? '',
    category: category?.name ?? 'Unknown category',
    date: (transaction.transaction_date ?? transaction.created_at ?? '').slice(0, 10),
    type: transaction.type,
    amount: Number(transaction.amount),
  }
}

function mapHabit(habit: ApiHabit, completedToday: Set<string>): Habit {
  return {
    id: habit.id,
    title: habit.title,
    description: habit.description ?? '',
    category: 'General',
    frequency: habit.frequency,
    targetCount: habit.target_count,
    isActive: habit.is_active === 'Active',
    startDate: habit.start_date,
    done: completedToday.has(habit.id),
    streak: 0,
    longest: 0,
    days: [],
  }
}

function mapGoal(goal: ApiGoal): Goal {
  return {
    id: goal.id,
    title: goal.title,
    description: goal.description ?? '',
    date: goal.target_date.slice(0, 10),
    category: goal.category,
    status: goal.status,
    progress: goal.progress,
    milestones: [],
  }
}

async function loadWorkspace(): Promise<WorkspaceData> {
  const [user, categoryRecords] = await Promise.all([api.user.me(), api.categories.list()])
  const categories = mapCategories(categoryRecords)
  const [tasks, transactions, habits, goals, overview, habitStats] = await Promise.all([
    api.tasks.list(),
    api.transactions.list(),
    api.habits.list(),
    api.goals.list(),
    api.dashboard.overview(),
    api.dashboard.habits(),
  ])
  const completedToday = new Set(habitStats.today_habit_completions.map(log => log.habit_id))

  return {
    ...emptyData,
    tasks: tasks.map(task => mapTask(task, categories)),
    transactions: transactions.map(transaction => mapTransaction(transaction, categories)),
    categories,
    habits: habits.map(habit => mapHabit(habit, completedToday)),
    goals: goals.map(mapGoal),
    profile: { ...emptyData.profile, name: user.full_name, email: user.email },
    overview,
  }
}

function findCategoryId(name: string, categories: Category[]) {
  const category = categories.find(item => item.name === name)
  if (!category) throw new Error(`Create or select a valid category for "${name}" before saving.`)
  return category.id
}

function taskPayload(task: Task, categories: Category[]): Omit<ApiTask, 'id'> {
  if (!task.date || !task.time) throw new Error('Choose a due date and time before saving this task.')
  return {
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    due_date: `${task.date}T${task.time}:00`,
    category_id: findCategoryId(task.category, categories),
    completed_at: task.status === 'Completed' ? new Date().toISOString() : null,
  }
}

function transactionPayload(transaction: Transaction, categories: Category[]): Omit<ApiTransaction, 'id' | 'transaction_date' | 'created_at'> {
  return {
    category_id: findCategoryId(transaction.category, categories),
    title: transaction.title,
    amount: transaction.amount,
    type: transaction.type,
    description: transaction.description ?? '',
  }
}

function habitPayload(habit: Habit): Omit<ApiHabit, 'id'> {
  return {
    title: habit.title,
    description: habit.description,
    frequency: habit.frequency ?? 'Daily',
    target_count: habit.targetCount ?? 1,
    is_active: habit.isActive === false ? 'Inactive' : 'Active',
    start_date: habit.startDate ?? null,
    end_date: null,
  }
}

function goalPayload(goal: Goal): Omit<ApiGoal, 'id'> {
  return {
    title: goal.title,
    description: goal.description,
    category: goal.category ?? 'Personal',
    target_date: `${goal.date}T00:00:00`,
    status: goal.status ?? 'Not Started',
    progress: goal.progress ?? 0,
  }
}

type Identified = { id: string }

async function syncItems<T extends Identified>(
  before: T[],
  after: T[],
  operations: {
    create: (item: T) => Promise<unknown>
    update: (id: string, item: T) => Promise<unknown>
    remove: (id: string) => Promise<unknown>
  },
) {
  const oldItems = new Map(before.map(item => [item.id, item]))
  const newItems = new Map(after.map(item => [item.id, item]))
  const calls: Promise<unknown>[] = []
  for (const [id, item] of newItems) {
    const old = oldItems.get(id)
    if (!old) calls.push(operations.create(item))
    else if (JSON.stringify(old) !== JSON.stringify(item)) calls.push(operations.update(id, item))
  }
  for (const id of oldItems.keys()) if (!newItems.has(id)) calls.push(operations.remove(id))
  await Promise.all(calls)
}

async function syncChanges(prev: WorkspaceData, next: WorkspaceData) {
  if (prev.categories !== next.categories) {
    await syncItems(prev.categories, next.categories, {
      create: category => api.categories.create({ name: category.name, type: category.type }),
      update: (id, category) => api.categories.update(id, { name: category.name, type: category.type }),
      remove: id => api.categories.remove(id),
    })
  }
  const calls: Promise<unknown>[] = []
  if (prev.tasks !== next.tasks) {
    calls.push(syncItems(prev.tasks, next.tasks, {
      create: task => api.tasks.create(taskPayload(task, next.categories)),
      update: (id, task) => api.tasks.update(id, taskPayload(task, next.categories)),
      remove: id => api.tasks.remove(id),
    }))
  }
  if (prev.transactions !== next.transactions) {
    calls.push(syncItems(prev.transactions, next.transactions, {
      create: transaction => api.transactions.create(transactionPayload(transaction, next.categories)),
      update: (id, transaction) => api.transactions.update(id, transactionPayload(transaction, next.categories)),
      remove: id => api.transactions.remove(id),
    }))
  }
  if (prev.habits !== next.habits) {
    const oldHabits = new Map(prev.habits.map(habit => [habit.id, habit]))
    const nextHabits = new Map(next.habits.map(habit => [habit.id, habit]))
    for (const [id, habit] of nextHabits) {
      const old = oldHabits.get(id)
      if (!old) calls.push(api.habits.create(habitPayload(habit)))
      else if (!old.done && habit.done) calls.push(api.habits.complete(id, new Date().toISOString()))
      else if (old.done && !habit.done) throw new Error('The backend does not provide an endpoint to undo a habit completion.')
      else if (JSON.stringify({ ...old, done: false }) !== JSON.stringify({ ...habit, done: false })) {
        calls.push(api.habits.update(id, habitPayload(habit)))
      }
    }
    for (const id of oldHabits.keys()) if (!nextHabits.has(id)) calls.push(api.habits.remove(id))
  }
  if (prev.goals !== next.goals) {
    calls.push(syncItems(prev.goals, next.goals, {
      create: goal => api.goals.create(goalPayload(goal)),
      update: (id, goal) => api.goals.update(id, goalPayload(goal)),
      remove: id => api.goals.remove(id),
    }))
  }
  await Promise.all(calls)
}

export function useWorkspace() {
  const { data = isBackendConnected ? emptyData : initialData, mutate, isLoading, error } = useSWR<WorkspaceData>(
    'lifeos-workspace',
    isBackendConnected ? loadWorkspace : null,
    {
      fallbackData: isBackendConnected ? emptyData : initialData,
      revalidateOnFocus: false,
      onError: reason => toast.error('Could not load your workspace', { description: apiErrorMessage(reason) }),
    },
  )

  const update = async (fn: (current: WorkspaceData) => WorkspaceData) => {
    const prev = data
    const next = fn(prev)
    mutate(next, { revalidate: false })
    if (!isBackendConnected) return true
    const hasBackendChanges = prev.categories !== next.categories
      || prev.tasks !== next.tasks
      || prev.transactions !== next.transactions
      || prev.habits !== next.habits
      || prev.goals !== next.goals
    if (!hasBackendChanges) return true
    try {
      await syncChanges(prev, next)
      await mutate()
      return true
    } catch (reason) {
      mutate(prev, { revalidate: false })
      toast.error('Changes were not saved', { description: apiErrorMessage(reason) })
      return false
    }
  }

  const money = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: data.profile.currency, maximumFractionDigits: 0 }).format(value)
  const expenses = data.overview?.total_expense ?? data.transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0)
  const income = data.overview?.total_income ?? data.transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0)
  const spending = data.overview?.expense_breakdown.map((item, index) => ({
    name: item.category,
    value: Number(item.total_amount),
    color: categoryColor(index),
  })) ?? data.categories
    .filter(category => category.type === 'Expense')
    .map(category => ({
      name: category.name,
      value: data.transactions.filter(transaction => transaction.category === category.name && transaction.type === 'Expense').reduce((sum, transaction) => sum + transaction.amount, 0),
      color: category.color,
    }))
    .filter(category => category.value > 0)

  return { data, update, money, expenses, income, spending, isLoading, error, isBackendConnected }
}
