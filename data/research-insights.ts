export interface OverallPerformanceRow {
  model: string
  preprocessingMs: number
  inferenceMs: number
  postprocessingMs: number
  totalMs: number
  precisionAll: number
  recallAll: number
  map50: number
  map5095: number
  meanPrecision: number
  meanRecall: number
}

export const overallPerformance: OverallPerformanceRow[] = [
  {
    model: "YOLO",
    preprocessingMs: 0.2,
    inferenceMs: 1.0,
    postprocessingMs: 0.9,
    totalMs: 2.1,
    precisionAll: 0.992,
    recallAll: 0.969,
    map50: 0.988,
    map5095: 0.835,
    meanPrecision: 0.9918,
    meanRecall: 0.969,
  },
  {
    model: "RT-DETR",
    preprocessingMs: 0.3,
    inferenceMs: 10.8,
    postprocessingMs: 0.3,
    totalMs: 11.4,
    precisionAll: 0.978,
    recallAll: 0.957,
    map50: 0.98,
    map5095: 0.75,
    meanPrecision: 0.978,
    meanRecall: 0.9569,
  },
  {
    model: "Hybrid",
    preprocessingMs: 0.3,
    inferenceMs: 0.8,
    postprocessingMs: 0.6,
    totalMs: 1.7,
    precisionAll: 0.986,
    recallAll: 0.967,
    map50: 0.986,
    map5095: 0.833,
    meanPrecision: 0.9858,
    meanRecall: 0.9671,
  },
]

export interface PerClassMapRow {
  class: string
  yoloMap50: number
  yoloMap5095: number
  rtDetrMap50: number
  rtDetrMap5095: number
  hybridMap50: number
  hybridMap5095: number
}

export const perClassMap: PerClassMapRow[] = [
  {
    class: "all",
    yoloMap50: 0.988,
    yoloMap5095: 0.835,
    rtDetrMap50: 0.98,
    rtDetrMap5095: 0.75,
    hybridMap50: 0.986,
    hybridMap5095: 0.833,
  },
  {
    class: "crab",
    yoloMap50: 0.995,
    yoloMap5095: 0.902,
    rtDetrMap50: 0.994,
    rtDetrMap5095: 0.76,
    hybridMap50: 0.995,
    hybridMap5095: 0.904,
  },
  {
    class: "fish",
    yoloMap50: 0.994,
    yoloMap5095: 0.885,
    rtDetrMap50: 0.985,
    rtDetrMap5095: 0.805,
    hybridMap50: 0.994,
    hybridMap5095: 0.894,
  },
  {
    class: "jellyfish",
    yoloMap50: 0.968,
    yoloMap5095: 0.725,
    rtDetrMap50: 0.951,
    rtDetrMap5095: 0.675,
    hybridMap50: 0.964,
    hybridMap5095: 0.721,
  },
  {
    class: "shrimp",
    yoloMap50: 0.995,
    yoloMap5095: 0.774,
    rtDetrMap50: 0.983,
    rtDetrMap5095: 0.689,
    hybridMap50: 0.993,
    hybridMap5095: 0.774,
  },
  {
    class: "small_fish",
    yoloMap50: 0.979,
    yoloMap5095: 0.733,
    rtDetrMap50: 0.974,
    rtDetrMap5095: 0.667,
    hybridMap50: 0.974,
    hybridMap5095: 0.716,
  },
  {
    class: "starfish",
    yoloMap50: 0.995,
    yoloMap5095: 0.99,
    rtDetrMap50: 0.995,
    rtDetrMap5095: 0.903,
    hybridMap50: 0.995,
    hybridMap5095: 0.988,
  },
]

export interface ErrorAnalysisRow {
  class: string
  yoloFP: number
  yoloFN: number
  yoloF1: number
  rtDetrFP: number
  rtDetrFN: number
  rtDetrF1: number
  hybridFP: number
  hybridFN: number
  hybridF1: number
}

