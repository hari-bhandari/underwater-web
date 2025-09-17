import type * as ort from "onnxruntime-web"

// Model metadata
export interface ModelInfo {
  id: string
  name: string
  path: string
  size: number // in MB
}

// Available models
export const availableModels: Record<string, ModelInfo> = {
  yolov8: {
    id: "yolov8",
    name: "YOLOv8",
    path: "https://github.com/hari-bhandari/underwater-react/releases/download/models/yolo.onnx",
    size: 28,
  },
  yolov8_transformer: {
    id: "yolov8_transformer",
    name: "YOLOv8 head + Transformer",
    path: "https://github.com/hari-bhandari/underwater-react/releases/download/models/hybrid.onnx",
    size: 42,
  },
  rt_detr: {
    id: "rt_detr",
    name: "RT-DETR",
    path: "https://github.com/hari-bhandari/underwater-react/releases/download/models/rt_detr.onnx",
    size: 56,
  },
}

// Cache for loaded models
const modelCache: Record<string, ort.InferenceSession> = {}

// Model loading status
export type ModelLoadingStatus = "idle" | "loading" | "loaded" | "error"

export interface ModelLoadingState {
  status: ModelLoadingStatus
  progress: number
  error?: string
}

// Load a model
export async function loadModel(
  modelId: string,
  onProgressUpdate?: (progress: number) => void,
): Promise<ort.InferenceSession> {
  // If model is already cached, return it
  if (modelCache[modelId]) {
    return modelCache[modelId]
  }

  const modelInfo = availableModels[modelId]
  if (!modelInfo) {
    throw new Error(`Model ${modelId} not found`)
  }

  try {
    // Simulate progressive loading for demo purposes
    // In a real app, you would use the actual loading progress from ONNX Runtime
    const totalSteps = 10
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const progress = (step / totalSteps) * 100
      onProgressUpdate?.(progress)
    }

    // In a real app, you would load the actual model
    // const session = await ort.InferenceSession.create(modelInfo.path);

    // For demo, we'll create a mock session
    const mockSession = {} as ort.InferenceSession
    modelCache[modelId] = mockSession

    return mockSession
  } catch (error) {
    console.error(`Error loading model ${modelId}:`, error)
    throw error
  }
}

// Run inference with a model
export async function runInference(
  modelId: string,
  input: any,
  onProgressUpdate?: (progress: number) => void,
): Promise<any> {
  // Ensure model is loaded
  const session = await loadModel(modelId, onProgressUpdate)

  // Simulate inference time
  const inferenceTime = modelId === "yolov8" ? 1000 : modelId === "yolov8_transformer" ? 1500 : 2000 // rt_detr takes longest

  await new Promise((resolve) => setTimeout(resolve, inferenceTime))

  // In a real app, you would run actual inference
  // const results = await session.run(input);

  // For demo, return mock results
  return {
  detections: [],
  }
}

// Mock detections (same as in your data file)

