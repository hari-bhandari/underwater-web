// lib/inference-utils.ts
import * as ort from "onnxruntime-web"
import type { Detection } from "@/types/detection"

// Class names for marine species
export const classNames = ["fish", "small_fish", "crab", "jellyfish", "shrimp", "starfish"]

// Class colors for visualization - using bright, high-contrast colors for underwater visibility
export const classColors = {
  fish: "#FF3B30", // bright red
  small_fish: "#FF9500", // bright orange
  crab: "#FFCC00", // bright yellow
  jellyfish: "#00E5FF", // bright cyan
  shrimp: "#FF2D55", // bright pink
  starfish: "#5AC8FA", // bright blue
}

// Model colors for visualization
export const modelColors = {
  yolov8: "#007AFF", // bright blue
  yolov8_transformer: "#5856D6", // bright purple
  rt_detr: "#FF2D55", // bright pink
}

// Helper function to scale values based on dimensions
function scaleValue(input: number, maxBefore: number, maxAfter: number): number {
  return (input * maxAfter) / maxBefore
}

// Convert image to tensor for ONNX inference
export async function imageToTensor(
    imageSource: string | HTMLImageElement,
    modelWidth = 640,
    modelHeight = 640,
): Promise<{
  tensor: ort.Tensor
  originalWidth: number
  originalHeight: number
}> {
  // Load image if it's a URL
  const img = imageSource instanceof HTMLImageElement ? imageSource : await loadImage(imageSource)

  // Store original dimensions
  const originalWidth = img.width
  const originalHeight = img.height

  // Create a canvas for image processing
  const canvas = document.createElement("canvas")
  canvas.width = modelWidth
  canvas.height = modelHeight
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("Could not get canvas context")
  }

  // Draw image to canvas with resizing
  ctx.drawImage(img, 0, 0, modelWidth, modelHeight)

  // Get image data
  const imageData = ctx.getImageData(0, 0, modelWidth, modelHeight)
  const buffer = imageData.data

  // Separate R, G, B channels
  const [red, green, blue] = [new Array<number>(), new Array<number>(), new Array<number>()]

  for (let i = 0; i < buffer.length; i += 4) {
    red.push(buffer[i])
    green.push(buffer[i + 1])
    blue.push(buffer[i + 2])
  }

  // Concatenate channels for NCHW format
  const transposed = red.concat(green).concat(blue)
  const float32Data = new Float32Array(1 * 3 * modelHeight * modelWidth)

  // Normalize values to 0-1 range
  for (let i = 0; i < transposed.length; i++) {
    float32Data[i] = transposed[i] / 255.0
  }

  // Create ONNX tensor
  return {
    tensor: new ort.Tensor("float32", float32Data, [1, 3, modelHeight, modelWidth]),
    originalWidth,
    originalHeight,
  }
}

// Load image from URL
async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = (err) => reject(err)
    img.src = url
  })
}

