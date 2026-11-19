'use client'

import { useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, PiggyBank, Wallet, CircleDollarSign, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { PageHeading, StatCard, NoResults, ConfirmDelete } from './shared'
import { FormDialog } from './form-dialog'
import { useWorkspace } from '@/lib/workspace-store'
import type { Budget } from '@/lib/demo-data'
import { cn } from '@/lib/utils'

const schema = z.object({ category: z.string().min(1, 'Choose a category.'), amount: z.number({ error: 'Enter a budget amount.' }).positive('Budget must be greater than 0.').max(1_000_000) })

export function BudgetsPage() {
  const { data, update, money, spending, isBackendConnected } = useWorkspace()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Budget | null>(null)
  const [deleting, setDeleting] = useState<Budget | null>(null)
  const spentFor = (c: string) => spending.find(s => s.name === c)?.value ?? 0
  const total = data.budgets.reduce((s, b) => s + b.amount, 0)
  const spent = data.budgets.reduce((s, b) => s + spentFor(b.category), 0)
  const warnings = data.budgets.filter(b => spentFor(b.category) / b.amount >= 0.85)
  const edit = (b: Budget | null) => { setEditing(b); setOpen(true) }

  if (isBackendConnected) return <main className="page-content">
    <PageHeading title="Budgets" description="Set monthly limits and see how you're tracking." />
    <Alert><TriangleAlert /><AlertTitle>Budget tracking is not available yet</AlertTitle><AlertDescription>The current FastAPI backend does not expose budget endpoints, so no sample budgets are shown or saved.</AlertDescription></Alert>
  </main>

  return <main className="page-content">
    <PageHeading title="Budgets" description="Set monthly limits and see how you're tracking." action={<Button onClick={() => edit(null)}><Plus data-icon="inline-start" />Set budget</Button>} />
    <section className="stat-grid xl:grid-cols-3" aria-label="Budget summary">
      <StatCard title="Total Budget" value={money(total)} icon={PiggyBank} note={`across ${data.budgets.length} categories`} />
      <StatCard title="Spent So Far" value={money(spent)} icon={Wallet} tone="amber" note={`${Math.round((spent / Math.max(total, 1)) * 100)}% of budget used`} />
      <StatCard title="Remaining" value={money(total - spent)} icon={CircleDollarSign} tone="green" note="left for November" />
    </section>
    {warnings.length > 0 && <Alert className="mb-5"><TriangleAlert /><AlertTitle>{warnings.length === 1 ? 'One budget needs attention' : `${warnings.length} budgets need attention`}</AlertTitle><AlertDescription>{warnings.map(w => w.category).join(', ')} {warnings.length === 1 ? 'is' : 'are'} at 85% or more of the monthly limit.</AlertDescription></Alert>}
    {data.budgets.length === 0 ? <Card><CardContent><NoResults title="No budgets yet" description="Set a monthly budget to start tracking." /></CardContent></Card> :
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.budgets.map(b => {
        const used = spentFor(b.category); const pct = Math.round((used / b.amount) * 100); const over = used > b.amount; const near = pct >= 85
        return <li key={b.id}><Card className="h-full gap-0 py-5"><CardContent className="flex flex-col gap-4 px-5">
          <div className="flex items-start justify-between gap-2"><div><p className="text-sm font-semibold">{b.category}</p><p className="mt-1 text-[11px] text-muted-foreground">Monthly budget · {money(b.amount)}</p></div><div><Button variant="ghost" size="icon-sm" aria-label={`Edit ${b.category} budget`} onClick={() => edit(b)}><Pencil /></Button><Button variant="ghost" size="icon-sm" aria-label={`Delete ${b.category} budget`} onClick={() => setDeleting(b)}><Trash2 /></Button></div></div>
          <div className="flex items-end justify-between"><p className="text-xl font-semibold">{money(used)}</p><p className={cn('text-xs font-medium', over ? 'text-destructive' : near ? 'text-warning' : 'text-muted-foreground')}>{pct}%</p></div>
          <Progress value={Math.min(pct, 100)} aria-label={`${b.category} budget used`} className={cn(over && '[&_[data-slot=progress-indicator]]:bg-destructive', !over && near && '[&_[data-slot=progress-indicator]]:bg-warning')} />
          <p className={cn('text-[11px]', over ? 'text-destructive' : 'text-muted-foreground')}>{over ? `${money(used - b.amount)} over budget` : `${money(b.amount - used)} remaining`}</p>
        </CardContent></Card></li>
      })}</ul>}
    <FormDialog open={open} onOpenChange={setOpen} schema={schema} title={editing ? 'Edit budget' : 'Set a monthly budget'} description="Choose a category and the most you want to spend." submitLabel={editing ? 'Save changes' : 'Set budget'}
      defaults={editing ?? { category: data.categories.find(c => c.type === 'Expense' && !data.budgets.some(b => b.category === c.name))?.name ?? 'Other', amount: undefined as unknown as number }}
      fields={[{ name: 'category', label: 'Category', type: 'select', options: data.categories.filter(c => c.type === 'Expense').map(c => c.name) }, { name: 'amount', label: `Amount (${data.profile.currency})`, type: 'number', placeholder: '500' }]}
      onSubmit={v => {
        update(d => { const existing = d.budgets.find(b => b.id === editing?.id) ?? d.budgets.find(b => b.category === v.category); return { ...d, budgets: existing ? d.budgets.map(b => b.id === existing.id ? { ...b, ...v } : b) : [...d.budgets, { ...v, id: `b${Date.now()}` }] } })
        toast.success('Budget saved', { description: `${v.category} · ${money(v.amount)}` })
      }} />
    <ConfirmDelete open={!!deleting} onOpenChange={o => !o && setDeleting(null)} name={deleting ? `the ${deleting.category} budget` : 'budget'} onConfirm={() => { if (!deleting) return; update(d => ({ ...d, budgets: d.budgets.filter(b => b.id !== deleting.id) })); toast.success('Budget deleted') }} />
  </main>
}
