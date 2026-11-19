import type { Metadata } from 'next'
import { ExpensesPage } from '@/components/lifeos/expenses-page'

export const metadata: Metadata = { title: 'Expenses — LifeOS AI' }

export default function Page() {
  return <ExpensesPage />
}
