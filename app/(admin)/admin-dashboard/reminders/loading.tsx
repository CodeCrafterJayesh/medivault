export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted"></div>
        <div className="h-8 w-32 animate-pulse rounded-md bg-muted"></div>
      </div>
      <div className="space-y-4">
        <div className="h-64 animate-pulse rounded-lg bg-muted"></div>
        <div className="h-64 animate-pulse rounded-lg bg-muted"></div>
      </div>
    </div>
  )
}
