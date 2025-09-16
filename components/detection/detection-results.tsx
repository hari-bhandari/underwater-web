"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { classColors, modelColors, drawDetections } from "@/lib/inference-utils"
import { useModel } from "@/contexts/model-context"
import { RuntimeSelector } from "@/components/detection/runtime-selector"
import type { MediaSource } from "@/types/media"
import type { ModelSelection } from "@/types/models"
import type { Detection } from "@/types/detection"

interface DetectionResultsProps {
  mediaSource: MediaSource
  modelSelection: ModelSelection
}

export function DetectionResults({ mediaSource, modelSelection }: DetectionResultsProps) {
  const { models, isComparison } = modelSelection
  const [activeModel, setActiveModel] = useState(models[0])
  const [confidenceThreshold, setConfidenceThreshold] = useState([0.5])
  const [showLabels, setShowLabels] = useState(true)
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null)
  const [outputImage, setOutputImage] = useState<string | null>(null)

  // Get model states from context
  const { modelStates, runModelInference, executionProvider, loadModel } = useModel()
  const executionProviderLabel =
    executionProvider === "webgl" ? "Backend: GPU (WebGL)" : "Backend: CPU (WebAssembly)"
  const mediaSourceKey = mediaSource?.source ?? ""

  useEffect(() => {
    if (models.length > 0 && !models.includes(activeModel)) {
      setActiveModel(models[0])
    }
  }, [models, activeModel])

  // Canvas refs for each model
  const canvasRefs = {
    yolov8: useRef<HTMLCanvasElement>(null),
    yolov8_transformer: useRef<HTMLCanvasElement>(null),
    rt_detr: useRef<HTMLCanvasElement>(null),
  }

  const lastInferenceSourceRef = useRef<Record<string, string>>({})

  // Get filtered detections based on confidence threshold
  const getFilteredDetections = useCallback((model: string): Detection[] => {
    const modelState = modelStates[model]
    if (modelState?.status !== "complete" || !modelState?.detections) {
      return []
    }
    return modelState.detections.filter((detection) => detection.confidence >= confidenceThreshold[0])
  }, [modelStates, confidenceThreshold])

  // Handle slider change
  const handleConfidenceChange = useCallback((values: number[]) => {
    console.log("Confidence changed to:", values[0])
    setConfidenceThreshold(values)
  }, [])

  // Update canvas drawings
  const updateCanvasDrawings = useCallback(() => {
    if (!imageElement) {
      console.log("Cannot update canvas: Image element not loaded")
      return
    }

    models.forEach((model) => {
      const canvas = canvasRefs[model as keyof typeof canvasRefs]?.current
      if (!canvas) {
        console.log(`Canvas for model ${model} not found`)
        return
      }

      const modelState = modelStates[model]
      if (!modelState) {
        console.log(`Model state for ${model} not found`)
        return
      }
      
      if (modelState.status === "complete" && modelState.detections && modelState.detections.length > 0) {
        console.log(`Redrawing ${model} with confidence ${confidenceThreshold[0]}, found ${modelState.detections.length} detections`)
        
        try {
          // Force canvas to be visible with correct dimensions
          canvas.style.display = 'block';
          canvas.style.width = '100%';
          canvas.style.height = 'auto';
          
          // Make sure the canvas is properly sized based on the image
          if (imageElement.width > 0 && imageElement.height > 0) {
            // Set initial dimensions to match the image
            canvas.width = imageElement.width;
            canvas.height = imageElement.height;
            
            console.log(`Canvas dimensions set to ${canvas.width}x${canvas.height} (image: ${imageElement.width}x${imageElement.height})`)
          } else {
            console.warn(`Image has invalid dimensions: ${imageElement.width}x${imageElement.height}`)
          }
          
          // Draw the detections
          drawDetections(canvas, imageElement, modelState.detections, confidenceThreshold[0], showLabels)
          
          // For the active model in non-comparison mode, also set the output image
          if (!isComparison && model === activeModel) {
            try {
              const dataUrl = canvas.toDataURL('image/png')
              setOutputImage(dataUrl)
              console.log(`Updated output image for ${model}`)
            } catch (error) {
              console.error("Error creating output image:", error)
            }
          }
        } catch (error) {
          console.error(`Error drawing detections for model ${model}:`, error)
        }
      } else {
        console.log(`Model ${model} not ready for drawing: status=${modelState.status}, detections=${modelState.detections?.length || 0}`)
      }
    })
  }, [confidenceThreshold, showLabels, imageElement, models, modelStates, activeModel, isComparison])

  // Load the media asset when the source changes
  useEffect(() => {
    if (!mediaSource || !mediaSource.source) {
      console.log("No media source provided")
      setImageElement(null)
      setOutputImage(null)
      lastInferenceSourceRef.current = {}
      return
    }

    console.log("Loading image from source:", mediaSource.source)
    lastInferenceSourceRef.current = {}
    setOutputImage(null)

    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      console.log("Image loaded successfully:", img.width, "x", img.height)
      if (!img.width || !img.height) {
        console.error("Loaded image has invalid dimensions")
        return
      }
      setImageElement(img)

      models.forEach((model) => {
        const canvas = canvasRefs[model as keyof typeof canvasRefs]?.current
        if (!canvas) return

        canvas.width = img.width
        canvas.height = img.height

        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      })
    }

    img.onerror = (error) => {
      console.error("Error loading image:", error)
    }

    img.src = mediaSource.source

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [mediaSource])

  // Ensure selected models are loaded when needed (including provider changes)
  useEffect(() => {
    if (!mediaSourceKey) return

    models.forEach((model) => {
      const state = modelStates[model]
      if (!state || state.status === "idle") {
        loadModel(model).catch((error) => {
          console.error(`Failed to load model ${model}:`, error)
        })
      }
    })
  }, [models, modelStates, loadModel, mediaSourceKey])

  // Run inference whenever the image changes and the model session is ready
  useEffect(() => {
    if (!imageElement || !mediaSourceKey) {
      return
    }

    models.forEach((model) => {
      const state = modelStates[model]
      if (!state || !state.session) {
        return
      }

      if (state.status === "loading" || state.status === "running" || state.status === "error") {
        return
      }

      const currentSource = mediaSourceKey
      if (lastInferenceSourceRef.current[model] === currentSource) {
        return
      }

      console.log(`Starting inference for model ${model}`)
      runModelInference(model, imageElement)
        .then(() => {
          lastInferenceSourceRef.current[model] = currentSource
        })
        .catch((error) => {
          console.error(`Error running inference for model ${model}:`, error)
          delete lastInferenceSourceRef.current[model]
        })
    })
  }, [imageElement, models, modelStates, mediaSourceKey, runModelInference])

  // Reset last inference tracking when backend changes
  useEffect(() => {
    lastInferenceSourceRef.current = {}
  }, [executionProvider, models])

  // Update canvas drawings when inference status changes
  useEffect(() => {
    const hasCompletedInference = models.some(
      (model) => {
        const modelState = modelStates[model]
        return modelState?.status === "complete" && 
               modelState.detections !== undefined && 
               modelState.detections.length > 0
      }
    )
    
    if (hasCompletedInference && imageElement) {
      console.log("Inference completed, updating canvas drawings")
      updateCanvasDrawings()
    }
  }, [models, modelStates, imageElement, updateCanvasDrawings])

  // Update drawings when confidence threshold changes
  useEffect(() => {
    updateCanvasDrawings()
  }, [confidenceThreshold, showLabels, updateCanvasDrawings])

  // Update drawings when active model changes
  useEffect(() => {
    if (isComparison) return
    updateCanvasDrawings()
  }, [activeModel, isComparison, updateCanvasDrawings])

  // Render loading state for a model
  const renderModelLoading = (model: string) => {
    const state = modelStates[model]

    if (!state || state.status === "idle") {
      return (
        <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg">
          <LoadingSpinner text="Preparing model..." />
        </div>
      )
    }

    if (state.status === "loading") {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-muted/50 rounded-lg p-6">
          <LoadingSpinner text={`Loading model... ${Math.round(state.progress || 0)}%`} />
          <Progress value={state.progress || 0} className="w-full mt-4 h-2" />
        </div>
      )
    }

    if (state.status === "running") {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-muted/50 rounded-lg p-6">
          <LoadingSpinner text={`Running inference... ${Math.round(state.progress || 0)}%`} />
          <Progress value={state.progress || 0} className="w-full mt-4 h-2" />
        </div>
      )
    }

    if (state.status === "error") {
      return (
        <div className="flex items-center justify-center h-64 bg-destructive/10 rounded-lg">
          <div className="text-center text-destructive">
            <p className="font-medium">Error running inference</p>
            <p className="text-sm mt-2">{state.error || "Unknown error"}</p>
          </div>
        </div>
      )
    }

    // Complete - show the canvas
    const filteredCount = getFilteredDetections(model).length
    return (
      <div className="relative bg-black/5 rounded-lg overflow-hidden">
        <canvas 
          ref={canvasRefs[model as keyof typeof canvasRefs]} 
          className="w-full h-auto rounded-lg object-contain" 
          data-testid={`canvas-${model}`}
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-3 py-1.5 rounded-full font-medium">
          {filteredCount} detections
        </div>
      </div>
    )
  }

  // Render the output image for download/display
  const renderOutputImage = () => {
    if (!outputImage) return null

    return (
      <>
        <h3 className="mt-5 text-sm font-medium">Result</h3>
        <div className="mt-3 relative">
          <img src={outputImage} className="w-full rounded-lg" alt="Detection result" />
          <a
            href={outputImage}
            download={`detection-${new Date().getTime()}.png`}
            className="absolute bottom-2 right-2 bg-primary text-white text-xs px-3 py-1 rounded"
          >
            Download
          </a>
        </div>
      </>
    )
  }

  // Calculate total detections for all models
  const getTotalDetections = () => {
    if (isComparison) {
      return models.reduce((total, model) => {
        return modelStates[model]?.status === "complete" 
          ? total + getFilteredDetections(model).length 
          : total
      }, 0)
    }
    
    return modelStates[activeModel]?.status === "complete"
      ? getFilteredDetections(activeModel).length
      : 0
  }

  return (
    <div className="space-y-6">
      <RuntimeSelector />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant="secondary" className="uppercase tracking-wide text-xs">
          {executionProviderLabel}
        </Badge>
        <p className="text-xs text-muted-foreground">
          Models reload automatically when you switch the runtime.
        </p>
      </div>

      {isComparison ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {models.map((model) => (
            <Card key={model} className="overflow-hidden">
              <div className="p-3 bg-muted">
                <h3
                  className="font-medium text-center"
                  style={{ color: modelColors[model as keyof typeof modelColors] }}
                >
                  {model === "yolov8" && "YOLOv8"}
                  {model === "yolov8_transformer" && "YOLOv8+Transformer"}
                  {model === "rt_detr" && "RT-DETR"}
                </h3>
              </div>

              <div className="relative">
                {renderModelLoading(model)}
              </div>

              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Inference Time</p>
                    <p className="font-medium">
                      {modelStates[model]?.inferenceTime
                        ? `${Math.round(modelStates[model]?.inferenceTime!)} ms`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg. Confidence</p>
                    <p className="font-medium">
                      {modelStates[model]?.status === "complete" && modelStates[model]?.detections?.length
                        ? `${Math.round(
                          (modelStates[model]?.detections!.reduce((sum, d) => sum + d.confidence, 0) /
                            modelStates[model]?.detections!.length) *
                          100,
                        )}%`
                        : "N/A"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Runtime</p>
                    <p className="font-medium capitalize">
                      {modelStates[model]?.executionProvider === "webgl" ? "GPU (WebGL)" : "CPU (WebAssembly)"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div>
          <Tabs value={activeModel} onValueChange={setActiveModel} className="mb-6">
            <TabsList className="bg-muted grid" style={{ gridTemplateColumns: `repeat(${models.length}, 1fr)` }}>
              {models.map((model) => (
                <TabsTrigger
                  key={model}
                  value={model}
                  className="data-[state=active]:bg-marine-indigo data-[state=active]:text-white"
                >
                  {model === "yolov8" && "YOLOv8"}
                  {model === "yolov8_transformer" && "YOLOv8+Transformer"}
                  {model === "rt_detr" && "RT-DETR"}
                </TabsTrigger>
              ))}
            </TabsList>

            {models.map((model) => (
              <TabsContent key={model} value={model} className="mt-0">
                {renderModelLoading(model)}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}

      <Card>
        <CardContent className="p-4 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="confidence-threshold">
                Confidence Threshold: {confidenceThreshold[0].toFixed(2)}
              </Label>
            </div>
            <Slider
              id="confidence-threshold"
              value={confidenceThreshold}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleConfidenceChange}
              className="[&>span]:bg-marine-indigo"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="show-labels"
              checked={showLabels}
              onCheckedChange={setShowLabels}
              className="data-[state=checked]:bg-marine-indigo"
            />
            <Label htmlFor="show-labels">Show Labels</Label>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">
              Detections ({getTotalDetections()})
            </h3>

            {/* Show loading spinner if inference is not complete */}
            {!isComparison && modelStates[activeModel]?.status !== "complete" && (
              <div className="flex items-center justify-center h-32 bg-muted/50 rounded-lg">
                <LoadingSpinner text="Processing results..." />
              </div>
            )}

            <div className="space-y-2">
              {!isComparison &&
                modelStates[activeModel]?.status === "complete" &&
                getFilteredDetections(activeModel).map((detection) => (
                  <div 
                    key={detection.id} 
                    className="flex items-center justify-between p-3 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-5 h-5 rounded-full mr-3"
                        style={{ backgroundColor: classColors[detection.class as keyof typeof classColors] || "#FF0000" }}
                      ></div>
                      <span className="capitalize font-medium">
                        {detection.class.replace("_", " ")}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-sm font-semibold bg-background/50">
                      {Math.round(detection.confidence * 100)}%
                    </Badge>
                  </div>
                ))}

              {!isComparison && 
               modelStates[activeModel]?.status === "complete" && 
               getFilteredDetections(activeModel).length === 0 && (
                <div className="p-4 text-center bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">
                    No detections found with current confidence threshold ({confidenceThreshold[0].toFixed(2)}).
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Try lowering the confidence threshold to see more results.
                  </p>
                </div>
              )}

              {isComparison && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {models.map((model) => (
                    <div key={model} className="space-y-2">
                      <h4
                        className="text-sm font-medium"
                        style={{ color: modelColors[model as keyof typeof modelColors] }}
                      >
                        {model === "yolov8" && "YOLOv8"}
                        {model === "yolov8_transformer" && "YOLOv8+Transformer"}
                        {model === "rt_detr" && "RT-DETR"}
                      </h4>

                      {modelStates[model]?.status !== "complete" ? (
                        <div className="p-2 rounded-md bg-muted/50 text-center text-sm text-muted-foreground">
                          {modelStates[model]?.status === "running"
                            ? `Processing... ${Math.round(modelStates[model]?.progress || 0)}%`
                            : "Waiting..."}
                        </div>
                      ) : getFilteredDetections(model).length === 0 ? (
                        <div className="p-3 rounded-md bg-muted/50 text-center text-sm text-muted-foreground">
                          No detections above threshold
                        </div>
                      ) : (
                        getFilteredDetections(model).map((detection) => (
                          <div
                            key={`${model}-${detection.id}`}
                            className="flex items-center justify-between p-3 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                          >
                            <div className="flex items-center">
                              <div
                                className="w-4 h-4 rounded-full mr-2"
                                style={{ backgroundColor: classColors[detection.class as keyof typeof classColors] || "#FF0000" }}
                              ></div>
                              <span className="capitalize text-sm font-medium">{detection.class.replace("_", " ")}</span>
                            </div>
                            <Badge variant="outline" className="text-xs font-semibold bg-background/50">
                              {Math.round(detection.confidence * 100)}%
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Show output image for download/sharing */}
          {!isComparison && renderOutputImage()}
        </CardContent>
      </Card>
    </div>
  )
}
