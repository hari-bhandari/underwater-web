"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Moon, Sun, Github, BarChart3, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "@/components/theme-provider"

const navItems = [
  { name: "Home", href: "/", icon: <Home className="h-5 w-5 mr-2" /> },
  { name: "Statistical Evaluation", href: "/analysis", icon: <BarChart3 className="h-5 w-5 mr-2" /> },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="border-r border-border">
              <div className="px-2">
                <Link href="/" className="flex items-center gap-2 py-4 text-lg font-semibold">
                  <BarChart3 className="h-6 w-6 text-marine-indigo" />
                  <span>Marine Detection</span>
                </Link>
              </div>
              <nav className="flex flex-col gap-4 py-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-2 py-1 text-sm font-medium rounded-md transition-colors ${
                      pathname === item.href
                        ? "bg-marine-indigo text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
                <a
                  href="https://github.com/university-of-york/marine-detection"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-2 py-1 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <Github className="h-5 w-5 mr-2" />
                  GitHub Repository
                </a>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-marine-indigo" />
            <span className="hidden font-bold sm:inline-block">Underwater Object Detection</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center text-sm font-medium transition-colors ${
                pathname === item.href ? "text-marine-indigo" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
          <a
            href="https://github.com/university-of-york/marine-detection"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
          >
            <Github className="h-5 w-5 mr-2" />
            GitHub
          </a>
        </nav>
        <div className="flex items-center gap-2">
          {isMounted && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-slate-700" />
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