export const errorAnalysis: ErrorAnalysisRow[] = [
  {
    class: "crab",
    yoloFP: 14,
    yoloFN: 13,
    yoloF1: 0.9894,
    rtDetrFP: 4,
    rtDetrFN: 94,
    rtDetrF1: 0.963,
    hybridFP: 7,
    hybridFN: 15,
    hybridF1: 0.9914,
  },
  {
    class: "fish",
    yoloFP: 5,
    yoloFN: 4,
    yoloF1: 0.986,
    rtDetrFP: 6,
    rtDetrFN: 21,
    rtDetrF1: 0.9589,
    hybridFP: 6,
    hybridFN: 6,
    hybridF1: 0.9813,
  },
  {
    class: "jellyfish",
    yoloFP: 5,
    yoloFN: 0,
    yoloF1: 0.958,
    rtDetrFP: 3,
    rtDetrFN: 8,
    rtDetrF1: 0.9147,
    hybridFP: 4,
    hybridFN: 0,
    hybridF1: 0.9667,
  },
  {
    class: "shrimp",
    yoloFP: 0,
    yoloFN: 1,
    yoloF1: 0.9913,
    rtDetrFP: 0,
    rtDetrFN: 5,
    rtDetrF1: 0.958,
    hybridFP: 1,
    hybridFN: 2,
    hybridF1: 0.9739,
  },
  {
    class: "small_fish",
    yoloFP: 37,
    yoloFN: 65,
    yoloF1: 0.9479,
    rtDetrFP: 17,
    rtDetrFN: 191,
    rtDetrF1: 0.9011,
    hybridFP: 44,
    hybridFN: 77,
    hybridF1: 0.9384,
  },
  {
    class: "starfish",
    yoloFP: 1,
    yoloFN: 2,
    yoloF1: 0.9981,
    rtDetrFP: 1,
    rtDetrFN: 8,
    rtDetrF1: 0.9943,
    hybridFP: 1,
    hybridFN: 0,
    hybridF1: 0.9994,
  },
]

export const robustnessDelta = [
  { model: "YOLO", deltaMap50Percent: -0.3 },
  { model: "Hybrid", deltaMap50Percent: -0.3 },
  { model: "RT-DETR", deltaMap50Percent: -1.5 },
]

export interface DeploymentRow {
  model: string
  layers: number
  paramsM: number
  gflops: number
  fileMb: number
  vramMb: number
  gpuSpeedMs: number
  cpuSpeedMs: number
}

export const deploymentEfficiency: DeploymentRow[] = [
  { model: "YOLO", layers: 129, paramsM: 3.01, gflops: 6.01, fileMb: 12, vramMb: 20, gpuSpeedMs: 2.1, cpuSpeedMs: 63 },
  { model: "RT-DETR", layers: 457, paramsM: 32.82, gflops: 63.12, fileMb: 135, vramMb: 210, gpuSpeedMs: 11.4, cpuSpeedMs: 372 },
  { model: "Hybrid", layers: 129, paramsM: 3.01, gflops: 6.01, fileMb: 15, vramMb: 12, gpuSpeedMs: 1.7, cpuSpeedMs: 49 },
]

export interface RepeatabilityRow {
  model: string
  meanMap50Percent: number
  sdPercent: number
  ci95: string
}

export const statisticalRepeatability: RepeatabilityRow[] = [
  { model: "YOLO", meanMap50Percent: 98.88, sdPercent: 0.03, ci95: "[98.81, 98.95]" },
  { model: "RT-DETR", meanMap50Percent: 98.1, sdPercent: 0.26, ci95: "[97.44, 98.76]" },
  { model: "Hybrid", meanMap50Percent: 98.6, sdPercent: 0.2, ci95: "[98.10, 99.10]" },
]

export interface PriorWorkRow {
  feature: string
  zhang2021: string
  pedersen2019: string
  thisWork: string
}