// Process ONNX model output to get detections
export function processOutput(
    output: ort.InferenceSession.ReturnType,
    originalWidth: number,
    originalHeight: number,
    modelWidth = 640,
    modelHeight = 640,
): Detection[] {
  console.log("Processing model output", { originalWidth, originalHeight, modelWidth, modelHeight });
  
  // Get output tensor - use the first available output
  // Common output names: "output0", "output", "detections", or simply the first one we find
  const outputKey = Object.keys(output)[0];
  const outputTensor = output[outputKey]

  if (!outputTensor) {
    console.error("No output tensor found")
    return []
  }

  const data = outputTensor.data as Float32Array
  const dimensions = outputTensor.dims

  console.log("Output tensor dimensions:", dimensions, "Output tensor name:", outputKey)

  // Extract key information about the model output format
  let numDetections = 0
  let valuesPerDetection = 0
  let layout: "det-last" | "det-first" = "det-last"

  if (dimensions.length === 3) {
    const [batch, dim1, dim2] = dimensions
    const expectedValues = classNames.length + 5 // 4 box coords + objectness + classes

    if (dim2 === expectedValues || dim2 === expectedValues - 1) {
      // Shape: [1, num_detections, values_per_detection]
      numDetections = dim1
      valuesPerDetection = dim2
      layout = "det-last"
    } else if (dim1 === expectedValues || dim1 === expectedValues - 1) {
      // Shape: [1, values_per_detection, num_detections]
      numDetections = dim2
      valuesPerDetection = dim1
      layout = "det-first"
    } else {
      // Fallback: assume detections live in last dimension
      numDetections = dim2
      valuesPerDetection = dim1
      layout = "det-first"
      console.warn(
        `Unexpected tensor shape ${dimensions}. Falling back to layout=${layout} with ${numDetections} detections and ${valuesPerDetection} values`,
      )
    }
  } else if (dimensions.length === 2) {
    numDetections = dimensions[0]
    valuesPerDetection = dimensions[1]
    layout = "det-last"
  } else {
    const totalElements = data.length
    const numClasses = classNames.length
    valuesPerDetection = 5 + numClasses
    numDetections = Math.floor(totalElements / valuesPerDetection)
    layout = "det-last"
    console.warn(
      `Unusual tensor shape ${dimensions}, inferring ${numDetections} detections with ${valuesPerDetection} values each`,
    )
  }

  const confidenceThreshold = 0.25 // Align with YOLO defaults so we drop low-confidence boxes early
  console.log(`Processing ${numDetections} detections with ${valuesPerDetection} values per detection`)

  const boxes: Detection[] = []
  const numClasses = classNames.length
  const hasObjectness = valuesPerDetection === numClasses + 5 || valuesPerDetection === numClasses + 6
  const baseOffset = hasObjectness ? 5 : 4
  const availableClassValues = Math.max(0, valuesPerDetection - baseOffset)
  const usableClassCount = Math.min(numClasses, availableClassValues)

  if (usableClassCount !== numClasses) {
    console.warn(
      `Model outputs ${availableClassValues} class scores but ${numClasses} class names are configured. Using first ${usableClassCount} classes`,
    )
  }

  const readValue = (detectionIndex: number, valueIndex: number): number => {
    if (layout === "det-last") {
      return data[detectionIndex * valuesPerDetection + valueIndex]
    }
    // layout === "det-first"
    return data[valueIndex * numDetections + detectionIndex]
  }

  // Process each detection
  for (let i = 0; i < numDetections; i++) {
    if (usableClassCount === 0) {
      continue
    }

    const rawX = readValue(i, 0)
    const rawY = readValue(i, 1)
    const rawW = readValue(i, 2)
    const rawH = readValue(i, 3)

    const rawObjectness = hasObjectness ? readValue(i, 4) : 1
    const objectness = Math.min(Math.max(rawObjectness, 0), 1)

    let highestProb = 0
    let bestClassIdx = 0

    for (let j = 0; j < usableClassCount; j++) {
      const rawClassScore = readValue(i, baseOffset + j)
      const classScore = Math.min(Math.max(rawClassScore, 0), 1)
      const confidence = classScore * objectness

      if (confidence > highestProb) {
        highestProb = confidence
        bestClassIdx = j
      }
    }

    if (highestProb < confidenceThreshold) continue

    const convertValue = (value: number, maxDim: number) => {
      if (Number.isFinite(value) && Math.abs(value) <= 1.5) {
        return Math.min(Math.max(value, 0), 1)
      }
      return Math.min(Math.max(value / maxDim, 0), 1)
    }

    const x = convertValue(rawX, modelWidth)
    const y = convertValue(rawY, modelHeight)
    const w = convertValue(rawW, modelWidth)
    const h = convertValue(rawH, modelHeight)

    const className = classNames[bestClassIdx] ?? `class_${bestClassIdx}`

    boxes.push({
      id: i,
      bbox: [x, y, w, h],
      class: className,
      confidence: highestProb,
    })

    console.log(
      `Detection ${i}: class=${className}, confidence=${(highestProb * 100).toFixed(2)}%, bbox=[${x.toFixed(4)}, ${y.toFixed(4)}, ${w.toFixed(4)}, ${h.toFixed(4)}]`,
    )
  }
  
  console.log(`Found ${boxes.length} initial detections before NMS`);
  
  // Apply non-maximum suppression
  const result = nonMaxSuppression(boxes);
  console.log(`Final detections after NMS: ${result.length}`);
  
  return result;
}

