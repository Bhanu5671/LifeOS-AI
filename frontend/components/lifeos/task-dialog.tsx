'use client'

import { z } from 'zod'
import { toast } from 'sonner'
import { FormDialog } from './form-dialog'
import { useWorkspace } from '@/lib/workspace-store'
import { DEMO_DATE, type Task } from '@/lib/demo-data'
import { isBackendConnected } from '@/lib/api'

const schema = z.object({
  title: z.string().trim().min(2, 'Add a title with at least 2 characters.').max(80, 'Keep the title under 80 characters.'),
  description: z.string().max(240, 'Keep the description under 240 characters.'),
  priority: z.enum(['High', 'Medium', 'Low']),
  status: z.enum(['Pending', 'In Progress', 'Completed']),
  category: z.string().min(1, 'Choose a category.'),
  date: z.string().min(1, 'Choose a due date.'),
  time: z.string().min(1, 'Choose a due time.'),
})

export function TaskDialog({ open, onOpenChange, task, defaultDate = DEMO_DATE }: { open: boolean; onOpenChange: (open: boolean) => void; task?: Task | null; defaultDate?: string }) {
  const { data, update } = useWorkspace()
  const today = new Date()
  const defaultTaskDate = isBackendConnected
    ? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    : defaultDate
  return <FormDialog open={open} onOpenChange={onOpenChange} schema={schema}
    title={task ? 'Edit task' : 'Create a new task'} description={task ? 'Update the details for this task.' : 'Add something you want to get done.'}
    submitLabel={task ? 'Save changes' : 'Create task'}
    defaults={task ?? { title: '', description: '', priority: 'Medium', status: 'Pending', category: data.categories[0]?.name ?? '', date: defaultTaskDate, time: '10:00' }}
    fields={[
      { name: 'title', label: 'Task title', placeholder: 'e.g. Prepare client presentation', full: true },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Add a few helpful details' },
      { name: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'] },
      { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'In Progress', 'Completed'] },
      { name: 'category', label: 'Category', type: 'select', options: data.categories.map(category => category.name), full: true },
      { name: 'date', label: 'Due date', type: 'date' },
      { name: 'time', label: 'Due time', type: 'time' },
    ]}
    onSubmit={async values => {
      const saved = await update(d => ({ ...d, tasks: task ? d.tasks.map(t => t.id === task.id ? { ...t, ...values } as Task : t) : [{ ...values, id: `new-${Date.now()}` } as Task, ...d.tasks] }))
      if (!saved) return false
      toast.success(task ? 'Task updated' : 'Task created', { description: values.title })
    }} />
}

export function useToggleTask() {
  const { update } = useWorkspace()
  return async (task: Task) => {
    const saved = await update(d => ({ ...d, tasks: d.tasks.map(t => t.id === task.id ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t) }))
    if (saved && task.status !== 'Completed') toast.success('Nice work!', { description: `${task.title} is complete.` })
  }
}

export function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number)
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}
export function formatDate(date: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', opts)
}