export const priorWorkComparison: PriorWorkRow[] = [
  {
    feature: "Backbone",
    zhang2021: "MobileNetV2",
    pedersen2019: "YOLOv2/3 (Darknet)",
    thisWork: "YOLOv8; Hybrid; RT-DETR",
  },
  {
    feature: "Neck/Head",
    zhang2021: "FPN; PANet; AFFM",
    pedersen2019: "FPN; Passthrough",
    thisWork: "Std. neck; Transformer",
  },
  {
    feature: "Loss/Opt.",
    zhang2021: "Multi-part; Adam",
    pedersen2019: "SSE; SGD",
    thisWork: "Focal; SGD; Cosine LR",
  },
  {
    feature: "Input Size",
    zhang2021: "416x416",
    pedersen2019: "416x416",
    thisWork: "640x640",
  },
  {
    feature: "Augmentation",
    zhang2021: "Flip; color; basic",
    pedersen2019: "Flip; scale",
    thisWork: "Flip; blur; turbidity; sonar",
  },
  {
    feature: "Train Schedule",
    zhang2021: "50+150 epochs",
    pedersen2019: "30k iters",
    thisWork: "183 (RT-DETR); 600 (Hybrid & YOLO)",
  },
  {
    feature: "Data Split",
    zhang2021: "80/10/10",
    pedersen2019: "80/10/10",
    thisWork: "80/10/10",
  },
  {
    feature: "mAP@0.5_%",
    zhang2021: "92.7",
    pedersen2019: "84.9",
    thisWork: "98.8 (YOLO), 98.6 (H), 98.0 (RT)",
  },
]

export interface AblationRow {
  model: string
  layers: number
  paramsM: number
  gflops: number
  preprocessingMs: number
  inferenceMs: number
  postprocessingMs: number
  totalMs: number
  map50: number
  map5095: number
}

export const ablationA1: AblationRow[] = [
  {
    model: "YOLO",
    layers: 129,
    paramsM: 3.01,
    gflops: 8.2,
    preprocessingMs: 0.2,
    inferenceMs: 1.0,
    postprocessingMs: 0.9,
    totalMs: 2.1,
    map50: 0.909,
    map5095: 0.768,
  },
  {
    model: "RT-DETR",
    layers: 457,
    paramsM: 32.82,
    gflops: 108,
    preprocessingMs: 0.3,
    inferenceMs: 10.8,
    postprocessingMs: 0.3,
    totalMs: 11.4,
    map50: 0.882,
    map5095: 0.675,
  },
  {
    model: "Hybrid",
    layers: 129,
    paramsM: 3.01,
    gflops: 8.2,
    preprocessingMs: 0.3,
    inferenceMs: 0.8,
    postprocessingMs: 0.6,
    totalMs: 1.7,
    map50: 0.917,
    map5095: 0.775,
  },
]

export const ablationA2: AblationRow[] = [
  {
    model: "YOLO",
    layers: 129,
    paramsM: 3.01,
    gflops: 8.2,
    preprocessingMs: 0.2,
    inferenceMs: 1.0,
    postprocessingMs: 0.9,
    totalMs: 2.1,
    map50: 0.97,
    map5095: 0.82,
  },
  {
    model: "RT-DETR",
    layers: 457,
    paramsM: 32.82,
    gflops: 108,
    preprocessingMs: 0.3,
    inferenceMs: 10.8,
    postprocessingMs: 0.3,
    totalMs: 11.4,
    map50: 0.978,
    map5095: 0.957,
  },
  {
    model: "Hybrid",
    layers: 129,
    paramsM: 3.01,
    gflops: 8.2,
    preprocessingMs: 0.3,
    inferenceMs: 0.8,
    postprocessingMs: 0.6,
    totalMs: 1.7,
    map50: 0.986,
    map5095: 0.967,
  },
]

