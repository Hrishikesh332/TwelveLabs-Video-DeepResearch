"use client"

import { useState } from "react"
import InlineVideoPlayer from "./InlineVideoPlayer"
import VideoPlayerModal from "./VideoPlayerModal"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Maximize2 } from "lucide-react"

interface VideoPlayerExampleProps {
  videoUrl: string
  thumbnailUrl?: string
  title?: string
  className?: string
}

export default function VideoPlayerExample({
  videoUrl,
  thumbnailUrl,
  title,
  className = ""
}: VideoPlayerExampleProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!videoUrl) {
    return (
      <Card className={`p-6 bg-[#E9E8E7] border border-[#D3D1CF] ${className}`}>
        <div className="text-center text-[#1D1C1B]">
          <div className="text-lg font-medium mb-2">No Video Available</div>
          <div className="text-sm">Video URL is required to display the player</div>
        </div>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Inline Video Player */}
      <Card className="p-6 bg-[#E9E8E7] border border-[#D3D1CF]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1D1C1B]">Inline Video Player</h3>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            size="sm"
            className="border-[#D3D1CF] hover:bg-[#D3D1CF] text-[#1D1C1B]"
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            Open in Modal
          </Button>
        </div>
        
        <InlineVideoPlayer
          videoUrl={videoUrl}
          thumbnailUrl={thumbnailUrl}
          title={title}
          className="max-w-2xl"
        />
      </Card>

      {/* Video Information */}
      <Card className="p-6 bg-[#E9E8E7] border border-[#D3D1CF]">
        <h3 className="text-lg font-semibold text-[#1D1C1B] mb-3">Video Information</h3>
        <div className="space-y-2 text-sm text-[#1D1C1B]">
          <div><strong>Title:</strong> {title || 'Untitled'}</div>
          <div><strong>URL:</strong> {videoUrl.substring(0, 60)}...</div>
          <div><strong>Type:</strong> HLS Stream (.m3u8)</div>
          <div><strong>Thumbnail:</strong> {thumbnailUrl ? 'Available' : 'Not available'}</div>
        </div>
      </Card>

      {/* Modal Video Player */}
      <VideoPlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoUrl={videoUrl}
        thumbnailUrl={thumbnailUrl}
        title={title}
        autoPlay={true}
      />
    </div>
  )
}
