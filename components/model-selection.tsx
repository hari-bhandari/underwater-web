"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Cpu, Zap, BarChart3, Clock } from "lucide-react"

interface ModelSelectionProps {
  onModelsSelected: (models: string[], comparison: boolean) => void
  initialModels?: string[]
  initialComparisonMode?: boolean
}

export function ModelSelection({
  onModelsSelected,
  initialModels = ["yolov8"],
  initialComparisonMode = false,
}: ModelSelectionProps) {
  const [selectedModels, setSelectedModels] = useState<string[]>(initialModels)
  const [comparisonMode, setComparisonMode] = useState(initialComparisonMode)

  const models = [
    {
      id: "yolov8",
      name: "YOLOv8",
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      description: "Fast and accurate object detection model with real-time performance.",
      strengths: [
        "Fastest inference time",
        "Good balance of speed and accuracy",
        "Excellent for real-time applications",
      ],
    },
    {
      id: "yolov8_transformer",
      name: "YOLOv8 head + Transformer",
      icon: <Cpu className="h-8 w-8 text-purple-500" />,
      description: "Enhanced YOLO model with transformer architecture for improved feature extraction.",
      strengths: [
        "Better feature representation",
        "Improved accuracy for complex scenes",
        "Strong performance on occluded objects",
      ],
    },
    {
      id: "rt_detr",
      name: "RT-DETR",
      icon: <BarChart3 className="h-8 w-8 text-blue-500" />,
      description: "Real-Time Detection Transformer combining transformer architecture with efficient design.",
      strengths: ["Highest accuracy", "Best for detailed analysis", "Superior performance on small objects"],
    },
  ]

  useEffect(() => {
    // Notify parent component when selection changes
    onModelsSelected(selectedModels, comparisonMode)
  }, [selectedModels, comparisonMode, onModelsSelected])

  const handleModelChange = (model: string) => {
    if (comparisonMode) {
      // In comparison mode, all models are selected
      return
    }

    if (selectedModels.includes(model)) {
      if (selectedModels.length > 1) {
        setSelectedModels(selectedModels.filter((m) => m !== model))
      }
    } else {
      setSelectedModels([...selectedModels, model])
    }
  }

  const toggleComparisonMode = () => {
    if (!comparisonMode) {
      // When enabling comparison mode, select all models
      setSelectedModels(["yolov8", "yolov8_transformer", "rt_detr"])
    }
    setComparisonMode(!comparisonMode)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-2 mb-6">
        <Checkbox
          id="comparison-mode"
          checked={comparisonMode}
          onCheckedChange={toggleComparisonMode}
          className="border-marine-indigo data-[state=checked]:bg-marine-indigo"
        />
        <Label htmlFor="comparison-mode" className="font-medium">
          Comparison Mode (Run all models)
        </Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {models.map((model) => (
          <div
            key={model.id}
            className={`bg-accent/50 p-6 rounded-lg border-2 transition-colors ${
              selectedModels.includes(model.id) ? "border-marine-indigo" : "border-transparent"
            }`}
          >
            <div className="flex items-center mb-4">
              {!comparisonMode && (
                <Checkbox
                  id={model.id}
                  checked={selectedModels.includes(model.id)}
                  onCheckedChange={() => handleModelChange(model.id)}
                  className="mr-3 border-marine-indigo data-[state=checked]:bg-marine-indigo"
                />
              )}
              {model.icon}
              <h3 className="text-lg font-semibold ml-3">{model.name}</h3>
            </div>

            <p className="text-muted-foreground mb-4">{model.description}</p>

            <div>
              <h4 className="font-medium text-marine-indigo mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Key Strengths
              </h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {model.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

