'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts'
import { CheckSquare, CircleCheckBig, Wallet, TrendingUp, Sprout, Plus, Clock, Sparkles, CalendarClock, Flag, ArrowRight, Target, Landmark, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Panel, StatCard, PriorityBadge, ViewLink, NoResults, colorVar } from './shared'
import { TaskDialog, useToggleTask, formatTime, formatDate } from './task-dialog'
import { useWorkspace } from '@/lib/workspace-store'
import { DEMO_DATE, weeklyData } from '@/lib/demo-data'
import { cn } from '@/lib/utils'
import { isBackendConnected } from '@/lib/api'

const weeklyConfig = { completed: { label: 'Completed', color: 'var(--chart-1)' }, planned: { label: 'Planned', color: 'var(--chart-5)' } } satisfies ChartConfig

export function Dashboard() {
  const { data, update, money, expenses, income, spending } = useWorkspace()
  const [open, setOpen] = useState(false)
  const toggleTask = useToggleTask()
  const now = new Date()
  const todayKey = isBackendConnected ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}` : DEMO_DATE
  const today = data.tasks.filter(t => t.date === todayKey).sort((a, b) => a.time.localeCompare(b.time))
  const completed = data.overview?.completed_tasks ?? data.tasks.filter(t => t.status === 'Completed').length
  const highPending = data.tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length
  const habitsDone = data.habits.filter(h => h.done && h.isActive !== false).length
  const activeHabitCount = data.overview?.active_habits ?? data.habits.filter(h => h.isActive !== false).length
  const habitPct = activeHabitCount ? Math.round((habitsDone / activeHabitCount) * 100) : 0
  const food = spending.find(s => s.name === 'Food & Dining')
  const reading = !isBackendConnected && data.habits.find(h => h.title.toLowerCase().includes('read'))
  const upcoming = [
    ...data.tasks.filter(t => t.date > todayKey && t.status !== 'Completed' && t.date).map(t => ({ id: t.id, title: t.title, date: t.date, meta: `${t.time ? formatTime(t.time) : 'No time'} · ${t.category}`, kind: 'task' as const })),
    ...data.goals.map(g => ({ id: g.id, title: g.title, date: g.date, meta: 'Goal deadline', kind: 'goal' as const })),
  ].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5)
  const spendConfig = Object.fromEntries(spending.map(s => [s.name, { label: s.name, color: colorVar[s.color] }])) satisfies ChartConfig
  const insights = [
    { text: `You have ${highPending} pending high-priority ${highPending === 1 ? 'task' : 'tasks'}.`, href: '/tasks', cta: 'Review tasks' },
    !isBackendConnected && food && { text: `Your spending on food reached ${money(food.value)} this month — slightly higher than usual.`, href: '/budgets', cta: 'Check budget' },
    reading && { text: `You maintained your reading habit for ${reading.streak} consecutive days. Keep going!`, href: '/habits', cta: 'View habits' },
  ].filter(Boolean) as { text: string; href: string; cta: string }[]

  return <main className="page-content">
    <div className="page-heading">
      <div><h1>{now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening'}, {data.profile.name}!</h1><p>{"Here's your personal productivity overview."}</p></div>
      <Button onClick={() => setOpen(true)}><Plus data-icon="inline-start" />Add task</Button>
    </div>
    <section className="stat-grid lg:grid-cols-4 xl:grid-cols-7" aria-label="Summary">
      <StatCard title="Total Tasks" value={data.overview?.total_tasks ?? data.tasks.length} icon={CheckSquare} note={isBackendConnected ? 'all tasks' : 'this month'} change={isBackendConnected ? undefined : '12%'} />
      <StatCard title="Completed Tasks" value={completed} icon={CircleCheckBig} tone="green" note={`${Math.round((completed / Math.max(data.tasks.length, 1)) * 100)}% completion rate`} />
      <StatCard title={isBackendConnected ? 'Total Expenses' : 'Monthly Expenses'} value={money(expenses)} icon={Wallet} tone="amber" note={isBackendConnected ? 'all transactions' : 'this month'} />
      <StatCard title={isBackendConnected ? 'Total Income' : 'Monthly Income'} value={money(income)} icon={TrendingUp} tone="blue" note={isBackendConnected ? 'all transactions' : 'vs. last month'} change={isBackendConnected ? undefined : '9%'} />
      <StatCard title="Balance" value={money(data.overview?.balance ?? income - expenses)} icon={Landmark} note="income minus expenses" />
      <StatCard title="Active Habits" value={activeHabitCount} icon={Sprout} note={`${habitsDone} done today`} />
      <StatCard title="Active Goals" value={data.overview?.active_goals ?? data.goals.filter(g => g.status !== 'Completed' && g.status !== 'Cancelled').length} icon={Target} tone="blue" note={data.overview ? `${data.overview.average_goal_progress}% average progress` : 'in progress'} />
    </section>

    <div className="dashboard-grid">
      <Panel title="Today's Tasks" subtitle={formatDate(todayKey, { weekday: 'long', month: 'long', day: 'numeric' })} action={<div className="flex items-center gap-3"><Button size="sm" variant="outline" onClick={() => setOpen(true)}><Plus data-icon="inline-start" />Add</Button><ViewLink href="/tasks" /></div>}>
        {today.length === 0 ? <NoResults title="A clear day" description="No tasks are due today. Add one to plan ahead." /> : <ul>
          {today.map(t => <li key={t.id} className="task-row">
            <Checkbox checked={t.status === 'Completed'} onCheckedChange={() => toggleTask(t)} aria-label={`Mark ${t.title} as ${t.status === 'Completed' ? 'pending' : 'complete'}`} />
            <div className="min-w-0 flex-1"><p className={cn('task-row-title truncate', t.status === 'Completed' && 'text-muted-foreground line-through')}>{t.title}</p><p className="task-meta"><Clock className="size-3" />{formatTime(t.time)}<span>·</span>{t.category}</p></div>
            <PriorityBadge value={t.priority} />
          </li>)}
        </ul>}
      </Panel>

      <Panel title="Expense Overview" subtitle={isBackendConnected ? 'All income vs. expenses' : 'November income vs. expenses'} action={<ViewLink href="/expenses" />}>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-success-soft p-3"><p className="text-[10px] text-muted-foreground">Income</p><p className="mt-1 text-base font-semibold text-success">{money(income)}</p></div>
          <div className="rounded-lg bg-warning-soft p-3"><p className="text-[10px] text-muted-foreground">Expenses</p><p className="mt-1 text-base font-semibold text-warning">{money(expenses)}</p></div>
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <ChartContainer config={spendConfig} className="aspect-square h-40 shrink-0">
            <PieChart><ChartTooltip content={<ChartTooltipContent hideLabel formatter={(v, n) => <span>{n}: {money(Number(v))}</span>} />} />
              <Pie data={spending} dataKey="value" nameKey="name" innerRadius={44} outerRadius={70} paddingAngle={2} strokeWidth={0}>{spending.map(s => <Cell key={s.name} fill={colorVar[s.color]} />)}</Pie>
            </PieChart>
          </ChartContainer>
          <ul className="flex w-full flex-col gap-2">{spending.map(s => <li key={s.name} className="flex items-center gap-2 text-[11px]"><span className="size-2 rounded-full" style={{ background: colorVar[s.color] }} /><span className="flex-1 text-muted-foreground">{s.name}</span><span className="font-medium">{money(s.value)}</span><span className="w-9 text-right text-muted-foreground">{Math.round((s.value / expenses) * 100)}%</span></li>)}</ul>
        </div>
      </Panel>
    </div>

    <div className="dashboard-bottom">
      <Panel title="Weekly Productivity" subtitle="Tasks completed vs. planned" action={<ViewLink href="/analytics">Details</ViewLink>}>
        {isBackendConnected ? <div className="flex h-52 flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground"><TriangleAlert className="size-4" />Weekly task trends are not available from the current API.</div> : <ChartContainer config={weeklyConfig} className="h-52 w-full">
          <BarChart data={weeklyData} barGap={3}><CartesianGrid vertical={false} /><XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={10} /><YAxis width={24} tickLine={false} axisLine={false} fontSize={10} />
            <ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="planned" fill="var(--color-planned)" radius={4} /><Bar dataKey="completed" fill="var(--color-completed)" radius={4} /></BarChart>
        </ChartContainer>}
      </Panel>
      <Panel title="Habit Progress" subtitle={`${habitsDone} of ${activeHabitCount} completed today`} action={<ViewLink href="/habits" />}>
        <div className="mb-3 flex items-center gap-3"><Progress value={habitPct} className="flex-1" aria-label="Habit completion" /><span className="text-xs font-semibold">{habitPct}%</span></div>
        <ul>{data.habits.slice(0, 5).map(h => <li key={h.id} className="habit-row">
          <Checkbox checked={h.done} disabled={isBackendConnected && h.done} aria-label={`Mark ${h.title} as ${h.done ? 'not done' : 'done'}`} onCheckedChange={() => update(d => ({ ...d, habits: d.habits.map(x => x.id === h.id ? { ...x, done: !x.done, streak: x.streak + (x.done ? -1 : 1) } : x) }))} />
          <span className={cn('flex-1 truncate text-xs', h.done && 'text-muted-foreground')}>{h.title}</span>
          <span className="text-[10px] text-muted-foreground">{h.streak} day streak</span>
        </li>)}</ul>
      </Panel>

      <Panel title="Upcoming Events" subtitle="Deadlines and scheduled activities" action={<ViewLink href="/calendar">Calendar</ViewLink>}>
        <ul className="flex flex-col gap-3">{upcoming.map(e => <li key={e.id} className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-secondary text-primary"><span className="text-[8px] font-medium uppercase">{formatDate(e.date, { month: 'short' })}</span><span className="text-sm font-semibold leading-none">{formatDate(e.date, { day: 'numeric' })}</span></span>
          <div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{e.title}</p><p className="task-meta">{e.kind === 'goal' ? <Flag className="size-3" /> : <CalendarClock className="size-3" />}{e.meta}</p></div>
        </li>)}</ul>
      </Panel>
    </div>

    <section className="mt-5 rounded-xl border border-primary/15 bg-secondary/50 p-5" aria-labelledby="ai-insights">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 id="ai-insights" className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="size-4 text-primary" />AI Insights</h2><Button size="sm" variant="outline" nativeButton={false} render={<Link href="/assistant" />}>Ask your assistant<ArrowRight data-icon="inline-end" /></Button></div>
      <ul className="grid gap-3 md:grid-cols-3">{insights.map(i => <li key={i.text} className="flex flex-col justify-between gap-3 rounded-lg border bg-card p-4"><p className="text-xs leading-relaxed">{i.text}</p><Link href={i.href} className="text-link">{i.cta}<ArrowRight /></Link></li>)}</ul>
    </section>
    <TaskDialog open={open} onOpenChange={setOpen} />
  </main>
}
