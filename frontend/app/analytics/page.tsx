import type { Metadata } from 'next'
import { AnalyticsPage } from '@/components/lifeos/analytics-page'

export const metadata: Metadata = { title: 'Analytics — LifeOS AI' }

export default function Page() {
  return <AnalyticsPage />
}
