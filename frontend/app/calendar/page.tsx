import type { Metadata } from 'next'
import { CalendarPage } from '@/components/lifeos/calendar-page'

export const metadata: Metadata = { title: 'Calendar — LifeOS AI' }

export default function Page() {
  return <CalendarPage />
}
