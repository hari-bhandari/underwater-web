import type { Metadata } from "next"

import { StatisticalAnalysis } from "@/components/analysis/statistical-analysis"

export const metadata: Metadata = {
  title: "Marine Detection Research Analysis",
  description: "Interactive dashboard derived from the Final (13) thesis report, covering metrics, robustness, and ablations.",
}

import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"

export default function AnalysisPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-10">
          <StatisticalAnalysis />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