// Calculate Intersection over Union (IoU) for two boxes
function calculateIoU(boxA: Detection, boxB: Detection): number {
  // Get coordinates in [center_x, center_y, width, height] format
  const [xA, yA, wA, hA] = boxA.bbox;
  const [xB, yB, wB, hB] = boxB.bbox;
  
  // Convert to [x1, y1, x2, y2] format (top-left, bottom-right corners)
  const xA1 = xA - wA/2;
  const yA1 = yA - hA/2;
  const xA2 = xA + wA/2;
  const yA2 = yA + hA/2;
  
  const xB1 = xB - wB/2;
  const yB1 = yB - hB/2;
  const xB2 = xB + wB/2;
  const yB2 = yB + hB/2;
  
  // Calculate intersection area
  const interX1 = Math.max(xA1, xB1);
  const interY1 = Math.max(yA1, yB1);
  const interX2 = Math.min(xA2, xB2);
  const interY2 = Math.min(yA2, yB2);
  
  const interWidth = Math.max(0, interX2 - interX1);
  const interHeight = Math.max(0, interY2 - interY1);
  const interArea = interWidth * interHeight;
  
  // Calculate union area
  const boxAArea = wA * hA;
  const boxBArea = wB * hB;
  const unionArea = boxAArea + boxBArea - interArea;
  
  // Return IoU
  return interArea / unionArea;
}

// Apply Non-Maximum Suppression to remove overlapping boxes
export function nonMaxSuppression(boxes: Detection[], iouThreshold = 0.5, maxDetections = 300): Detection[] {
  if (boxes.length === 0) return [];
  
  // Sort by confidence (descending)
  boxes.sort((a, b) => b.confidence - a.confidence);
  
  const selectedBoxes: Detection[] = [];
  let remainingBoxes = [...boxes];
  
  while (remainingBoxes.length > 0 && selectedBoxes.length < maxDetections) {
    // Select box with highest confidence
    const chosenBox = remainingBoxes.shift();
    if (!chosenBox) break;
    
    // Add to selected boxes
    selectedBoxes.push(chosenBox);
    
    // Filter remaining boxes - keep only those with low IoU with chosen box
    remainingBoxes = remainingBoxes.filter(
      box => calculateIoU(chosenBox, box) < iouThreshold
    );
  }
  
  return selectedBoxes;
}

