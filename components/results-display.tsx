"use client"

import { useState, useRef, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"


// Color mapping for different classes
const classColors = {
  fish: "#3B82F6", // blue
  small_fish: "#60A5FA", // lighter blue
  crab: "#EF4444", // red
  jellyfish: "#EC4899", // pink
  shrimp: "#F97316", // orange
  starfish: "#F59E0B", // amber
}

// Model colors for comparison view
const modelColors = {
  yolov8: "#3B82F6", // blue
  yolov8_transformer: "#8B5CF6", // purple
  rt_detr: "#10B981", // green
}

interface ResultsDisplayProps {
  mediaSource: string
  mediaType: string
  models: string[]
  isComparison: boolean
}

export function ResultsDisplay({ mediaSource, mediaType, models, isComparison }: ResultsDisplayProps) {
  const [activeModel, setActiveModel] = useState(models[0])
  const [confidenceThreshold, setConfidenceThreshold] = useState([0.5])
  const [showLabels, setShowLabels] = useState(true)

  // Canvas refs for each model
  const canvasRefs = {
    yolov8: useRef<HTMLCanvasElement>(null),
    yolov8_transformer: useRef<HTMLCanvasElement>(null),
    rt_detr: useRef<HTMLCanvasElement>(null),
  }

  // Filter detections based on confidence threshold
  // TODO: Replace with real detection data from props or context
    // No detection logic present; removed unused function

  // Draw bounding boxes on image
  const drawDetectionsOnImage = () => {
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.src = mediaSource

    image.onload = () => {
      if (isComparison) {
        // Draw for each model in comparison mode
        Object.entries(canvasRefs).forEach(([model, canvasRef]) => {
          if (!models.includes(model)) return

          const canvas = canvasRef.current
          if (!canvas) return

          const ctx = canvas.getContext("2d")
          if (!ctx) return

          // Set canvas dimensions to match image
          canvas.width = image.width
          canvas.height = image.height

          // Draw the image
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

          // Draw detections for this model
          // No detections to draw

          // Add model label
          ctx.fillStyle = modelColors[model as keyof typeof modelColors]
          ctx.font = "bold 16px Arial"
          ctx.fillText(
            model === "yolov8" ? "YOLOv8" : model === "yolov8_transformer" ? "YOLOv8+Transformer" : "RT-DETR",
            10,
            30,
          )
        })
      } else {
        // Draw for single active model
        const canvas = canvasRefs[activeModel as keyof typeof canvasRefs]?.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set canvas dimensions to match image
        canvas.width = image.width
        canvas.height = image.height

        // Draw the image
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

        // Draw detections
  // No detections to draw
      }
    }
  }

  // Effect to draw detections when component mounts or dependencies change
  useEffect(() => {
    drawDetectionsOnImage()
  }, [activeModel, confidenceThreshold, showLabels, mediaSource, isComparison])

  return (
    <div className="space-y-6">
      {isComparison ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {models.map((model) => (
            <div key={model} className="bg-card rounded-lg overflow-hidden border border-border">
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
                <canvas
                  ref={canvasRefs[model as keyof typeof canvasRefs]}
                  className="w-full aspect-video object-cover"
                />

                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {/* Comparison detections removed as unused */}
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Inference Time</p>
                    <p className="font-medium">
                      {model === "yolov8" ? "42 ms" : model === "yolov8_transformer" ? "68 ms" : "95 ms"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg. Confidence</p>
                    <p className="font-medium">
                      {model === "yolov8" ? "82%" : model === "yolov8_transformer" ? "87%" : "91%"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
                <div className="relative">
                  <canvas ref={canvasRefs[model as keyof typeof canvasRefs]} className="w-full rounded-lg" />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}

      <div className="space-y-6 bg-card p-4 rounded-lg border border-border">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="confidence-threshold">Confidence Threshold: {confidenceThreshold[0].toFixed(2)}</Label>
          </div>
          <Slider
            id="confidence-threshold"
            value={confidenceThreshold}
            min={0}
            max={1}
            step={0.01}
            onValueChange={setConfidenceThreshold}
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
            Detections (0)
          </h3>
          <div className="space-y-2">
            {/* No detections to display */}

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
                    {/* No detections to display */}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

