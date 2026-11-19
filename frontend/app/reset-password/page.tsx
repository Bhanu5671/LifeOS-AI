import type { Metadata } from 'next'
import { AuthForm } from '@/components/lifeos/auth-form'

export const metadata: Metadata = { title: 'Reset password — LifeOS AI' }

export default function Page() {
  return <AuthForm mode="reset" />
}
