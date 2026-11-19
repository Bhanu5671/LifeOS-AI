import type { Metadata } from 'next'
import { HabitsPage } from '@/components/lifeos/habits-page'

export const metadata: Metadata = { title: 'Habits — LifeOS AI' }

export default function Page() {
  return <HabitsPage />
}
