'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { PageHeading, Panel, PriorityBadge, NoResults } from './shared'
import { TaskDialog, formatDate, formatTime } from './task-dialog'
import { useWorkspace } from '@/lib/workspace-store'
import { DEMO_DATE, type Task } from '@/lib/demo-data'
import { cn } from '@/lib/utils'

type View = 'month' | 'week' | 'day'
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const parse = (s: string) => new Date(`${s}T12:00:00`)
const addDays = (s: string, n: number) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d) }
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarPage() {
  const { data } = useWorkspace()
  const [view, setView] = useState<View>('month')
  const [cursor, setCursor] = useState(DEMO_DATE)
  const [selected, setSelected] = useState(DEMO_DATE)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [newDate, setNewDate] = useState(DEMO_DATE)
  const byDate = (date: string) => data.tasks.filter(t => t.date === date).sort((a, b) => a.time.localeCompare(b.time))
  const addOn = (date: string) => { setEditing(null); setNewDate(date); setOpen(true) }
  const openTask = (t: Task) => { setEditing(t); setOpen(true) }

  const c = parse(cursor)
  const monthStart = new Date(c.getFullYear(), c.getMonth(), 1, 12)
  const gridStart = addDays(iso(monthStart), -monthStart.getDay())
  const weekStart = addDays(cursor, -c.getDay())
  const days = view === 'month' ? Array.from({ length: 42 }, (_, i) => addDays(gridStart, i)) : view === 'week' ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)) : [cursor]
  const move = (dir: number) => {
    if (view === 'month') { const d = new Date(c.getFullYear(), c.getMonth() + dir, 1, 12); setCursor(iso(d)) }
    else setCursor(addDays(cursor, dir * (view === 'week' ? 7 : 1)))
  }
  const label = view === 'month' ? c.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : view === 'week' ? `${formatDate(days[0])} – ${formatDate(days[6], { month: 'short', day: 'numeric', year: 'numeric' })}` : formatDate(cursor, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const upcoming = data.tasks.filter(t => t.date >= DEMO_DATE && t.status !== 'Completed').sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).slice(0, 6)
  const event = (t: Task) => <button key={t.id} onClick={e => { e.stopPropagation(); openTask(t) }} className={cn('calendar-event', `event-${t.priority.toLowerCase()}`, t.status === 'Completed' && 'line-through opacity-60')}>{formatTime(t.time)} {t.title}</button>

  return <main className="page-content">
    <PageHeading title="Calendar" description="See your tasks and deadlines at a glance." action={<Button onClick={() => addOn(selected)}><Plus data-icon="inline-start" />Add task</Button>} />
    <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div className="flex items-center gap-2"><Button variant="outline" size="icon-sm" aria-label="Previous" onClick={() => move(-1)}><ChevronLeft /></Button><Button variant="outline" size="icon-sm" aria-label="Next" onClick={() => move(1)}><ChevronRight /></Button><h2 className="ml-2 text-sm font-semibold">{label}</h2><Button variant="ghost" size="sm" onClick={() => { setCursor(DEMO_DATE); setSelected(DEMO_DATE) }}>Today</Button></div>
          <ToggleGroup value={[view]} onValueChange={v => v[0] && setView(v[0] as View)} variant="outline" size="sm" aria-label="Calendar view">
            <ToggleGroupItem value="month">Month</ToggleGroupItem><ToggleGroupItem value="week">Week</ToggleGroupItem><ToggleGroupItem value="day">Day</ToggleGroupItem>
          </ToggleGroup>
        </div>
        {view === 'day' ? <div className="flex flex-col p-4">{byDate(cursor).length === 0 ? <NoResults title="Nothing scheduled" description="Enjoy the open space, or add a task for this day." /> : byDate(cursor).map(t => <button key={t.id} onClick={() => openTask(t)} className="flex items-center gap-4 border-b py-3 text-left last:border-b-0 hover:bg-muted/50">
          <span className="w-16 shrink-0 text-xs text-muted-foreground">{formatTime(t.time)}</span><span className={cn('h-10 w-1 rounded-full', `event-${t.priority.toLowerCase()}`)} /><span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium">{t.title}</span><span className="block truncate text-[11px] text-muted-foreground">{t.description}</span></span><PriorityBadge value={t.priority} />
        </button>)}</div> : <>
          <div className="grid grid-cols-7 border-b bg-muted/50">{weekdays.map(d => <div key={d} className="px-2 py-2 text-[10px] font-medium text-muted-foreground">{d}</div>)}</div>
          <div className="grid grid-cols-7">{days.map(d => { const tasks = byDate(d); const outside = view === 'month' && parse(d).getMonth() !== c.getMonth(); return <div key={d} role="button" tabIndex={0} aria-label={`${formatDate(d, { weekday: 'long', month: 'long', day: 'numeric' })}, ${tasks.length} tasks`} onClick={() => setSelected(d)} onDoubleClick={() => addOn(d)} onKeyDown={e => e.key === 'Enter' && setSelected(d)} className={cn('calendar-cell cursor-pointer', view === 'week' && 'min-h-[320px]', outside && 'bg-muted/30 text-muted-foreground', selected === d && 'bg-secondary/50')}>
            <span className={cn('flex size-6 items-center justify-center rounded-full text-[11px]', d === DEMO_DATE && 'bg-primary font-semibold text-primary-foreground')}>{parse(d).getDate()}</span>
            {tasks.slice(0, view === 'week' ? 8 : 2).map(event)}
            {view === 'month' && tasks.length > 2 && <span className="px-1 text-[9px] text-muted-foreground">+{tasks.length - 2} more</span>}
          </div> })}</div>
        </>}
        <div className="flex flex-wrap items-center gap-4 border-t px-4 py-3 text-[10px] text-muted-foreground"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-destructive" />High</span><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-warning" />Medium</span><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-info" />Low</span><span className="ml-auto hidden sm:block">Double-click a day to add a task</span></div>
      </Card>
      <div className="flex flex-col gap-5">
        <Panel title={formatDate(selected, { weekday: 'long', month: 'short', day: 'numeric' })} subtitle={`${byDate(selected).length} scheduled`} action={<Button size="icon-sm" variant="outline" aria-label="Add task on selected day" onClick={() => addOn(selected)}><Plus /></Button>}>
          {byDate(selected).length === 0 ? <p className="text-[11px] text-muted-foreground">No tasks on this day.</p> : <ul className="flex flex-col gap-2">{byDate(selected).map(t => <li key={t.id}><button onClick={() => openTask(t)} className="flex w-full items-center gap-2 text-left text-xs"><Clock className="size-3 text-muted-foreground" /><span className="w-14 text-[10px] text-muted-foreground">{formatTime(t.time)}</span><span className="flex-1 truncate">{t.title}</span></button></li>)}</ul>}
        </Panel>
        <Panel title="Upcoming" subtitle="Your next deadlines">
          <ul className="flex flex-col gap-3">{upcoming.map(t => <li key={t.id} className="flex items-center gap-3"><span className="flex size-9 shrink-0 flex-col items-center justify-center rounded-lg bg-secondary text-primary"><span className="text-[8px] uppercase">{formatDate(t.date, { month: 'short' })}</span><span className="text-xs font-semibold leading-none">{parse(t.date).getDate()}</span></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{t.title}</p><p className="text-[10px] text-muted-foreground">{formatTime(t.time)}</p></div><PriorityBadge value={t.priority} /></li>)}</ul>
        </Panel>
      </div>
    </div>
    <TaskDialog open={open} onOpenChange={setOpen} task={editing} defaultDate={newDate} />
  </main>
}
