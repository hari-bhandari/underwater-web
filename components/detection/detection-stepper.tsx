"use client"

import { Check } from "lucide-react"

interface DetectionStepperProps {
  currentStep: number
  onStepClick: (step: number) => void
}

export function DetectionStepper({ currentStep, onStepClick }: DetectionStepperProps) {
  const steps = [
    { id: "input", name: "Input" },
    { id: "models", name: "Models" },
    { id: "results", name: "Results" },
  ]

  return (
    <div className="w-full flex justify-center mb-8">
      <div className="flex w-full max-w-3xl justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = index < currentStep

          return (
            <div
              key={step.id}
              className={`stepper-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
              onClick={() => onStepClick(index)}
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

