import type { Metadata } from 'next'
import { AssistantPage } from '@/components/lifeos/assistant-page'

export const metadata: Metadata = { title: 'AI Assistant — LifeOS AI' }

export default function Page() {
  return <AssistantPage />
}
