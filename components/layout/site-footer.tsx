import { BarChart3 } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <BarChart3 className="h-6 w-6 text-marine-indigo" />
            <span className="font-bold">Underwater Object Detection</span>
          </div>

          <p className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} University of York</p>
        </div>
      </div>
    </footer>
  )
}

