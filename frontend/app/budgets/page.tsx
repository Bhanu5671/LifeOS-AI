import type { Metadata } from 'next'
import { BudgetsPage } from '@/components/lifeos/budgets-page'

export const metadata: Metadata = { title: 'Budgets — LifeOS AI' }

export default function Page() {
  return <BudgetsPage />
}