// Draw detections on canvas
export function drawDetections(
    canvas: HTMLCanvasElement,
    image: HTMLImageElement,
    detections: Detection[],
    confidenceThreshold = 0.5,
    showLabels = true,
): void {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    console.error("Could not get canvas context for drawing detections");
    return;
  }

  // Set canvas dimensions to match image
  canvas.width = image.width;
  canvas.height = image.height;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the image
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  // Filter detections by confidence threshold
  const filteredDetections = detections.filter((d) => d.confidence >= confidenceThreshold);
  
  console.log(`Drawing ${filteredDetections.length} detections with confidence >= ${confidenceThreshold}`);
  
  if (filteredDetections.length === 0) {
    console.log("No detections to draw with current confidence threshold");
  }

  // Draw each detection
  filteredDetections.forEach((detection, index) => {
    try {
      const [centerX, centerY, width, height] = detection.bbox;
      
      // Convert from center coordinates to top-left coordinates
      const x = (centerX - width/2) * canvas.width;
      const y = (centerY - height/2) * canvas.height;
      const boxWidth = width * canvas.width;
      const boxHeight = height * canvas.height;
      
      // Ensure box is within canvas bounds
      const boxX = Math.max(0, x);
      const boxY = Math.max(0, y);
      const boundedWidth = Math.min(boxWidth, canvas.width - boxX);
      const boundedHeight = Math.min(boxHeight, canvas.height - boxY);

      // Log detection details for debugging
      console.log(`Drawing detection ${index}: ${detection.class} (${(detection.confidence * 100).toFixed(2)}%) at [${boxX.toFixed(1)}, ${boxY.toFixed(1)}, ${boundedWidth.toFixed(1)}, ${boundedHeight.toFixed(1)}]`);

      // Get color for class (or default to a random color if not found)
      const color = classColors[detection.class as keyof typeof classColors] || "#FF0000";

      // Calculate proportional sizes based on canvas dimensions
      const lineWidth = Math.max(2, scaleValue(2, 640, Math.min(canvas.width, canvas.height)));
      const fontSize = Math.max(12, scaleValue(20, 640, Math.min(canvas.width, canvas.height)));
      const labelHeight = Math.max(16, scaleValue(30, 640, Math.min(canvas.width, canvas.height)));
      const padding = Math.max(2, scaleValue(5, 640, Math.min(canvas.width, canvas.height)));
      
      // Draw bounding box
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;
      ctx.strokeRect(boxX, boxY, boundedWidth, boundedHeight);

      // Draw label if enabled
      if (showLabels) {
        const confidenceText = (detection.confidence * 100).toFixed(1);
        const label = `${detection.class} ${confidenceText}%`;
        
        // Set up font and measure text
        ctx.font = `${fontSize}px Arial, sans-serif`;
        const textWidth = ctx.measureText(label).width;
        
        // Position label at the top of the box or inside if needed
        const labelY = Math.max(0, boxY);
        
        // Draw label background
        ctx.fillStyle = color;
        ctx.fillRect(
          boxX, 
          labelY > labelHeight ? labelY - labelHeight : labelY, 
          textWidth + padding * 2, 
          labelHeight
        );
        
        // Draw label text
        ctx.fillStyle = "white";
        ctx.fillText(
          label, 
          boxX + padding, 
          labelY > labelHeight ? labelY - padding : labelY + fontSize
        );
      }
    } catch (error) {
      console.error("Error drawing detection:", error, detection);
    }
  });
}

// Run inference with ONNX model
export async function runInference(
    session: ort.InferenceSession,
    imageSource: string | HTMLImageElement,
    onProgress?: (progress: number) => void,
): Promise<{
  detections: Detection[]
  inferenceTime: number
  originalWidth: number
  originalHeight: number
}> {
  // Start timing
  const startTime = performance.now()

  // Update progress
  onProgress?.(10)

  try {
    // Convert image to tensor
    const { tensor, originalWidth, originalHeight } = await imageToTensor(imageSource)

    // Update progress
    onProgress?.(40)

    // Determine the correct input name for the model (default to "images" for Ultralytics exports)
    const inputName = session.inputNames?.[0] ?? "images"

    // Run inference
    const feeds: Record<string, ort.Tensor> = { [inputName]: tensor }
    const results = await session.run(feeds)

    // Update progress
    onProgress?.(70)

    // Process results
    const detections = processOutput(results, originalWidth, originalHeight)

    // Log detections for debugging
    console.log("Detected objects:", detections)

    // Calculate inference time
    const inferenceTime = performance.now() - startTime

    // Update progress
    onProgress?.(100)

    return {
      detections,
      inferenceTime,
      originalWidth,
      originalHeight,
    }
  } catch (error) {
    console.error("Inference error:", error)
    throw error
  }
}
