"use client"

import { useState, useRef, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Mock detection data for demonstration
const mockDetections = {
  yolov8: [
    { id: 1, class: "fish", confidence: 0.92, bbox: [0.2, 0.3, 0.15, 0.1] },
    { id: 2, class: "small_fish", confidence: 0.85, bbox: [0.5, 0.6, 0.1, 0.05] },
    { id: 3, class: "crab", confidence: 0.78, bbox: [0.7, 0.8, 0.12, 0.08] },
  ],
  yolov8_transformer: [
    { id: 1, class: "fish", confidence: 0.94, bbox: [0.21, 0.31, 0.15, 0.1] },
    { id: 2, class: "small_fish", confidence: 0.88, bbox: [0.51, 0.61, 0.1, 0.05] },
    { id: 3, class: "crab", confidence: 0.82, bbox: [0.71, 0.81, 0.12, 0.08] },
    { id: 4, class: "jellyfish", confidence: 0.76, bbox: [0.4, 0.5, 0.08, 0.12] },
  ],
  rt_detr: [
    { id: 1, class: "fish", confidence: 0.96, bbox: [0.2, 0.3, 0.15, 0.1] },
    { id: 2, class: "small_fish", confidence: 0.91, bbox: [0.5, 0.6, 0.1, 0.05] },
    { id: 3, class: "crab", confidence: 0.85, bbox: [0.7, 0.8, 0.12, 0.08] },
    { id: 4, class: "starfish", confidence: 0.79, bbox: [0.3, 0.7, 0.09, 0.09] },
    { id: 5, class: "jellyfish", confidence: 0.88, bbox: [0.4, 0.5, 0.08, 0.12] },
  ],
}

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
  const getFilteredDetections = (model: string) => {
    const modelKey = model as keyof typeof mockDetections
    return mockDetections[modelKey].filter((detection) => detection.confidence >= confidenceThreshold[0])
  }

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
          const filteredDetections = getFilteredDetections(model)
          filteredDetections.forEach((detection) => {
            const [x, y, width, height] = detection.bbox
            const boxX = x * canvas.width
            const boxY = y * canvas.height
            const boxWidth = width * canvas.width
            const boxHeight = height * canvas.height

            // Draw bounding box
            ctx.strokeStyle = classColors[detection.class as keyof typeof classColors] || "#10B981"
            ctx.lineWidth = 3
            ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)

            // Draw label if enabled
            if (showLabels) {
              const label = `${detection.class} ${Math.round(detection.confidence * 100)}%`
              ctx.fillStyle = classColors[detection.class as keyof typeof classColors] || "#10B981"
              ctx.fillRect(boxX, boxY - 25, ctx.measureText(label).width + 10, 25)
              ctx.fillStyle = "#FFFFFF"
              ctx.font = "16px Arial"
              ctx.fillText(label, boxX + 5, boxY - 7)
            }
          })

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
        const filteredDetections = getFilteredDetections(activeModel)
        filteredDetections.forEach((detection) => {
          const [x, y, width, height] = detection.bbox
          const boxX = x * canvas.width
          const boxY = y * canvas.height
          const boxWidth = width * canvas.width
          const boxHeight = height * canvas.height

          // Draw bounding box
          ctx.strokeStyle = classColors[detection.class as keyof typeof classColors] || "#10B981"
          ctx.lineWidth = 3
          ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)

          // Draw label if enabled
          if (showLabels) {
            const label = `${detection.class} ${Math.round(detection.confidence * 100)}%`
            ctx.fillStyle = classColors[detection.class as keyof typeof classColors] || "#10B981"
            ctx.fillRect(boxX, boxY - 25, ctx.measureText(label).width + 10, 25)
            ctx.fillStyle = "#FFFFFF"
            ctx.font = "16px Arial"
            ctx.fillText(label, boxX + 5, boxY - 7)
          }
        })
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
                  {getFilteredDetections(model).length} detections
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
            Detections (
            {isComparison
              ? models.reduce((total, model) => total + getFilteredDetections(model).length, 0)
              : getFilteredDetections(activeModel).length}
            )
          </h3>
          <div className="space-y-2">
            {!isComparison &&
              getFilteredDetections(activeModel).map((detection) => (
                <div key={detection.id} className="flex items-center justify-between p-2 rounded-md bg-muted">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: classColors[detection.class as keyof typeof classColors] }}
                    ></div>
                    <span className="capitalize">{detection.class.replace("_", " ")}</span>
                  </div>
                  <span className="font-medium">{Math.round(detection.confidence * 100)}%</span>
                </div>
              ))}

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
                    {getFilteredDetections(model).map((detection) => (
                      <div
                        key={`${model}-${detection.id}`}
                        className="flex items-center justify-between p-2 rounded-md bg-muted"
                      >
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: classColors[detection.class as keyof typeof classColors] }}
                          ></div>
                          <span className="capitalize text-sm">{detection.class.replace("_", " ")}</span>
                        </div>
                        <span className="font-medium text-sm">{Math.round(detection.confidence * 100)}%</span>
                      </div>
                    ))}
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

