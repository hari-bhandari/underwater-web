"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, BarChart3, AlertCircle } from "lucide-react"
import { DetectionStepper } from "@/components/detection/detection-stepper"
import { InputStep } from "@/components/detection/input-step"
import { ModelSelectionStep } from "@/components/detection/model-selection-step"
import { ResultsStep } from "@/components/detection/results-step"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useModel } from "@/contexts/model-context"
import type { MediaSource } from "@/types/media"
import type { ModelSelection } from "@/types/models"

// Steps for the application flow
const STEPS = {
  INPUT: 0,
  MODELS: 1,
  RESULTS: 2,
}

export function MainDetectionFlow() {
  const router = useRouter()
  const { modelStates, resetAllModels } = useModel()

  // State for tracking the current step
  const [currentStep, setCurrentStep] = useState(STEPS.INPUT)

  // State for tracking selected media
  const [mediaSource, setMediaSource] = useState<MediaSource | null>(null)

  // State for tracking selected models
  const [modelSelection, setModelSelection] = useState<ModelSelection>({
    models: ["yolov8"],
    isComparison: false,
  })

  // State for tracking validation errors
  const [validationError, setValidationError] = useState<string | null>(null)

  // Reset models when component mounts
  useEffect(() => {
    resetAllModels()
  }, [resetAllModels])

  // Check if models are ready for inference
  const areModelsReady = () => {
    return modelSelection.models.every(
      (model) => modelStates[model]?.status === "loaded" || modelStates[model]?.status === "complete",
    )
  }

  // Check if the current step is complete
  const isStepComplete = (step: number) => {
    switch (step) {
      case STEPS.INPUT:
        return !!mediaSource && !!mediaSource.source
      case STEPS.MODELS:
        return modelSelection.models.length > 0 && areModelsReady()
      default:
        return true
    }
  }

  // Navigate to next step
  const nextStep = () => {
    if (currentStep === STEPS.INPUT && !isStepComplete(STEPS.INPUT)) {
      setValidationError("Please select an image or upload a file before proceeding")
      return
    }

    if (currentStep === STEPS.MODELS && !areModelsReady()) {
      setValidationError("Please wait for models to finish loading")
      return
    }

    if (currentStep < STEPS.RESULTS && isStepComplete(currentStep)) {
      setValidationError(null)
      setCurrentStep(currentStep + 1)
    }
  }

  // Navigate to previous step
  const prevStep = () => {
    if (currentStep > STEPS.INPUT) {
      setValidationError(null)
      setCurrentStep(currentStep - 1)
    }
  }

  // Handle media selection
  const handleMediaSelected = (media: MediaSource) => {
    setMediaSource(media)
    setValidationError(null)
  }

  // Handle model selection
  const handleModelsSelected = (selection: ModelSelection) => {
    setModelSelection(selection)
  }

  // Navigate to statistical analysis page
  const goToAnalysis = () => {
    router.push("/analysis")
  }

  // Check if any models are loading
  const isLoading = modelSelection.models.some((model) => modelStates[model]?.status === "loading")

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-foreground">Underwater Object Detection</h1>
      <p className="text-muted-foreground mb-8">Detect marine species using state-of-the-art computer vision models</p>

      <DetectionStepper
        currentStep={currentStep}
        onStepClick={(step) => {
          // Only allow navigation to completed steps or the current step
          if (step < currentStep || (step === currentStep + 1 && isStepComplete(currentStep))) {
            setCurrentStep(step)
            setValidationError(null)
          }
        }}
      />

      <Card className="overflow-hidden border border-border">
        <CardContent className="p-6">
          {validationError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {currentStep === STEPS.INPUT && (
            <>
              <h2 className="text-xl font-semibold text-card-foreground mb-4">Select Input</h2>
              <p className="text-muted-foreground mb-6">
                Upload an image or video, or select from our sample images to detect marine species
              </p>

              <InputStep onMediaSelected={handleMediaSelected} selectedMedia={mediaSource} />

              <div className="flex justify-end mt-6">
                <Button
                  className="bg-marine-indigo hover:bg-marine-indigo/90 text-white"
                  onClick={nextStep}
                  disabled={!isStepComplete(STEPS.INPUT)}
                >
                  Continue to Models
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {currentStep === STEPS.MODELS && (
            <>
              <h2 className="text-xl font-semibold text-card-foreground mb-4">Select Models</h2>
              <p className="text-muted-foreground mb-6">
                Choose which detection models to run on your{" "}
                {mediaSource?.exampleId
                  ? `selected example: ${mediaSource.exampleId.replace(/-/g, " ")}`
                  : "uploaded media"}
              </p>

              <ModelSelectionStep onModelsSelected={handleModelsSelected} initialSelection={modelSelection} />

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Input
                </Button>

                <Button
                  className="bg-marine-indigo hover:bg-marine-indigo/90 text-white"
                  onClick={nextStep}
                  disabled={!modelSelection.models.length || isLoading || !areModelsReady()}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-pulse">Loading Models...</span>
                    </>
                  ) : (
                    <>
                      Run Detection
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {currentStep === STEPS.RESULTS && mediaSource && (
            <>
              <h2 className="text-xl font-semibold text-card-foreground mb-4">Detection Results</h2>
              <p className="text-muted-foreground mb-6">
                View detection results for{" "}
                {mediaSource.exampleId ? `example: ${mediaSource.exampleId.replace(/-/g, " ")}` : "your uploaded media"}
              </p>

              <ResultsStep mediaSource={mediaSource} modelSelection={modelSelection} />

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Models
                </Button>

                <Button className="bg-marine-indigo hover:bg-marine-indigo/90 text-white" onClick={goToAnalysis}>
                  View Statistical Analysis
                  <BarChart3 className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

