"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Play, Pause, SkipForward, SkipBack } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock detection data for demonstration

// Mock statistics data for comparison
const mockComparisonStats = {
  yolov8: {
    inferenceTime: 42, // ms
    totalDetections: 21,
    averageConfidence: 0.82,
    precision: 0.88,
    recall: 0.85,
  },
  yolov8_transformer: {
    inferenceTime: 68, // ms
    totalDetections: 26,
    averageConfidence: 0.87,
    precision: 0.92,
    recall: 0.89,
  },
  rt_detr: {
    inferenceTime: 95, // ms
    totalDetections: 31,
    averageConfidence: 0.91,
    precision: 0.95,
    recall: 0.93,
  },
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

interface ComparisonViewProps {
  mediaSource: string
  mediaType: string
}

export function ComparisonView({ mediaSource, mediaType }: ComparisonViewProps) {
  const [confidenceThreshold, setConfidenceThreshold] = useState([0.5])
  const [showLabels, setShowLabels] = useState(true)
  const [activeTab, setActiveTab] = useState("visual")

  // Video controls
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Canvas refs for each model
  const canvasRefs = {
    yolov8: useRef<HTMLCanvasElement>(null),
    yolov8_transformer: useRef<HTMLCanvasElement>(null),
    rt_detr: useRef<HTMLCanvasElement>(null),
  }

  const videoRef = useRef<HTMLVideoElement>(null)
  const animationRef = useRef<number>()

  // Filter detections based on confidence threshold
  // TODO: Replace with real detection data from props or context
  const getFilteredDetections = (_model: string) => {
    return [];
  }

  // Draw bounding boxes on image for all models
  const drawDetectionsOnImage = () => {
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.src = mediaSource

    image.onload = () => {
      // Draw for each model
      Object.entries(canvasRefs).forEach(([model, canvasRef]) => {
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
    }
  }

  // Draw bounding boxes on video frame for all models
  const drawDetectionsOnVideo = () => {
    const video = videoRef.current
    if (!video) return

    // Draw for each model
    Object.entries(canvasRefs).forEach(([model, canvasRef]) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw the current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

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

    // Continue animation loop if playing
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(drawDetectionsOnVideo)
    }
  }

  // Handle video playback
  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
      cancelAnimationFrame(animationRef.current as number)
    } else {
      video.play()
      animationRef.current = requestAnimationFrame(drawDetectionsOnVideo)
    }

    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video) return

    setCurrentTime(video.currentTime)
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = value[0]
    setCurrentTime(value[0])

    // Update canvas immediately
    drawDetectionsOnVideo()
  }

  const handleSkip = (seconds: number) => {
    const video = videoRef.current
    if (!video) return

    const newTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds))
    video.currentTime = newTime
    setCurrentTime(newTime)

    // Update canvas immediately
    drawDetectionsOnVideo()
  }

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Load metadata for video
  const handleLoadedMetadata = () => {
    const video = videoRef.current
    if (!video) return

    setDuration(video.duration)
  }

  // Effect to draw detections when component mounts or dependencies change
  useEffect(() => {
    if (mediaType === "image") {
      drawDetectionsOnImage()
    } else {
      // For video, we'll draw on each frame during playback
      if (!isPlaying) {
        drawDetectionsOnVideo()
      }
    }
  }, [confidenceThreshold, showLabels, mediaSource, mediaType])

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="visual">Visual Comparison</TabsTrigger>
          <TabsTrigger value="metrics">Metrics Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["yolov8", "yolov8_transformer", "rt_detr"].map((model) => (
              <Card key={model} className="overflow-hidden">
                <div className="p-4 bg-slate-50 dark:bg-slate-800">
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
                      <p className="text-slate-500">Inference Time</p>
                      <p className="font-medium">
                        {mockComparisonStats[model as keyof typeof mockComparisonStats].inferenceTime} ms
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Avg. Confidence</p>
                      <p className="font-medium">
                        {(
                          mockComparisonStats[model as keyof typeof mockComparisonStats].averageConfidence * 100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {mediaType === "video" && (
            <div className="mt-6">
              <video
                ref={videoRef}
                src={mediaSource}
                className="w-full rounded-lg hidden"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
              />

              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{formatTime(currentTime)}</span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleSkip(-5)}>
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={togglePlay}>
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleSkip(5)}>
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm">{formatTime(duration)}</span>
                </div>

                <Slider value={[currentTime]} min={0} max={duration || 100} step={0.1} onValueChange={handleSeek} />
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="comparison-confidence-threshold">
                  Confidence Threshold: {confidenceThreshold[0].toFixed(2)}
                </Label>
              </div>
              <Slider
                id="comparison-confidence-threshold"
                value={confidenceThreshold}
                min={0}
                max={1}
                step={0.01}
                onValueChange={setConfidenceThreshold}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="comparison-show-labels" checked={showLabels} onCheckedChange={setShowLabels} />
              <Label htmlFor="comparison-show-labels">Show Labels</Label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6">Performance Metrics Comparison</h3>

            <div className="space-y-8">
              <div>
                <h4 className="font-medium mb-4">Detection Counts</h4>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                        YOLOv8
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        {mockComparisonStats.yolov8.totalDetections}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                    <div
                      style={{ width: `${(mockComparisonStats.yolov8.totalDetections / 35) * 100}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    ></div>
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
                        YOLOv8+Transformer
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-purple-600">
                        {mockComparisonStats.yolov8_transformer.totalDetections}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
                    <div
                      style={{ width: `${(mockComparisonStats.yolov8_transformer.totalDetections / 35) * 100}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                    ></div>
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                        RT-DETR
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-green-600">
                        {mockComparisonStats.rt_detr.totalDetections}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                    <div
                      style={{ width: `${(mockComparisonStats.rt_detr.totalDetections / 35) * 100}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">Inference Time (ms)</h4>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                        YOLOv8
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        {mockComparisonStats.yolov8.inferenceTime} ms
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                    <div
                      style={{ width: `${(mockComparisonStats.yolov8.inferenceTime / 100) * 100}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    ></div>
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
                        YOLOv8+Transformer
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-purple-600">
                        {mockComparisonStats.yolov8_transformer.inferenceTime} ms
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
                    <div
                      style={{ width: `${(mockComparisonStats.yolov8_transformer.inferenceTime / 100) * 100}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                    ></div>
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                        RT-DETR
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-green-600">
                        {mockComparisonStats.rt_detr.inferenceTime} ms
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                    <div
                      style={{ width: `${(mockComparisonStats.rt_detr.inferenceTime / 100) * 100}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                    ></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Precision</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">YOLOv8</span>
                      <span className="font-medium">{(mockComparisonStats.yolov8.precision * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">YOLOv8+Transformer</span>
                      <span className="font-medium">
                        {(mockComparisonStats.yolov8_transformer.precision * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">RT-DETR</span>
                      <span className="font-medium">{(mockComparisonStats.rt_detr.precision * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Recall</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">YOLOv8</span>
                      <span className="font-medium">{(mockComparisonStats.yolov8.recall * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">YOLOv8+Transformer</span>
                      <span className="font-medium">
                        {(mockComparisonStats.yolov8_transformer.recall * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">RT-DETR</span>
                      <span className="font-medium">{(mockComparisonStats.rt_detr.recall * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Average Confidence</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">YOLOv8</span>
                      <span className="font-medium">
                        {(mockComparisonStats.yolov8.averageConfidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">YOLOv8+Transformer</span>
                      <span className="font-medium">
                        {(mockComparisonStats.yolov8_transformer.averageConfidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">RT-DETR</span>
                      <span className="font-medium">
                        {(mockComparisonStats.rt_detr.averageConfidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Summary</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>
                    <span className="font-medium">YOLOv8:</span> Fastest inference time, good for real-time applications
                    with acceptable accuracy.
                  </li>
                  <li>
                    <span className="font-medium">YOLOv8+Transformer:</span> Balanced performance with improved accuracy
                    over YOLOv8 and reasonable speed.
                  </li>
                  <li>
                    <span className="font-medium">RT-DETR:</span> Highest accuracy and most detections, but slowest
                    inference time. Best for detailed analysis where time is not critical.
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

