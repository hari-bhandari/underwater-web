"use client"
import { MainDetectionFlow } from "@/components/main-detection-flow"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <MainDetectionFlow />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

