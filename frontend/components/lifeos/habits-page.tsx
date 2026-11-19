'use client'

import { useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Flame, Trophy, Sprout, CircleCheckBig, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { PageHeading, Panel, StatCard, NoResults, ConfirmDelete } from './shared'
import { FormDialog } from './form-dialog'
import { useWorkspace } from '@/lib/workspace-store'
import type { Habit } from '@/lib/demo-data'
import { cn } from '@/lib/utils'

const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const schema = z.object({
  title: z.string().trim().min(2, 'Use at least 2 characters.').max(50),
  description: z.string().max(120, 'Keep it under 120 characters.'),
  frequency: z.enum(['Daily', 'Weekly']),
  targetCount: z.number().int().min(1, 'Target must be at least one.').max(100),
})

export function HabitsPage() {
  const { data, update, isBackendConnected } = useWorkspace()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Habit | null>(null)
  const [deleting, setDeleting] = useState<Habit | null>(null)
  const activeHabits = data.habits.filter(h => h.isActive !== false)
  const done = activeHabits.filter(h => h.done).length
  const best = activeHabits.reduce((m, h) => Math.max(m, h.longest), 0)
  const allDays = data.habits.flatMap(h => h.days)
  const weekly = allDays.length ? Math.round((allDays.filter(Boolean).length / allDays.length) * 100) : 0
  const heat = Array.from({ length: 28 }, (_, i) => data.habits.length ? data.habits.filter((h, j) => (i * 7 + j * 3 + h.streak) % 5 !== 0).length / data.habits.length : 0)
  const toggle = async (h: Habit) => {
    if (isBackendConnected && h.done) {
      toast.error('The backend does not support undoing a habit completion.')
      return
    }
    const saved = await update(d => ({ ...d, habits: d.habits.map(x => x.id === h.id ? { ...x, done: !x.done, streak: Math.max(0, x.streak + (x.done ? -1 : 1)), longest: Math.max(x.longest, x.streak + (x.done ? 0 : 1)), days: [...x.days.slice(0, 6), !x.done] } : x) }))
    if (saved && !h.done) toast.success('Habit checked in', { description: `${h.title} · ${h.streak + 1} day streak` })
  }
  const edit = (h: Habit | null) => { setEditing(h); setOpen(true) }

  return <main className="page-content">
    <PageHeading title="Habits" description="Small actions, repeated daily, add up to big change." action={<Button onClick={() => edit(null)}><Plus data-icon="inline-start" />New habit</Button>} />
    <section className="stat-grid xl:grid-cols-4" aria-label="Habit summary">
      <StatCard title="Active Habits" value={activeHabits.length} icon={Sprout} note="being tracked" />
      <StatCard title="Done Today" value={`${done}/${activeHabits.length}`} icon={CircleCheckBig} tone="green" note="keep the momentum" />
      <StatCard title="Weekly Completion" value={isBackendConnected ? '—' : `${weekly}%`} icon={Flame} tone="amber" note={isBackendConnected ? 'history unavailable' : 'last 7 days'} />
      <StatCard title="Longest Streak" value={isBackendConnected ? '—' : `${best} days`} icon={Trophy} tone="blue" note={isBackendConnected ? 'history unavailable' : 'personal best'} />
    </section>
    <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
      <Panel title="Today's Habits" subtitle="Check in as you go">
        {activeHabits.length === 0 ? <NoResults title="No habits yet" description="Start with one small habit you can do every day." /> : <ul className="flex flex-col">{activeHabits.map(h => <li key={h.id} className="flex flex-wrap items-center gap-4 border-b py-4 first:pt-0 last:border-b-0 last:pb-0">
          <Checkbox checked={h.done} disabled={isBackendConnected && h.done} onCheckedChange={() => toggle(h)} aria-label={`Mark ${h.title} as ${h.done ? 'not done' : 'done'}`} />
          <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className={cn('text-[13px] font-medium', h.done && 'text-muted-foreground')}>{h.title}</p><Badge variant="outline" className="text-[9px] font-normal">{h.frequency ?? h.category}</Badge></div><p className="mt-0.5 text-[11px] text-muted-foreground">{h.description}</p></div>
          {h.days.length > 0 && <ol className="flex gap-1" aria-label="Last 7 days">{h.days.map((d, i) => <li key={i} title={d ? 'Done' : 'Missed'} className={cn('flex size-6 items-center justify-center rounded-md text-[9px]', d ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>{days[i]}<span className="sr-only">{d ? ' done' : ' missed'}</span></li>)}</ol>}
          <div className="w-24 text-right"><p className="flex items-center justify-end gap-1 text-xs font-semibold">{isBackendConnected ? `${h.targetCount ?? 1}× ${h.frequency ?? 'Daily'}` : <><Flame className="size-3.5 text-warning" />{h.streak} days</>}</p>{!isBackendConnected && <p className="text-[10px] text-muted-foreground">Best: {h.longest}</p>}</div>
          <div><Button variant="ghost" size="icon-sm" aria-label={`Edit ${h.title}`} onClick={() => edit(h)}><Pencil /></Button><Button variant="ghost" size="icon-sm" aria-label={`Delete ${h.title}`} onClick={() => setDeleting(h)}><Trash2 /></Button></div>
        </li>)}</ul>}
      </Panel>
      <div className="flex flex-col gap-5">
        <Panel title={isBackendConnected ? 'Completion history' : 'November Progress'} subtitle={isBackendConnected ? 'History is not available from the current API' : 'Monthly completion'}>
          {isBackendConnected ? <div className="py-6 text-center text-xs text-muted-foreground"><p>The API currently provides today&apos;s check-ins only.</p><p className="mt-2">When a habit already has a log, the backend increments its count without updating its completion date, so later check-ins may not appear as completed today.</p></div> : <>
          <div className="mb-4 flex items-center gap-3"><Progress value={78} className="flex-1" aria-label="Monthly progress" /><span className="text-xs font-semibold">78%</span></div>
          <div className="grid grid-cols-7 gap-1.5" role="img" aria-label="Habit completion calendar for the last four weeks">{heat.map((v, i) => <span key={i} className="aspect-square rounded-md bg-primary" style={{ opacity: 0.12 + v * 0.88 }} />)}</div>
          <div className="mt-3 flex items-center justify-end gap-1.5 text-[9px] text-muted-foreground">Less{[0.15, 0.4, 0.7, 1].map(o => <span key={o} className="size-2.5 rounded-sm bg-primary" style={{ opacity: o }} />)}More</div>
          </>}
        </Panel>
        <Card className="gap-0 bg-secondary/50 py-5"><CardContent className="px-5"><p className="text-xs font-semibold">Tip of the day</p><p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">Stack a new habit onto one you already do — like a few minutes of journaling right after your morning meditation.</p></CardContent></Card>
      </div>
    </div>
    <FormDialog<z.infer<typeof schema>> open={open} onOpenChange={setOpen} schema={schema} title={editing ? 'Edit habit' : 'Create a habit'} description="Keep it small enough to do every day." submitLabel={editing ? 'Save changes' : 'Create habit'}
      defaults={editing ? { title: editing.title, description: editing.description, frequency: editing.frequency ?? 'Daily', targetCount: editing.targetCount ?? 1 } : { title: '', description: '', frequency: 'Daily', targetCount: 1 }}
      fields={[{ name: 'title', label: 'Habit name', placeholder: 'e.g. Evening walk', full: true }, { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Why this habit matters to you' }, { name: 'frequency', label: 'Frequency', type: 'select', options: ['Daily', 'Weekly'] }, { name: 'targetCount', label: 'Target count', type: 'number' }]}
      onSubmit={async v => {
        const habit: Habit = { ...v, category: editing?.category ?? 'General', id: editing?.id ?? `new-${Date.now()}`, done: editing?.done ?? false, streak: editing?.streak ?? 0, longest: editing?.longest ?? 0, days: editing?.days ?? [], isActive: editing?.isActive ?? true }
        const saved = await update(d => ({ ...d, habits: editing ? d.habits.map(item => item.id === editing.id ? habit : item) : [...d.habits, habit] }))
        if (!saved) return false
        toast.success(editing ? 'Habit updated' : 'Habit created', { description: v.title })
      }} />
    <ConfirmDelete open={!!deleting} onOpenChange={o => !o && setDeleting(null)} name={deleting ? `“${deleting.title}”` : 'habit'} onConfirm={async () => { if (!deleting) return; const saved = await update(d => ({ ...d, habits: d.habits.filter(h => h.id !== deleting.id) })); if (!saved) return false; toast.success('Habit deleted') }} />
  </main>
}
