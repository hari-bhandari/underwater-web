
"use client"
import Image from "next/image"
import { exampleImages } from "@/data/example-images"
import type { MediaSource } from "@/types/media"
import { CheckCircle2 } from "lucide-react"

interface ExampleGalleryProps {
  onExampleSelect: (example: MediaSource) => void
  selectedExampleId: string | null
}

export function ExampleGallery({ onExampleSelect, selectedExampleId }: ExampleGalleryProps): JSX.Element {
  const handleExampleSelect = (id: string, source: string, title: string) => {
    onExampleSelect({
      type: "example",
      mediaType: "image",
      source: source,
      exampleId: id,
      title: title,
    })
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {exampleImages.map((image) => (
        <div
          key={image.id}
          className={`relative overflow-hidden rounded-lg cursor-pointer group ${
            selectedExampleId === image.id ? "ring-2 ring-marine-indigo" : ""
          }`}
          onClick={() => handleExampleSelect(image.id, image.thumbnail, image.title)}
        >
          <div className="aspect-video relative">
            <Image
              src={image.thumbnail}
              alt={image.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <h3 className="text-white font-medium">{image.title}</h3>
            <p className="text-gray-300 text-sm">{image.description}</p>
          </div>
          {selectedExampleId === image.id && (
            <div className="absolute top-2 right-2 bg-marine-indigo rounded-full p-1">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

