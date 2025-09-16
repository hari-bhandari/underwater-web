export interface MediaSource {
  type: "upload" | "example"
  mediaType: "image" | "video"
  source: string
  fileName?: string
  exampleId?: string
  title?: string
}

