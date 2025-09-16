import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ModelProvider } from "@/contexts/model-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Underwater Object Detection",
  description: "Detect marine species using state-of-the-art models"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ModelProvider>{children}</ModelProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'