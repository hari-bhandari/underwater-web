"use client"

import { MediaUploader } from "@/components/detection/media-uploader"
import { ExampleGallery } from "@/components/detection/example-gallery"
import type { MediaSource } from "@/types/media"

interface InputStepProps {
  onMediaSelected: (media: MediaSource) => void
  selectedMedia: MediaSource | null
}

export function InputStep({ onMediaSelected, selectedMedia }: InputStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Media Section */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-medium mb-4">Upload Media</h3>
          <MediaUploader
            onFileSelected={onMediaSelected}
            selectedMedia={selectedMedia?.type === "upload" ? selectedMedia : null}
          />

          <div className="mt-6">
            <p className="text-muted-foreground text-sm mb-2">Supported marine life classes:</p>
            <div className="flex flex-wrap gap-2">
              {["crab", "fish", "jellyfish", "shrimp", "small_fish", "starfish"].map((species) => (
                <span key={species} className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                  {species.replace("_", " ")}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sample Images Section */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-medium mb-4">Sample Images</h3>
          <ExampleGallery
            onExampleSelect={onMediaSelected}
            selectedExampleId={selectedMedia?.type === "example" ? selectedMedia.exampleId : null}
          />
        </div>
      </div>

      {/* Selected Media Preview */}
      {selectedMedia && selectedMedia.source && (
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-medium mb-4">Selected Media</h3>
          <div className="flex items-center justify-center">
            {selectedMedia.mediaType === "image" ? (
              <div className="relative">
                <img
                  src={selectedMedia.source || "/placeholder.svg"}
                  alt={selectedMedia.title || "Selected image"}
                  className="max-h-64 rounded-md object-contain"
                />
                <div className="mt-2 text-center text-sm text-muted-foreground">
                  {selectedMedia.type === "upload" ? selectedMedia.fileName : selectedMedia.title}
                </div>
              </div>
            ) : (
              <div className="relative">
                <video src={selectedMedia.source} controls className="max-h-64 rounded-md" />
                <div className="mt-2 text-center text-sm text-muted-foreground">{selectedMedia.fileName}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

