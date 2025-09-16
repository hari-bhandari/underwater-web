"use client"

import { usePathname, useRouter } from "next/navigation"
import { Check } from "lucide-react"

interface Step {
  id: string
  name: string
  path: string
}

const steps: Step[] = [
  { id: "input", name: "Input", path: "/" },
  { id: "models", name: "Models", path: "/models" },
  { id: "results", name: "Results", path: "/results" },
]

export function Stepper() {
  const pathname = usePathname()
  const router = useRouter()

  // Determine current step based on pathname
  const currentStepIndex = steps.findIndex((step) => pathname === step.path || pathname.startsWith(step.path + "/"))

  const handleStepClick = (path: string, index: number) => {
    // Only allow navigation to completed steps or the next available step
    if (index <= currentStepIndex + 1) {
      router.push(path)
    }
  }

  return (
    <div className="w-full flex justify-center mb-8">
      <div className="flex w-full max-w-3xl justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex
          const isCompleted = index < currentStepIndex

          return (
            <div
              key={step.id}
              className={`stepper-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
              onClick={() => handleStepClick(step.path, index)}
            >
              <div className="step-counter">{isCompleted ? <Check className="h-5 w-5" /> : index + 1}</div>
              <div className="step-name">{step.name}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

