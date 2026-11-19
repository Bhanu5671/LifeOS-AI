'use client'

import { useState } from 'react'
import { Sparkles, ArrowUp, Plus, MessageSquare, CalendarCheck, Wallet, Target, ListTodo, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupTextarea } from '@/components/ui/input-group'
import { MessageScrollerProvider, MessageScroller, MessageScrollerViewport, MessageScrollerContent, MessageScrollerItem, MessageScrollerButton } from '@/components/ui/message-scroller'
import { Message, MessageContent, MessageAvatar } from '@/components/ui/message'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { useWorkspace } from '@/lib/workspace-store'
import { isBackendConnected } from '@/lib/api'
import { cn } from '@/lib/utils'

const prompts = [
  { label: 'Plan my day', icon: CalendarCheck, text: 'Plan my day based on my pending tasks.' },
  { label: 'Analyze my expenses', icon: Wallet, text: 'Analyze my expenses this month.' },
  { label: 'Pending tasks', icon: ListTodo, text: 'What tasks are still pending?' },
  { label: 'Goal suggestions', icon: Target, text: 'Give me suggestions to reach my goals.' },
]

export function AssistantPage() {
  const { data, update } = useWorkspace()
  const [activeId, setActiveId] = useState<string | null>(data.conversations[0]?.id ?? null)
  const active = data.conversations.find(c => c.id === activeId)

  return <main className="page-content">
    <div className="grid h-[calc(100dvh-9.5rem)] min-h-[560px] gap-5 lg:grid-cols-[260px_1fr]">
      <Card className="hidden gap-0 py-0 lg:flex">
        <div className="border-b p-4"><Button className="w-full" onClick={() => setActiveId(null)}><Plus data-icon="inline-start" />New chat</Button></div>
        <nav aria-label="Conversations" className="flex-1 overflow-y-auto p-2">
          {data.conversations.length === 0 ? <p className="p-3 text-[11px] text-muted-foreground">Your conversations will appear here.</p> : <ul className="flex flex-col gap-0.5">{data.conversations.map(c => <li key={c.id} className="group flex items-center">
            <button onClick={() => setActiveId(c.id)} aria-current={c.id === activeId || undefined} className={cn('flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2 text-left text-xs hover:bg-muted', c.id === activeId && 'bg-secondary font-medium text-primary')}><MessageSquare className="size-3.5 shrink-0" /><span className="truncate">{c.title}</span></button>
            <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100" aria-label={`Delete ${c.title}`} onClick={() => { update(d => ({ ...d, conversations: d.conversations.filter(x => x.id !== c.id) })); if (c.id === activeId) setActiveId(null) }}><Trash2 /></Button>
          </li>)}</ul>}
        </nav>
        <div className="border-t p-4 text-[10px] leading-relaxed text-muted-foreground">AI Assistant is coming soon. No AI endpoint is available yet.</div>
      </Card>

      <Card className="relative flex min-h-0 flex-col gap-0 py-0">
        <header className="flex items-center gap-3 border-b px-5 py-3.5"><span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="size-4" /></span><div><h1 className="text-sm font-semibold">LifeOS Assistant</h1><p className="text-[10px] text-muted-foreground">{isBackendConnected ? 'Coming soon' : 'Plans, insights, and gentle nudges'}</p></div></header>
        {isBackendConnected && <div className="mx-5 mt-4 rounded-lg border border-primary/20 bg-secondary/60 px-4 py-3 text-xs text-muted-foreground">The chat interface is ready. AI responses will be available when an assistant API is added to the backend.</div>}
        {!active || active.messages.length === 0 ? <div className="flex flex-1 items-center justify-center overflow-y-auto p-6"><Empty className="border-0">
          <EmptyHeader><EmptyMedia variant="icon"><Sparkles /></EmptyMedia><EmptyTitle>How can I help today, {data.profile.name}?</EmptyTitle><EmptyDescription>Ask about your tasks, spending, habits, or goals — or start with a suggestion.</EmptyDescription></EmptyHeader>
          <EmptyContent><ul className="grid w-full max-w-md gap-2 sm:grid-cols-2">{prompts.map(p => <li key={p.label}><button disabled className="flex w-full items-center gap-2.5 rounded-xl border bg-card p-3 text-left text-xs transition-colors hover:border-primary/40 hover:bg-secondary/50 disabled:cursor-not-allowed disabled:opacity-60"><p.icon className="size-4 text-primary" />{p.label}</button></li>)}</ul></EmptyContent>
        </Empty></div> : <MessageScrollerProvider><MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport className="h-full"><MessageScrollerContent className="mx-auto flex max-w-3xl flex-col gap-5 p-5">
            {active.messages.map((m, i) => <MessageScrollerItem key={i}><Message align={m.role === 'user' ? 'end' : 'start'}>
              {m.role === 'assistant' && <MessageAvatar className="bg-secondary text-primary"><Sparkles className="size-3.5" /></MessageAvatar>}
              <MessageContent><Bubble variant={m.role === 'user' ? 'default' : 'secondary'} align={m.role === 'user' ? 'end' : 'start'}><BubbleContent className="whitespace-pre-line">{m.content}</BubbleContent></Bubble></MessageContent>
            </Message></MessageScrollerItem>)}
          </MessageScrollerContent></MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller></MessageScrollerProvider>}
        <form className="border-t p-4" onSubmit={e => e.preventDefault()}>
          <InputGroup className="mx-auto max-w-3xl">
            <InputGroupTextarea aria-label="Message the assistant" placeholder="AI Assistant coming soon" rows={1} className="max-h-32" disabled />
            <InputGroupAddon align="block-end" className="justify-between"><span className="text-[10px] text-muted-foreground">No assistant API is available yet</span><Button type="submit" size="icon-sm" disabled aria-label="Send message"><ArrowUp /></Button></InputGroupAddon>
          </InputGroup>
        </form>
      </Card>
    </div>
  </main>
}