export const ablationA3: PerClassMapRow[] = [
  {
    class: "all",
    yoloMap50: 0.945,
    yoloMap5095: 0.801,
    rtDetrMap50: 0.933,
    rtDetrMap5095: 0.715,
    hybridMap50: 0.943,
    hybridMap5095: 0.799,
  },
  {
    class: "crab",
    yoloMap50: 0.985,
    yoloMap5095: 0.892,
    rtDetrMap50: 0.984,
    rtDetrMap5095: 0.752,
    hybridMap50: 0.985,
    hybridMap5095: 0.895,
  },
  {
    class: "fish",
    yoloMap50: 0.944,
    yoloMap5095: 0.841,
    rtDetrMap50: 0.926,
    rtDetrMap5095: 0.758,
    hybridMap50: 0.944,
    hybridMap5095: 0.849,
  },
  {
    class: "jellyfish",
    yoloMap50: 0.871,
    yoloMap5095: 0.653,
    rtDetrMap50: 0.846,
    rtDetrMap5095: 0.601,
    hybridMap50: 0.868,
    hybridMap5095: 0.649,
  },
  {
    class: "shrimp",
    yoloMap50: 0.915,
    yoloMap5095: 0.712,
    rtDetrMap50: 0.895,
    rtDetrMap5095: 0.627,
    hybridMap50: 0.913,
    hybridMap5095: 0.712,
  },
  {
    class: "small_fish",
    yoloMap50: 0.969,
    yoloMap5095: 0.726,
    rtDetrMap50: 0.964,
    rtDetrMap5095: 0.66,
    hybridMap50: 0.964,
    hybridMap5095: 0.709,
  },
  {
    class: "starfish",
    yoloMap50: 0.985,
    yoloMap5095: 0.98,
    rtDetrMap50: 0.985,
    rtDetrMap5095: 0.894,
    hybridMap50: 0.985,
    hybridMap5095: 0.978,
  },
]

export interface QuickReferenceRow {
  model: string
  headlineMap50Percent: number
  map5095Percent: number
  gpuLatencyMs: number
  vramMb: number
}

export const quickReference: QuickReferenceRow[] = [
  { model: "YOLO", headlineMap50Percent: 98.8, map5095Percent: 83.5, gpuLatencyMs: 2.1, vramMb: 20 },
  { model: "Hybrid", headlineMap50Percent: 98.6, map5095Percent: 83.3, gpuLatencyMs: 1.7, vramMb: 12 },
  { model: "RT-DETR", headlineMap50Percent: 98.0, map5095Percent: 75.0, gpuLatencyMs: 11.4, vramMb: 210 },
]

export const analysisSections = [
  {
    id: "performance",
    title: "Overall Performance",
    description: "Latency breakdown and aggregate detection metrics across the three production candidates.",
  },
  {
    id: "per-class",
    title: "Per-Class Accuracy",
    description: "Per-class mAP to highlight class-specific strengths and weaknesses.",
  },
  {
    id: "errors",
    title: "Error Analysis",
    description: "False positives, false negatives, and F1 scores per class for each architecture.",
  },
  {
    id: "robustness",
    title: "Robustness",
    description: "Impact on mAP under turbidity, motion blur, and color shift perturbations.",
  },
  {
    id: "deployment",
    title: "Deployment Efficiency",
    description: "Model complexity, footprint, and runtime efficiency across hardware targets.",
  },
  {
    id: "repeatability",
    title: "Statistical Repeatability",
    description: "Stability across training seeds with 95% confidence intervals.",
  },
  {
    id: "prior-work",
    title: "Prior Work Comparison",
    description: "Side-by-side comparison with previous marine detection efforts.",
  },
  {
    id: "ablations",
    title: "Ablation Studies",
    description: "Effect of training choices such as augmentation and learning rate schedules.",
  },
  {
    id: "quick-reference",
    title: "Executive Summary",
    description: "Headline KPIs that stakeholders can reference quickly.",
  },
]

export type AnalysisSectionId = (typeof analysisSections)[number]["id"]

