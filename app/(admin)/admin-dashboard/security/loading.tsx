import { Loader2 } from "lucide-react"

export default function SecurityLoading() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading security data...</p>
      </div>
    </div>
  )
}
