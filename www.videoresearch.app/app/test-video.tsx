"use client"

import { useState, useRef, useEffect } from "react"
import Hls from 'hls.js'

export default function TestVideo() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [logs, setLogs] = useState<string[]>([])
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testVideoUrl = "https://deuqpmn4rs7j5.cloudfront.net/67ca0ec8d29800ecabf27d70/689df76cb1ba49c5144b7eca/stream/79db76d4-493c-4f5f-899d-ea6aa9fd77e8.m3u8"
  const testThumbnail = "https://deuqpmn4rs7j5.cloudfront.net/67ca0ec8d29800ecabf27d70/689df76cb1ba49c5144b7eca/thumbnails/79db76d4-493c-4f5f-899d-ea6aa9fd77e8.0000001.jpg"

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    addLog("Starting video player test...")
    addLog(`Video URL: ${testVideoUrl}`)
    addLog(`Thumbnail: ${testThumbnail}`)
    setError(null)
    setIsLoading(true)

    // Check if HLS is supported natively
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      addLog("Using native HLS support (Safari)")
      video.src = testVideoUrl
      video.load()
    } else if (Hls.isSupported()) {
      addLog("Using HLS.js for HLS support")
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
      
      hlsRef.current = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        debug: true,
        xhrSetup: (xhr, url) => {
          addLog(`XHR setup for: ${url}`)
          xhr.withCredentials = false
        }
      })
      
      hlsRef.current.loadSource(testVideoUrl)
      hlsRef.current.attachMedia(video)
      
      hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
        addLog("HLS manifest loaded successfully")
        setIsLoading(false)
        video.play().catch(e => {
          addLog(`Auto-play failed: ${e}`)
          setError('Auto-play failed. Click play button to start.')
        })
      })
      
      hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
        addLog(`HLS error: ${JSON.stringify(data)}`)
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              addLog("Network error, trying to recover...")
              hlsRef.current?.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              addLog("Media error, trying to recover...")
              hlsRef.current?.recoverMediaError()
              break
            default:
              addLog("Fatal error, destroying HLS instance")
              hlsRef.current?.destroy()
              setError('HLS playback failed. Trying direct video...')
              video.src = testVideoUrl
              video.load()
              break
          }
        }
      })
    } else {
      addLog("HLS is not supported, trying direct source")
      video.src = testVideoUrl
      video.load()
    }

    // Add video event listeners for debugging
    const handleLoadStart = () => addLog("Load started")
    const handleLoadedData = () => {
      addLog("Data loaded")
      setIsLoading(false)
    }
    const handleCanPlay = () => {
      addLog("Can play")
      setIsLoading(false)
    }
    const handleError = (e: Event) => {
      const target = e.target as HTMLVideoElement
      if (target.error) {
        addLog(`Video error: ${target.error.message}`)
        setError(`Video error: ${target.error.message}`)
      }
      setIsLoading(false)
    }
    const handleLoad = () => addLog("Load completed")

    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    video.addEventListener('load', handleLoad)

    return () => {
      addLog("Cleaning up")
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      video.removeEventListener('load', handleLoad)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Video Player Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Player */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Video Player</h2>
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded">
                  <div className="text-white text-sm">Loading video...</div>
                </div>
              )}
              {error && (
                <div className="absolute inset-0 bg-red-900 bg-opacity-50 flex items-center justify-center z-10 rounded">
                  <div className="text-white text-sm text-center p-2">
                    <div className="mb-2">{error}</div>
                    <button 
                      onClick={() => {
                        setError(null)
                        if (videoRef.current) {
                          videoRef.current.load()
                        }
                      }}
                      className="px-3 py-1 bg-white text-red-900 rounded text-xs hover:bg-gray-100"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
              <video
                ref={videoRef}
                controls
                className="w-full aspect-video bg-black rounded"
                poster={testThumbnail}
                preload="metadata"
                playsInline
                crossOrigin="anonymous"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
              <div><strong>URL:</strong> {testVideoUrl.substring(0, 50)}...</div>
              <div><strong>Type:</strong> HLS Stream (.m3u8)</div>
              <div><strong>Status:</strong> {isLoading ? 'Loading' : error ? 'Error' : 'Ready'}</div>
            </div>
          </div>

          {/* Debug Logs */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded h-96 overflow-y-auto font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
              {logs.length === 0 && (
                <div className="text-gray-500">No logs yet...</div>
              )}
            </div>
            <button 
              onClick={() => setLogs([])}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Test Controls */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.load()
                  addLog("Manual reload triggered")
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Video
            </button>
            <button 
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.play()
                  addLog("Manual play triggered")
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Play Video
            </button>
            <button 
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.pause()
                  addLog("Manual pause triggered")
                }
              }}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Pause Video
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 