"use client"

import Image from "next/image"

// Example data
const exampleImages = [
  {
    id: "coral-reef",
    title: "Coral Reef Scene",
    description: "Various fish in a coral reef habitat",
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "tide-pool",
    title: "Tide Pool",
    description: "Crabs and starfish in a tide pool",
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "open-ocean",
    title: "Open Ocean",
    description: "Jellyfish in open water",
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "shallow-reef",
    title: "Shallow Reef",
    description: "Small fish and shrimp near coral",
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
]

interface ExampleGalleryProps {
  onExampleSelect: (id: string, source: string) => void
}

export function ExampleGallery({ onExampleSelect }: ExampleGalleryProps) {
  const handleExampleSelect = (id: string, source: string) => {
    onExampleSelect(id, source)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {exampleImages.map((image) => (
        <div
          key={image.id}
          className="relative overflow-hidden rounded-lg cursor-pointer group"
          onClick={() => handleExampleSelect(image.id, image.thumbnail)}
        >
          <div className="aspect-video relative">
            <Image
              src={image.thumbnail || "/placeholder.svg"}
              alt={image.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <h3 className="text-white font-medium">{image.title}</h3>
            <p className="text-gray-300 text-sm">{image.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

