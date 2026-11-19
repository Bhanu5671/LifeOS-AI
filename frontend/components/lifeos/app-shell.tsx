'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, CheckSquare, CalendarDays, Wallet, Shapes, PieChart, Sprout, Target, Sparkles, ChartNoAxesCombined, Settings, Search, Bell, Moon, Sun, ChevronDown, ChevronRight, LogOut, Menu, X, CircleHelp, Command, Layers, ArrowUpRight, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Toaster } from '@/components/ui/sonner'
import { useWorkspace } from '@/lib/workspace-store'
import { api, authToken, isBackendConnected } from '@/lib/api'
import { cn } from '@/lib/utils'

export const navigation = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, group: 'WORKSPACE' },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Expenses', href: '/expenses', icon: Wallet, group: 'FINANCES' },
  { label: 'Categories', href: '/categories', icon: Shapes },
  { label: 'Budgets', href: '/budgets', icon: PieChart },
  { label: 'Habits', href: '/habits', icon: Sprout, group: 'PERSONAL GROWTH' },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'AI Assistant', href: '/assistant', icon: Sparkles, group: 'INSIGHTS' },
  { label: 'Analytics', href: '/analytics', icon: ChartNoAxesCombined },
]
export function Brand() { return <Link href="/" className="brand"><span className="brand-mark"><Layers strokeWidth={1.8} /></span><span>LifeOS <span className="font-normal text-primary">AI</span></span></Link> }
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data, isLoading, error } = useWorkspace()
  const [mobile, setMobile] = useState(false)
  const [dark, setDark] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [notifications, setNotifications] = useState(false)
  const [help, setHelp] = useState(false)
  const [authReady, setAuthReady] = useState(!isBackendConnected)
  const title = navigation.find(n => n.href === pathname)?.label ?? 'Settings'
  const toggleTheme = () => { const next = !dark; setDark(next); document.documentElement.classList.toggle('dark', next); document.documentElement.classList.toggle('light', !next) }
  const auth = ['/login', '/register', '/forgot-password', '/reset-password'].includes(pathname)

  useEffect(() => {
    if (auth || !isBackendConnected) {
      setAuthReady(true)
      return
    }
    let active = true
    setAuthReady(false)
    if (!authToken.get()) {
      router.replace('/login')
      return () => { active = false }
    }
    api.user.me()
      .then(() => { if (active) setAuthReady(true) })
      .catch(() => {
        if (!active) return
        if (!authToken.get()) router.replace('/login')
        else setAuthReady(true)
      })
    return () => { active = false }
  }, [auth, router])

  const logout = () => {
    api.user.logout()
    router.replace('/login')
  }

  if (auth) return <>{children}<Toaster /></>
  if (isBackendConnected && !authReady) return <div className="flex min-h-dvh items-center justify-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Checking your session…</div>
  return <>
    {mobile && <button className="fixed inset-0 z-40 bg-black/30 lg:hidden" aria-label="Close navigation" onClick={() => setMobile(false)} />}
    <aside className={cn('app-sidebar', mobile && 'mobile-open')} aria-label="Main navigation">
      <div className="flex h-[78px] shrink-0 items-center justify-between px-6"><Brand /><button className="lg:hidden" aria-label="Close navigation" onClick={() => setMobile(false)}><X className="size-4" /></button></div>
      <div className="mx-4 flex items-center gap-2.5 rounded-lg border px-3 py-2.5"><span className="flex size-7 items-center justify-center rounded-md bg-secondary text-[11px] font-semibold text-primary">B</span><div className="min-w-0 flex-1"><p className="text-[11px] font-semibold">Personal workspace</p><p className="mt-0.5 text-[9px] text-muted-foreground">A little more organized.</p></div><ChevronDown className="size-3 text-muted-foreground" /></div>
      <nav className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">{navigation.map(item => <div key={item.href}>{item.group && <p className="nav-label">{item.group}</p>}<Link href={item.href} onClick={() => setMobile(false)} className={cn('nav-item', pathname === item.href && 'active')} aria-current={pathname === item.href ? 'page' : undefined}><item.icon /><span>{item.label}</span>{item.label === 'Tasks' && <span className="nav-count">{data.tasks.filter(t => t.status !== 'Completed').length}</span>}{item.label === 'AI Assistant' && <span className="ml-auto rounded bg-secondary px-1.5 py-0.5 text-[8px] font-semibold text-primary">AI</span>}</Link></div>)}</nav>
      <div className="shrink-0 px-4 pb-4"><div className="mb-4 rounded-xl [@media(max-height:820px)]:hidden border border-primary/10 bg-secondary/55 p-3.5"><div className="mb-2 flex items-center gap-2 text-[11px] font-semibold"><Sparkles className="size-3.5 text-primary" />A little help. A lot of clarity.</div><p className="text-[10px] leading-relaxed text-muted-foreground">Make room for what matters with your personal AI assistant.</p><Link href="/assistant" className="mt-3 flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-[10px] font-medium">Meet your assistant<ArrowUpRight className="size-3" /></Link></div><Link href="/settings" className={cn('nav-item', pathname === '/settings' && 'active')} onClick={() => setMobile(false)}><Settings />Settings</Link><button className="nav-item w-full" onClick={() => setHelp(true)}><CircleHelp />Help & getting started</button></div>
      <div className="flex shrink-0 items-center gap-2.5 border-t px-5 py-4"><span className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-card bg-secondary text-xs font-semibold text-primary">{data.profile.name.slice(0, 2).toUpperCase()}</span><Link href="/settings" className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{data.profile.name}</p><p className="mt-0.5 text-[9px] text-muted-foreground">Personal account</p></Link><button type="button" aria-label="Log out" onClick={logout}><LogOut className="size-4 text-muted-foreground" /></button></div>
    </aside>
    <div className="app-main"><header className="topbar"><div className="flex items-center gap-3"><Button size="icon" variant="ghost" className="lg:hidden" aria-label="Open navigation" onClick={() => setMobile(true)}><Menu /></Button><span className="text-[14px] font-semibold">{title}</span><span className="hidden h-4 w-px bg-border md:block" /><span className="hidden text-[11px] text-muted-foreground md:block">Your life, a little more in sync.</span></div><div className="flex items-center gap-2 md:gap-3"><span className="hidden text-[11px] text-muted-foreground lg:block">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span><button className="hidden h-8 w-52 items-center gap-2 rounded-lg border bg-background/60 px-3 text-[10px] text-muted-foreground sm:flex" onClick={() => setSearchOpen(true)}><Search className="size-3.5" />Search anything...<span className="ml-auto flex items-center rounded border px-1 text-[9px]"><Command className="size-2.5" />K</span></button><Button aria-label="Search workspace" variant="ghost" size="icon" className="sm:hidden" onClick={() => setSearchOpen(true)}><Search /></Button><Button variant="ghost" size="icon" aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggleTheme}>{dark ? <Sun /> : <Moon />}</Button><div className="relative"><Button variant="ghost" size="icon" aria-label="Notifications" onClick={() => setNotifications(true)}><Bell /></Button><span className="pointer-events-none absolute top-1.5 right-2 size-1.5 rounded-full bg-primary ring-2 ring-card" /></div><span className="mx-1 hidden h-6 w-px bg-border sm:block" /><DropdownMenu><DropdownMenuTrigger aria-label="Open profile menu" className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-primary">{data.profile.name.slice(0, 2).toUpperCase()}</span><ChevronDown className="size-3 text-muted-foreground" /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuGroup><DropdownMenuItem onClick={() => router.push('/settings')}>Account settings</DropdownMenuItem><DropdownMenuItem onClick={toggleTheme}>Switch theme</DropdownMenuItem><DropdownMenuItem onClick={logout}><LogOut />Log out</DropdownMenuItem></DropdownMenuGroup></DropdownMenuContent></DropdownMenu></div></header>{isLoading && isBackendConnected && <div className="px-8 py-2 text-xs text-muted-foreground" role="status">Loading your workspace…</div>}{error && isBackendConnected && <div className="mx-5 mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive lg:mx-8" role="alert">Your workspace could not be loaded. Check the backend connection and try again.</div>}{children}<footer className="mx-5 mb-5 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-[10px] text-muted-foreground lg:mx-8"><span>LifeOS AI · One place to organize your entire life.</span><span className="flex items-center gap-1.5"><span className={cn('size-1.5 rounded-full', isBackendConnected ? 'bg-success' : 'bg-warning')} />{isBackendConnected ? 'Connected to LifeOS API' : 'Preview data · Changes reset on refresh'}</span></footer></div>
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}><DialogContent><DialogHeader><DialogTitle>Search your workspace</DialogTitle><DialogDescription>Find a page or task in your personal workspace.</DialogDescription></DialogHeader><Input aria-label="Search pages and tasks" placeholder="Search tasks, expenses, goals..." value={search} onChange={e => setSearch(e.target.value)} /><div className="flex max-h-72 flex-col gap-1 overflow-y-auto">{navigation.filter(n => n.label.toLowerCase().includes(search.toLowerCase())).map(n => <Link key={n.href} href={n.href} onClick={() => setSearchOpen(false)} className="nav-item"><n.icon />{n.label}<ChevronRight className="ml-auto" /></Link>)}{search && data.tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase())).slice(0, 5).map(t => <Link key={t.id} href={`/tasks?q=${encodeURIComponent(t.title)}`} onClick={() => setSearchOpen(false)} className="nav-item"><CheckSquare /><span className="truncate">{t.title}</span></Link>)}</div></DialogContent></Dialog>
    <Dialog open={notifications} onOpenChange={setNotifications}><DialogContent><DialogHeader><DialogTitle>You&apos;re in the loop</DialogTitle><DialogDescription>{isBackendConnected ? 'Notifications are not available from the current API.' : 'Your latest reminders from the demo workspace.'}</DialogDescription></DialogHeader>{isBackendConnected ? <p className="text-sm text-muted-foreground">No notification endpoint is configured yet.</p> : ['Your project presentation is due today at 3:00 PM.', 'Reading streak: 7 days. Keep the momentum going!', 'Food & Dining has reached 89% of its monthly budget.'].map(n => <div key={n} className="flex gap-3 rounded-lg border p-3 text-xs"><Bell className="size-4 shrink-0 text-primary" />{n}</div>)}</DialogContent></Dialog>
    <Dialog open={help} onOpenChange={setHelp}><DialogContent><DialogHeader><DialogTitle>A fresh start for your everyday</DialogTitle><DialogDescription>{isBackendConnected ? 'Your workspace is connected to the LifeOS API.' : 'This is an interactive frontend preview using sample data.'}</DialogDescription></DialogHeader><div className="flex flex-col gap-4 text-sm text-muted-foreground"><p>Add a task, track an expense, or check off a habit. Your changes are shared across pages during this session.</p><p>AI chat, budgets, password recovery, and goal milestones require backend endpoints that are not currently exposed.</p>{!isBackendConnected && <p>Set NEXT_PUBLIC_API_URL to connect this app to your FastAPI backend.</p>}</div></DialogContent></Dialog>
    <Toaster />
  </>
}
