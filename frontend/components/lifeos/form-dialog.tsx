'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller, type FieldValues, type DefaultValues, type Path, type Resolver } from 'react-hook-form'
import type { ZodType } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '@/components/ui/select'
import { cn } from '@/lib/utils'

export function SimpleSelect({ value, onChange, options, label, id, className }: { value: string; onChange: (value: string) => void; options: string[]; label: string; id?: string; className?: string }) {
  return <Select value={value} onValueChange={v => onChange(String(v ?? ''))}>
    <SelectTrigger id={id} aria-label={label} className={cn('w-full', className)}><SelectValue placeholder={label} /></SelectTrigger>
    <SelectContent><SelectGroup>{options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectGroup></SelectContent>
  </Select>
}

export function zodResolver<T extends FieldValues>(schema: ZodType<T>): Resolver<T> {
  return async values => {
    const result = schema.safeParse(values)
    if (result.success) return { values: result.data, errors: {} }
    const errors: Record<string, { type: string; message: string }> = {}
    for (const issue of result.error.issues) errors[String(issue.path[0])] ??= { type: 'validation', message: issue.message }
    return { values: {}, errors } as never
  }
}

export type FieldDef = { name: string; label: string; type?: 'text' | 'textarea' | 'select' | 'date' | 'time' | 'number' | 'email' | 'password'; options?: string[]; placeholder?: string; full?: boolean }

function PasswordInput({ id, placeholder, invalid, registration }: { id: string; placeholder?: string; invalid: boolean; registration: ReturnType<ReturnType<typeof useForm>['register']> }) {
  const [visible, setVisible] = useState(false)
  return <div className="relative">
    <Input id={id} type={visible ? 'text' : 'password'} placeholder={placeholder} aria-invalid={invalid} className="pr-10" {...registration} />
    <button type="button" className="absolute inset-y-0 right-2 flex items-center text-muted-foreground" aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} onClick={() => setVisible(value => !value)}>
      {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  </div>
}

export function FormFields<T extends FieldValues>({ form, fields }: { form: ReturnType<typeof useForm<T>>; fields: FieldDef[] }) {
  const { register, control, formState: { errors } } = form
  return <FieldGroup className="grid gap-4 sm:grid-cols-2">
    {fields.map(f => {
      const name = f.name as Path<T>
      const error = errors[f.name]?.message as string | undefined
      const id = `field-${f.name}`
      return <Field key={f.name} data-invalid={!!error || undefined} className={cn((f.full || f.type === 'textarea') && 'sm:col-span-2')}>
        <FieldLabel htmlFor={id}>{f.label}</FieldLabel>
        {f.type === 'textarea' ? <Textarea id={id} placeholder={f.placeholder} aria-invalid={!!error} {...register(name)} />
          : f.type === 'select' ? <Controller control={control} name={name} render={({ field }) => <SimpleSelect id={id} label={f.label} value={field.value} onChange={field.onChange} options={f.options ?? []} />} />
          : f.type === 'password' ? <PasswordInput id={id} placeholder={f.placeholder} invalid={!!error} registration={register(name)} />
          : <Input id={id} type={f.type ?? 'text'} step={f.type === 'number' ? '0.01' : undefined} placeholder={f.placeholder} aria-invalid={!!error} {...register(name, { valueAsNumber: f.type === 'number' })} />}
        {error && <FieldError>{error}</FieldError>}
      </Field>
    })}
  </FieldGroup>
}

export function FormDialog<T extends FieldValues>({ open, onOpenChange, title, description, fields, schema, defaults, onSubmit, submitLabel = 'Save changes' }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; fields: FieldDef[]; schema: ZodType<T>; defaults: DefaultValues<T>; onSubmit: (values: T) => void | boolean | Promise<void | boolean>; submitLabel?: string }) {
  const form = useForm<T>({ defaultValues: defaults, resolver: zodResolver(schema) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (open) form.reset(defaults) }, [open])
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-lg">
      <form noValidate onSubmit={form.handleSubmit(async values => { const result = await onSubmit(values); if (result !== false) onOpenChange(false) })} className="flex flex-col gap-5">
        <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
        <FormFields form={form} fields={fields} />
        <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit">{submitLabel}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
}
