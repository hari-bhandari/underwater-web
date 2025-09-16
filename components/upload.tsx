"use client"

import type React from "react"
import { useState } from "react"
import { UploadIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UploadProps {
  onFileSelected: (source: string, type: string) => void
}

export function Upload({ onFileSelected }: UploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      handleFile(droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      handleFile(selectedFile)
    }
  }

  const handleFile = (selectedFile: File) => {
    // Check if file is an image or video
    if (!selectedFile.type.match("image.*") && !selectedFile.type.match("video.*")) {
      alert("Please upload an image or video file")
      return
    }

    setFile(selectedFile)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreview(result)
      onFileSelected(result, selectedFile.type.includes("image") ? "image" : "video")
    }
    reader.readAsDataURL(selectedFile)
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
  }

  return (
    <div className="space-y-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? "border-marine-indigo bg-marine-indigo/10" : "border-border"
        } ${preview ? "border-marine-indigo" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!preview ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <UploadIcon className="h-12 w-12 text-marine-indigo" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Drag and drop your file here, or</p>
              <label htmlFor="file-upload" className="mt-2 cursor-pointer">
                <span className="inline-flex items-center justify-center rounded-md bg-marine-indigo px-4 py-2 text-sm font-medium text-white hover:bg-marine-indigo/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-marine-indigo">
                  Choose file
                </span>
                <input
                  id="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">No file chosen</p>
          </div>
        ) : (
          <div className="relative">
            <Button
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 h-8 w-8 rounded-full"
              onClick={clearFile}
            >
              <X className="h-4 w-4" />
            </Button>
            {file?.type.includes("image") ? (
              <div className="flex justify-center">
                <img src={preview || "/placeholder.svg"} alt="Preview" className="max-h-64 rounded-md object-contain" />
              </div>
            ) : (
              <div className="flex justify-center">
                <video src={preview} controls className="max-h-64 rounded-md" />
              </div>
            )}
            <p className="mt-2 text-sm text-muted-foreground">{file?.name}</p>
          </div>
        )}
      </div>
    </div>
  )
}

