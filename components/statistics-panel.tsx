"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock statistics data for demonstration
const mockStatistics = {
  yolov8: {
    inferenceTime: 42, // ms
    detectionCount: {
      fish: 5,
      small_fish: 12,
      crab: 3,
      jellyfish: 0,
      shrimp: 1,
      starfish: 0,
    },
    averageConfidence: 0.82,
    precision: 0.88,
    recall: 0.85,
    f1Score: 0.86,
    mAP: 0.84,
    falsePositives: 7,
    falseNegatives: 9,
    modelSize: 28, // MB
    gflops: 17.4,
    classAccuracy: {
      fish: 0.91,
      small_fish: 0.89,
      crab: 0.85,
      jellyfish: 0.72,
      shrimp: 0.81,
      starfish: 0.76,
    },
    // ROC curve data points (x: FPR, y: TPR)
    rocCurve: [
      { x: 0, y: 0 },
      { x: 0.1, y: 0.7 },
      { x: 0.2, y: 0.85 },
      { x: 0.3, y: 0.9 },
      { x: 0.4, y: 0.93 },
      { x: 0.5, y: 0.95 },
      { x: 0.6, y: 0.97 },
      { x: 0.7, y: 0.98 },
      { x: 0.8, y: 0.99 },
      { x: 0.9, y: 0.995 },
      { x: 1.0, y: 1.0 },
    ],
    // Precision-Recall curve data points
    prCurve: [
      { recall: 0.1, precision: 0.99 },
      { recall: 0.2, precision: 0.98 },
      { recall: 0.3, precision: 0.97 },
      { recall: 0.4, precision: 0.95 },
      { recall: 0.5, precision: 0.93 },
      { recall: 0.6, precision: 0.9 },
      { recall: 0.7, precision: 0.85 },
      { recall: 0.8, precision: 0.78 },
      { recall: 0.9, precision: 0.65 },
      { recall: 1.0, precision: 0.5 },
    ],
    // IoU threshold vs mAP
    iouMap: [
      { iou: 0.5, mAP: 0.92 },
      { iou: 0.55, mAP: 0.9 },
      { iou: 0.6, mAP: 0.87 },
      { iou: 0.65, mAP: 0.85 },
      { iou: 0.7, mAP: 0.82 },
      { iou: 0.75, mAP: 0.78 },
      { iou: 0.8, mAP: 0.72 },
      { iou: 0.85, mAP: 0.65 },
      { iou: 0.9, mAP: 0.55 },
      { iou: 0.95, mAP: 0.4 },
    ],
  },
  yolov8_transformer: {
    inferenceTime: 68, // ms
    detectionCount: {
      fish: 6,
      small_fish: 14,
      crab: 3,
      jellyfish: 2,
      shrimp: 1,
      starfish: 0,
    },
    averageConfidence: 0.87,
    precision: 0.92,
    recall: 0.89,
    f1Score: 0.9,
    mAP: 0.88,
    falsePositives: 5,
    falseNegatives: 7,
    modelSize: 42, // MB
    gflops: 24.6,
    classAccuracy: {
      fish: 0.94,
      small_fish: 0.92,
      crab: 0.89,
      jellyfish: 0.85,
      shrimp: 0.87,
      starfish: 0.82,
    },
    // ROC curve data points (x: FPR, y: TPR)
    rocCurve: [
      { x: 0, y: 0 },
      { x: 0.1, y: 0.75 },
      { x: 0.2, y: 0.88 },
      { x: 0.3, y: 0.92 },
      { x: 0.4, y: 0.95 },
      { x: 0.5, y: 0.97 },
      { x: 0.6, y: 0.98 },
      { x: 0.7, y: 0.99 },
      { x: 0.8, y: 0.995 },
      { x: 0.9, y: 0.998 },
      { x: 1.0, y: 1.0 },
    ],
    // Precision-Recall curve data points
    prCurve: [
      { recall: 0.1, precision: 0.995 },
      { recall: 0.2, precision: 0.99 },
      { recall: 0.3, precision: 0.98 },
      { recall: 0.4, precision: 0.97 },
      { recall: 0.5, precision: 0.95 },
      { recall: 0.6, precision: 0.93 },
      { recall: 0.7, precision: 0.9 },
      { recall: 0.8, precision: 0.85 },
      { recall: 0.9, precision: 0.75 },
      { recall: 1.0, precision: 0.6 },
    ],
    // IoU threshold vs mAP
    iouMap: [
      { iou: 0.5, mAP: 0.95 },
      { iou: 0.55, mAP: 0.93 },
      { iou: 0.6, mAP: 0.91 },
      { iou: 0.65, mAP: 0.89 },
      { iou: 0.7, mAP: 0.86 },
      { iou: 0.75, mAP: 0.83 },
      { iou: 0.8, mAP: 0.78 },
      { iou: 0.85, mAP: 0.72 },
      { iou: 0.9, mAP: 0.63 },
      { iou: 0.95, mAP: 0.48 },
    ],
  },
  rt_detr: {
    inferenceTime: 95, // ms
    detectionCount: {
      fish: 7,
      small_fish: 15,
      crab: 4,
      jellyfish: 2,
      shrimp: 2,
      starfish: 1,
    },
    averageConfidence: 0.91,
    precision: 0.95,
    recall: 0.93,
    f1Score: 0.94,
    mAP: 0.92,
    falsePositives: 3,
    falseNegatives: 4,
    modelSize: 56, // MB
    gflops: 32.8,
    classAccuracy: {
      fish: 0.97,
      small_fish: 0.95,
      crab: 0.93,
      jellyfish: 0.91,
      shrimp: 0.92,
      starfish: 0.89,
    },
    // ROC curve data points (x: FPR, y: TPR)
    rocCurve: [
      { x: 0, y: 0 },
      { x: 0.1, y: 0.82 },
      { x: 0.2, y: 0.91 },
      { x: 0.3, y: 0.95 },
      { x: 0.4, y: 0.97 },
      { x: 0.5, y: 0.98 },
      { x: 0.6, y: 0.99 },
      { x: 0.7, y: 0.995 },
      { x: 0.8, y: 0.998 },
      { x: 0.9, y: 0.999 },
      { x: 1.0, y: 1.0 },
    ],
    // Precision-Recall curve data points
    prCurve: [
      { recall: 0.1, precision: 0.998 },
      { recall: 0.2, precision: 0.995 },
      { recall: 0.3, precision: 0.99 },
      { recall: 0.4, precision: 0.98 },
      { recall: 0.5, precision: 0.97 },
      { recall: 0.6, precision: 0.96 },
      { recall: 0.7, precision: 0.94 },
      { recall: 0.8, precision: 0.91 },
      { recall: 0.9, precision: 0.85 },
      { recall: 1.0, precision: 0.7 },
    ],
    // IoU threshold vs mAP
    iouMap: [
      { iou: 0.5, mAP: 0.97 },
      { iou: 0.55, mAP: 0.96 },
      { iou: 0.6, mAP: 0.94 },
      { iou: 0.65, mAP: 0.92 },
      { iou: 0.7, mAP: 0.9 },
      { iou: 0.75, mAP: 0.87 },
      { iou: 0.8, mAP: 0.83 },
      { iou: 0.85, mAP: 0.78 },
      { iou: 0.9, mAP: 0.7 },
      { iou: 0.95, mAP: 0.55 },
    ],
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

// Model colors
const modelColors = {
  yolov8: "#3B82F6", // blue
  yolov8_transformer: "#8B5CF6", // purple
  rt_detr: "#10B981", // green
}

interface StatisticsPanelProps {
  models: string[]
}

export function StatisticsPanel({ models }: StatisticsPanelProps) {
  const [activeTab, setActiveTab] = useState("counts")

  // Prepare data for charts
  const prepareCountData = (modelKey: string) => {
    const model = mockStatistics[modelKey as keyof typeof mockStatistics]
    if (!model) return []

    return Object.entries(model.detectionCount).map(([className, count]) => ({
      name: className.replace("_", " "),
      count,
      color: classColors[className as keyof typeof classColors],
    }))
  }

  const preparePerformanceData = () => {
    return models
      .map((model) => {
        const stats = mockStatistics[model as keyof typeof mockStatistics]
        if (!stats) return null

        return {
          name: model === "yolov8" ? "YOLOv8" : model === "yolov8_transformer" ? "YOLOv8+T" : "RT-DETR",
          "Inference Time (ms)": stats.inferenceTime,
          Precision: stats.precision * 100,
          Recall: stats.recall * 100,
        }
      })
      .filter(Boolean)
  }

  const prepareConfidenceData = () => {
    return models
      .map((model) => {
        const stats = mockStatistics[model as keyof typeof mockStatistics]
        if (!stats) return null

        return {
          name: model === "yolov8" ? "YOLOv8" : model === "yolov8_transformer" ? "YOLOv8+T" : "RT-DETR",
          "Average Confidence": stats.averageConfidence * 100,
        }
      })
      .filter(Boolean)
  }

  // Prepare F1 Score data
  const prepareF1ScoreData = () => {
    return models
      .map((model) => {
        const stats = mockStatistics[model as keyof typeof mockStatistics]
        if (!stats) return null

        return {
          name: model === "yolov8" ? "YOLOv8" : model === "yolov8_transformer" ? "YOLOv8+T" : "RT-DETR",
          "F1 Score": stats.f1Score * 100,
          Precision: stats.precision * 100,
          Recall: stats.recall * 100,
        }
      })
      .filter(Boolean)
  }

  // Prepare mAP data
  const prepareMAPData = () => {
    return models
      .map((model) => {
        const stats = mockStatistics[model as keyof typeof mockStatistics]
        if (!stats) return null

        return {
          name: model === "yolov8" ? "YOLOv8" : model === "yolov8_transformer" ? "YOLOv8+T" : "RT-DETR",
          mAP: stats.mAP * 100,
        }
      })
      .filter(Boolean)
  }

  // Prepare class accuracy data for radar chart
  const prepareClassAccuracyData = () => {
    const classNames = ["fish", "small_fish", "crab", "jellyfish", "shrimp", "starfish"]

    return classNames.map((className) => {
      const data: Record<string, any> = {
        class: className.replace("_", " "),
      }

      models.forEach((model) => {
        const stats = mockStatistics[model as keyof typeof mockStatistics]
        if (stats) {
          const modelName = model === "yolov8" ? "YOLOv8" : model === "yolov8_transformer" ? "YOLOv8+T" : "RT-DETR"
          data[modelName] = stats.classAccuracy[className as keyof typeof stats.classAccuracy] * 100
        }
      })

      return data
    })
  }

  // Prepare speed vs accuracy data
  const prepareSpeedAccuracyData = () => {
    return models
      .map((model) => {
        const stats = mockStatistics[model as keyof typeof mockStatistics]
        if (!stats) return null

        return {
          name: model === "yolov8" ? "YOLOv8" : model === "yolov8_transformer" ? "YOLOv8+T" : "RT-DETR",
          "Inference Time (ms)": stats.inferenceTime,
          mAP: stats.mAP * 100,
          "Model Size (MB)": stats.modelSize,
        }
      })
      .filter(Boolean)
  }

  // Prepare false positive/negative data
  const prepareFPFNData = () => {
    return models
      .map((model) => {
        const stats = mockStatistics[model as keyof typeof mockStatistics]
        if (!stats) return null

        return {
          name: model === "yolov8" ? "YOLOv8" : model === "yolov8_transformer" ? "YOLOv8+T" : "RT-DETR",
          "False Positives": stats.falsePositives,
          "False Negatives": stats.falseNegatives,
        }
      })
      .filter(Boolean)
  }

  // Prepare model complexity data
  const prepareModelComplexityData = () => {
    return models
      .map((model) => {
        const stats = mockStatistics[model as keyof typeof mockStatistics]
        if (!stats) return null

        return {
          name: model === "yolov8" ? "YOLOv8" : model === "yolov8_transformer" ? "YOLOv8+T" : "RT-DETR",
          "Model Size (MB)": stats.modelSize,
          GFLOPs: stats.gflops,
        }
      })
      .filter(Boolean)
  }

  // Calculate total detections for each model
  const getTotalDetections = (modelKey: string) => {
    const model = mockStatistics[modelKey as keyof typeof mockStatistics]
    if (!model) return 0

    return Object.values(model.detectionCount).reduce((sum, count) => sum + count, 0)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted grid grid-cols-7">
          <TabsTrigger value="counts" className="data-[state=active]:bg-marine-indigo data-[state=active]:text-white">
            Counts
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="data-[state=active]:bg-marine-indigo data-[state=active]:text-white"
          >
            Performance
          </TabsTrigger>
          <TabsTrigger
            value="confidence"
            className="data-[state=active]:bg-marine-indigo data-[state=active]:text-white"
          >
            Confidence
          </TabsTrigger>
          <TabsTrigger value="advanced" className="data-[state=active]:bg-marine-indigo data-[state=active]:text-white">
            Advanced
          </TabsTrigger>
          <TabsTrigger value="curves" className="data-[state=active]:bg-marine-indigo data-[state=active]:text-white">
            Curves
          </TabsTrigger>
          <TabsTrigger value="classes" className="data-[state=active]:bg-marine-indigo data-[state=active]:text-white">
            Classes
          </TabsTrigger>
          <TabsTrigger
            value="complexity"
            className="data-[state=active]:bg-marine-indigo data-[state=active]:text-white"
          >
            Complexity
          </TabsTrigger>
        </TabsList>

        {/* Counts Tab */}
        <TabsContent value="counts" className="space-y-6 pt-4">
          {models.map((model) => {
            const countData = prepareCountData(model)
            const totalDetections = getTotalDetections(model)

            return (
              <div key={model} className="space-y-4 bg-card p-4 rounded-lg border border-border">
                <h3 className="text-lg font-medium">
                  {model === "yolov8" && "YOLOv8"}
                  {model === "yolov8_transformer" && "YOLOv8+Transformer"}
                  {model === "rt_detr" && "RT-DETR"}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({totalDetections} total detections)
                  </span>
                </h3>

                <div className="bg-muted p-4 rounded-lg">
                  <ChartContainer
                    config={{
                      count: {
                        label: "Count",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[200px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={countData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count">
                          {countData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {countData.map((item) => (
                    <div key={item.name} className="flex items-center p-2 rounded-md bg-muted">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm capitalize">
                        {item.name}: {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="pt-4">
          <div className="bg-card p-4 rounded-lg border border-border">
            <h3 className="text-lg font-medium mb-4">Model Performance Comparison</h3>

            <div className="bg-muted p-4 rounded-lg mb-6">
              <ChartContainer
                config={{
                  "Inference Time (ms)": {
                    label: "Inference Time (ms)",
                    color: "hsl(var(--chart-1))",
                  },
                  Precision: {
                    label: "Precision",
                    color: "hsl(var(--chart-2))",
                  },
                  Recall: {
                    label: "Recall",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={preparePerformanceData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="Inference Time (ms)" />
                    <Bar dataKey="Precision" />
                    <Bar dataKey="Recall" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {models.map((model) => {
                const stats = mockStatistics[model as keyof typeof mockStatistics]
                if (!stats) return null

                return (
                  <div key={model} className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">
                      {model === "yolov8" && "YOLOv8"}
                      {model === "yolov8_transformer" && "YOLOv8+Transformer"}
                      {model === "rt_detr" && "RT-DETR"}
                    </h3>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between items-center border-b border-border pb-2">
                        <p className="text-muted-foreground">Inference Time</p>
                        <p className="font-medium">{stats.inferenceTime} ms</p>
                      </div>
                      <div className="flex justify-between items-center border-b border-border pb-2">
                        <p className="text-muted-foreground">Precision</p>
                        <p className="font-medium">{(stats.precision * 100).toFixed(1)}%</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-muted-foreground">Recall</p>
                        <p className="font-medium">{(stats.recall * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </TabsContent>

        {/* Confidence Tab */}
        <TabsContent value="confidence" className="pt-4">
          <div className="bg-card p-4 rounded-lg border border-border">
            <h3 className="text-lg font-medium mb-4">Confidence Analysis</h3>

            <div className="bg-muted p-4 rounded-lg mb-6">
              <ChartContainer
                config={{
                  "Average Confidence": {
                    label: "Average Confidence",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareConfidenceData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="Average Confidence" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {models.map((model) => {
                const stats = mockStatistics[model as keyof typeof mockStatistics]
                if (!stats) return null

                // Calculate confidence distribution
                const confidenceRanges = {
                  "90-100%": 0,
                  "80-90%": 0,
                  "70-80%": 0,
                  "<70%": 0,
                }

                // For demo purposes, we'll generate some random distribution
                const total = getTotalDetections(model)
                if (total > 0) {
                  const avgConf = stats.averageConfidence
                  confidenceRanges["90-100%"] = Math.round(total * (avgConf > 0.9 ? 0.4 : 0.2))
                  confidenceRanges["80-90%"] = Math.round(total * (avgConf > 0.8 ? 0.4 : 0.3))
                  confidenceRanges["70-80%"] = Math.round(total * (avgConf > 0.7 ? 0.15 : 0.3))
                  confidenceRanges["<70%"] =
                    total - confidenceRanges["90-100%"] - confidenceRanges["80-90%"] - confidenceRanges["70-80%"]
                }

                const pieData = Object.entries(confidenceRanges).map(([range, value]) => ({
                  name: range,
                  value,
                }))

                const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"]

                return (
                  <div key={model} className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">
                      {model === "yolov8" && "YOLOv8"}
                      {model === "yolov8_transformer" && "YOLOv8+Transformer"}
                      {model === "rt_detr" && "RT-DETR"}
                    </h3>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-muted-foreground text-sm">Average Confidence</p>
                        <p className="font-medium text-lg">{(stats.averageConfidence * 100).toFixed(1)}%</p>
                      </div>

                      <div className="w-32 h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={50}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {pieData.map((item, index) => (
                        <div key={item.name} className="flex items-center text-xs">
                          <div
                            className="w-3 h-3 rounded-full mr-1"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span>
                            {item.name}: {item.value} detections
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-marine-indigo/20 p-4 rounded-lg mt-6">
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
        </TabsContent>

        {/* Advanced Metrics Tab */}
        <TabsContent value="advanced" className="pt-4">
          <div className="bg-card p-4 rounded-lg border border-border">
            <h3 className="text-lg font-medium mb-4">Advanced Metrics Analysis</h3>

            {/* F1 Score Chart */}
            <div className="bg-muted p-4 rounded-lg mb-6">
              <h4 className="text-md font-medium mb-3">F1 Score Comparison</h4>
              <ChartContainer
                config={{
                  "F1 Score": {
                    label: "F1 Score",
                    color: "hsl(var(--chart-1))",
                  },
                  Precision: {
                    label: "Precision",
                    color: "hsl(var(--chart-2))",
                  },
                  Recall: {
                    label: "Recall",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareF1ScoreData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="F1 Score" />
                    <Bar dataKey="Precision" />
                    <Bar dataKey="Recall" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* mAP Chart */}
            <div className="bg-muted p-4 rounded-lg mb-6">
              <h4 className="text-md font-medium mb-3">Mean Average Precision (mAP)</h4>
              <ChartContainer
                config={{
                  mAP: {
                    label: "mAP",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareMAPData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="mAP" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* False Positives/Negatives Chart */}
            <div className="bg-muted p-4 rounded-lg mb-6">
              <h4 className="text-md font-medium mb-3">False Positives & Negatives</h4>
              <ChartContainer
                config={{
                  "False Positives": {
                    label: "False Positives",
                    color: "hsl(var(--chart-1))",
                  },
                  "False Negatives": {
                    label: "False Negatives",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareFPFNData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="False Positives" />
                    <Bar dataKey="False Negatives" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Speed vs Accuracy Scatter Plot */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="text-md font-medium mb-3">Speed vs Accuracy Trade-off</h4>
              <ChartContainer
                config={{
                  "Inference Time (ms)": {
                    label: "Inference Time (ms)",
                    color: "hsl(var(--chart-1))",
                  },
                  mAP: {
                    label: "mAP",
                    color: "hsl(var(--chart-2))",
                  },
                  "Model Size (MB)": {
                    label: "Model Size (MB)",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="Inference Time (ms)" name="Inference Time" unit="ms" />
                    <YAxis type="number" dataKey="mAP" name="mAP" unit="%" domain={[80, 100]} />
                    <ZAxis type="number" dataKey="Model Size (MB)" range={[60, 120]} name="Model Size" unit="MB" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    {models.map((model, index) => (
                      <Scatter
                        key={model}
                        name={model === "yolov8" ? "YOLOv8" : model === "yolov8_transformer" ? "YOLOv8+T" : "RT-DETR"}
                        data={[prepareSpeedAccuracyData()[index]]}
                        fill={modelColors[model as keyof typeof modelColors]}
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </ChartContainer>
              <p className="text-muted-foreground text-sm mt-2">Note: Bubble size represents model size in MB</p>
            </div>
          </div>
        </TabsContent>

        {/* Curves Tab */}
        <TabsContent value="curves" className="pt-4">
          <div className="bg-card p-4 rounded-lg border border-border">
            <h3 className="text-lg font-medium mb-4">Performance Curves</h3>

            {/* ROC Curves */}
            <div className="bg-muted p-4 rounded-lg mb-6">
              <h4 className="text-md font-medium mb-3">ROC Curves</h4>
              <ChartContainer
                config={{
                  y: {
                    label: "True Positive Rate",
                    color: "hsl(var(--chart-1))",
                  },
                  x: {
                    label: "False Positive Rate",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="False Positive Rate"
                      domain={[0, 1]}
                      label={{
                        value: "False Positive Rate",
                        position: "insideBottomRight",
                        offset: -10,
                      }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="True Positive Rate"
                      domain={[0, 1]}
                      label={{ value: "True Positive Rate", angle: -90, position: "insideLeft" }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />

                    {models.map((model) => {
                      const stats = mockStatistics[model as keyof typeof mockStatistics]
                      if (!stats) return null

                      return (
                        <Line
                          key={model}
                          type="monotone"
                          data={stats.rocCurve}
                          name={model === "yolov8" ? "YOLOv8" : model === "yolov8_transformer" ? "YOLOv8+T" : "RT-DETR"}
                          dataKey="y"
                          stroke={modelColors[model as keyof typeof modelColors]}
                          dot={false}
                          activeDot={{ r: 8 }}
                        />
                      )
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Precision-Recall Curves */}
            <div className="bg-muted p-4 rounded-lg mb-6">
              <h4 className="text-md font-medium mb-3">Precision-Recall Curves</h4>
              <ChartContainer
                config={{
                  precision: {
                    label: "Precision",
                    color: "hsl(var(--chart-1))",
                  },
                  recall: {
                    label: "Recall",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="recall"
                      name="Recall"
                      domain={[0, 1]}
                      label={{ value: "Recall", position: "insideBottomRight", offset: -10 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="precision"
                      name="Precision"
                      domain={[0, 1]}
                      label={{ value: "Precision", angle: -90, position: "insideLeft" }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />

                    {models.map((model) => {
                      const stats = mockStatistics[model as keyof typeof mockStatistics]
                      if (!stats) return null

                      return (
                        <Line
                          key={model}
                          type="monotone"
                          data={stats.prCurve}
                          name={model === "yolov8" ? "YOLOv8" : model === "yolov8_transformer" ? "YOLOv8+T" : "RT-DETR"}
                          dataKey="precision"
                          stroke={modelColors[model as keyof typeof modelColors]}
                          dot={false}
                          activeDot={{ r: 8 }}
                        />
                      )
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* IoU vs mAP Curves */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="text-md font-medium mb-3">IoU Threshold vs mAP</h4>
              <ChartContainer
                config={{
                  mAP: {
                    label: "mAP",
                    color: "hsl(var(--chart-1))",
                  },
                  iou: {
                    label: "IoU Threshold",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="iou"
                      name="IoU Threshold"
                      domain={[0.5, 0.95]}
                      label={{ value: "IoU Threshold", position: "insideBottomRight", offset: -10 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="mAP"
                      name="mAP"
                      domain={[0, 1]}
                      label={{ value: "mAP", angle: -90, position: "insideLeft" }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />

                    {models.map((model) => {
                      const stats = mockStatistics[model as keyof typeof mockStatistics]
                      if (!stats) return null

                      return (
                        <Line
                          key={model}
                          type="monotone"
                          data={stats.iouMap}
                          name={model === "yolov8" ? "YOLOv8" : model === "yolov8_transformer" ? "YOLOv8+T" : "RT-DETR"}
                          dataKey="mAP"
                          stroke={modelColors[model as keyof typeof modelColors]}
                          dot={false}
                          activeDot={{ r: 8 }}
                        />
                      )
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="pt-4">
          <div className="bg-card p-4 rounded-lg border border-border">
            <h3 className="text-lg font-medium mb-4">Class-wise Performance</h3>

            {/* Class Accuracy Radar Chart */}
            <div className="bg-muted p-4 rounded-lg mb-6">
              <h4 className="text-md font-medium mb-3">Class Accuracy Comparison</h4>
              <ChartContainer
                config={{
                  YOLOv8: {
                    label: "YOLOv8",
                    color: "hsl(var(--chart-1))",
                  },
                  "YOLOv8+T": {
                    label: "YOLOv8+T",
                    color: "hsl(var(--chart-2))",
                  },
                  "RT-DETR": {
                    label: "RT-DETR",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={prepareClassAccuracyData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="class" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />

                    {models.map((model) => {
                      const modelName =
                        model === "yolov8" ? "YOLOv8" : model === "yolov8_transformer" ? "YOLOv8+T" : "RT-DETR"
                      return (
                        <Radar
                          key={model}
                          name={modelName}
                          dataKey={modelName}
                          stroke={modelColors[model as keyof typeof modelColors]}
                          fill={modelColors[model as keyof typeof modelColors]}
                          fillOpacity={0.2}
                        />
                      )
                    })}
                  </RadarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Class-wise Detection Counts */}
            <div className="bg-muted p-4 rounded-lg mb-6">
              <h4 className="text-md font-medium mb-3">Class-wise Detection Counts</h4>
              <ChartContainer
                config={{
                  YOLOv8: {
                    label: "YOLOv8",
                    color: "hsl(var(--chart-1))",
                  },
                  "YOLOv8+T": {
                    label: "YOLOv8+T",
                    color: "hsl(var(--chart-2))",
                  },
                  "RT-DETR": {
                    label: "RT-DETR",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.keys(classColors).map((className) => {
                      const data: Record<string, any> = {
                        name: className.replace("_", " "),
                      }

                      models.forEach((model) => {
                        const stats = mockStatistics[model as keyof typeof mockStatistics]
                        if (stats) {
                          const modelName =
                            model === "yolov8" ? "YOLOv8" : model === "yolov8_transformer" ? "YOLOv8+T" : "RT-DETR"
                          data[modelName] = stats.detectionCount[className as keyof typeof stats.detectionCount]
                        }
                      })

                      return data
                    })}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />

                    {models.map((model) => {
                      const modelName =
                        model === "yolov8" ? "YOLOv8" : model === "yolov8_transformer" ? "YOLOv8+T" : "RT-DETR"
                      return (
                        <Bar key={model} dataKey={modelName} fill={modelColors[model as keyof typeof modelColors]} />
                      )
                    })}
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Class-wise Confidence Distribution */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="text-md font-medium mb-3">Class-wise Confidence Distribution</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(classColors).map((className) => (
                  <div key={className} className="bg-card p-3 rounded-lg border border-border">
                    <h5 className="text-sm font-medium mb-2 capitalize">{className.replace("_", " ")}</h5>
                    <ChartContainer
                      config={{
                        confidence: {
                          label: "Confidence (%)",
                          color: "hsl(var(--chart-1))",
                        },
                        count: {
                          label: "Count",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                      className="h-[150px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={models
                            .map((model) => {
                              const stats = mockStatistics[model as keyof typeof mockStatistics]
                              if (!stats) return null

                              return {
                                name:
                                  model === "yolov8"
                                    ? "YOLOv8"
                                    : model === "yolov8_transformer"
                                      ? "YOLOv8+T"
                                      : "RT-DETR",
                                confidence: stats.classAccuracy[className as keyof typeof stats.classAccuracy] * 100,
                                count: stats.detectionCount[className as keyof typeof stats.detectionCount],
                              }
                            })
                            .filter(Boolean)}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="confidence"
                            stroke={classColors[className as keyof typeof classColors]}
                            fill={classColors[className as keyof typeof classColors]}
                            fillOpacity={0.3}
                            name="Confidence (%)"
                          />
                          <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="count"
                            stroke="#8884d8"
                            fill="#8884d8"
                            fillOpacity={0.3}
                            name="Count"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Complexity Tab */}
        <TabsContent value="complexity" className="pt-4">
          <div className="bg-card p-4 rounded-lg border border-border">
            <h3 className="text-lg font-medium mb-4">Model Complexity Analysis</h3>

            {/* Model Size and Complexity */}
            <div className="bg-muted p-4 rounded-lg mb-6">
              <h4 className="text-md font-medium mb-3">Model Size & Computational Complexity</h4>
              <ChartContainer
                config={{
                  "Model Size (MB)": {
                    label: "Model Size (MB)",
                    color: "hsl(var(--chart-1))",
                  },
                  GFLOPs: {
                    label: "GFLOPs",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareModelComplexityData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="Model Size (MB)" />
                    <Bar yAxisId="right" dataKey="GFLOPs" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Efficiency Metrics */}
            <div className="bg-muted p-4 rounded-lg mb-6">
              <h4 className="text-md font-medium mb-3">Efficiency Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {models.map((model) => {
                  const stats = mockStatistics[model as keyof typeof mockStatistics]
                  if (!stats) return null

                  // Calculate efficiency metrics
                  const mAPperMS = stats.mAP / stats.inferenceTime
                  const mAPperMB = stats.mAP / stats.modelSize
                  const mAPperGFLOP = stats.mAP / stats.gflops

                  return (
                    <div key={model} className="bg-card p-4 rounded-lg border border-border">
                      <h5 className="font-medium mb-3">
                        {model === "yolov8" && "YOLOv8"}
                        {model === "yolov8_transformer" && "YOLOv8+Transformer"}
                        {model === "rt_detr" && "RT-DETR"}
                      </h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center border-b border-border pb-2">
                          <p className="text-muted-foreground text-sm">mAP per ms</p>
                          <p className="font-medium">{mAPperMS.toFixed(4)}</p>
                        </div>
                        <div className="flex justify-between items-center border-b border-border pb-2">
                          <p className="text-muted-foreground text-sm">mAP per MB</p>
                          <p className="font-medium">{mAPperMB.toFixed(4)}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-muted-foreground text-sm">mAP per GFLOP</p>
                          <p className="font-medium">{mAPperGFLOP.toFixed(4)}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Comprehensive Model Comparison */}
            <div className="bg-marine-indigo/20 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Comprehensive Model Comparison</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted">
                    <tr>
                      <th scope="col" className="px-4 py-3">
                        Metric
                      </th>
                      {models.map((model) => (
                        <th key={model} scope="col" className="px-4 py-3">
                          {model === "yolov8" && "YOLOv8"}
                          {model === "yolov8_transformer" && "YOLOv8+T"}
                          {model === "rt_detr" && "RT-DETR"}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <th scope="row" className="px-4 py-2 font-medium whitespace-nowrap">
                        Model Size (MB)
                      </th>
                      {models.map((model) => {
                        const stats = mockStatistics[model as keyof typeof mockStatistics]
                        return (
                          <td key={model} className="px-4 py-2">
                            {stats?.modelSize}
                          </td>
                        )
                      })}
                    </tr>
                    <tr className="border-b border-border">
                      <th scope="row" className="px-4 py-2 font-medium whitespace-nowrap">
                        GFLOPs
                      </th>
                      {models.map((model) => {
                        const stats = mockStatistics[model as keyof typeof mockStatistics]
                        return (
                          <td key={model} className="px-4 py-2">
                            {stats?.gflops}
                          </td>
                        )
                      })}
                    </tr>
                    <tr className="border-b border-border">
                      <th scope="row" className="px-4 py-2 font-medium whitespace-nowrap">
                        Inference Time (ms)
                      </th>
                      {models.map((model) => {
                        const stats = mockStatistics[model as keyof typeof mockStatistics]
                        return (
                          <td key={model} className="px-4 py-2">
                            {stats?.inferenceTime}
                          </td>
                        )
                      })}
                    </tr>
                    <tr className="border-b border-border">
                      <th scope="row" className="px-4 py-2 font-medium whitespace-nowrap">
                        mAP
                      </th>
                      {models.map((model) => {
                        const stats = mockStatistics[model as keyof typeof mockStatistics]
                        return (
                          <td key={model} className="px-4 py-2">
                            {(stats?.mAP * 100).toFixed(1)}%
                          </td>
                        )
                      })}
                    </tr>
                    <tr className="border-b border-border">
                      <th scope="row" className="px-4 py-2 font-medium whitespace-nowrap">
                        F1 Score
                      </th>
                      {models.map((model) => {
                        const stats = mockStatistics[model as keyof typeof mockStatistics]
                        return (
                          <td key={model} className="px-4 py-2">
                            {(stats?.f1Score * 100).toFixed(1)}%
                          </td>
                        )
                      })}
                    </tr>
                    <tr className="border-b border-border">
                      <th scope="row" className="px-4 py-2 font-medium whitespace-nowrap">
                        Avg. Confidence
                      </th>
                      {models.map((model) => {
                        const stats = mockStatistics[model as keyof typeof mockStatistics]
                        return (
                          <td key={model} className="px-4 py-2">
                            {(stats?.averageConfidence * 100).toFixed(1)}%
                          </td>
                        )
                      })}
                    </tr>
                    <tr>
                      <th scope="row" className="px-4 py-2 font-medium whitespace-nowrap">
                        Total Detections
                      </th>
                      {models.map((model) => {
                        const totalDetections = getTotalDetections(model)
                        return (
                          <td key={model} className="px-4 py-2">
                            {totalDetections}
                          </td>
                        )
                      })}
                    </tr>
                    <tr className="border-b border-border">
                      <th scope="row" className="px-4 py-2 font-medium whitespace-nowrap">
                        False Positives
                      </th>
                      {models.map((model) => {
                        const stats = mockStatistics[model as keyof typeof mockStatistics]
                        return (
                          <td key={model} className="px-4 py-2">
                            {stats?.falsePositives}
                          </td>
                        )
                      })}
                    </tr>
                    <tr>
                      <th scope="row" className="px-4 py-2 font-medium whitespace-nowrap">
                        False Negatives
                      </th>
                      {models.map((model) => {
                        const stats = mockStatistics[model as keyof typeof mockStatistics]
                        return (
                          <td key={model} className="px-4 py-2">
                            {stats?.falseNegatives}
                          </td>
                        )
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-sm">
                <p className="mb-2">
                  <span className="font-medium">Key Findings:</span>
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <span className="font-medium">YOLOv8</span> offers the best efficiency with the lowest computational
                    requirements.
                  </li>
                  <li>
                    <span className="font-medium">YOLOv8+Transformer</span> provides a balanced trade-off between
                    performance and resource usage.
                  </li>
                  <li>
                    <span className="font-medium">RT-DETR</span> delivers the highest accuracy but requires
                    significantly more computational resources.
                  </li>
                  <li>
                    For resource-constrained environments (e.g., edge devices),{" "}
                    <span className="font-medium">YOLOv8</span> is recommended.
                  </li>
                  <li>
                    For applications requiring high accuracy, <span className="font-medium">RT-DETR</span> is the best
                    choice if computational resources are available.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

