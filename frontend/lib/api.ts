import axios, { isAxiosError, type InternalAxiosRequestConfig } from 'axios'

export const isBackendConnected = Boolean(process.env.NEXT_PUBLIC_API_URL)

const API_PREFIX = '/api/v1'
export const endpoints = {
  user: `${API_PREFIX}/user`,
  task: `${API_PREFIX}/task`,
  transaction: `${API_PREFIX}/transaction`,
  category: `${API_PREFIX}/category`,
  habit: `${API_PREFIX}/habit`,
  goal: `${API_PREFIX}/goal`,
  dashboard: `${API_PREFIX}/dashboard`,
} as const

const TOKEN_KEY = 'lifeos_token'
const REFRESH_TOKEN_KEY = 'lifeos_refresh_token'

export const authToken = {
  get: () => (typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_KEY) ?? window.sessionStorage.getItem(TOKEN_KEY)),
  getRefresh: () => (typeof window === 'undefined' ? null : window.localStorage.getItem(REFRESH_TOKEN_KEY) ?? window.sessionStorage.getItem(REFRESH_TOKEN_KEY)),
  set: (token: string, refreshToken: string, remember: boolean) => {
    const storage = remember ? window.localStorage : window.sessionStorage
    const otherStorage = remember ? window.sessionStorage : window.localStorage
    storage.setItem(TOKEN_KEY, token)
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    otherStorage.removeItem(TOKEN_KEY)
    otherStorage.removeItem(REFRESH_TOKEN_KEY)
  },
  replaceAccess: (token: string) => {
    const storage = window.localStorage.getItem(REFRESH_TOKEN_KEY) ? window.localStorage : window.sessionStorage
    storage.setItem(TOKEN_KEY, token)
  },
  clear: () => {
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.removeItem(REFRESH_TOKEN_KEY)
    window.sessionStorage.removeItem(TOKEN_KEY)
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use(config => {
  if (!config.baseURL) throw new Error('The FastAPI backend is not connected. Set NEXT_PUBLIC_API_URL (e.g. http://localhost:8000).')
  const token = authToken.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

client.interceptors.response.use(undefined, async error => {
  const config = error.config as RetryConfig | undefined
  if (isAxiosError(error) && error.response?.status === 401 && config && !config._retry && !config.url?.includes('/user/refresh')) {
    const refreshToken = authToken.getRefresh()
    if (refreshToken) {
      config._retry = true
      try {
        const { data } = await client.post<{ access_token: string; token_type: string }>(
          `${endpoints.user}/refresh`,
          null,
          { params: { refresh_token: refreshToken } },
        )
        authToken.replaceAccess(data.access_token)
        config.headers.Authorization = `Bearer ${data.access_token}`
        return client(config)
      } catch {
        authToken.clear()
      }
    }

    authToken.clear()
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login'
    }
  }
  return Promise.reject(error)
})

export function apiErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg as string
    return error.message
  }
  return error instanceof Error ? error.message : 'Something went wrong.'
}

export type User = { id: string; full_name: string; email: string; role?: string }
export type ApiTask = {
  id: string
  title: string
  description: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'Pending' | 'In Progress' | 'Completed'
  due_date: string | null
  category_id: string
  completed_at: string | null
}
export type ApiTransaction = {
  id: string
  category_id: string
  title: string
  amount: number | string
  type: 'Income' | 'Expense'
  description: string
  transaction_date?: string
  created_at?: string
}
export type ApiCategory = { id: string; name: string; type: 'Income' | 'Expense' }
export type ApiHabit = {
  id: string
  title: string
  description: string
  frequency: 'Daily' | 'Weekly'
  target_count: number
  is_active: 'Active' | 'Inactive'
  start_date: string | null
  end_date: string | null
}
export type ApiGoal = {
  id: string
  title: string
  description: string
  category: 'Career' | 'Finance' | 'Health' | 'Personal'
  target_date: string
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Cancelled'
  progress: number
}
export type DashboardOverview = {
  total_tasks: number
  completed_tasks: number
  active_goals: number
  average_goal_progress: number
  active_habits: number
  today_habit_completions: number
  total_income: number
  total_expense: number
  balance: number
  expense_breakdown: { category: string; total_amount: number }[]
}
export type DashboardHabitData = {
  active_habits: ApiHabit[]
  today_habit_completions: { habit_id: string; completed_date: string }[]
  habit_completion_counts: { habit_id: string; total_completions: number }[]
}

type ListResponse<K extends string, T> = Record<K, T[]>
type ItemResponse<K extends string, T> = Record<K, T>

function collection<T, K extends string>(data: ListResponse<K, T>, key: K): T[] {
  const items = data[key]
  if (!Array.isArray(items)) throw new Error(`The backend response did not include a "${key}" list.`)
  return items
}

function item<T, K extends string>(data: ItemResponse<K, T>, key: K): T {
  const result = data[key]
  if (!result || typeof result !== 'object') throw new Error(`The backend response did not include a "${key}" record.`)
  return result
}

