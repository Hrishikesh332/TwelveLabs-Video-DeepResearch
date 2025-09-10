"use client"

import { useState } from "react"
import VideoPlayer from "./VideoPlayer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Video } from "lucide-react"
import React from "react"

interface InlineVideoPlayerProps {
  videoUrl: string
  thumbnailUrl?: string
  title?: string
  className?: string
  showThumbnail?: boolean
  autoPlay?: boolean
  duration?: number
  preventAutoPlay?: boolean
}

export default function InlineVideoPlayer({
  videoUrl,
  thumbnailUrl,
  title,
  className = "",
  showThumbnail = true,
  autoPlay = false,
  duration,
  preventAutoPlay = false
}: InlineVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  // Reset play state on source change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    setIsPlaying(false)
  }, [videoUrl])

  if (!videoUrl) {
    return (
      <div className={`aspect-[21/9] bg-[#D3D1CF] rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-[#1D1C1B]">
          <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <div className="text-sm">No video available</div>
        </div>
      </div>
    )
  }

  // Common container styling for both thumbnail and video player to ensure consistent modal size
  const containerClasses = `p-0 overflow-hidden bg-[#E9E8E7] border border-[#D3D1CF] rounded-[58px] transition-all duration-200 ${className}`
  const innerContainerClasses = "relative aspect-[21/9] bg-black rounded-[58px] overflow-hidden"
  
  // Ensure consistent dimensions and prevent layout shifts
  const containerStyle = {
    aspectRatio: '21 / 9',
    width: '100%',
    height: 'auto'
  }

  if (showThumbnail && !isPlaying) {
    return (
      <Card 
        className={containerClasses} 
        style={containerStyle}
        onKeyDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onKeyUp={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onKeyPress={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        tabIndex={-1}
      >
        <div 
          className={innerContainerClasses}
          onKeyDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onKeyUp={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onKeyPress={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          tabIndex={-1}
        >
          {/* Thumbnail */}
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={title || "Video thumbnail"}
              className="w-full h-full object-cover rounded-[58px]"
            />
          )}
          
          {/* Duration Tag */}
          {duration && (
            <div className="absolute top-3 right-3 z-10">
              <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                {Math.round(duration / 60)}m {Math.round(duration % 60)}s
              </span>
            </div>
          )}
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <Button
              onClick={() => setIsPlaying(true)}
              className="w-16 h-16 bg-green-500/80 backdrop-blur-sm rounded-full hover:bg-green-500/90 transition-colors"
            >
              <Play className="w-8 h-8 text-white ml-1" />
            </Button>
          </div>

          {/* Title Overlay */}
          {title && (
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white text-lg font-medium truncate drop-shadow-lg">
                {title}
              </h3>
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card 
      className={containerClasses} 
      style={containerStyle}
      onKeyDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onKeyUp={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onKeyPress={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      tabIndex={-1}
    >
      <div 
        className={innerContainerClasses}
        onKeyDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onKeyUp={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onKeyPress={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        tabIndex={-1}
      >
        {/* Duration Tag for Video Player - Identical positioning */}
        {duration && (
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
              {Math.round(duration / 60)}m {Math.round(duration % 60)}s
            </span>
          </div>
        )}
        <VideoPlayer
          videoUrl={videoUrl}
          thumbnailUrl={thumbnailUrl}
          title={title}
          autoPlay={!preventAutoPlay && (autoPlay || isPlaying)}
          preventAutoPlay={preventAutoPlay}
          className="w-full h-full"
          onError={(error) => console.error("Video error:", error)}
          onLoadStart={() => console.log("Video loading started")}
          onLoadComplete={() => console.log("Video loading completed")}
        />
      </div>
    </Card>
  )
}
