"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Cpu, Zap, BarChart3, Clock, CheckCircle2 } from "lucide-react"
import { modelData } from "@/data/model-data"
import { Progress } from "@/components/ui/progress"
import { useModel, availableModels } from "@/contexts/model-context"
import type { ModelSelection } from "@/types/models"

interface ModelSelectorProps {
  onModelsSelected: (selection: ModelSelection) => void
  initialSelection: ModelSelection
}

export function ModelSelector({ onModelsSelected, initialSelection }: ModelSelectorProps) {
  const [selectedModels, setSelectedModels] = useState<string[]>(initialSelection.models)
  const [comparisonMode, setComparisonMode] = useState(initialSelection.isComparison)

  // Get model states from context
  const { modelStates, loadModel } = useModel()

  // Start loading models when they're selected
  useEffect(() => {
    // Only load models that are selected and not already loading/loaded
    selectedModels.forEach((modelId) => {
      const currentState = modelStates[modelId]
      if (currentState.status === "idle") {
        console.log(`Starting to load model ${modelId}`)
        loadModel(modelId).catch((error) => {
          console.error(`Failed to load model ${modelId}:`, error)
        })
      }
    })
  }, [selectedModels, modelStates, loadModel])

  useEffect(() => {
    // Only notify parent component when selection actually changes
    const newSelection = {
      models: selectedModels,
      isComparison: comparisonMode,
    }

    if (
      JSON.stringify(newSelection.models) !== JSON.stringify(initialSelection.models) ||
      newSelection.isComparison !== initialSelection.isComparison
    ) {
      onModelsSelected(newSelection)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModels, comparisonMode, initialSelection.models, initialSelection.isComparison])

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
      setSelectedModels(modelData.map((model) => model.id))
    }
    setComparisonMode(!comparisonMode)
  }

  // Get loading status text
  const getLoadingStatusText = (modelId: string) => {
    const state = modelStates[modelId]
    switch (state.status) {
      case "loading":
        return `Loading... ${Math.round(state.progress)}%`
      case "loaded":
        return "Model loaded"
      case "running":
        return `Running inference... ${Math.round(state.progress)}%`
      case "complete":
        return "Inference complete"
      case "error":
        return `Error: ${state.error}`
      default:
        return "Click to load model"
    }
  }

  // Get model size text
  const getModelSizeText = (modelId: string) => {
    const modelInfo = availableModels[modelId]
    return modelInfo ? `${modelInfo.size} MB` : ""
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
        {modelData.map((model) => {
          const isSelected = selectedModels.includes(model.id)
          const modelState = modelStates[model.id]
          const isLoading = modelState.status === "loading"
          const isLoaded = modelState.status === "loaded" || modelState.status === "complete"
          const isRunning = modelState.status === "running"
          const hasError = modelState.status === "error"

          return (
            <div
              key={model.id}
              className={`bg-accent/50 p-6 rounded-lg border-2 transition-colors ${
                isSelected ? "border-marine-indigo" : "border-transparent"
              }`}
            >
              <div className="flex items-center mb-4">
                {!comparisonMode && (
                  <Checkbox
                    id={model.id}
                    checked={isSelected}
                    onCheckedChange={() => handleModelChange(model.id)}
                    className="mr-3 border-marine-indigo data-[state=checked]:bg-marine-indigo"
                  />
                )}
                {model.icon === "zap" && <Zap className="h-8 w-8 text-yellow-500" />}
                {model.icon === "cpu" && <Cpu className="h-8 w-8 text-purple-500" />}
                {model.icon === "chart" && <BarChart3 className="h-8 w-8 text-blue-500" />}
                <h3 className="text-lg font-semibold ml-3">{model.name}</h3>
              </div>

              <p className="text-muted-foreground mb-4">{model.description}</p>

              <div className="mb-4">
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

              {/* Model loading status */}
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">{getLoadingStatusText(model.id)}</span>
                    <span className="text-xs text-muted-foreground">{getModelSizeText(model.id)}</span>
                  </div>

                  {(isLoading || isRunning) && <Progress value={modelState.progress} className="h-2" />}

                  {isLoaded && !isRunning && (
                    <div className="flex items-center text-green-500 text-sm">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      <span>Ready for inference</span>
                    </div>
                  )}

                  {hasError && <div className="text-destructive text-sm">{modelState.error}</div>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

