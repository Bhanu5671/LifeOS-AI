import type { Metadata } from 'next'
import { AuthForm } from '@/components/lifeos/auth-form'

export const metadata: Metadata = { title: 'Forgot password — LifeOS AI' }

export default function Page() {
  return <AuthForm mode="forgot" />
}
