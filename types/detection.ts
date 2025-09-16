export interface Detection {
  id: number
  bbox: [number, number, number, number] // [x, y, width, height] normalized to 0-1
  class: string
  confidence: number
}

