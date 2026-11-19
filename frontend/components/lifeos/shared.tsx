'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ChevronRight, Inbox, type LucideIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { cn } from '@/lib/utils'
import type { Priority } from '@/lib/demo-data'

export function Panel({ title, subtitle, action, children, className }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <Card className={cn('panel', className)}><CardHeader><CardTitle>{title}</CardTitle>{subtitle && <CardDescription>{subtitle}</CardDescription>}{action && <CardAction>{action}</CardAction>}</CardHeader><CardContent>{children}</CardContent></Card>
}
export const colorVar: Record<string, string> = { purple: 'var(--chart-1)', blue: 'var(--chart-3)', green: 'var(--chart-4)', amber: 'var(--warning)', gray: 'var(--chart-2)' }
export function PageHeading({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="page-heading"><div><h1>{title}</h1><p>{description}</p></div>{action && <div className="flex items-center gap-2">{action}</div>}</div>
}
export function ViewLink({ href, children = 'View all' }: { href: string; children?: ReactNode }) { return <Link href={href} className="text-link">{children}<ChevronRight /></Link> }
export function PriorityBadge({ value }: { value: Priority }) { return <Badge className={cn('priority-badge', value.toLowerCase())}>{value}</Badge> }
export function StatCard({ title, value, icon: Icon, note, change, tone = 'purple' }: { title: string; value: ReactNode; icon: LucideIcon; note: string; change?: string; tone?: string }) {
  return <Card className="stat-card"><CardHeader className="sr-only"><CardTitle>{title}</CardTitle></CardHeader><CardContent><div className="stat-top"><span className="stat-label">{title}</span><span className={cn('stat-icon', `color-${tone}`)}><Icon /></span></div><div className="stat-value">{value}</div><div className="stat-note">{change && <strong><ArrowUpRight />{change}</strong>}<span>{note}</span></div></CardContent></Card>
}
export function NoResults({ title = 'A little breathing room', description = 'Nothing here yet. Add your first item to get started.' }: { title?: string; description?: string }) { return <Empty><EmptyHeader><EmptyMedia variant="icon"><Inbox /></EmptyMedia><EmptyTitle>{title}</EmptyTitle><EmptyDescription>{description}</EmptyDescription></EmptyHeader></Empty> }
export function ConfirmDelete({ open, onOpenChange, onConfirm, name }: { open: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void | boolean | Promise<void | boolean>; name: string }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Delete {name}?</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="destructive" onClick={async () => { const result = await onConfirm(); if (result !== false) onOpenChange(false) }}>Delete</Button></DialogFooter></DialogContent></Dialog>
}
