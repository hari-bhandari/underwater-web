import { Card } from "@/components/ui/card"
import { Cpu, Zap, BarChart3, Clock } from "lucide-react"

export function ModelInfo() {
  const models = [
    {
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
      name: "RT-DETR",
      icon: <BarChart3 className="h-8 w-8 text-blue-500" />,
      description: "Real-Time Detection Transformer combining transformer architecture with efficient design.",
      strengths: ["Highest accuracy", "Best for detailed analysis", "Superior performance on small objects"],
    },
  ]

  return (
    <>
      {models.map((model) => (
        <Card key={model.name} className="p-6 flex flex-col h-full">
          <div className="flex items-center mb-4">
            {model.icon}
            <h3 className="text-xl font-semibold ml-3">{model.name}</h3>
          </div>
          <p className="text-slate-600 dark:text-slate-300 mb-4 flex-grow">{model.description}</p>
          <div>
            <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Key Strengths
            </h4>
            <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
              {model.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
        </Card>
      ))}
    </>
  )
}

