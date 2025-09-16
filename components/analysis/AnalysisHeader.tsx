import { AnalysisTitle } from "@/components/analysis/AnalysisTitle"
import { AnalysisDescription } from "@/components/analysis/AnalysisDescription"
import { AnalysisBackButton } from "@/components/analysis/AnalysisBackButton"

export function AnalysisHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <AnalysisTitle />
        <AnalysisDescription />
      </div>
      <AnalysisBackButton />
    </div>
  )
}
