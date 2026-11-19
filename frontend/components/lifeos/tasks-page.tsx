'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Search, List, Columns3, MoreHorizontal, Pencil, Trash2, CalendarDays, ArrowUpDown, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { PageHeading, PriorityBadge, NoResults, ConfirmDelete } from './shared'
import { SimpleSelect } from './form-dialog'
import { TaskDialog, useToggleTask, formatDate, formatTime } from './task-dialog'
import { useWorkspace } from '@/lib/workspace-store'
import type { Task, Status } from '@/lib/demo-data'
import { cn } from '@/lib/utils'

const statuses: Status[] = ['Pending', 'In Progress', 'Completed']

export function TasksPage() {
  const params = useSearchParams()
  const { data, update } = useWorkspace()
  const toggleTask = useToggleTask()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [status, setStatus] = useState('All statuses')
  const [priority, setPriority] = useState('All priorities')
  const [category, setCategory] = useState('All categories')
  const [sort, setSort] = useState<'asc' | 'desc'>('asc')
  const [view, setView] = useState<'list' | 'board'>('list')
  const [editing, setEditing] = useState<Task | null>(null)
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState<Task | null>(null)

  const tasks = data.tasks
    .filter(t => `${t.title} ${t.description}`.toLowerCase().includes(query.toLowerCase()))
    .filter(t => status === 'All statuses' || t.status === status)
    .filter(t => priority === 'All priorities' || t.priority === priority)
    .filter(t => category === 'All categories' || t.category === category)
    .sort((a, b) => (sort === 'asc' ? 1 : -1) * `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  const setTaskStatus = async (task: Task, next: Status) => update(d => ({ ...d, tasks: d.tasks.map(t => t.id === task.id ? { ...t, status: next } : t) }))
  const edit = (t: Task | null) => { setEditing(t); setOpen(true) }
  const filtersActive = query || status !== 'All statuses' || priority !== 'All priorities' || category !== 'All categories'

  const actions = (t: Task) => <DropdownMenu>
    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${t.title}`} />}><MoreHorizontal /></DropdownMenuTrigger>
    <DropdownMenuContent align="end"><DropdownMenuGroup>
      <DropdownMenuItem onClick={() => edit(t)}><Pencil />Edit</DropdownMenuItem>
      {statuses.filter(s => s !== t.status).map(s => <DropdownMenuItem key={s} onClick={() => setTaskStatus(t, s)}>Move to {s}</DropdownMenuItem>)}
    </DropdownMenuGroup><DropdownMenuSeparator /><DropdownMenuGroup><DropdownMenuItem variant="destructive" onClick={() => setDeleting(t)}><Trash2 />Delete</DropdownMenuItem></DropdownMenuGroup></DropdownMenuContent>
  </DropdownMenu>

  const meta = (t: Task) => <p className="task-meta flex-wrap"><CalendarDays className="size-3" />{t.date ? formatDate(t.date) : 'No due date'}{t.time && <><Clock className="size-3" />{formatTime(t.time)}</>}<span>·</span>{t.category}</p>

  return <main className="page-content">
    <PageHeading title="Tasks" description={`${data.tasks.filter(t => t.status !== 'Completed').length} open tasks · ${data.tasks.filter(t => t.status === 'Completed').length} completed`} action={<Button onClick={() => edit(null)}><Plus data-icon="inline-start" />Create task</Button>} />
    <div className="filter-bar">
      <label className="toolbar-search"><span className="sr-only">Search tasks</span><Search /><Input placeholder="Search tasks..." value={query} onChange={e => setQuery(e.target.value)} /></label>
      <SimpleSelect label="Filter by status" value={status} onChange={setStatus} options={['All statuses', ...statuses]} className="w-36" />
      <SimpleSelect label="Filter by priority" value={priority} onChange={setPriority} options={['All priorities', 'High', 'Medium', 'Low']} className="w-36" />
      <SimpleSelect label="Filter by category" value={category} onChange={setCategory} options={['All categories', ...data.categories.map(item => item.name)]} className="w-40" />
      <Button variant="outline" onClick={() => setSort(sort === 'asc' ? 'desc' : 'asc')}><ArrowUpDown data-icon="inline-start" />Due date {sort === 'asc' ? '(earliest)' : '(latest)'}</Button>
      <ToggleGroup value={[view]} onValueChange={v => v[0] && setView(v[0] as 'list' | 'board')} variant="outline" aria-label="Task view">
        <ToggleGroupItem value="list" aria-label="List view"><List /></ToggleGroupItem><ToggleGroupItem value="board" aria-label="Board view"><Columns3 /></ToggleGroupItem>
      </ToggleGroup>
    </div>

    {tasks.length === 0 ? <Card><CardContent><NoResults title={filtersActive ? 'No matching tasks' : 'No tasks yet'} description={filtersActive ? 'Try adjusting your search or filters.' : 'Create your first task to get started.'} /></CardContent></Card>
      : view === 'list' ? <Card className="py-0"><ul>{tasks.map(t => <li key={t.id} className="flex items-start gap-3 border-b px-5 py-4 last:border-b-0">
        <Checkbox className="mt-0.5" checked={t.status === 'Completed'} onCheckedChange={() => toggleTask(t)} aria-label={`Mark ${t.title} as ${t.status === 'Completed' ? 'pending' : 'complete'}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><p className={cn('text-[13px] font-medium', t.status === 'Completed' && 'text-muted-foreground line-through')}>{t.title}</p><PriorityBadge value={t.priority} /><Badge variant="outline" className="text-[9px] font-normal"><span className={cn('status-dot', t.status === 'Completed' && 'bg-success', t.status === 'Pending' && 'bg-muted-foreground')} />{t.status}</Badge></div>
          <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">{t.description}</p>{meta(t)}
        </div>{actions(t)}
      </li>)}</ul></Card>
        : <div className="grid gap-4 lg:grid-cols-3">{statuses.map(s => {
          const col = tasks.filter(t => t.status === s); return <section key={s} aria-label={s} className="flex flex-col gap-3 rounded-xl bg-muted/60 p-3">
            <h2 className="flex items-center gap-2 px-1 text-xs font-semibold">{s}<span className="rounded bg-card px-1.5 text-[10px] text-muted-foreground">{col.length}</span></h2>
            {col.map(t => <Card key={t.id} className="gap-2 py-4"><CardContent className="flex flex-col gap-2 px-4">
              <div className="flex items-start justify-between gap-2"><p className="text-xs font-medium">{t.title}</p>{actions(t)}</div>
              <p className="line-clamp-2 text-[11px] text-muted-foreground">{t.description}</p>
              <div className="flex items-center justify-between gap-2"><PriorityBadge value={t.priority} />{meta(t)}</div>
            </CardContent></Card>)}
            {col.length === 0 && <p className="px-1 py-6 text-center text-[11px] text-muted-foreground">Nothing here right now.</p>}
          </section>
        })}</div>}

    <TaskDialog open={open} onOpenChange={setOpen} task={editing} />
    <ConfirmDelete open={!!deleting} onOpenChange={o => !o && setDeleting(null)} name={deleting ? `“${deleting.title}”` : 'task'} onConfirm={async () => { if (!deleting) return; const saved = await update(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== deleting.id) })); if (!saved) return false; toast.success('Task deleted') }} />
  </main>
}
