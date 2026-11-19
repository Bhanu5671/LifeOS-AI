import type { Metadata } from 'next'
import { SettingsPage } from '@/components/lifeos/settings-page'

export const metadata: Metadata = { title: 'Settings — LifeOS AI' }

export default function Page() {
  return <SettingsPage />
}
