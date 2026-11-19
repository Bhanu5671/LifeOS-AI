'use client'

import { useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, RadialBar, RadialBarChart, PolarAngleAxis, XAxis, YAxis } from 'recharts'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Progress } from '@/components/ui/progress'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart'
import { PageHeading, Panel, colorVar } from './shared'
import { useWorkspace } from '@/lib/workspace-store'
import { monthlyData, weeklyData } from '@/lib/demo-data'

type Range = '7d' | '30d' | '90d'
const flow = { income: { label: 'Income', color: 'var(--chart-4)' }, expenses: { label: 'Expenses', color: 'var(--chart-1)' } } satisfies ChartConfig
const prod = { completed: { label: 'Completed', color: 'var(--chart-1)' }, planned: { label: 'Planned', color: 'var(--chart-3)' } } satisfies ChartConfig
const rate = { rate: { label: 'Completion', color: 'var(--chart-1)' } } satisfies ChartConfig

export function AnalyticsPage() {
  const { data, income, expenses, spending, money, isBackendConnected } = useWorkspace()
  const [range, setRange] = useState<Range>('30d')
  const scale = range === '7d' ? 1 : range === '30d' ? 4 : 12
  const productivity = range === '7d' ? weeklyData : Array.from({ length: range === '30d' ? 4 : 12 }, (_, i) => ({ day: `W${i + 1}`, completed: 28 + ((i * 7) % 13), planned: 40 + ((i * 5) % 9) }))
  const months = range === '90d' ? [...monthlyData, { month: 'Nov', income, expenses }] : [...monthlyData.slice(-2), { month: 'Nov', income, expenses }]
  const completion = Math.round((data.tasks.filter(t => t.status === 'Completed').length / Math.max(data.tasks.length, 1)) * 100)
  const habitRates = data.habits.filter(h => h.days.length > 0).map(h => ({ name: h.title, rate: Math.round((h.days.filter(Boolean).length / h.days.length) * 100) }))
  const spendConfig = Object.fromEntries(spending.map(s => [s.name, { label: s.name, color: colorVar[s.color] }])) satisfies ChartConfig
  const axis = { tickLine: false, axisLine: false, fontSize: 10 }

  return <main className="page-content">
    <PageHeading title="Analytics" description="Understand your patterns and celebrate your progress." action={<ToggleGroup value={[range]} onValueChange={v => v[0] && setRange(v[0] as Range)} variant="outline" aria-label="Date range"><ToggleGroupItem value="7d">7 days</ToggleGroupItem><ToggleGroupItem value="30d">30 days</ToggleGroupItem><ToggleGroupItem value="90d">90 days</ToggleGroupItem></ToggleGroup>} />
    <div className="grid gap-5 lg:grid-cols-3">
      <Panel title="Task Completion Rate" subtitle={`${data.tasks.length * scale} tasks in range`}>
        <ChartContainer config={rate} className="mx-auto aspect-square h-48"><RadialBarChart data={[{ rate: completion }]} innerRadius="72%" outerRadius="100%" startAngle={90} endAngle={-270}><PolarAngleAxis type="number" domain={[0, 100]} tick={false} /><RadialBar dataKey="rate" background cornerRadius={10} fill="var(--color-rate)" />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-2xl font-semibold">{completion}%</text></RadialBarChart></ChartContainer>
      </Panel>
      <Panel title="Productivity Trend" subtitle="Completed vs. planned" className="lg:col-span-2">
        {isBackendConnected ? <p className="py-24 text-center text-xs text-muted-foreground">Task history is not available from the current API.</p> : <ChartContainer config={prod} className="h-56 w-full"><AreaChart data={productivity}><CartesianGrid vertical={false} /><XAxis dataKey="day" {...axis} /><YAxis width={28} {...axis} /><ChartTooltip content={<ChartTooltipContent />} /><ChartLegend content={<ChartLegendContent />} /><Area dataKey="planned" type="monotone" stroke="var(--color-planned)" fill="var(--color-planned)" fillOpacity={0.12} strokeWidth={2} /><Area dataKey="completed" type="monotone" stroke="var(--color-completed)" fill="var(--color-completed)" fillOpacity={0.25} strokeWidth={2} /></AreaChart></ChartContainer>}
      </Panel>
      <Panel title="Income vs. Expenses" subtitle="Monthly cash flow" className="lg:col-span-2">
        {isBackendConnected ? <p className="py-24 text-center text-xs text-muted-foreground">Monthly transaction history is not available from the current API.</p> : <ChartContainer config={flow} className="h-56 w-full"><BarChart data={months}><CartesianGrid vertical={false} /><XAxis dataKey="month" {...axis} /><YAxis width={40} {...axis} tickFormatter={v => `${v / 1000}k`} /><ChartTooltip content={<ChartTooltipContent />} /><ChartLegend content={<ChartLegendContent />} /><Bar dataKey="income" fill="var(--color-income)" radius={4} /><Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} /></BarChart></ChartContainer>}
      </Panel>
      <Panel title="Spending by Category" subtitle={money(expenses)}>
        <ChartContainer config={spendConfig} className="mx-auto aspect-square h-48"><PieChart><ChartTooltip content={<ChartTooltipContent hideLabel />} /><Pie data={spending} dataKey="value" nameKey="name" outerRadius={80} strokeWidth={2} stroke="var(--card)">{spending.map(s => <Cell key={s.name} fill={colorVar[s.color]} />)}</Pie></PieChart></ChartContainer>
      </Panel>
      <Panel title="Expense Trend" subtitle="Spending over time">
        {isBackendConnected ? <p className="py-20 text-center text-xs text-muted-foreground">Expense history by month is not available from the current API.</p> : <ChartContainer config={flow} className="h-48 w-full"><LineChart data={months}><CartesianGrid vertical={false} /><XAxis dataKey="month" {...axis} /><YAxis width={40} {...axis} tickFormatter={v => `${v / 1000}k`} /><ChartTooltip content={<ChartTooltipContent />} /><Line dataKey="expenses" type="monotone" stroke="var(--color-expenses)" strokeWidth={2} dot={{ r: 3 }} /></LineChart></ChartContainer>}
      </Panel>
      <Panel title="Habit Completion" subtitle="Last 7 days">
        {isBackendConnected ? <p className="py-20 text-center text-xs text-muted-foreground">Habit history is not available from the current API.</p> : <ChartContainer config={rate} className="h-48 w-full"><BarChart data={habitRates} layout="vertical" margin={{ left: 8 }}><XAxis type="number" domain={[0, 100]} hide /><YAxis type="category" dataKey="name" width={110} {...axis} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="rate" fill="var(--color-rate)" radius={4} /></BarChart></ChartContainer>}
      </Panel>
      <Panel title="Goal Progress" subtitle={`${data.goals.length} goals`}>
        <ul className="flex flex-col gap-4">{data.goals.map(g => { const pct = g.progress ?? (g.milestones.length ? Math.round((g.milestones.filter(m => m.done).length / g.milestones.length) * 100) : 0); return <li key={g.id}><div className="mb-1.5 flex justify-between gap-2 text-[11px]"><span className="truncate font-medium">{g.title}</span><span className="text-muted-foreground">{pct}%</span></div><Progress value={pct} aria-label={`${g.title} progress`} /></li> })}</ul>
      </Panel>
    </div>
  </main>
}
