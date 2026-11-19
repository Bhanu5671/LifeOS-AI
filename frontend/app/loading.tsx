import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <Spinner className="size-7 text-primary" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-medium text-foreground">Loading LifeOS</p>
          <p className="text-xs text-muted-foreground">Getting things in order...</p>
        </div>
      </div>
    </div>
  )
}