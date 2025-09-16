import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function AnalysisBackButton() {
  return (
    <Link href="/">
      <Button variant="outline" className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Detection
      </Button>
    </Link>
  )
}
