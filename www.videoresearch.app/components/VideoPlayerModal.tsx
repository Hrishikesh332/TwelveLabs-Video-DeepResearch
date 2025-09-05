"use client"

import { useState } from "react"
import VideoPlayer from "./VideoPlayer"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface VideoPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  thumbnailUrl?: string
  title?: string
  autoPlay?: boolean
}

export default function VideoPlayerModal({
  isOpen,
  onClose,
  videoUrl,
  thumbnailUrl,
  title,
  autoPlay = false
}: VideoPlayerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl w-full h-[80vh] p-0 bg-[#E9E8E7] border-2 border-black !rounded-[20px]"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-[#1D1C1B]">
              {title || 'Video Player'}
            </DialogTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 hover:bg-[#D3D1CF] rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Video Player */}
        <div className="flex-1 p-6 pt-4">
          <VideoPlayer
            videoUrl={videoUrl}
            thumbnailUrl={thumbnailUrl}
            title={title}
            autoPlay={autoPlay}
            className="w-full h-full"
            onError={(error) => console.error("Video error:", error)}
            onLoadStart={() => console.log("Video loading started")}
            onLoadComplete={() => console.log("Video loading completed")}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
