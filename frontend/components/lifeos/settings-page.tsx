'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Field, FieldGroup, FieldLabel, FieldContent, FieldDescription } from '@/components/ui/field'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PageHeading } from './shared'
import { FormFields, SimpleSelect, zodResolver } from './form-dialog'
import { useWorkspace } from '@/lib/workspace-store'

const profileSchema = z.object({ name: z.string().trim().min(2, 'Use at least 2 characters.').max(40), email: z.email('Enter a valid email address.') })
const passwordSchema = z.object({ current: z.string().min(1, 'Enter your current password.'), next: z.string().min(8, 'Use at least 8 characters.').regex(/[0-9]/, 'Include at least one number.'), confirm: z.string() }).refine(v => v.next === v.confirm, { message: 'Passwords do not match.', path: ['confirm'] })
type ProfileValues = z.infer<typeof profileSchema>
type PasswordValues = z.infer<typeof passwordSchema>

export function SettingsPage() {
  const { data, update, isBackendConnected } = useWorkspace()
  const [theme, setTheme] = useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light')
  const profile = useForm<ProfileValues>({ defaultValues: { name: data.profile.name, email: data.profile.email }, resolver: zodResolver(profileSchema) })
  const password = useForm<PasswordValues>({ defaultValues: { current: '', next: '', confirm: '' }, resolver: zodResolver(passwordSchema) })
  const setPref = (patch: Partial<typeof data.profile>) => update(d => ({ ...d, profile: { ...d.profile, ...patch } }))
  const applyTheme = (t: string) => { setTheme(t); document.documentElement.classList.toggle('dark', t === 'dark'); document.documentElement.classList.toggle('light', t !== 'dark') }

  return <main className="page-content">
    <PageHeading title="Settings" description="Manage your profile, security, and preferences." />
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      {isBackendConnected && <Alert><AlertTitle>Some settings are local only</AlertTitle><AlertDescription>The current API supports account sign-in, but does not expose profile, password, or preference update endpoints.</AlertDescription></Alert>}
      <Card><form noValidate onSubmit={profile.handleSubmit(async v => { const saved = await setPref(v); if (saved) toast.success(isBackendConnected ? 'Profile updated for this session' : 'Profile updated') })} className="flex flex-col gap-6">
        <CardHeader><CardTitle>Profile</CardTitle><CardDescription>How you appear across your workspace.</CardDescription></CardHeader>
        <CardContent><FormFields form={profile} fields={[{ name: 'name', label: 'Full name' }, { name: 'email', label: 'Email address', type: 'email' }]} /></CardContent>
        <CardFooter className="justify-end"><Button type="submit">Save profile</Button></CardFooter>
      </form></Card>

      <Card><form noValidate onSubmit={password.handleSubmit(() => { if (isBackendConnected) { toast.error('Password updates are not available in the current backend API.'); return } password.reset(); toast.success('Password changed') })} className="flex flex-col gap-6">
        <CardHeader><CardTitle>Password</CardTitle><CardDescription>Use at least 8 characters, including a number.</CardDescription></CardHeader>
        <CardContent><FormFields form={password} fields={[{ name: 'current', label: 'Current password', type: 'password', full: true }, { name: 'next', label: 'New password', type: 'password' }, { name: 'confirm', label: 'Confirm new password', type: 'password' }]} /></CardContent>
        <CardFooter className="justify-end"><Button type="submit">Update password</Button></CardFooter>
      </form></Card>

      <Card>
        <CardHeader><CardTitle>Preferences</CardTitle><CardDescription>Make LifeOS feel like yours.</CardDescription></CardHeader>
        <CardContent><FieldGroup>
          <Field orientation="horizontal"><FieldContent><FieldLabel>Theme</FieldLabel><FieldDescription>Choose a light or dark appearance.</FieldDescription></FieldContent>
            <ToggleGroup value={[theme]} onValueChange={v => v[0] && applyTheme(v[0])} variant="outline" aria-label="Theme"><ToggleGroupItem value="light"><Sun />Light</ToggleGroupItem><ToggleGroupItem value="dark"><Moon />Dark</ToggleGroupItem></ToggleGroup></Field>
          <Field orientation="horizontal"><FieldContent><FieldLabel htmlFor="currency">Currency</FieldLabel><FieldDescription>Used for all amounts.</FieldDescription></FieldContent>
            <SimpleSelect id="currency" label="Currency" value={data.profile.currency} onChange={v => { setPref({ currency: v }); toast.success(`Currency set to ${v}`) }} options={['USD', 'EUR', 'GBP', 'INR', 'JPY']} className="w-32" /></Field>
          <Field orientation="horizontal"><FieldContent><FieldLabel htmlFor="timezone">Time zone</FieldLabel><FieldDescription>For reminders and schedules.</FieldDescription></FieldContent>
            <SimpleSelect id="timezone" label="Time zone" value={data.profile.timezone} onChange={v => setPref({ timezone: v })} options={['Asia/Kolkata', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo']} className="w-48" /></Field>
          <Field orientation="horizontal"><FieldContent><FieldLabel htmlFor="notifications">Email notifications</FieldLabel><FieldDescription>Weekly summaries and insights.</FieldDescription></FieldContent>
            <Switch id="notifications" checked={data.profile.notifications} onCheckedChange={v => setPref({ notifications: v })} /></Field>
          <Field orientation="horizontal"><FieldContent><FieldLabel htmlFor="reminders">Task reminders</FieldLabel><FieldDescription>A gentle nudge before tasks are due.</FieldDescription></FieldContent>
            <Switch id="reminders" checked={data.profile.reminders} onCheckedChange={v => setPref({ reminders: v })} /></Field>
        </FieldGroup></CardContent>
      </Card>
    </div>
  </main>
}
