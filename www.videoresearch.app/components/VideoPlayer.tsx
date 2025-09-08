"use client"

import { useState, useRef, useEffect } from "react"
import Hls from 'hls.js'
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Loader2 } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl: string
  thumbnailUrl?: string
  title?: string
  className?: string
  autoPlay?: boolean
  preventAutoPlay?: boolean
  onError?: (error: string) => void
  onLoadStart?: () => void
  onLoadComplete?: () => void
}

export default function VideoPlayer({
  videoUrl,
  thumbnailUrl,
  title,
  className = "",
  autoPlay = false,
  preventAutoPlay = false,
  onError,
  onLoadStart,
  onLoadComplete
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Use refs to store callbacks to prevent useEffect re-runs
  const onErrorRef = useRef(onError)
  const onLoadStartRef = useRef(onLoadStart)
  const onLoadCompleteRef = useRef(onLoadComplete)
  
  // Update refs when callbacks change
  useEffect(() => {
    onErrorRef.current = onError
    onLoadStartRef.current = onLoadStart
    onLoadCompleteRef.current = onLoadComplete
  }, [onError, onLoadStart, onLoadComplete])

  // Initialize video player
  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) {
      console.log("Video element or URL not available")
      return
    }

    // Validate video URL
    try {
      new URL(videoUrl)
    } catch (e) {
      console.error("Invalid video URL:", videoUrl)
      setError('Invalid video URL provided')
      setIsLoading(false)
      return
    }

    // Check if the video format is likely supported
    const isHLSUrl = videoUrl.includes('.m3u8') || videoUrl.includes('/hls/') || videoUrl.includes('manifest')
    const isDirectVideo = /\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i.test(videoUrl)
    
    if (!isHLSUrl && !isDirectVideo && !videoUrl.includes('blob:') && !videoUrl.includes('data:')) {
      console.warn("Potentially unsupported video format:", videoUrl)
    }

    setIsLoading(true)
    setError(null)
    onLoadStartRef.current?.()

    // Set a loading timeout (30 seconds)
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }
    loadingTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false)
        setError('Video loading timed out. The video may be too large or the connection is slow.')
        console.warn('Video loading timeout for:', videoUrl)
      }
    }, 30000)

    // Check if HLS is supported natively (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl') && isHLSUrl) {
      console.log("Using native HLS support (Safari)", videoUrl)
      video.src = videoUrl
      video.load()
    } else if (Hls.isSupported() && isHLSUrl) {
      console.log("Using HLS.js for HLS support", videoUrl)
      
      // Clean up existing HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
      
      // Create new HLS instance
      hlsRef.current = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 30,
        debug: false,
        xhrSetup: (xhr, url) => {
          xhr.withCredentials = false
        }
      })
      
      hlsRef.current.loadSource(videoUrl)
      hlsRef.current.attachMedia(video)
      
      hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS manifest loaded successfully")
        setIsLoading(false)
        onLoadCompleteRef.current?.()
        
        if (autoPlay) {
          video.play().catch(e => {
            console.log("Auto-play failed:", e)
            setError('Auto-play failed. Click play button to start.')
          })
        }
      })
      
      hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
        // Filter out non-critical buffer stall errors that are common and usually self-recover
        const isBufferStallError = data.details === "bufferStalledError" || 
                                   data.details === "bufferSeekOverHole" ||
                                   data.details === "bufferNudgeOnStall"
        
        // Only log meaningful errors, avoid empty objects and buffer stalls
        if (data && Object.keys(data).length > 0 && !isBufferStallError) {
          console.warn("HLS warning:", {
            type: data.type,
            details: data.details,
            fatal: data.fatal,
            reason: data.reason || 'Unknown'
          })
          }
        
        // Only handle fatal errors
        if (data.fatal) {
          console.error("HLS fatal error:", {
            type: data.type,
            details: data.details,
            reason: data.reason || 'Unknown'
          })
          
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Network error, trying to recover...")
              try {
              hlsRef.current?.startLoad()
              } catch (e) {
                console.log("Recovery failed, falling back to direct video")
                setError('Network error. Trying direct video...')
                video.src = videoUrl
                video.load()
              }
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Media error, trying to recover...")
              try {
              hlsRef.current?.recoverMediaError()
              } catch (e) {
                console.log("Media recovery failed, falling back to direct video")
                setError('Media error. Trying direct video...')
                video.src = videoUrl
                video.load()
              }
              break
            default:
              console.log("Fatal error, destroying HLS instance")
              if (hlsRef.current) {
                try {
                  hlsRef.current.destroy()
                } catch (e) {
                  console.log("Error destroying HLS instance:", e)
                }
              }
              setError('HLS playback failed. Trying direct video...')
              video.src = videoUrl
              video.load()
              break
          }
        }
      })
    } else {
      console.log("Loading direct video source", videoUrl)
      
      // For direct video files, check if the browser can play the format
      if (isDirectVideo) {
        const extension = videoUrl.split('.').pop()?.split('?')[0]?.toLowerCase()
        let canPlay = ''
        
        switch (extension) {
          case 'mp4':
            canPlay = video.canPlayType('video/mp4')
            break
          case 'webm':
            canPlay = video.canPlayType('video/webm')
            break
          case 'ogg':
            canPlay = video.canPlayType('video/ogg')
            break
          case 'mov':
            canPlay = video.canPlayType('video/quicktime')
            break
          default:
            canPlay = 'maybe' // Let the browser try
        }
        
        if (canPlay === '') {
          console.warn(`Browser cannot play ${extension} format`)
          setError(`This video format (${extension?.toUpperCase()}) is not supported by your browser.`)
          setIsLoading(false)
          return
        }
        
        console.log(`Browser support for ${extension}:`, canPlay)
      }
      
      video.src = videoUrl
      video.load()
    }

    // Video event listeners
    const handleLoadedData = () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      setIsLoading(false)
      onLoadCompleteRef.current?.()
    }
    
    const handleCanPlay = () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      setIsLoading(false)
      onLoadCompleteRef.current?.()
    }
    
    const isHLSStream = (url: string) => {
    return url.includes(".m3u8") || url.includes("/hls/") || url.includes("manifest")
  }

  const handleError = (e: Event) => {
      const target = e.target as HTMLVideoElement
      if (target.error) {
      let errorMessage = 'Video playback failed'
      let userFriendlyMessage = 'Unable to play video'
      
      // Clear loading timeout since we have an error
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      
      // Provide more specific error messages based on error code
      switch (target.error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = 'Video playback was aborted'
          userFriendlyMessage = 'Video loading was interrupted. Please try again.'
          break
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error while loading video'
          userFriendlyMessage = 'Network error. Please check your connection and try again.'
          break
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = 'Video decoding error'
          userFriendlyMessage = 'This video cannot be decoded. The file may be corrupted or use an unsupported codec.'
          break
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Video format not supported'
          userFriendlyMessage = 'This video format is not supported by your browser. Please try a different video.'
          break
        default:
          // Handle specific format errors
          if (target.error.message && target.error.message.includes('Format error')) {
            errorMessage = 'Video format error'
            userFriendlyMessage = 'This video format is not compatible with your browser. Try using MP4, WebM, or another supported format.'
          } else {
            errorMessage = `Video error: ${target.error.message || 'Unknown error'}`
            userFriendlyMessage = 'Video playback failed. The video may be corrupted or in an unsupported format.'
          }
      }
      
      console.warn('Video error details:', {
        code: target.error.code,
        message: target.error.message,
        videoUrl: videoUrl,
        isHLS: videoUrl.includes('.m3u8'),
        userAgent: navigator.userAgent
      })
      
      setError(userFriendlyMessage)
      onErrorRef.current?.(errorMessage)
      }
      setIsLoading(false)
    }
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }
    
    const handleDurationChange = () => {
      setDuration(video.duration)
    }
    
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('durationchange', handleDurationChange)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('volumechange', handleVolumeChange)

    return () => {
      // Clean up timeouts
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      
      // Clean up HLS instance safely
      if (hlsRef.current) {
        try {
        hlsRef.current.destroy()
          hlsRef.current = null
        } catch (e) {
          console.log("Error cleaning up HLS instance:", e)
        }
      }
      
      // Clean up video event listeners safely
      if (video) {
        try {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('durationchange', handleDurationChange)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('volumechange', handleVolumeChange)
        } catch (e) {
          console.log("Error cleaning up video event listeners:", e)
        }
      }
    }
  }, [videoUrl, autoPlay])

  // Add global keyboard event prevention specifically for this video element
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const preventVideoKeyboardEvents = (e: KeyboardEvent) => {
      // Only prevent events if the video element is the target or if no input elements are focused
      const activeElement = document.activeElement
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        (activeElement as HTMLElement).contentEditable === 'true'
      )

      // Don't prevent events if user is typing in an input/textarea
      if (isInputFocused) {
        return
      }

      // Prevent specific keys that commonly control videos
      const videoControlKeys = [
        ' ', // Space bar
        'Enter',
        'ArrowLeft',
        'ArrowRight', 
        'ArrowUp',
        'ArrowDown',
        'k', // Play/pause
        'm', // Mute
        'f', // Fullscreen
        'j', // Rewind
        'l', // Fast forward
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' // Seek to percentage
      ]

      if (videoControlKeys.includes(e.key)) {
        console.log('Preventing video control key:', e.key, 'target:', e.target)
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        return false
      }
    }

    // Add event listeners at the document level to catch all keyboard events
    document.addEventListener('keydown', preventVideoKeyboardEvents, true)
    document.addEventListener('keyup', preventVideoKeyboardEvents, true)
    document.addEventListener('keypress', preventVideoKeyboardEvents, true)

    return () => {
      document.removeEventListener('keydown', preventVideoKeyboardEvents, true)
      document.removeEventListener('keyup', preventVideoKeyboardEvents, true)
      document.removeEventListener('keypress', preventVideoKeyboardEvents, true)
    }
  }, [])

  // Control visibility timeout
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    setShowControls(true)
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  const handleMouseMove = () => {
    resetControlsTimeout()
  }

  const handleMouseLeave = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    if (isPlaying) {
      setShowControls(false)
    }
  }

  // Player controls
  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newTime = parseFloat(e.target.value)
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = parseFloat(e.target.value)
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (!document.fullscreenElement) {
      video.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  // Add error boundary for the component
  if (error && error.includes('Invalid video URL')) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-red-900 bg-opacity-50 flex items-center justify-center z-20 rounded-[58px]">
          <div className="text-white text-center p-4">
            <div className="mb-3 text-sm">Invalid video URL provided</div>
            <div className="text-xs text-gray-300">Please check the video URL and try again</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`relative overflow-hidden group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onKeyDown={(e) => {
        // Prevent ALL keyboard events from affecting the video player
        // This includes common video control keys like Space, Enter, Arrow keys, etc.
        e.preventDefault()
        e.stopPropagation()
        e.nativeEvent.stopImmediatePropagation()
      }}
      onKeyUp={(e) => {
        e.preventDefault()
        e.stopPropagation()
        e.nativeEvent.stopImmediatePropagation()
      }}
      onKeyPress={(e) => {
        e.preventDefault()
        e.stopPropagation()
        e.nativeEvent.stopImmediatePropagation()
      }}
      tabIndex={-1}
      style={{ outline: 'none' }}
    >
      {/* Video Element */}
      <video tabIndex={-1}
        ref={videoRef}
        className="w-full h-full object-cover rounded-[58px]"
        poster={thumbnailUrl}
        preload="metadata"
        playsInline
        crossOrigin="anonymous"
        controls={false}
        disablePictureInPicture={true}
        disableRemotePlayback={true}
        onKeyDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          e.nativeEvent.stopImmediatePropagation()
          return false
        }}
        onKeyUp={(e) => {
          e.preventDefault()
          e.stopPropagation()
          e.nativeEvent.stopImmediatePropagation()
          return false
        }}
        onKeyPress={(e) => {
          e.preventDefault()
          e.stopPropagation()
          e.nativeEvent.stopImmediatePropagation()
          return false
        }}
        onInput={(e) => {
          e.preventDefault()
          e.stopPropagation()
          e.nativeEvent.stopImmediatePropagation()
          return false
        }}
        onFocus={(e) => {
          e.preventDefault()
          e.stopPropagation()
          ;(e.target as HTMLVideoElement).blur() // Immediately blur to prevent focus
          return false
        }}
        onBlur={(e) => {
          e.stopPropagation()
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{ outline: 'none' }} // Remove focus outline
      >
        Your browser does not support the video tag.
      </video>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 rounded-[58px]">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <div className="text-white text-sm">Loading video...</div>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 bg-red-900 bg-opacity-50 flex items-center justify-center z-20 rounded-[58px]">
          <div className="text-white text-center p-4 max-w-md">
            <div className="mb-2">
              <svg className="w-12 h-12 mx-auto mb-2 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mb-3 text-sm font-medium">{error}</div>
            <div className="flex flex-col space-y-2">
            <button 
              onClick={() => {
                setError(null)
                  setIsLoading(true)
                if (videoRef.current) {
                  videoRef.current.load()
                }
              }}
                className="px-4 py-2 bg-white text-red-900 rounded text-sm hover:bg-gray-100 transition-colors font-medium"
            >
                Try Again
            </button>
              {videoUrl.includes('.m3u8') && (
                <div className="text-xs text-red-200 mt-2">
                  This appears to be an HLS stream. Make sure your browser supports it or try a different video format.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Controls Overlay */}
      <div className={`absolute inset-0 z-10 transition-opacity duration-300 rounded-[58px] ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/50 to-transparent" />
        
        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Title */}
        {title && (
          <div className="absolute top-4 left-4 right-4">
            <h3 className="text-white text-lg font-medium truncate">{title}</h3>
          </div>
        )}

        {/* Center Play Button */}
        {!isPlaying && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Play className="w-8 h-8 text-white ml-1" />
            </button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-4 right-4">
          {/* Progress Bar */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-white/30 rounded-[58px] appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #60E21B 0%, #60E21B ${progressPercentage}%, rgba(255,255,255,0.3) ${progressPercentage}%, rgba(255,255,255,0.3) 100%)`
              }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>

              {/* Volume */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white/30 rounded-[58px] appearance-none cursor-pointer slider"
                />
              </div>

              {/* Time Display */}
              <div className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #60E21B;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #60E21B;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  )
}
