import type { Metadata } from 'next'
import { GoalsPage } from '@/components/lifeos/goals-page'

export const metadata: Metadata = { title: 'Goals — LifeOS AI' }

export default function Page() {
  return <GoalsPage />
}
