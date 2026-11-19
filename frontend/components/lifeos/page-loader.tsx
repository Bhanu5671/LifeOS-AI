"use client"

import { Spinner } from "@/components/ui/spinner"

export function PageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Spinner className="size-5 text-primary" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  )
}