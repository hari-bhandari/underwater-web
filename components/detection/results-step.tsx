"use client"

import { DetectionResults } from "@/components/detection/detection-results"
import type { MediaSource } from "@/types/media"
import type { ModelSelection } from "@/types/models"

interface ResultsStepProps {
  mediaSource: MediaSource
  modelSelection: ModelSelection
}

export function ResultsStep({ mediaSource, modelSelection }: ResultsStepProps) {
  return (
    <div className="space-y-6">
      <DetectionResults mediaSource={mediaSource} modelSelection={modelSelection} />
    </div>
  )
}