export const api = {
  user: {
    register: async (data: { full_name: string; email: string; password: string }) => {
      const { data: user } = await client.post<User>(`${endpoints.user}/create`, {
        ...data,
        is_active: true,
        role: 'user',
        is_verified: false,
      })
      return user
    },
    login: async (email: string, password: string, remember = false) => {
      const { data } = await client.post<{ token: string; refresh_token: string }>(
        `${endpoints.user}/login`,
        { email, password },
      )
      authToken.set(data.token, data.refresh_token, remember)
      return data
    },
    me: async () => {
      const { data } = await client.get<{ user: User }>(`${endpoints.user}/me`)
      return data.user
    },
    logout: () => authToken.clear(),
  },
  tasks: {
    list: async (page = 1) => {
      const { data } = await client.get<ListResponse<'tasks', ApiTask>>(`${endpoints.task}/tasks`, { params: { page } })
      return collection(data, 'tasks')
    },
    create: async (payload: Omit<ApiTask, 'id'>) => {
      const { data } = await client.post<ItemResponse<'task', ApiTask>>(`${endpoints.task}/tasks`, payload)
      return item(data, 'task')
    },
    update: async (id: string, payload: Partial<Omit<ApiTask, 'id'>>) => {
      const { data } = await client.put<ItemResponse<'task', ApiTask>>(`${endpoints.task}/tasks/${encodeURIComponent(id)}`, payload)
      return item(data, 'task')
    },
    remove: async (id: string) => { await client.delete(`${endpoints.task}/tasks/${encodeURIComponent(id)}`) },
  },
  transactions: {
    list: async () => {
      const { data } = await client.get<ListResponse<'transactions', ApiTransaction>>(`${endpoints.transaction}/expenses`)
      return collection(data, 'transactions')
    },
    create: async (payload: Omit<ApiTransaction, 'id' | 'transaction_date' | 'created_at'>) => {
      const { data } = await client.post<ItemResponse<'transaction', ApiTransaction>>(`${endpoints.transaction}/expenses`, payload)
      return item(data, 'transaction')
    },
    update: async (id: string, payload: Partial<Omit<ApiTransaction, 'id' | 'transaction_date' | 'created_at'>>) => {
      const { data } = await client.put<ItemResponse<'transaction', ApiTransaction>>(`${endpoints.transaction}/expenses/${encodeURIComponent(id)}`, payload)
      return item(data, 'transaction')
    },
    remove: async (id: string) => { await client.delete(`${endpoints.transaction}/expenses/${encodeURIComponent(id)}`) },
  },
  categories: {
    list: async () => {
      const { data } = await client.get<ListResponse<'categories', ApiCategory>>(`${endpoints.category}/categories`)
      return collection(data, 'categories')
    },
    create: async (payload: Omit<ApiCategory, 'id'>) => {
      const { data } = await client.post<ItemResponse<'category', ApiCategory>>(`${endpoints.category}/categories`, payload)
      return item(data, 'category')
    },
    update: async (id: string, payload: Partial<Omit<ApiCategory, 'id'>>) => {
      const { data } = await client.put<ItemResponse<'category', ApiCategory>>(`${endpoints.category}/categories/${encodeURIComponent(id)}`, payload)
      return item(data, 'category')
    },
    remove: async (id: string) => { await client.delete(`${endpoints.category}/categories/${encodeURIComponent(id)}`) },
  },
  habits: {
    list: async () => {
      const { data } = await client.get<ListResponse<'habits', ApiHabit>>(`${endpoints.habit}/habits`)
      return collection(data, 'habits')
    },
    create: async (payload: Omit<ApiHabit, 'id'>) => {
      const { data } = await client.post<ItemResponse<'habit', ApiHabit>>(`${endpoints.habit}/habits`, payload)
      return item(data, 'habit')
    },
    update: async (id: string, payload: Partial<Omit<ApiHabit, 'id'>>) => {
      const { data } = await client.put<ItemResponse<'habit', ApiHabit>>(`${endpoints.habit}/habits/${encodeURIComponent(id)}`, payload)
      return item(data, 'habit')
    },
    remove: async (id: string) => { await client.delete(`${endpoints.habit}/habits/${encodeURIComponent(id)}`) },
    complete: async (id: string, completedDate: string) => {
      const { data } = await client.post(`${endpoints.habit}/habits/${encodeURIComponent(id)}/logs`, { completed_date: completedDate })
      return data
    },
  },
  goals: {
    list: async () => {
      const { data } = await client.get<ListResponse<'goals', ApiGoal>>(`${endpoints.goal}/goals`)
      return collection(data, 'goals')
    },
    create: async (payload: Omit<ApiGoal, 'id'>) => {
      const { data } = await client.post<ItemResponse<'goal', ApiGoal>>(`${endpoints.goal}/goals`, payload)
      return item(data, 'goal')
    },
    update: async (id: string, payload: Partial<Omit<ApiGoal, 'id'>>) => {
      const { data } = await client.put<ItemResponse<'goal', ApiGoal>>(`${endpoints.goal}/goals/${encodeURIComponent(id)}`, payload)
      return item(data, 'goal')
    },
    remove: async (id: string) => { await client.delete(`${endpoints.goal}/goals/${encodeURIComponent(id)}`) },
  },
  dashboard: {
    overview: async () => (await client.get<DashboardOverview>(`${endpoints.dashboard}/overview`)).data,
    habits: async () => (await client.get<DashboardHabitData>(`${endpoints.dashboard}/habits`)).data,
  },
}
