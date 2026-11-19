export type Priority = 'High' | 'Medium' | 'Low'
export type Status = 'Pending' | 'In Progress' | 'Completed'
export type Task = { id: string; title: string; description: string; priority: Priority; status: Status; category: string; date: string; time: string }
export type Transaction = { id: string; title: string; description?: string; category: string; date: string; type: 'Income' | 'Expense'; amount: number }
export type Category = { id: string; name: string; type: 'Income' | 'Expense'; color: string; system?: boolean }
export type Habit = { id: string; title: string; description: string; category: string; frequency?: 'Daily' | 'Weekly'; targetCount?: number; isActive?: boolean; startDate?: string | null; done: boolean; streak: number; longest: number; days: boolean[] }
export type Goal = { id: string; title: string; description: string; date: string; category?: 'Career' | 'Finance' | 'Health' | 'Personal'; status?: 'Not Started' | 'In Progress' | 'Completed' | 'Cancelled'; progress?: number; milestones: { title: string; done: boolean }[] }
export type WorkspaceOverview = {
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
export type Budget = { id: string; category: string; amount: number }
export type ChatMessage = { role: 'user' | 'assistant'; content: string }
export type Conversation = { id: string; title: string; messages: ChatMessage[] }
export type WorkspaceData = { tasks: Task[]; transactions: Transaction[]; categories: Category[]; habits: Habit[]; goals: Goal[]; budgets: Budget[]; conversations: Conversation[]; profile: { name: string; email: string; currency: string; timezone: string; notifications: boolean; reminders: boolean }; overview?: WorkspaceOverview }
export const DEMO_DATE = '2026-11-16'
export const initialData: WorkspaceData = {
  tasks: [
    { id: 't1', title: 'Finish website redesign', description: 'Finalize the homepage and responsive layouts for the client review.', priority: 'High', status: 'In Progress', category: 'Work', date: DEMO_DATE, time: '10:00' },
    { id: 't2', title: 'Review monthly budget', description: 'Check subscriptions and set aside savings for the month.', priority: 'Medium', status: 'Pending', category: 'Personal', date: DEMO_DATE, time: '12:30' },
    { id: 't3', title: 'Read 20 pages', description: 'Continue reading Atomic Habits.', priority: 'Low', status: 'Completed', category: 'Learning', date: DEMO_DATE, time: '08:00' },
    { id: 't4', title: 'Prepare project presentation', description: 'Bring together research, wireframes, and next steps.', priority: 'High', status: 'Pending', category: 'Work', date: DEMO_DATE, time: '15:00' },
    { id: 't5', title: '30-minute evening workout', description: 'Strength training and a short stretch.', priority: 'Medium', status: 'Pending', category: 'Health', date: DEMO_DATE, time: '18:00' },
    { id: 't6', title: 'Schedule annual health checkup', description: 'Book a convenient appointment for next week.', priority: 'High', status: 'Pending', category: 'Health', date: '2026-11-18', time: '09:00' },
    { id: 't7', title: 'Plan the weekend trip', description: 'Compare places to stay and plan a walking route.', priority: 'Low', status: 'Pending', category: 'Personal', date: '2026-11-20', time: '17:00' },
    ...['Morning meditation', 'Send project proposal', 'Weekly grocery shopping', 'Update portfolio', 'Pay electricity bill', 'Complete React lesson', 'Call family', 'Organize workspace', 'Review design feedback', 'Prepare meal plan', 'Back up project files', 'Morning walk', 'Renew gym membership', 'Write journal entry', 'Team standup', 'Sort email inbox', 'Water the plants'].map((title, i): Task => ({ id: `t${i + 8}`, title, description: 'Completed as part of this month’s personal plan.', priority: 'Low', status: 'Completed', category: ['Personal', 'Work', 'Health'][i % 3], date: `2026-11-${String(15 - (i % 12)).padStart(2, '0')}`, time: '09:00' })),
  ],
  transactions: [
    { id: 'x1', title: 'November salary', category: 'Salary', type: 'Income', amount: 7500, date: '2026-11-01' },
    { id: 'x2', title: 'Freelance design project', category: 'Freelance', type: 'Income', amount: 1000, date: '2026-11-10' },
    { id: 'x3', title: 'Apartment rent', category: 'Housing', type: 'Expense', amount: 950, date: '2026-11-01' },
    { id: 'x4', title: 'Weekly groceries', category: 'Food & Dining', type: 'Expense', amount: 245, date: '2026-11-14' },
    { id: 'x5', title: 'Dinner with friends', category: 'Food & Dining', type: 'Expense', amount: 185, date: '2026-11-13' },
    { id: 'x6', title: 'Coffee & lunch', category: 'Food & Dining', type: 'Expense', amount: 190, date: '2026-11-16' },
    { id: 'x7', title: 'New running shoes', category: 'Shopping', type: 'Expense', amount: 320, date: '2026-11-12' },
    { id: 'x8', title: 'Monthly transit pass', category: 'Transport', type: 'Expense', amount: 180, date: '2026-11-02' },
    { id: 'x9', title: 'Fuel refill', category: 'Transport', type: 'Expense', amount: 80, date: '2026-11-09' },
    { id: 'x10', title: 'Internet & utilities', category: 'Other', type: 'Expense', amount: 210, date: '2026-11-05' },
    { id: 'x11', title: 'Streaming subscriptions', category: 'Other', type: 'Expense', amount: 90, date: '2026-11-06' },
  ],
  categories: ['Housing', 'Food & Dining', 'Shopping', 'Transport', 'Other', 'Salary', 'Freelance'].map((name, i) => ({ id: `c${i}`, name, type: i > 4 ? 'Income' : 'Expense', color: ['purple', 'blue', 'green', 'amber', 'gray'][i % 5], system: true })),
  habits: [
    { id: 'h1', title: 'Morning meditation', description: '10 minutes of mindfulness', category: 'Mindfulness', done: true, streak: 12, longest: 21, days: [true, true, true, true, true, true, true] },
    { id: 'h2', title: 'Read 20 pages', description: 'A little learning, every day', category: 'Learning', done: true, streak: 7, longest: 14, days: [true, true, true, true, true, true, true] },
    { id: 'h3', title: 'Drink 2L of water', description: 'Stay hydrated throughout the day', category: 'Health', done: false, streak: 5, longest: 18, days: [true, false, true, true, true, true, false] },
    { id: 'h4', title: 'Exercise for 30 minutes', description: 'Move your body, clear your mind', category: 'Health', done: false, streak: 3, longest: 12, days: [true, true, false, true, true, true, false] },
    { id: 'h5', title: 'Write in my journal', description: 'Make a little space for reflection', category: 'Mindfulness', done: true, streak: 9, longest: 16, days: [true, true, true, true, true, true, true] },
    { id: 'h6', title: 'Wake up before 7 AM', description: 'Start the day with intention', category: 'Lifestyle', done: true, streak: 6, longest: 10, days: [false, true, true, true, true, true, true] },
  ],
  goals: [
    { id: 'g1', title: 'Build an emergency fund', description: 'Create a financial safety net for the things that matter.', date: '2026-12-31', milestones: [{ title: 'Save the first $1,000', done: true }, { title: 'Reach $2,500 in savings', done: true }, { title: 'Reach $4,000 in savings', done: true }, { title: 'Reach the $5,000 target', done: false }] },
    { id: 'g2', title: 'Read 12 books this year', description: 'One good book each month, one new perspective at a time.', date: '2026-12-31', milestones: [{ title: 'Read the first 3 books', done: true }, { title: 'Finish 6 books', done: true }, { title: 'Finish 9 books', done: false }, { title: 'Complete all 12 books', done: false }] },
    { id: 'g3', title: 'Launch my portfolio', description: 'Build a thoughtful home for my best creative work.', date: '2026-11-30', milestones: [{ title: 'Choose featured projects', done: true }, { title: 'Finish the visual design', done: true }, { title: 'Build the website', done: false }, { title: 'Publish and share', done: false }] },
  ],
  budgets: [{ id: 'b1', category: 'Housing', amount: 1000 }, { id: 'b2', category: 'Food & Dining', amount: 700 }, { id: 'b3', category: 'Shopping', amount: 400 }, { id: 'b4', category: 'Transport', amount: 400 }, { id: 'b5', category: 'Other', amount: 500 }],
  conversations: [],
  profile: { name: 'Bhanu', email: 'bhanu@example.com', currency: 'USD', timezone: 'Asia/Kolkata', notifications: true, reminders: true },
}
export const weeklyData = [ { day: 'Mon', completed: 5, planned: 8 }, { day: 'Tue', completed: 8, planned: 10 }, { day: 'Wed', completed: 6, planned: 9 }, { day: 'Thu', completed: 9, planned: 12 }, { day: 'Fri', completed: 7, planned: 10 }, { day: 'Sat', completed: 4, planned: 7 }, { day: 'Sun', completed: 6, planned: 9 } ]
export const monthlyData = [ { month: 'Jun', income: 6500, expenses: 3200 }, { month: 'Jul', income: 7200, expenses: 2800 }, { month: 'Aug', income: 6800, expenses: 3500 }, { month: 'Sep', income: 8000, expenses: 2900 }, { month: 'Oct', income: 7800, expenses: 2710 } ]
