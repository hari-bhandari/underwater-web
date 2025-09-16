import * as ort from "onnxruntime-web"
import type { Detection } from "@/types/detection"

// Class names for COCO dataset (or your custom classes)
export const classNames = ["fish", "small_fish", "crab", "jellyfish", "shrimp", "starfish"]

// Preprocess image for model input
export async function preprocessImage(imageData: ImageData | HTMLImageElement): Promise<ort.Tensor> {
  // Create a canvas to manipulate the image
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("Could not get canvas context")
  }

  // Set canvas dimensions to model input size
  canvas.width = 640
  canvas.height = 640

  // Draw and resize image to canvas
  if (imageData instanceof HTMLImageElement) {
    ctx.drawImage(imageData, 0, 0, canvas.width, canvas.height)
  } else {
    // If it's ImageData, we need to create a temporary canvas
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) {
      throw new Error("Could not get temporary canvas context")
    }
    tempCanvas.width = imageData.width
    tempCanvas.height = imageData.height
    tempCtx.putImageData(imageData, 0, 0)

    // Draw the temp canvas to our resized canvas
    ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height)
  }

  // Get image data from canvas
  const resizedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  // Create Float32Array for the tensor
  const inputData = new Float32Array(3 * canvas.width * canvas.height)

  // Normalize pixel values and convert to RGB format
  for (let i = 0; i < canvas.width * canvas.height; i++) {
    // RGBA format in imageData
    const offset = i * 4
    // RGB format for model input (NCHW format)
    inputData[i] = resizedImageData.data[offset] / 255.0 // R
    inputData[i + canvas.width * canvas.height] = resizedImageData.data[offset + 1] / 255.0 // G
    inputData[i + 2 * canvas.width * canvas.height] = resizedImageData.data[offset + 2] / 255.0 // B
  }

  // Create tensor with shape [1, 3, height, width]
  return new ort.Tensor("float32", inputData, [1, 3, canvas.height, canvas.width])
}

// Convert model output tensor to detections
export function tensorToDetections(results: ort.InferenceSession.ReturnType): Detection[] {
  // Get output tensor (format depends on your model)
  // For YOLOv8, the output is typically named 'output0' and has shape [1, 84, num_boxes]
  // where 84 = 4 (bbox) + 80 (class scores for COCO)
  const outputTensor = results.output0

  if (!outputTensor) {
    console.error("No output tensor found")
    return []
  }

  // Get tensor data and dimensions
  const data = outputTensor.data as Float32Array
  const dimensions = outputTensor.dims

  // For YOLOv8, the output format is [batch, boxes, 4+num_classes]
  // where the 4 values are [x, y, width, height]
  const numClasses = classNames.length
  const boxesPerBatch = dimensions[1]
  const valuesPerBox = dimensions[2]

  const detections: Detection[] = []

  // Process each box
  for (let i = 0; i < boxesPerBatch; i++) {
    const baseOffset = i * valuesPerBox

    // Get bounding box coordinates
    const x = data[baseOffset]
    const y = data[baseOffset + 1]
    const width = data[baseOffset + 2]
    const height = data[baseOffset + 3]

    // Find class with highest confidence
    let maxClassScore = 0
    let maxClassIndex = 0

    for (let j = 0; j < numClasses; j++) {
      const classScore = data[baseOffset + 4 + j]
      if (classScore > maxClassScore) {
        maxClassScore = classScore
        maxClassIndex = j
      }
    }

    // Only keep detections with confidence above 0.1 (we'll filter further with the slider)
    if (maxClassScore > 0.1) {
      detections.push({
        id: i,
        bbox: [x, y, width, height],
        class: classNames[maxClassIndex],
        confidence: maxClassScore,
      })
    }
  }

  return detections
}

// Draw detections on canvas
export function drawDetections(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  detections: Detection[],
  confidenceThreshold = 0.5,
  showLabels = true,
  classColors: Record<string, string> = {},
): void {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  // Set canvas dimensions to match image
  canvas.width = image.width
  canvas.height = image.height

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw the image
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

  // Filter detections by confidence threshold
  const filteredDetections = detections.filter((d) => d.confidence >= confidenceThreshold)

  // Draw each detection
  filteredDetections.forEach((detection) => {
    const [x, y, width, height] = detection.bbox
    const boxX = x * canvas.width
    const boxY = y * canvas.height
    const boxWidth = width * canvas.width
    const boxHeight = height * canvas.height

    // Get color for class (or default to green)
    const color = classColors[detection.class] || "#10B981"

    // Draw bounding box
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)

    // Draw label if enabled
    if (showLabels) {
      const label = `${detection.class} ${Math.round(detection.confidence * 100)}%`

      // Measure text width
      const textWidth = ctx.measureText(label).width

      // Draw label background
      ctx.fillStyle = color
      ctx.fillRect(boxX, boxY - 25, textWidth + 10, 25)

      // Draw label text
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "16px Arial"
      ctx.fillText(label, boxX + 5, boxY - 7)
    }
  })

  return
}

