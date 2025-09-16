// contexts/model-context.tsx
"use client"

import React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import * as ort from "onnxruntime-web"
import { runInference } from "@/lib/inference-utils"
import type { Detection } from "@/types/detection"

// Model metadata
export interface ModelInfo {
  id: string
  name: string
  path: string
  size: number
}

export type ExecutionProvider = "webgl" | "wasm"

// Available models
export const availableModels: Record<string, ModelInfo> = {
  yolov8: {
    id: "yolov8",
    name: "YOLOv8",
    path: "https://github.com/hari-bhandari/underwater-react/releases/download/models/yolo.onnx",
    size: 12.3,
  },
  yolov8_transformer: {
    id: "yolov8_transformer",
    name: "YOLOv8 head + Transformer",
    path: "https://github.com/hari-bhandari/underwater-react/releases/download/models/rt_detr.onnx",
    size: 42.5,
  },
  rt_detr: {
    id: "rt_detr",
    name: "RT-DETR",
    path: "https://github.com/hari-bhandari/underwater-react/releases/download/models/rt_detr.onnx",
    size: 56.8,
  },
}

// Model loading status
export type ModelStatus = "idle" | "loading" | "loaded" | "running" | "error" | "complete"

export interface ModelState {
  status: ModelStatus
  progress: number
  error?: string
  session?: ort.InferenceSession
  detections?: Detection[]
  inferenceTime?: number
  originalWidth?: number
  originalHeight?: number
  executionProvider: ExecutionProvider
}

interface ModelContextType {
  modelStates: Record<string, ModelState>
  loadModel: (modelId: string) => Promise<void>
  runModelInference: (modelId: string, imageSource: string | HTMLImageElement) => Promise<void>
  resetModel: (modelId: string) => void
  resetAllModels: () => void
  executionProvider: ExecutionProvider
  availableExecutionProviders: ExecutionProvider[]
  setExecutionProvider: (provider: ExecutionProvider) => void
  providerError: string | null
}

const ModelContext = createContext<ModelContextType | undefined>(undefined)

const createInitialModelState = (provider: ExecutionProvider): ModelState => ({
  status: "idle",
  progress: 0,
  executionProvider: provider,
})

const createInitialModelStates = (provider: ExecutionProvider): Record<string, ModelState> => ({
  yolov8: createInitialModelState(provider),
  yolov8_transformer: createInitialModelState(provider),
  rt_detr: createInitialModelState(provider),
})

const disposeSession = (session?: ort.InferenceSession) => {
  if (!session) return
  const releasable = session as unknown as { release?: () => Promise<void> }
  if (typeof releasable.release === "function") {
    releasable.release().catch((error) => {
      console.warn("Failed to release ONNX Runtime session", error)
    })
  }
}

