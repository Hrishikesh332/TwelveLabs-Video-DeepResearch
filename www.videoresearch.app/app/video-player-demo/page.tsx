"use client"

import { useState } from "react"
import VideoPlayer from "@/components/VideoPlayer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function VideoPlayerDemo() {
  const [videoUrl, setVideoUrl] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [title, setTitle] = useState("")
  const [autoPlay, setAutoPlay] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)

  // Sample video URLs for testing
  const sampleVideos = [
    {
      url: "https://deuqpmn4rs7j5.cloudfront.net/67ca0ec8d29800ecabf27d70/689df76cb1ba49c5144b7eca/stream/79db76d4-493c-4f5f-899d-ea6aa9fd77e8.m3u8",
      thumbnail: "https://deuqpmn4rs7j5.cloudfront.net/67ca0ec8d29800ecabf27d70/689df76cb1ba49c5144b7eca/thumbnails/79db76d4-493c-4f5f-899d-ea6aa9fd77e8.0000001.jpg",
      title: "Sample Video - Olympics 3.mp4"
    }
  ]

  const handleLoadSample = (sample: typeof sampleVideos[0]) => {
    setVideoUrl(sample.url)
    setThumbnailUrl(sample.thumbnail)
    setTitle(sample.title)
    setShowPlayer(true)
  }

  const handleLoadCustom = () => {
    if (videoUrl.trim()) {
      setShowPlayer(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F3F3] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#1D1C1B] mb-8">Video Player Demo</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Panel */}
          <div className="space-y-6">
            <Card className="p-6 bg-[#E9E8E7] border border-[#D3D1CF]">
              <h2 className="text-xl font-semibold text-[#1D1C1B] mb-4">Video Player Controls</h2>
              
              {/* Sample Videos */}
              <div className="mb-6">
                <Label className="text-[#1D1C1B] font-medium">Sample Videos</Label>
                <div className="mt-2 space-y-2">
                  {sampleVideos.map((sample, index) => (
                    <Button
                      key={index}
                      onClick={() => handleLoadSample(sample)}
                      variant="outline"
                      className="w-full justify-start text-left border-[#D3D1CF] hover:bg-[#D3D1CF] text-[#1D1C1B]"
                    >
                      {sample.title}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Video Input */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="videoUrl" className="text-[#1D1C1B] font-medium">Video URL (HLS .m3u8)</Label>
                  <Input
                    id="videoUrl"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://example.com/video.m3u8"
                    className="mt-1 border-[#D3D1CF] bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="thumbnailUrl" className="text-[#1D1C1B] font-medium">Thumbnail URL (Optional)</Label>
                  <Input
                    id="thumbnailUrl"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://example.com/thumbnail.jpg"
                    className="mt-1 border-[#D3D1CF] bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="title" className="text-[#1D1C1B] font-medium">Video Title (Optional)</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My Video Title"
                    className="mt-1 border-[#D3D1CF] bg-white"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoPlay"
                    checked={autoPlay}
                    onChange={(e) => setAutoPlay(e.target.checked)}
                    className="rounded border-[#D3D1CF]"
                  />
                  <Label htmlFor="autoPlay" className="text-[#1D1C1B]">Auto Play</Label>
                </div>

                <Button
                  onClick={handleLoadCustom}
                  disabled={!videoUrl.trim()}
                  className="w-full bg-[#1D1C1B] hover:bg-[#1D1C1B]/90 text-white"
                >
                  Load Custom Video
                </Button>
              </div>
            </Card>

            {/* Features List */}
            <Card className="p-6 bg-[#E9E8E7] border border-[#D3D1CF]">
              <h3 className="text-lg font-semibold text-[#1D1C1B] mb-3">Video Player Features</h3>
              <ul className="space-y-2 text-sm text-[#1D1C1B]">
                <li>• HLS streaming support (Safari native + HLS.js)</li>
                <li>• Custom video controls with auto-hide</li>
                <li>• Progress bar with seeking</li>
                <li>• Volume control with mute toggle</li>
                <li>• Fullscreen support</li>
                <li>• Loading states and error handling</li>
                <li>• Thumbnail poster support</li>
                <li>• Responsive design</li>
                <li>• Custom styling with app theme</li>
              </ul>
            </Card>
          </div>

          {/* Video Player */}
          <div className="space-y-6">
            {showPlayer ? (
              <Card className="p-6 bg-[#E9E8E7] border border-[#D3D1CF]">
                <h2 className="text-xl font-semibold text-[#1D1C1B] mb-4">Video Player</h2>
                <VideoPlayer
                  videoUrl={videoUrl}
                  thumbnailUrl={thumbnailUrl || undefined}
                  title={title || undefined}
                  autoPlay={autoPlay}
                  className="aspect-video"
                  onError={(error) => console.error("Video error:", error)}
                  onLoadStart={() => console.log("Video loading started")}
                  onLoadComplete={() => console.log("Video loading completed")}
                />
              </Card>
            ) : (
              <Card className="p-6 bg-[#E9E8E7] border border-[#D3D1CF]">
                <div className="aspect-video bg-[#D3D1CF] rounded-lg flex items-center justify-center">
                  <div className="text-center text-[#1D1C1B]">
                    <div className="text-lg font-medium mb-2">No Video Loaded</div>
                    <div className="text-sm">Select a sample video or enter a custom URL to start</div>
                  </div>
                </div>
              </Card>
            )}

            {/* Video Info */}
            {showPlayer && (
              <Card className="p-6 bg-[#E9E8E7] border border-[#D3D1CF]">
                <h3 className="text-lg font-semibold text-[#1D1C1B] mb-3">Video Information</h3>
                <div className="space-y-2 text-sm text-[#1D1C1B]">
                  <div><strong>URL:</strong> {videoUrl.substring(0, 60)}...</div>
                  <div><strong>Type:</strong> HLS Stream (.m3u8)</div>
                  <div><strong>Title:</strong> {title || 'Untitled'}</div>
                  <div><strong>Thumbnail:</strong> {thumbnailUrl ? 'Yes' : 'No'}</div>
                  <div><strong>Auto Play:</strong> {autoPlay ? 'Yes' : 'No'}</div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
