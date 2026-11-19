'use client'

import { useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Lock, House, Utensils, ShoppingBag, Car, Shapes, Briefcase, Laptop, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeading, NoResults, ConfirmDelete } from './shared'
import { FormDialog } from './form-dialog'
import { useWorkspace } from '@/lib/workspace-store'
import type { Category } from '@/lib/demo-data'
import { cn } from '@/lib/utils'

const icons: Record<string, LucideIcon> = { Housing: House, 'Food & Dining': Utensils, Shopping: ShoppingBag, Transport: Car, Salary: Briefcase, Freelance: Laptop }
const colors = ['purple', 'blue', 'green', 'amber', 'gray']
const schema = z.object({ name: z.string().trim().min(2, 'Use at least 2 characters.').max(30, 'Keep it under 30 characters.'), type: z.enum(['Income', 'Expense']), color: z.string().optional() })

export function CategoriesPage() {
  const { data, update, money, isBackendConnected } = useWorkspace()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const usage = (name: string) => data.transactions.filter(t => t.category === name)
  const edit = (c: Category | null) => { setEditing(c); setOpen(true) }

  const grid = (items: Category[]) => <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{items.map(c => {
    const Icon = icons[c.name] ?? Shapes
    const tx = usage(c.name)
    return <li key={c.id}><Card className="h-full gap-0 py-5"><CardContent className="flex flex-col gap-4 px-5">
      <div className="flex items-start justify-between gap-2"><span className={cn('flex size-10 items-center justify-center rounded-xl', `color-${c.color}`)}><Icon className="size-5" /></span>
        {c.system ? <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Lock className="size-3" />System</span> : <div><Button variant="ghost" size="icon-sm" aria-label={`Edit ${c.name}`} onClick={() => edit(c)}><Pencil /></Button><Button variant="ghost" size="icon-sm" aria-label={`Delete ${c.name}`} onClick={() => setDeleting(c)}><Trash2 /></Button></div>}</div>
      <div><p className="text-sm font-semibold">{c.name}</p><p className="mt-1 text-[11px] text-muted-foreground">{tx.length} transactions · {money(tx.reduce((s, t) => s + t.amount, 0))}</p></div>
      <Badge variant={c.type === 'Income' ? 'secondary' : 'outline'} className="w-fit text-[10px] font-normal">{c.type}</Badge>
    </CardContent></Card></li>
  })}</ul>
  const custom = data.categories.filter(c => !c.system)

  return <main className="page-content">
    <PageHeading title="Categories" description="Organize your transactions the way that makes sense to you." action={<Button onClick={() => edit(null)}><Plus data-icon="inline-start" />Create category</Button>} />
    <section aria-labelledby="custom-cats" className="mb-8"><h2 id="custom-cats" className="mb-3 text-sm font-semibold">Your categories</h2>
      {custom.length ? grid(custom) : <Card><CardContent><NoResults title="No custom categories yet" description="Create a category for anything the defaults don't cover, like Pets or Travel." /></CardContent></Card>}</section>
    {!isBackendConnected && <section aria-labelledby="system-cats"><h2 id="system-cats" className="mb-1 text-sm font-semibold">Predefined categories</h2><p className="mb-3 text-[11px] text-muted-foreground">Built-in categories available to every workspace.</p>{grid(data.categories.filter(c => c.system))}</section>}

    <FormDialog open={open} onOpenChange={setOpen} schema={schema} title={editing ? 'Edit category' : 'Create a category'} description="Give it a name, type, and color." submitLabel={editing ? 'Save changes' : 'Create category'}
      defaults={editing ?? { name: '', type: 'Expense', color: 'purple' }}
      fields={[{ name: 'name', label: 'Category name', placeholder: 'e.g. Travel', full: true }, { name: 'type', label: 'Type', type: 'select', options: ['Expense', 'Income'] }, ...(!isBackendConnected ? [{ name: 'color', label: 'Color', type: 'select' as const, options: colors }] : [])]}
      onSubmit={async v => {
        if (data.categories.some(c => c.name.toLowerCase() === v.name.toLowerCase() && c.id !== editing?.id)) { toast.error('That category already exists'); return false }
        const category = { ...v, color: v.color ?? editing?.color ?? 'purple' }
        const saved = await update(d => ({ ...d, categories: editing ? d.categories.map(c => c.id === editing.id ? { ...c, ...category } as Category : c) : [...d.categories, { ...category, id: `new-${Date.now()}`, system: false }] as Category[] }))
        if (!saved) return false
        toast.success(editing ? 'Category updated' : 'Category created', { description: v.name })
      }} />
    <ConfirmDelete open={!!deleting} onOpenChange={o => !o && setDeleting(null)} name={deleting ? `“${deleting.name}”` : 'category'} onConfirm={async () => { if (!deleting) return; const saved = await update(d => ({ ...d, categories: d.categories.filter(c => c.id !== deleting.id) })); if (!saved) return false; toast.success('Category deleted') }} />
  </main>
}
