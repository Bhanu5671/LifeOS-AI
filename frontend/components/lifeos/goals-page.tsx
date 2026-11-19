'use client'

import { useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Target, Trophy, CalendarDays, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { PageHeading, StatCard, NoResults, ConfirmDelete } from './shared'
import { FormDialog } from './form-dialog'
import { formatDate } from './task-dialog'
import { useWorkspace } from '@/lib/workspace-store'
import { DEMO_DATE, type Goal } from '@/lib/demo-data'
import { cn } from '@/lib/utils'

const schema = z.object({
  title: z.string().trim().min(3, 'Use at least 3 characters.').max(60),
  description: z.string().max(160, 'Keep it under 160 characters.'),
  date: z.string().min(1, 'Choose a target date.'),
  category: z.enum(['Career', 'Finance', 'Health', 'Personal']),
  status: z.enum(['Not Started', 'In Progress', 'Completed', 'Cancelled']),
  milestones: z.string().optional(),
})
const pctOf = (g: Goal) => g.progress ?? (g.milestones.length ? Math.round((g.milestones.filter(m => m.done).length / g.milestones.length) * 100) : 0)
const daysLeft = (date: string) => {
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  return Math.ceil((new Date(`${date}T12:00:00`).getTime() - today.getTime()) / 86400000)
}

export function GoalsPage() {
  const { data, update, isBackendConnected } = useWorkspace()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Goal | null>(null)
  const [deleting, setDeleting] = useState<Goal | null>(null)
  const completed = data.goals.filter(g => g.status === 'Completed' || pctOf(g) === 100).length
  const avg = data.goals.length ? Math.round(data.goals.reduce((s, g) => s + pctOf(g), 0) / data.goals.length) : 0
  const toggleMilestone = (goal: Goal, index: number) => {
    if (isBackendConnected) return
    update(d => ({ ...d, goals: d.goals.map(g => g.id === goal.id ? { ...g, milestones: g.milestones.map((m, i) => i === index ? { ...m, done: !m.done } : m) } : g) }))
    if (!goal.milestones[index].done) toast.success('Milestone reached', { description: goal.milestones[index].title })
  }
  const edit = (goal: Goal | null) => { setEditing(goal); setOpen(true) }

  return <main className="page-content">
    <PageHeading title="Goals" description="Break big ambitions into milestones you can celebrate." action={<Button onClick={() => edit(null)}><Plus data-icon="inline-start" />New goal</Button>} />
    <section className="stat-grid xl:grid-cols-3" aria-label="Goal summary">
      <StatCard title="Active Goals" value={data.goals.length - completed} icon={Target} note="in progress" />
      <StatCard title="Completed" value={completed} icon={Trophy} tone="green" note="goals achieved" />
      <StatCard title="Average Progress" value={`${avg}%`} icon={CalendarDays} tone="blue" note="across all goals" />
    </section>
    {data.goals.length === 0 ? <Card><CardContent><NoResults title="No goals yet" description="Set your first goal and map out the milestones." /></CardContent></Card> :
      <ul className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">{data.goals.map(g => {
        const pct = pctOf(g); const left = daysLeft(g.date)
        const status = g.status ?? (pct === 100 ? 'Completed' : left < 0 ? 'Overdue' : left <= 21 ? 'Due soon' : 'On track')
        return <li key={g.id}><Card className="h-full">
          <CardHeader><div className="flex items-start justify-between gap-2"><CardTitle className="text-sm">{g.title}</CardTitle><Badge variant={status === 'Completed' ? 'default' : status === 'On track' ? 'secondary' : 'outline'} className={cn('shrink-0 text-[10px]', status === 'Due soon' && 'text-warning', status === 'Overdue' && 'text-destructive')}>{status}</Badge></div><CardDescription className="text-[11px]">{g.description}</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div><div className="mb-2 flex justify-between text-[11px]"><span className="text-muted-foreground">Progress</span><span className="font-semibold">{pct}%</span></div><Progress value={pct} aria-label={`${g.title} progress`} /></div>
            {g.milestones.length ? <ol className="relative flex flex-col gap-3 border-l pl-5" aria-label="Milestones">{g.milestones.map((m, i) => <li key={i} className="relative">
              <button onClick={() => toggleMilestone(g, i)} aria-pressed={m.done} aria-label={`${m.title}: ${m.done ? 'complete' : 'incomplete'}. Toggle.`} className={cn('absolute top-0 -left-[29px] flex size-4 items-center justify-center rounded-full border-2 bg-card', m.done && 'border-primary bg-primary text-primary-foreground')}>{m.done && <Check className="size-2.5" />}</button>
              <p className={cn('text-xs', m.done && 'text-muted-foreground line-through')}>{m.title}</p>
            </li>)}</ol> : isBackendConnected && <p className="text-[11px] text-muted-foreground">Milestone endpoints are not exposed by the current backend.</p>}
          </CardContent>
          <CardFooter className="justify-between text-[11px] text-muted-foreground"><span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />{formatDate(g.date, { month: 'short', day: 'numeric', year: 'numeric' })} · {left >= 0 ? `${left} days left` : `${-left} days ago`}</span><div><Button variant="ghost" size="icon-sm" aria-label={`Edit ${g.title}`} onClick={() => edit(g)}><CalendarDays /></Button><Button variant="ghost" size="icon-sm" aria-label={`Delete ${g.title}`} onClick={() => setDeleting(g)}><Trash2 /></Button></div></CardFooter>
        </Card></li>
      })}</ul>}
    <FormDialog open={open} onOpenChange={setOpen} schema={schema} title={editing ? 'Edit goal' : 'Create a goal'} description="Describe what you want to achieve and the steps along the way." submitLabel={editing ? 'Save changes' : 'Create goal'}
      defaults={editing ? { ...editing, category: editing.category ?? 'Personal', status: editing.status ?? 'Not Started', milestones: editing.milestones.map(m => m.title).join('\n') } : { title: '', description: '', date: '2026-12-31', category: 'Personal', status: 'Not Started', milestones: '' }}
      fields={[{ name: 'title', label: 'Goal', placeholder: 'e.g. Run a half marathon', full: true }, { name: 'description', label: 'Why it matters', type: 'textarea', placeholder: 'A short note to your future self' }, { name: 'date', label: 'Target date', type: 'date' }, { name: 'category', label: 'Category', type: 'select', options: ['Career', 'Finance', 'Health', 'Personal'] }, { name: 'status', label: 'Status', type: 'select', options: ['Not Started', 'In Progress', 'Completed', 'Cancelled'] }, ...(!isBackendConnected ? [{ name: 'milestones', label: 'Milestones (one per line)', type: 'textarea' as const, placeholder: 'Run 5K\nRun 10K\nRun 15K' }] : [])]}
      onSubmit={async v => {
        const milestones = isBackendConnected ? editing?.milestones ?? [] : (v.milestones ?? '').split('\n').map(line => line.trim()).filter(Boolean).map(title => ({ title, done: false }))
        const goal: Goal = { id: editing?.id ?? `new-${Date.now()}`, title: v.title, description: v.description, date: v.date, category: v.category, status: v.status, progress: editing?.progress ?? 0, milestones }
        const saved = await update(d => ({ ...d, goals: editing ? d.goals.map(item => item.id === editing.id ? goal : item) : [...d.goals, goal] }))
        if (!saved) return false
        toast.success(editing ? 'Goal updated' : 'Goal created', { description: v.title })
      }} />
    <ConfirmDelete open={!!deleting} onOpenChange={o => !o && setDeleting(null)} name={deleting ? `“${deleting.title}”` : 'goal'} onConfirm={async () => { if (!deleting) return; const saved = await update(d => ({ ...d, goals: d.goals.filter(g => g.id !== deleting.id) })); if (!saved) return false; toast.success('Goal deleted') }} />
  </main>
}