const detectAvailableExecutionProviders = (): ExecutionProvider[] => {
  if (typeof window === "undefined") {
    return ["wasm"]
  }

  const providers: ExecutionProvider[] = ["wasm"]

  try {
    const canvas = document.createElement("canvas")
    const webglContext =
      (canvas.getContext("webgl") as WebGLRenderingContext | null) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null)

    if (typeof window.WebGLRenderingContext !== "undefined" && webglContext) {
      providers.unshift("webgl")
    }
  } catch (error) {
    console.warn("Unable to probe WebGL support", error)
  }

  return providers
}

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [executionProvider, setExecutionProviderState] = useState<ExecutionProvider>("wasm")
  const [availableExecutionProviders, setAvailableExecutionProviders] = useState<ExecutionProvider[]>(["wasm"])
  const [providerError, setProviderError] = useState<string | null>(null)
  const initialProviderResolved = useRef(false)
  const [modelStates, setModelStates] = useState<Record<string, ModelState>>(() =>
    createInitialModelStates("wasm"),
  )

  // Initialize ONNX runtime
  useEffect(() => {
    // Set ONNX runtime configurations for optimal performance
    ort.env.wasm.numThreads = navigator.hardwareConcurrency || 4
    ort.env.wasm.simd = true

    console.log("ONNX Runtime initialized with", ort.env.wasm.numThreads, "threads")
  }, [])

  const changeExecutionProvider = useCallback(
    (provider: ExecutionProvider) => {
      if (provider === executionProvider) {
        return
      }

      setExecutionProviderState(provider)
      setProviderError(null)
      setModelStates((prev) => {
        Object.values(prev).forEach((state) => disposeSession(state.session))
        return createInitialModelStates(provider)
      })
    },
    [executionProvider],
  )

  useEffect(() => {
    const providers = detectAvailableExecutionProviders()
    setAvailableExecutionProviders(providers)

    if (!providers.includes(executionProvider)) {
      // If the current provider isn't supported, fall back to the first available option
      changeExecutionProvider(providers[0])
      initialProviderResolved.current = true
      return
    }

    if (!initialProviderResolved.current && providers[0] === "webgl" && executionProvider !== "webgl") {
      setExecutionProviderState("webgl")
      setModelStates(createInitialModelStates("webgl"))
    }

    initialProviderResolved.current = true
  }, [executionProvider, changeExecutionProvider])

  // Load a model
  const loadModel = useCallback(
      async (modelId: string): Promise<void> => {
        const modelInfo = availableModels[modelId]
        if (!modelInfo) {
          throw new Error(`Model ${modelId} not found`)
        }

        // Skip if already loaded or loading
        if (
            modelStates[modelId]?.status === "loaded" ||
            modelStates[modelId]?.status === "loading" ||
            modelStates[modelId]?.status === "running" ||
            modelStates[modelId]?.status === "complete"
        ) {
          return
        }

        try {
          // Update state to loading
          setModelStates((prev) => ({
            ...prev,
            [modelId]: {
              ...prev[modelId],
              status: "loading",
              progress: 0,
              executionProvider,
              error: undefined,
            },
          }))

          console.log(`Loading model ${modelId} from ${modelInfo.path}`)

          // Create session options - include all possible providers
          const chosenProviders: ort.InferenceSession.SessionOptions["executionProviders"] =
            executionProvider === "webgl" ? ["webgl", "wasm"] : ["wasm"]

          const sessionOptions: ort.InferenceSession.SessionOptions = {
            executionProviders: chosenProviders,
            graphOptimizationLevel: "all",
          }

          // Create progress handler for real progress tracking
          const progressHandler = (progress: number) => {
            console.log(`Model ${modelId} loading progress: ${progress * 100}%`)
            setModelStates((prev) => ({
              ...prev,
              [modelId]: { ...prev[modelId], progress: progress * 100 },
            }))
          }

          // Real model loading
          const session = await ort.InferenceSession.create(modelInfo.path, sessionOptions, {
            progressCallback: progressHandler,
          })

          console.log(`Model ${modelId} loaded successfully`)

          setProviderError(null)

          // Update state to loaded
          setModelStates((prev) => ({
            ...prev,
            [modelId]: {
              ...prev[modelId],
              status: "loaded",
              progress: 100,
              session,
              error: undefined,
              executionProvider,
            },
          }))
        } catch (error) {
          console.error(`Error loading model ${modelId}:`, error)
          setProviderError(
            executionProvider === "webgl"
              ? "GPU acceleration (WebGL) is not supported on this device. Try switching to WebAssembly."
              : error instanceof Error
                ? error.message
                : "Unknown provider error",
          )
          setModelStates((prev) => ({
            ...prev,
            [modelId]: {
              ...prev[modelId],
              status: "error",
              progress: 0,
              error: error instanceof Error ? error.message : "Unknown error",
              session: undefined,
              executionProvider,
            },
          }))
        }
      },
      [modelStates, executionProvider],
  )

  // Run inference with a model
  const runModelInference = useCallback(
      async (modelId: string, imageSource: string | HTMLImageElement): Promise<void> => {
        const modelState = modelStates[modelId]

        if (!modelState || (modelState.status !== "loaded" && modelState.status !== "complete")) {
          throw new Error(`Model ${modelId} is not ready for inference`)
        }

        try {
          // Update state to running
          setModelStates((prev) => ({
            ...prev,
            [modelId]: {
              ...prev[modelId],
              status: "running",
              progress: 0,
              error: undefined,
              detections: undefined,
            },
          }))

          const session = modelState.session
          if (!session) {
            throw new Error(`Model session not found for ${modelId}`)
          }

          console.log(`Running inference with model ${modelId}`)

          // Run inference
          const { detections, inferenceTime, originalWidth, originalHeight } = await runInference(
              session,
              imageSource,
              (progress) => {
                setModelStates((prev) => ({
                  ...prev,
                  [modelId]: { ...prev[modelId], progress },
                }))
              },
          )

          console.log(
              `Inference complete for model ${modelId}. Found ${detections.length} detections in ${inferenceTime.toFixed(2)}ms`,
          )

          // Update state to complete
          setModelStates((prev) => ({
            ...prev,
            [modelId]: {
              ...prev[modelId],
              status: "complete",
              progress: 100,
              detections: detections,
              inferenceTime,
              originalWidth,
              originalHeight,
              error: undefined,
            },
          }))
        } catch (error) {
          console.error(`Error running inference with model ${modelId}:`, error)
          setModelStates((prev) => ({
            ...prev,
            [modelId]: {
              ...prev[modelId],
              status: "error",
              error: error instanceof Error ? error.message : "Unknown error",
            },
          }))
        }
      },
      [modelStates],
  )

  // Reset a model
  const resetModel = useCallback(
    (modelId: string) => {
      setModelStates((prev) => {
        const target = prev[modelId]
        if (!target) return prev

        disposeSession(target.session)

        return {
          ...prev,
          [modelId]: createInitialModelState(executionProvider),
        }
      })
    },
    [executionProvider],
  )

  // Reset all models
  const resetAllModels = useCallback(() => {
    setProviderError(null)
    setModelStates((prev) => {
      Object.values(prev).forEach((state) => disposeSession(state.session))
      return createInitialModelStates(executionProvider)
    })
  }, [executionProvider])

  return (
      <ModelContext.Provider
          value={{
            modelStates,
            loadModel,
            runModelInference,
            resetModel,
            resetAllModels,
            executionProvider,
            availableExecutionProviders,
            setExecutionProvider: changeExecutionProvider,
            providerError,
          }}
      >
        {children}
      </ModelContext.Provider>
  )
}

// Hook to use the model context
export function useModel() {
  const context = useContext(ModelContext)
  if (context === undefined) {
    throw new Error("useModel must be used within a ModelProvider")
  }
  return context
}
