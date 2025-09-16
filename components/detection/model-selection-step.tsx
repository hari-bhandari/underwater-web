"use client"

import { ModelSelector } from "@/components/detection/model-selector"
import { RuntimeSelector } from "@/components/detection/runtime-selector"
import type { ModelSelection } from "@/types/models"

interface ModelSelectionStepProps {
  onModelsSelected: (selection: ModelSelection) => void
  initialSelection: ModelSelection
}

export function ModelSelectionStep({ onModelsSelected, initialSelection }: ModelSelectionStepProps) {
  return (
    <div className="space-y-6">
      <RuntimeSelector />
      <ModelSelector onModelsSelected={onModelsSelected} initialSelection={initialSelection} />
    </div>
  )
}
