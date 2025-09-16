export const mockDetections = {
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

