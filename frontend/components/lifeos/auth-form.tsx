'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Sparkles, CheckSquare, Wallet, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { FormFields, zodResolver, type FieldDef } from './form-dialog'
import { api, apiErrorMessage } from '@/lib/api'

type Mode = 'login' | 'register' | 'forgot' | 'reset'
const email = z.email('Enter a valid email address.')
const password = z.string().min(8, 'Use at least 8 characters.')
const schemas = {
  login: z.object({ email, password: z.string().min(1, 'Enter your password.') }),
  register: z.object({ name: z.string().trim().min(2, 'Enter your name.'), email, password, confirm: z.string() }).refine(v => v.password === v.confirm, { message: 'Passwords do not match.', path: ['confirm'] }),
  forgot: z.object({ email }),
  reset: z.object({ password, confirm: z.string() }).refine(v => v.password === v.confirm, { message: 'Passwords do not match.', path: ['confirm'] }),
}
const config: Record<Mode, { title: string; description: string; submit: string; fields: FieldDef[] }> = {
  login: { title: 'Welcome back', description: 'Sign in to continue to your workspace.', submit: 'Sign in', fields: [{ name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', full: true }, { name: 'password', label: 'Password', type: 'password', full: true, placeholder:"Enter your password" }] },
  register: { title: 'Create your account', description: 'Start organizing your life in one calm place.', submit: 'Create account', fields: [{ name: 'name', label: 'Full name', full: true }, { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', full: true }, { name: 'password', label: 'Password', type: 'password', full: true }, { name: 'confirm', label: 'Confirm password', type: 'password', full: true }] },
  forgot: { title: 'Forgot your password?', description: "Enter your email and we'll send a reset link.", submit: 'Send reset link', fields: [{ name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', full: true }] },
  reset: { title: 'Set a new password', description: 'Choose a strong password you have not used before.', submit: 'Reset password', fields: [{ name: 'password', label: 'New password', type: 'password', full: true }, { name: 'confirm', label: 'Confirm password', type: 'password', full: true }] },
}
const features = [{ icon: CheckSquare, text: 'Tasks, calendar, and deadlines together' }, { icon: Wallet, text: 'Budgets and spending you can understand' }, { icon: Sprout, text: 'Habits and goals that build momentum' }]

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const [remember, setRemember] = useState(false)
  const c = config[mode]
  const form = useForm({ resolver: zodResolver(schemas[mode] as z.ZodType<Record<string, string>>), defaultValues: Object.fromEntries(c.fields.map(f => [f.name, ''])) })

  const onSubmit = async (values: Record<string, string>) => {
    if (mode === 'forgot' || mode === 'reset') {
      toast.error('Password recovery is not available in the current backend API.')
      return
    }
    try {
      if (mode === 'login') {
        await api.user.login(values.email, values.password, remember)
        toast.success('Welcome back!')
        router.replace('/')
        return
      }
      await api.user.register({ full_name: values.name, email: values.email, password: values.password })
      toast.success('Account created', { description: 'Sign in with your new account.' })
      router.replace('/login')
    } catch (error) {
      toast.error(mode === 'login' ? 'Could not sign in' : 'Could not create account', { description: apiErrorMessage(error) })
    }
  }

  return <div className="grid min-h-dvh lg:grid-cols-2">
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
      <div className="flex items-center gap-2.5 font-semibold"><span className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground/15"><Sparkles className="size-4" /></span>LifeOS AI</div>
      <div className="flex max-w-md flex-col gap-6"><h2 className="text-3xl font-semibold leading-tight text-balance">Your life, a little more in sync.</h2><ul className="flex flex-col gap-3">{features.map(f => <li key={f.text} className="flex items-center gap-3 text-sm opacity-90"><f.icon className="size-4" />{f.text}</li>)}</ul></div>
      <p className="text-xs opacity-70">Your personal space for a life that feels a little more in sync.</p>
    </aside>
    <main className="flex items-center justify-center bg-background p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 font-semibold lg:hidden">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="size-4" /></span>LifeOS AI</div>

        <div><h1 className="text-xl font-semibold">{c.title}</h1><p className="mt-1 text-sm text-muted-foreground">{c.description}</p></div>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <FormFields form={form} fields={c.fields} />
          {mode === 'login' && <div className="-mt-2 flex items-center justify-between gap-3">
            <label htmlFor="remember-me" className="flex items-center gap-2 text-xs text-muted-foreground"><input id="remember-me" type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} />Remember me</label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
          </div>}
          <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <Spinner data-icon="inline-start" />}{c.submit}</Button>
        </form>
        <p className="text-center text-xs text-muted-foreground">
          {mode === 'login' ? <>New to LifeOS? <Link href="/register" className="font-medium text-primary hover:underline">Create an account</Link></> : mode === 'register' ? <>Already have an account? <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link></> : <Link href="/login" className="font-medium text-primary hover:underline">Back to sign in</Link>}
        </p>
      </div>
    </main>
  </div>
}
