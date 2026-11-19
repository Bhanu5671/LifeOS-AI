import { Suspense } from 'react'
import type { Metadata } from 'next'
import { TasksPage } from '@/components/lifeos/tasks-page'

export const metadata: Metadata = { title: 'Tasks — LifeOS AI' }

export default function Page() {
  return <Suspense><TasksPage /></Suspense>
}
