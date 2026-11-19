'use client'

import { useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts'
import { Plus, Search, Pencil, Trash2, Landmark, TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { PageHeading, Panel, StatCard, NoResults, ConfirmDelete, colorVar } from './shared'
import { FormDialog, SimpleSelect } from './form-dialog'
import { formatDate } from './task-dialog'
import { useWorkspace } from '@/lib/workspace-store'
import { monthlyData, type Transaction } from '@/lib/demo-data'
import { cn } from '@/lib/utils'

const schema = z.object({
  title: z.string().trim().min(2, 'Add a name with at least 2 characters.').max(60),
  description: z.string().max(300),
  type: z.enum(['Income', 'Expense']),
  category: z.string().min(1, 'Choose a category.'),
  amount: z.number({ error: 'Enter an amount.' }).positive('Amount must be greater than 0.').max(1_000_000, 'That amount looks too large.'),
})
const flowConfig = { income: { label: 'Income', color: 'var(--chart-4)' }, expenses: { label: 'Expenses', color: 'var(--chart-1)' } } satisfies ChartConfig

export function ExpensesPage() {
  const { data, update, money, income, expenses, spending, isBackendConnected } = useWorkspace()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All categories')
  const [type, setType] = useState('All types')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)
  const trend = [...monthlyData, { month: 'Nov', income, expenses }]
  const spendConfig = Object.fromEntries(spending.map(s => [s.name, { label: s.name, color: colorVar[s.color] }])) satisfies ChartConfig
  const rows = data.transactions
    .filter(t => t.title.toLowerCase().includes(query.toLowerCase()))
    .filter(t => category === 'All categories' || t.category === category)
    .filter(t => type === 'All types' || t.type === type)
    .filter(t => (!from || t.date >= from) && (!to || t.date <= to))
    .sort((a, b) => b.date.localeCompare(a.date))
  const edit = (t: Transaction | null) => { setEditing(t); setOpen(true) }

  return <main className="page-content">
    <PageHeading title="Expenses" description="Track your income and spending in one place." action={<Button onClick={() => edit(null)}><Plus data-icon="inline-start" />Add transaction</Button>} />
    <section className="stat-grid xl:grid-cols-3" aria-label="Finance summary">
      <StatCard title="Balance" value={money(income - expenses)} icon={Landmark} note={isBackendConnected ? 'all transactions' : 'available this month'} />
      <StatCard title={isBackendConnected ? 'Total Income' : 'Monthly Income'} value={money(income)} icon={TrendingUp} tone="green" note={isBackendConnected ? 'all transactions' : 'vs. October'} change={isBackendConnected ? undefined : '9%'} />
      <StatCard title={isBackendConnected ? 'Total Expenses' : 'Monthly Expenses'} value={money(expenses)} icon={TrendingDown} tone="amber" note={isBackendConnected ? 'all transactions' : 'November 2026'} />
    </section>
    <div className="section-grid mb-5">
      <Panel title="Income vs. Expenses" subtitle={isBackendConnected ? 'Totals from your transactions' : 'Last 6 months'}>
        {isBackendConnected ? <p className="py-16 text-center text-xs text-muted-foreground">Monthly history is not available from the current API.</p> : <ChartContainer config={flowConfig} className="h-56 w-full"><BarChart data={trend}><CartesianGrid vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} /><YAxis width={40} tickLine={false} axisLine={false} fontSize={10} tickFormatter={v => `${v / 1000}k`} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="income" fill="var(--color-income)" radius={4} /><Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} /></BarChart></ChartContainer>}
      </Panel>
      <Panel title="Spending by Category" subtitle={isBackendConnected ? 'All transactions' : 'November 2026'}>
        <ChartContainer config={spendConfig} className="mx-auto aspect-square h-44"><PieChart><ChartTooltip content={<ChartTooltipContent hideLabel />} /><Pie data={spending} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2} strokeWidth={0}>{spending.map(s => <Cell key={s.name} fill={colorVar[s.color]} />)}</Pie></PieChart></ChartContainer>
        <ul className="mt-3 grid grid-cols-2 gap-2">{spending.map(s => <li key={s.name} className="flex items-center gap-2 text-[10px]"><span className="size-2 rounded-full" style={{ background: colorVar[s.color] }} /><span className="flex-1 truncate text-muted-foreground">{s.name}</span><span className="font-medium">{money(s.value)}</span></li>)}</ul>
      </Panel>
      <Panel title="Monthly Spending Trend" subtitle="Expenses over time">
        {isBackendConnected ? <p className="py-16 text-center text-xs text-muted-foreground">Expense history by month is not available from the current API.</p> : <ChartContainer config={flowConfig} className="h-56 w-full"><AreaChart data={trend}><defs><linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-expenses)" stopOpacity={0.3} /><stop offset="95%" stopColor="var(--color-expenses)" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} /><YAxis width={40} tickLine={false} axisLine={false} fontSize={10} tickFormatter={v => `${v / 1000}k`} /><ChartTooltip content={<ChartTooltipContent />} /><Area type="monotone" dataKey="expenses" stroke="var(--color-expenses)" fill="url(#spendFill)" strokeWidth={2} /></AreaChart></ChartContainer>}
      </Panel>
    </div>

    <Panel title="Transactions" subtitle={`${rows.length} of ${data.transactions.length} transactions`}>
      <div className="filter-bar">
        <label className="toolbar-search"><span className="sr-only">Search transactions</span><Search /><Input placeholder="Search transactions..." value={query} onChange={e => setQuery(e.target.value)} /></label>
        <SimpleSelect label="Filter by category" value={category} onChange={setCategory} options={['All categories', ...data.categories.map(c => c.name)]} className="w-40" />
        <SimpleSelect label="Filter by type" value={type} onChange={setType} options={['All types', 'Income', 'Expense']} className="w-32" />
        <Input type="date" aria-label="From date" value={from} onChange={e => setFrom(e.target.value)} className="h-9 w-36" />
        <Input type="date" aria-label="To date" value={to} onChange={e => setTo(e.target.value)} className="h-9 w-36" />
      </div>
      {rows.length === 0 ? <NoResults title="No transactions found" description="Try a different search or date range." /> : <div className="table-wrap -mx-5"><table className="data-table">
        <thead><tr><th>Transaction</th><th>Category</th><th>Date</th><th>Type</th><th className="text-right">Amount</th><th className="text-right"><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>{rows.map(t => <tr key={t.id} className="transition-colors hover:bg-muted/40">
          <td><div className="flex items-center gap-3"><span className={cn('flex size-8 items-center justify-center rounded-lg', t.type === 'Income' ? 'color-green' : 'color-purple')}>{t.type === 'Income' ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}</span><span className="font-medium">{t.title}</span></div></td>
          <td className="text-muted-foreground">{t.category}</td><td className="text-muted-foreground">{formatDate(t.date, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
          <td><Badge variant={t.type === 'Income' ? 'secondary' : 'outline'} className="text-[10px] font-normal">{t.type}</Badge></td>
          <td className={cn('text-right font-semibold', t.type === 'Income' && 'text-success')}>{t.type === 'Income' ? '+' : '-'}{money(t.amount)}</td>
          <td className="text-right"><Button variant="ghost" size="icon-sm" aria-label={`Edit ${t.title}`} onClick={() => edit(t)}><Pencil /></Button><Button variant="ghost" size="icon-sm" aria-label={`Delete ${t.title}`} onClick={() => setDeleting(t)}><Trash2 /></Button></td>
        </tr>)}</tbody></table></div>}
    </Panel>

    <FormDialog<z.infer<typeof schema>> open={open} onOpenChange={setOpen} schema={schema} title={editing ? 'Edit transaction' : 'Add a transaction'} description="Record money coming in or going out." submitLabel={editing ? 'Save changes' : 'Add transaction'}
      defaults={editing ? { title: editing.title, description: editing.description ?? '', type: editing.type, category: editing.category, amount: editing.amount } : { title: '', description: '', type: 'Expense', category: data.categories.find(c => c.type === 'Expense')?.name ?? '', amount: undefined as unknown as number }}
      fields={[{ name: 'title', label: 'Transaction name', placeholder: 'e.g. Weekly groceries', full: true }, { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Add a note', full: true }, { name: 'type', label: 'Type', type: 'select', options: ['Expense', 'Income'] }, { name: 'category', label: 'Category', type: 'select', options: data.categories.map(c => c.name) }, { name: 'amount', label: `Amount (${data.profile.currency})`, type: 'number', placeholder: '0.00' }]}
      onSubmit={async v => {
        const transaction: Transaction = { ...v, date: editing?.date ?? new Date().toISOString().slice(0, 10), id: editing?.id ?? `new-${Date.now()}` }
        const saved = await update(d => ({ ...d, transactions: editing ? d.transactions.map(t => t.id === editing.id ? transaction : t) : [transaction, ...d.transactions] }))
        if (!saved) return false
        toast.success(editing ? 'Transaction updated' : 'Transaction added', { description: `${v.title} · ${money(v.amount)}` })
      }} />
    <ConfirmDelete open={!!deleting} onOpenChange={o => !o && setDeleting(null)} name={deleting ? `“${deleting.title}”` : 'transaction'} onConfirm={async () => { if (!deleting) return; const saved = await update(d => ({ ...d, transactions: d.transactions.filter(t => t.id !== deleting.id) })); if (!saved) return false; toast.success('Transaction deleted') }} />
  </main>
}
